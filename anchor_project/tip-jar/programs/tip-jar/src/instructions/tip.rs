use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::TipJar;
use create::TipError;

#[derive(Accounts)]
pub struct Tip<'a> {
    #[account(mut)]
    pub tipper: Signer<'a>,
    #[account(mut)]
    pub creator: AccountInfo<'a>,
    #[account(init_if_needed, space = 8 + TipRecord::INIT_SPACE, payer = tipper, seeds = [b"tip-record", tipper.key().as_ref(), tip_jar.key().as_ref()], bump)]
    pub tip_record: Account<'a, TipRecord>,
    #[account(mut, has_one = creator)]
    pub tip_jar: Account<'a, TipJar>,
    pub system_program: Program<'a, System>,
}

pub fn handler(ctx: Context<Tip>, amount: u64) -> Result<()> {
    let tip_record = &mut ctx.accounts.tip_record;
    let tipper = &mut ctx.accounts.tipper;
    let tip_jar = &mut ctx.accounts.tip_jar;
    let cpi_program = &ctx.account.system_program.to_account_info();

    require!(tipper.lamports() >= amount, TipError::NotEnoughLamports);
    require!(tip_record.checked_add(amount).is_ok(), TipError::Overflow);

    let cpi_accounts = Transfer {
        from: tipper.to_account_info(),
        to: ctx.accounts.creator.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

    system_program::transfer(cpi_ctx, amount)?;

    if (!tip_record.initialized) {
        tip_record.bump = ctx.bumps.tip_record;
        tip_record.tipper = tipper.key();
        tip_record.tip_jar = ctx.accounts.tip_jar.key();
        tip_record.initialized = true;
        tip_record.amount = 0;
    }

    tip_record.amount += amount;

    Ok(())
}
