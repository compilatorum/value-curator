use anchor_lang::prelude::*;

use crate::constants::{BPS_DENOMINATOR, NODE_SEED};
use crate::error::ValueCuratorError;
use crate::state::NodeAccount;

#[derive(Accounts)]
pub struct InitializeNode<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// Governance owner authority and PDA seed.
    pub owner: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = 8 + NodeAccount::INIT_SPACE,
        seeds = [NODE_SEED, owner.key().as_ref()],
        bump
    )]
    pub node: Account<'info, NodeAccount>,
    pub system_program: Program<'info, System>,
}

pub fn handle_initialize_node(
    ctx: Context<InitializeNode>,
    infrastructure_fee_bps: u16,
    treasury_pubkey: Pubkey,
    operator: Pubkey,
    strategy_mint: Pubkey,
) -> Result<()> {
    require!(
        (infrastructure_fee_bps as u64) <= BPS_DENOMINATOR,
        ValueCuratorError::InvalidFee
    );
    require_keys_neq!(operator, Pubkey::default(), ValueCuratorError::InvalidOperator);
    require_keys_neq!(
        operator,
        ctx.accounts.owner.key(),
        ValueCuratorError::InvalidOperator
    );
    require_keys_neq!(
        treasury_pubkey,
        Pubkey::default(),
        ValueCuratorError::InvalidTreasuryAccount
    );
    require_keys_neq!(
        strategy_mint,
        Pubkey::default(),
        ValueCuratorError::InvalidStrategyMint
    );

    let node = &mut ctx.accounts.node;
    node.owner = ctx.accounts.owner.key();
    node.operator = operator;
    node.infrastructure_fee_bps = infrastructure_fee_bps;
    node.total_metabolized = 0;
    node.treasury_pubkey = treasury_pubkey;
    node.strategy_mint = strategy_mint;
    node.bump = ctx.bumps.node;
    node._reserved = [0u8; 32];

    Ok(())
}
