use anchor_lang::prelude::*;

#[error_code]
pub enum ValueCuratorError {
    #[msg("Unauthorized: governance owner signer required")]
    Unauthorized,

    #[msg("Unauthorized: designated operator signer required")]
    UnauthorizedOperator,

    #[msg("Infrastructure fee cannot exceed 10000 bps")]
    InvalidFee,

    #[msg("Operator cannot be zero or equal to the owner")]
    InvalidOperator,

    #[msg("Amount must be strictly positive")]
    ZeroAmount,

    #[msg("Arithmetic overflow in fee or balance calculation")]
    MathOverflow,

    #[msg("Target strategy mint does not match allowlist in node")]
    InvalidStrategyMint,

    #[msg("Insufficient vault balance for the requested allocation")]
    InsufficientVaultBalance,

    #[msg("Token balance delta after strategy swap does not match expectations")]
    InvalidSwapBalance,

    #[msg("Jupiter swap input spent does not match the exact requested amount")]
    InvalidSwapInput,

    #[msg("Output received from swap is below the required minimum slippage threshold")]
    SlippageExceeded,

    #[msg("Invalid token program interface")]
    InvalidTokenProgram,

    #[msg("Treasury pubkey cannot be default")]
    InvalidTreasuryAccount,

    #[msg("Minimum output amount must be strictly positive")]
    InvalidMinimumOutput,
}
