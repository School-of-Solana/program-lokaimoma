use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
struct TipJar {
    pub creator: Pubkey,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
struct TipRecord {
    pub tipper: Pubkey,
    pub tip_jar: Pubkey,
    pub bump: u8,
    pub total_tips: u128,
}
