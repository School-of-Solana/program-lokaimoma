use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct TipJar {
    pub creator: Pubkey,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct TipRecord {
    pub tipper: Pubkey,
    pub tip_jar: Pubkey,
    pub bump: u8,
    pub total_tips: u128,
    pub initialized: bool,
}
