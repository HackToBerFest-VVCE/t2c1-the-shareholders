use anchor_lang::prelude::*;

#[error_code]
pub enum MarketError {
    // === General ===
    #[msg("Arithmetic overflow")]
    Overflow,

    #[msg("Unauthorized signer")]
    Unauthorized,

    // === Task ===
    #[msg("Invalid task mode (must be 0=Objective or 1=Subjective)")]
    InvalidTaskMode,

    #[msg("Reward amount must be greater than zero")]
    ZeroReward,

    #[msg("Budget amount must be greater than zero")]
    ZeroBudget,

    #[msg("Spec URI too long (max 128 chars)")]
    SpecUriTooLong,

    #[msg("Task is not in the expected state for this operation")]
    InvalidTaskState,

    #[msg("Bid window must be positive")]
    InvalidBidWindow,

    #[msg("Deadline must be after bid window")]
    InvalidDeadline,

    #[msg("Challenge window must be positive")]
    InvalidChallengeWindow,

    #[msg("Task has not expired yet")]
    TaskNotExpired,

    #[msg("Task is not settled (cannot refund unspent budget)")]
    TaskNotSettled,

    // === Spend Policy ===
    #[msg("Per-call cap must be greater than zero")]
    ZeroPerCallCap,

    #[msg("Total cap must be greater than zero")]
    ZeroTotalCap,

    #[msg("Per-call cap exceeds total cap")]
    PerCallCapExceedsTotalCap,

    #[msg("Policy expiry must be in the future")]
    PolicyExpired,

    #[msg("Too many vendors in whitelist (max 8)")]
    TooManyVendors,

    #[msg("Vendor whitelist must not be empty")]
    EmptyVendorWhitelist,

    // === pay_x402 ===
    #[msg("Payment amount exceeds per-call cap")]
    ExceedsPerCallCap,

    #[msg("Payment would exceed total budget cap")]
    ExceedsTotalCap,

    #[msg("Spend policy has expired")]
    SpendPolicyExpired,

    #[msg("Vendor is not whitelisted in the spend policy")]
    VendorNotWhitelisted,

    #[msg("Only the assigned agent can execute spend")]
    NotAssignedAgent,

    #[msg("Payment amount must be greater than zero")]
    ZeroPaymentAmount,

    #[msg("Task must be InProgress to execute spend")]
    TaskNotInProgress,

    // === Budget ===
    #[msg("Insufficient budget remaining")]
    InsufficientBudget,

    #[msg("No unspent budget to refund")]
    NoUnspentBudget,
}
