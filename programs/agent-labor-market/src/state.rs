use anchor_lang::prelude::*;

// ============================================================
// MarketState — Global singleton for protocol configuration
// Seeds: ["market_state"]
// ============================================================
#[account]
#[derive(InitSpace)]
pub struct MarketState {
    pub bump: u8,
    pub authority: Pubkey,
    pub task_counter: u64,
    pub protocol_fee_bps: u16,
    pub treasury: Pubkey,
    pub usdc_mint: Pubkey,
}

impl MarketState {
    pub const SEED: &'static [u8] = b"market_state";
}

// ============================================================
// Task — Represents a single task with dual vaults
// Seeds: ["task", task_id.to_le_bytes()]
// ============================================================
#[account]
#[derive(InitSpace)]
pub struct Task {
    pub bump: u8,
    pub task_id: u64,
    pub poster: Pubkey,
    pub state: TaskState,
    pub mode: TaskMode,
    #[max_len(128)]
    pub spec_uri: String,
    pub spec_hash: [u8; 32],
    pub checker_hash: [u8; 32],
    pub reward_amount: u64,
    pub budget_amount: u64,
    pub reward_vault: Pubkey,
    pub budget_vault: Pubkey,
    pub selected_agent: Pubkey,
    pub category: u8,
    pub bid_window_end: i64,
    pub deadline: i64,
    pub challenge_window_end: i64,
    pub delivery_hash: [u8; 32],
    pub trace_hash: [u8; 32],
    #[max_len(128)]
    pub checker_result_uri: String,
    pub budget_spent: u64,
    pub receipt_count: u32,
    pub is_honeypot: bool,
    pub honeypot_answer_hash: [u8; 32],
    pub parent_task_id: u64,
    pub created_at: i64,
}

impl Task {
    pub const SEED: &'static [u8] = b"task";
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum TaskState {
    Open,
    BidWindow,
    Assigned,
    InProgress,
    Delivered,
    Settled,
    Challenged,
    Failed,
    Cancelled,
    Expired,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum TaskMode {
    Objective,
    Subjective,
}

// ============================================================
// SpendPolicy — Controls how budget vault can be spent
// Seeds: ["spend_policy", task_id.to_le_bytes()]
// ============================================================
#[account]
#[derive(InitSpace)]
pub struct SpendPolicy {
    pub bump: u8,
    pub task_id: u64,
    pub per_call_cap: u64,
    pub total_cap: u64,
    pub total_spent: u64,
    pub expiry: i64,
    #[max_len(8)]
    pub vendor_whitelist: Vec<Pubkey>,
    pub vendor_count: u8,
}

impl SpendPolicy {
    pub const SEED: &'static [u8] = b"spend_policy";
}

// ============================================================
// SpendReceipt — Immutable receipt for each pay_x402 call
// Seeds: ["receipt", task_id.to_le_bytes(), receipt_index.to_le_bytes()]
// ============================================================
#[account]
#[derive(InitSpace)]
pub struct SpendReceipt {
    pub bump: u8,
    pub task_id: u64,
    pub receipt_index: u32,
    pub vendor: Pubkey,
    pub amount: u64,
    pub request_hash: [u8; 32],
    pub slot: u64,
    pub timestamp: i64,
}

impl SpendReceipt {
    pub const SEED: &'static [u8] = b"receipt";
}

// ============================================================
// VendorRegistry — Global vendor whitelist (protocol-level)
// Seeds: ["vendor_registry"]
// ============================================================
#[account]
#[derive(InitSpace)]
pub struct VendorRegistry {
    pub bump: u8,
    pub authority: Pubkey,
    #[max_len(32)]
    pub vendors: Vec<Pubkey>,
    pub vendor_count: u8,
}

impl VendorRegistry {
    pub const SEED: &'static [u8] = b"vendor_registry";
}
