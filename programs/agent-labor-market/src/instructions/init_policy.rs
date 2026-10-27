use anchor_lang::prelude::*;
use crate::state::{Task, SpendPolicy, TaskState};
use crate::errors::MarketError;
use crate::events::PolicyInitialized;

#[derive(Accounts)]
pub struct InitPolicy<'info> {
    #[account(
        mut,
        seeds = [Task::SEED, task.task_id.to_le_bytes().as_ref()],
        bump = task.bump,
        constraint = task.poster == poster.key() @ MarketError::Unauthorized,
        constraint = task.state == TaskState::Open || task.state == TaskState::BidWindow @ MarketError::InvalidTaskState,
    )]
    pub task: Account<'info, Task>,

    #[account(
        init,
        payer = poster,
        space = 8 + SpendPolicy::INIT_SPACE,
        seeds = [SpendPolicy::SEED, task.task_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub spend_policy: Account<'info, SpendPolicy>,

    #[account(mut)]
    pub poster: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitPolicy>,
    per_call_cap: u64,
    total_cap: u64,
    expiry: i64,
    vendor_whitelist: Vec<Pubkey>,
) -> Result<()> {
    // === Validation ===
    require!(per_call_cap > 0, MarketError::ZeroPerCallCap);
    require!(total_cap > 0, MarketError::ZeroTotalCap);
    require!(per_call_cap <= total_cap, MarketError::PerCallCapExceedsTotalCap);
    require!(!vendor_whitelist.is_empty(), MarketError::EmptyVendorWhitelist);
    require!(vendor_whitelist.len() <= 8, MarketError::TooManyVendors);

    let clock = Clock::get()?;
    require!(expiry > clock.unix_timestamp, MarketError::PolicyExpired);

    // Total cap should not exceed the task's budget
    let task = &ctx.accounts.task;
    require!(total_cap <= task.budget_amount, MarketError::ExceedsTotalCap);

    // === Initialize SpendPolicy ===
    let policy = &mut ctx.accounts.spend_policy;
    policy.bump = ctx.bumps.spend_policy;
    policy.task_id = task.task_id;
    policy.per_call_cap = per_call_cap;
    policy.total_cap = total_cap;
    policy.total_spent = 0;
    policy.expiry = expiry;
    policy.vendor_count = vendor_whitelist.len() as u8;
    policy.vendor_whitelist = vendor_whitelist;

    emit!(PolicyInitialized {
        task_id: task.task_id,
        per_call_cap,
        total_cap,
        expiry,
        vendor_count: policy.vendor_count,
    });

    msg!(
        "Spend policy initialized for task {}. Per-call cap: {}, Total cap: {}, Vendors: {}",
        task.task_id,
        per_call_cap,
        total_cap,
        policy.vendor_count
    );
    Ok(())
}
