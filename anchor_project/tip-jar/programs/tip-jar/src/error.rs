use anchor_lang::prelude::*;

#[error_code]
pub enum TipError {
    #[msg("Tipper has fewer lamports than what he want's to tip.")]
    NotEnoughLamports,
    #[msg("You've reached your max tipping limit for this creator. Reset your record to tip again.")]
    Overflow,
    #[msg("You cannot tip zero lamports.")]
    ZeroTipAmount,
}
