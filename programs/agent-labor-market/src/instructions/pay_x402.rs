use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::{Task, SpendPolicy, SpendReceipt, TaskState};
use crate::errors::MarketError;
use crate::events::SpendExecuted;

/// CUSTOM x402 ADAPTER
/// 
/// This is NOT standard x402 client-side payment. In the Agent Labor
/// Marketplace, agents never hold budget funds directly. Instead:
///
/// 1. Agent calls this instruction with (vendor, amount, request_hash)
/// 2. Program validates against spend policy (whitelist, caps, expiry)
/// 3. Program CPI-transfers USDC from PDA-owned budget_vault → vendor
/// 4. Program creates an immutable SpendReceipt PDA
/// 5. Off-chain x402 gateway verifies the receipt to serve the resource
///
/// This ensures the budget cannot be drained or misused.
#[derive(Accounts)]
pub struct PayX402<'info> {
    #[account(
        mut,
        seeds = [Task::SEED, task.task_id.to_le_bytes().as_ref()],
        bump = task.bump,
        constraint = task.state == TaskState::InProgress @ MarketError::TaskNotInProgress,
        constraint = task.selected_agent == agent.key() @ MarketError::NotAssignedAgent,
    )]
    pub task: Account<'info, Task>,

    #[account(
        mut,
        seeds = [SpendPolicy::SEED, task.task_id.to_le_bytes().as_ref()],
        bump = spend_policy.bump,
        constraint = spend_policy.task_id == task.task_id,
    )]
    pub spend_policy: Account<'info, SpendPolicy>,

    /// Budget vault — PDA-owned, authority is the task PDA
    #[account(
        mut,
        constraint = budget_vault.key() == task.budget_vault,
        constraint = budget_vault.amount > 0 @ MarketError::InsufficientBudget,
    )]
    pub budget_vault: Account<'info, TokenAccount>,

    /// Vendor's token account — must be in the spend policy whitelist
    #[account(mut)]
    pub vendor_token_account: Account<'info, TokenAccount>,

    /// The receipt PDA — one per pay_x402 call, append-only
    #[account(
        init,
        payer = agent,
        space = 8 + SpendReceipt::INIT_SPACE,
        seeds = [
            SpendReceipt::SEED,
            task.task_id.to_le_bytes().as_ref(),
            task.receipt_count.to_le_bytes().as_ref(),
        ],
        bump,
    )]
    pub spend_receipt: Account<'info, SpendReceipt>,

    /// The assigned agent — must be the signer
    #[account(mut)]
    pub agent: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<PayX402>,
    amount: u64,
    request_hash: [u8; 32],
) -> Result<()> {
    let task = &ctx.accounts.task;
    let policy = &ctx.accounts.spend_policy;

    // === Validate payment amount ===
    require!(amount > 0, MarketError::ZeroPaymentAmount);

    // === Check per-call cap ===
    require!(amount <= policy.per_call_cap, MarketError::ExceedsPerCallCap);

    // === Check total cap (checked arithmetic) ===
    let new_total_spent = policy.total_spent
        .checked_add(amount)
        .ok_or(MarketError::Overflow)?;
    require!(new_total_spent <= policy.total_cap, MarketError::ExceedsTotalCap);

    // === Check policy expiry ===
    let clock = Clock::get()?;
    require!(clock.unix_timestamp < policy.expiry, MarketError::SpendPolicyExpired);

    // === Check vendor is whitelisted ===
    let vendor_key = ctx.accounts.vendor_token_account.key();
    let is_whitelisted = policy.vendor_whitelist.iter().any(|v| *v == vendor_key);
    require!(is_whitelisted, MarketError::VendorNotWhitelisted);

    // === CPI Transfer: budget_vault → vendor_token_account ===
    // The task PDA is the authority of budget_vault
    let task_id_bytes = task.task_id.to_le_bytes();
    let seeds: &[&[u8]] = &[
        Task::SEED,
        task_id_bytes.as_ref(),
        &[task.bump],
    ];
    let signer_seeds = &[seeds];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.budget_vault.to_account_info(),
                to: ctx.accounts.vendor_token_account.to_account_info(),
                authority: ctx.accounts.task.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
    )?;

    // === Update policy spent counter ===
    let policy = &mut ctx.accounts.spend_policy;
    policy.total_spent = new_total_spent;

    // === Update task spent counter ===
    let receipt_index = ctx.accounts.task.receipt_count;
    let task = &mut ctx.accounts.task;
    task.budget_spent = task.budget_spent
        .checked_add(amount)
        .ok_or(MarketError::Overflow)?;
    task.receipt_count = receipt_index
        .checked_add(1)
        .ok_or(MarketError::Overflow)?;

    // === Create immutable SpendReceipt ===
    let receipt = &mut ctx.accounts.spend_receipt;
    receipt.bump = ctx.bumps.spend_receipt;
    receipt.task_id = task.task_id;
    receipt.receipt_index = receipt_index;
    receipt.vendor = vendor_key;
    receipt.amount = amount;
    receipt.request_hash = request_hash;
    receipt.slot = clock.slot;
    receipt.timestamp = clock.unix_timestamp;

    let budget_remaining = task.budget_amount
        .checked_sub(task.budget_spent)
        .ok_or(MarketError::Overflow)?;

    emit!(SpendExecuted {
        task_id: task.task_id,
        vendor: vendor_key,
        amount,
        request_hash,
        receipt_index,
        slot: clock.slot,
        total_spent: task.budget_spent,
        budget_remaining,
    });

    msg!(
        "pay_x402: Task {} | Receipt #{} | {} USDC → vendor {} | Remaining: {}",
        task.task_id,
        receipt_index,
        amount,
        vendor_key,
        budget_remaining
    );

    Ok(())
}
