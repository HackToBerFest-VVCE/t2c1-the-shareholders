use anchor_lang::prelude::*;
use crate::state::MarketState;
use crate::events::MarketInitialized;

#[derive(Accounts)]
pub struct InitializeMarket<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + MarketState::INIT_SPACE,
        seeds = [MarketState::SEED],
        bump,
    )]
    pub market_state: Account<'info, MarketState>,

    /// The USDC mint on this network (devnet or mainnet)
    pub usdc_mint: Account<'info, anchor_spl::token::Mint>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeMarket>, protocol_fee_bps: u16) -> Result<()> {
    let market = &mut ctx.accounts.market_state;

    market.bump = ctx.bumps.market_state;
    market.authority = ctx.accounts.authority.key();
    market.task_counter = 0;
    market.protocol_fee_bps = protocol_fee_bps;
    market.treasury = ctx.accounts.authority.key(); // Treasury defaults to authority
    market.usdc_mint = ctx.accounts.usdc_mint.key();

    emit!(MarketInitialized {
        authority: market.authority,
        usdc_mint: market.usdc_mint,
        protocol_fee_bps,
    });

    msg!("Market initialized. Authority: {}", market.authority);
    Ok(())
}
