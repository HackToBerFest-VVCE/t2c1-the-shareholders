use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, CloseAccount};
use crate::state::{Task, TaskState};
use crate::errors::MarketError;
use crate::events::TaskCancelled;

#[derive(Accounts)]
pub struct CancelTask<'info> {
    #[account(
        mut,
        seeds = [Task::SEED, task.task_id.to_le_bytes().as_ref()],
        bump = task.bump,
        constraint = task.poster == poster.key() @ MarketError::Unauthorized,
        constraint = task.state == TaskState::Open @ MarketError::InvalidTaskState,
    )]
    pub task: Account<'info, Task>,

    /// Reward vault to drain back to poster
    #[account(
        mut,
        constraint = reward_vault.key() == task.reward_vault,
    )]
    pub reward_vault: Account<'info, TokenAccount>,

    /// Budget vault to drain back to poster
    #[account(
        mut,
        constraint = budget_vault.key() == task.budget_vault,
    )]
    pub budget_vault: Account<'info, TokenAccount>,

    /// Poster's token account to receive refund
    #[account(
        mut,
        constraint = poster_token_account.owner == poster.key(),
    )]
    pub poster_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub poster: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<CancelTask>) -> Result<()> {
    let task = &ctx.accounts.task;
    let task_id_bytes = task.task_id.to_le_bytes();
    let seeds: &[&[u8]] = &[
        Task::SEED,
        task_id_bytes.as_ref(),
        &[task.bump],
    ];
    let signer_seeds = &[seeds];

    let reward_amount = ctx.accounts.reward_vault.amount;
    let budget_amount = ctx.accounts.budget_vault.amount;

    // === Refund reward vault → poster ===
    if reward_amount > 0 {
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.reward_vault.to_account_info(),
                    to: ctx.accounts.poster_token_account.to_account_info(),
                    authority: ctx.accounts.task.to_account_info(),
                },
                signer_seeds,
            ),
            reward_amount,
        )?;
    }

    // === Refund budget vault → poster ===
    if budget_amount > 0 {
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.budget_vault.to_account_info(),
                    to: ctx.accounts.poster_token_account.to_account_info(),
                    authority: ctx.accounts.task.to_account_info(),
                },
                signer_seeds,
            ),
            budget_amount,
        )?;
    }

    // === Close vault token accounts (reclaim rent) ===
    token::close_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        CloseAccount {
            account: ctx.accounts.reward_vault.to_account_info(),
            destination: ctx.accounts.poster.to_account_info(),
            authority: ctx.accounts.task.to_account_info(),
        },
        signer_seeds,
    ))?;

    token::close_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        CloseAccount {
            account: ctx.accounts.budget_vault.to_account_info(),
            destination: ctx.accounts.poster.to_account_info(),
            authority: ctx.accounts.task.to_account_info(),
        },
        signer_seeds,
    ))?;

    // === Update task state ===
    let task = &mut ctx.accounts.task;
    task.state = TaskState::Cancelled;

    emit!(TaskCancelled {
        task_id: task.task_id,
        poster: task.poster,
        reward_refunded: reward_amount,
        budget_refunded: budget_amount,
    });

    msg!(
        "Task {} cancelled. Refunded {} reward + {} budget to poster",
        task.task_id,
        reward_amount,
        budget_amount
    );
    Ok(())
}
