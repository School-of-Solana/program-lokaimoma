use anchor_lang::prelude::*;

use crate::state::{TipJar, TipRecord};

#[derive(Accounts)]
pub struct DeleteTipRecord<'a> {
    #[account(mut)]
    pub tipper: Signer<'a>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub creator: AccountInfo<'a>,
    #[account(
        mut,
        close = tipper,
        seeds = [b"tip-record", tipper.key().as_ref(), tip_jar.key().as_ref()],
        bump = tip_record.bump
    )]
    pub tip_record: Account<'a, TipRecord>,
    #[account(has_one = creator)]
    pub tip_jar: Account<'a, TipJar>,
    pub system_program: Program<'a, System>,
}

pub fn handler(_ctx: Context<DeleteTip_Record>) -> Result<()> {
    Ok(())
}
