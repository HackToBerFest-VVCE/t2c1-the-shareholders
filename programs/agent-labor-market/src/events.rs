use anchor_lang::prelude::*;

// All events emitted for the indexer to consume

#[event]
pub struct MarketInitialized {
    pub authority: Pubkey,
    pub usdc_mint: Pubkey,
    pub protocol_fee_bps: u16,
}

#[event]
pub struct TaskCreated {
    pub task_id: u64,
    pub poster: Pubkey,
    pub reward_amount: u64,
    pub budget_amount: u64,
    pub mode: u8,
    pub category: u8,
    pub bid_window_end: i64,
    pub deadline: i64,
    pub spec_hash: [u8; 32],
}

#[event]
pub struct TaskCancelled {
    pub task_id: u64,
    pub poster: Pubkey,
    pub reward_refunded: u64,
    pub budget_refunded: u64,
}

#[event]
pub struct TaskExpired {
    pub task_id: u64,
    pub reward_refunded: u64,
    pub budget_refunded: u64,
}

#[event]
pub struct PolicyInitialized {
    pub task_id: u64,
    pub per_call_cap: u64,
    pub total_cap: u64,
    pub expiry: i64,
    pub vendor_count: u8,
}

#[event]
pub struct SpendExecuted {
    pub task_id: u64,
    pub vendor: Pubkey,
    pub amount: u64,
    pub request_hash: [u8; 32],
    pub receipt_index: u32,
    pub slot: u64,
    pub total_spent: u64,
    pub budget_remaining: u64,
}

#[event]
pub struct BudgetRefunded {
    pub task_id: u64,
    pub poster: Pubkey,
    pub amount_refunded: u64,
}
