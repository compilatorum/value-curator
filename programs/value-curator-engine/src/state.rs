use anchor_lang::prelude::*;

/// On-chain state for one Value Curator Node.
#[account]
#[derive(InitSpace)]
pub struct NodeAccount {
    /// Governance authority. Can rotate the operator and execute emergency withdrawals.
    pub owner: Pubkey,
    /// Limited hot operator key allowed to trigger yield metabolization and bounded strategy swaps.
    pub operator: Pubkey,
    /// Infrastructure retention in basis points (e.g. 1500 = 15%).
    pub infrastructure_fee_bps: u16,
    /// Cumulative yield processed by `metabolize_yield`.
    pub total_metabolized: u64,
    /// Treasury destination for the infrastructure share.
    pub treasury_pubkey: Pubkey,
    /// Allowlisted output strategy mint (e.g. AAPLx or RWA asset).
    pub strategy_mint: Pubkey,
    /// PDA bump seed.
    pub bump: u8,
    /// Reserved space for layout expansion without breaking changes.
    pub _reserved: [u8; 32],
}

impl NodeAccount {
    pub fn assert_owner(&self, signer: &Pubkey) -> Result<()> {
        require_keys_eq!(self.owner, *signer, crate::error::ValueCuratorError::Unauthorized);
        Ok(())
    }

    pub fn assert_operator(&self, signer: &Pubkey) -> Result<()> {
        require_keys_eq!(
            self.operator,
            *signer,
            crate::error::ValueCuratorError::UnauthorizedOperator
        );
        Ok(())
    }
}
