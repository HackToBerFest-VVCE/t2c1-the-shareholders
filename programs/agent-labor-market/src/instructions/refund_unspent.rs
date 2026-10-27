use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, CloseAccount};
use crate::state::{Task, TaskState};
use crate::errors::MarketError;
use crate::events::BudgetRefunded;

#[derive(Accounts)]
pub struct RefundUnspent<'info> {
    #[account(
        mut,
        seeds = [Task::SEED, task.task_id.to_le_bytes().as_ref()],
        bump = task.bump,
        constraint = task.state == TaskState::Settled @ MarketError::TaskNotSettled,
    )]
    pub task: Account<'info, Task>,

    /// Budget vault — may have unspent USDC remaining after settlement
    #[account(
        mut,
        constraint = budget_vault.key() == task.budget_vault,
    )]
    pub budget_vault: Account<'info, TokenAccount>,

    /// Poster's token account to receive the refund
    #[account(
        mut,
        constraint = poster_token_account.owner == task.poster,
    )]
    pub poster_token_account: Account<'info, TokenAccount>,

    /// Permissionless crank
    #[account(mut)]
    pub cranker: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<RefundUnspent>) -> Result<()> {
    let task = &ctx.accounts.task;
    let unspent = ctx.accounts.budget_vault.amount;

    require!(unspent > 0, MarketError::NoUnspentBudget);

    let task_id_bytes = task.task_id.to_le_bytes();
    let seeds: &[&[u8]] = &[
        Task::SEED,
        task_id_bytes.as_ref(),
        &[task.bump],
    ];
    let signer_seeds = &[seeds];

    // === Transfer unspent budget → poster ===
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
        unspent,
    )?;

    // === Close budget vault (reclaim rent to cranker as incentive) ===
    token::close_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        CloseAccount {
            account: ctx.accounts.budget_vault.to_account_info(),
            destination: ctx.accounts.cranker.to_account_info(),
            authority: ctx.accounts.task.to_account_info(),
        },
        signer_seeds,
    ))?;

    emit!(BudgetRefunded {
        task_id: task.task_id,
        poster: task.poster,
        amount_refunded: unspent,
    });

    msg!(
        "Task {} budget refund: {} USDC returned to poster",
        task.task_id,
        unspent
    );
    Ok(())
}
