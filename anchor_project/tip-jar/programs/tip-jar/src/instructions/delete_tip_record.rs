use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::TipJar;
use create::TipError;

#[derive(Accounts)]
pub struct DeleteTipRecord<'a> {
    #[account(mut)]
    pub tipper: Signer<'a>,
    #[account()]
    pub creator: AccountInfo<'a>,
    #[account(mut, close = tipper, seeds = [b"tip-record", tipper.key().as_ref(), tip_jar.key().as_ref()], bump=tip_record.bump)]
    pub tip_record: Account<'a, TipRecord>,
    #[account(has_one = creator)]
    pub tip_jar: Account<'a, TipJar>,
    pub system_program: Program<'a, System>,
}

pub fn handler(ctx: Context<Tip>, amount: u64) -> Result<()> {
    Ok(())
}
