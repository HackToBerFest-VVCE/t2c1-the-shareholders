use anchor_lang::prelude::*;

pub mod state;
pub mod errors;
pub mod events;
pub mod instructions;

use instructions::*;

declare_id!("ALMk8Z9bXaTnYWqJYk5dCNGrJ5RCqj5N7EqYpVYEfJPr");

#[program]
pub mod agent_labor_market {
    use super::*;

    /// Initialize the global market state singleton.
    /// Must be called once by the protocol authority.
    pub fn initialize_market(
        ctx: Context<InitializeMarket>,
        protocol_fee_bps: u16,
    ) -> Result<()> {
        instructions::initialize_market::handler(ctx, protocol_fee_bps)
    }

    /// Create a new task with reward + budget vaults.
    /// Poster deposits USDC for both reward and compute budget.
    pub fn create_task(
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
        instructions::create_task::handler(
            ctx,
            spec_uri,
            spec_hash,
            mode,
            checker_hash,
            reward_amount,
            budget_amount,
            category,
            bid_window_seconds,
            deadline_seconds,
            challenge_window_seconds,
        )
    }

    /// Initialize a spend policy for a task's compute budget.
    /// Only the poster can set policy parameters.
    pub fn init_policy(
        ctx: Context<InitPolicy>,
        per_call_cap: u64,
        total_cap: u64,
        expiry: i64,
        vendor_whitelist: Vec<Pubkey>,
    ) -> Result<()> {
        instructions::init_policy::handler(ctx, per_call_cap, total_cap, expiry, vendor_whitelist)
    }

    /// Execute a spend from the budget vault to a whitelisted x402 vendor.
    /// Validates spend policy, transfers USDC, creates receipt.
    /// CUSTOM x402 ADAPTER: Agent never holds funds directly.
    pub fn pay_x402(
        ctx: Context<PayX402>,
        amount: u64,
        request_hash: [u8; 32],
    ) -> Result<()> {
        instructions::pay_x402::handler(ctx, amount, request_hash)
    }

    /// Cancel a task. Only poster can cancel, only in Open state.
    /// Refunds all deposited USDC to poster.
    pub fn cancel_task(ctx: Context<CancelTask>) -> Result<()> {
        instructions::cancel_task::handler(ctx)
    }

    /// Expire a task. Permissionless crank.
    /// Callable when deadline has passed without delivery.
    /// Refunds remaining funds to poster.
    pub fn expire_task(ctx: Context<ExpireTask>) -> Result<()> {
        instructions::expire_task::handler(ctx)
    }

    /// Refund unspent budget to poster after settlement.
    /// Permissionless crank.
    pub fn refund_unspent(ctx: Context<RefundUnspent>) -> Result<()> {
        instructions::refund_unspent::handler(ctx)
    }
}
