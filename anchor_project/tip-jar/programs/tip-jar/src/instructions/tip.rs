use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::error::TipError;
use crate::state::{TipJar, TipRecord};

#[derive(Accounts)]
pub struct Tip<'a> {
    #[account(mut)]
    pub tipper: Signer<'a>,
    /// CHECK: The creator of the tip jar. This is the account that will receive the tip.
    /// The `has_one` constraint on the `tip_jar` account ensures that the `creator`
    /// account provided is the legitimate owner of the tip jar.
    #[account(mut)]
    pub creator: AccountInfo<'a>,
    #[account(
        init_if_needed,
        space = 8 + TipRecord::INIT_SPACE,
        payer = tipper,
        seeds = [b"tip-record", tipper.key().as_ref(), tip_jar.key().as_ref()],
        bump
    )]
    pub tip_record: Account<'a, TipRecord>,
    #[account(mut, has_one = creator)]
    pub tip_jar: Account<'a, TipJar>,
    pub system_program: Program<'a, System>,
}

pub fn handler(ctx: Context<Tip>, amount: u64) -> Result<()> {
    require!(amount > 0, TipError::ZeroTipAmount);
    require!(
        ctx.accounts.tipper.lamports() >= amount,
        TipError::NotEnoughLamports
    );
    require!(
        ctx.accounts
            .tip_record
            .total_tips
            .checked_add(amount as u128)
            .is_some(),
        TipError::Overflow
    );

    let cpi_accounts = Transfer {
        from: ctx.accounts.tipper.to_account_info(),
        to: ctx.accounts.creator.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(ctx.accounts.system_program.to_account_info(), cpi_accounts);

    transfer(cpi_ctx, amount)?;

    let tip_record = &mut ctx.accounts.tip_record;

    if tip_record.total_tips == 0 {
        tip_record.bump = ctx.bumps.tip_record;
        tip_record.tipper = ctx.accounts.tipper.key();
        tip_record.tip_jar = ctx.accounts.tip_jar.key();
    }

    tip_record.total_tips += amount as u128;

    Ok(())
}
