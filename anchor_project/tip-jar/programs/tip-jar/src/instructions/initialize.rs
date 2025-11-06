use anchor_lang::prelude::*;

use crate::TipJar;

#[derive(Accounts)]
pub struct Initialize<'a> {
    #[account(mut)]
    pub creator: Signer<'a>,
    #[account(init, space = 8 + TipJar::INIT_SPACE, payer = creator, seeds = [b"tipJar", creator.key().as_ref()], bump)]
    pub tip_jar: Account<'a, TipJar>,
    pub system_program: Program<'a, System>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    let tip_jar = &mut ctx.accounts.tip_jar;
    tip_jar.bump = ctx.bumps.tip_jar;
    tip_jar.creator = ctx.accounts.creator.key();
    Ok(())
}
