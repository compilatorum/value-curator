use crate::constants::BPS_DENOMINATOR;
use crate::error::ValueCuratorError;
use anchor_lang::prelude::*;

/// Split `amount` into (infrastructure, vaulted) using `fee_bps` / 10_000.
pub fn split_yield(amount: u64, fee_bps: u16) -> Result<(u64, u64)> {
    require!(amount > 0, ValueCuratorError::ZeroAmount);
    require!((fee_bps as u64) <= BPS_DENOMINATOR, ValueCuratorError::InvalidFee);

    let infrastructure = (amount as u128)
        .checked_mul(fee_bps as u128)
        .ok_or(ValueCuratorError::MathOverflow)?
        .checked_div(BPS_DENOMINATOR as u128)
        .ok_or(ValueCuratorError::MathOverflow)? as u64;

    let vaulted = amount
        .checked_sub(infrastructure)
        .ok_or(ValueCuratorError::MathOverflow)?;

    Ok((infrastructure, vaulted))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::constants::DEFAULT_INFRASTRUCTURE_FEE_BPS;

    #[test]
    fn default_fee_splits_fifteen_eighty_five() {
        let (infra, reinvest) = split_yield(10_000, DEFAULT_INFRASTRUCTURE_FEE_BPS).unwrap();
        assert_eq!(infra, 1_500);
        assert_eq!(reinvest, 8_500);
    }

    #[test]
    fn allows_zero_fee() {
        let (infra, reinvest) = split_yield(10_000, 0).unwrap();
        assert_eq!(infra, 0);
        assert_eq!(reinvest, 10_000);
    }

    #[test]
    fn rejects_zero_amount() {
        assert!(split_yield(0, DEFAULT_INFRASTRUCTURE_FEE_BPS).is_err());
    }

    #[test]
    fn rejects_fee_over_100_percent() {
        assert!(split_yield(100, 10_001).is_err());
    }
}
