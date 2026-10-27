use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use crate::state::{MarketState, Task, TaskState, TaskMode};
use crate::errors::MarketError;
use crate::events::TaskCreated;

#[derive(Accounts)]
pub struct CreateTask<'info> {
    #[account(
        mut,
        seeds = [MarketState::SEED],
        bump = market_state.bump,
    )]
    pub market_state: Account<'info, MarketState>,

    #[account(
        init,
        payer = poster,
        space = 8 + Task::INIT_SPACE,
        seeds = [Task::SEED, market_state.task_counter.to_le_bytes().as_ref()],
        bump,
    )]
    pub task: Account<'info, Task>,

    /// Reward vault — PDA-owned token account for the reward pot
    #[account(
        init,
        payer = poster,
        token::mint = usdc_mint,
        token::authority = task,
        seeds = [b"reward_vault", market_state.task_counter.to_le_bytes().as_ref()],
        bump,
    )]
    pub reward_vault: Account<'info, TokenAccount>,

    /// Budget vault — PDA-owned token account for the compute budget
    #[account(
        init,
        payer = poster,
        token::mint = usdc_mint,
        token::authority = task,
        seeds = [b"budget_vault", market_state.task_counter.to_le_bytes().as_ref()],
        bump,
    )]
    pub budget_vault: Account<'info, TokenAccount>,

    /// Poster's USDC token account (source of funds)
    #[account(
        mut,
        constraint = poster_token_account.mint == usdc_mint.key(),
        constraint = poster_token_account.owner == poster.key(),
    )]
    pub poster_token_account: Account<'info, TokenAccount>,

    #[account(
        constraint = usdc_mint.key() == market_state.usdc_mint @ MarketError::InvalidTaskMode,
    )]
    pub usdc_mint: Account<'info, Mint>,

    #[account(mut)]
    pub poster: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateTask>,
    spec_uri: String,
    spec_hash: [u8; 32],
    mode: u8,
    checker_hash: [u8; 32],
    reward_amount: u64,
    budget_amount: u64,
    category: u8,
    bid_window_seconds: i64,
    deadline_seconds: i64,
    challenge_window_seconds: i64,
) -> Result<()> {
    // === Validation ===
    require!(reward_amount > 0, MarketError::ZeroReward);
    require!(budget_amount > 0, MarketError::ZeroBudget);
    require!(spec_uri.len() <= 128, MarketError::SpecUriTooLong);
    require!(bid_window_seconds > 0, MarketError::InvalidBidWindow);
    require!(deadline_seconds > bid_window_seconds, MarketError::InvalidDeadline);
    require!(challenge_window_seconds > 0, MarketError::InvalidChallengeWindow);

    let task_mode = match mode {
        0 => TaskMode::Objective,
        1 => TaskMode::Subjective,
        _ => return Err(MarketError::InvalidTaskMode.into()),
    };

    let clock = Clock::get()?;
    let now = clock.unix_timestamp;

    // === Transfer reward USDC from poster → reward_vault ===
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.poster_token_account.to_account_info(),
                to: ctx.accounts.reward_vault.to_account_info(),
                authority: ctx.accounts.poster.to_account_info(),
            },
        ),
        reward_amount,
    )?;

    // === Transfer budget USDC from poster → budget_vault ===
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.poster_token_account.to_account_info(),
                to: ctx.accounts.budget_vault.to_account_info(),
                authority: ctx.accounts.poster.to_account_info(),
            },
        ),
        budget_amount,
    )?;

    // === Initialize Task Account ===
    let task_id = ctx.accounts.market_state.task_counter;
    let task = &mut ctx.accounts.task;

    task.bump = ctx.bumps.task;
    task.task_id = task_id;
    task.poster = ctx.accounts.poster.key();
    task.state = TaskState::Open;
    task.mode = task_mode;
    task.spec_uri = spec_uri;
    task.spec_hash = spec_hash;
    task.checker_hash = checker_hash;
    task.reward_amount = reward_amount;
    task.budget_amount = budget_amount;
    task.reward_vault = ctx.accounts.reward_vault.key();
    task.budget_vault = ctx.accounts.budget_vault.key();
    task.selected_agent = Pubkey::default(); // Zero = none selected
    task.category = category;
    task.bid_window_end = now.checked_add(bid_window_seconds).ok_or(MarketError::Overflow)?;
    task.deadline = now.checked_add(deadline_seconds).ok_or(MarketError::Overflow)?;
    task.challenge_window_end = 0; // Set when delivery is submitted
    task.delivery_hash = [0u8; 32];
    task.trace_hash = [0u8; 32];
    task.checker_result_uri = String::new();
    task.budget_spent = 0;
    task.receipt_count = 0;
    task.is_honeypot = false;
    task.honeypot_answer_hash = [0u8; 32];
    task.parent_task_id = 0;
    task.created_at = now;

    // === Increment task counter ===
    ctx.accounts.market_state.task_counter = task_id
        .checked_add(1)
        .ok_or(MarketError::Overflow)?;

    emit!(TaskCreated {
        task_id,
        poster: task.poster,
        reward_amount,
        budget_amount,
        mode,
        category,
        bid_window_end: task.bid_window_end,
        deadline: task.deadline,
        spec_hash,
    });

    msg!(
        "Task {} created. Reward: {}, Budget: {}",
        task_id,
        reward_amount,
        budget_amount
    );
    Ok(())
}
