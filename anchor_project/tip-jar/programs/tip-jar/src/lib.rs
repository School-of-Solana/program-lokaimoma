pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("HubzaEUtqJsik78CL7QLPP3hqo9CcvHrgdZD8NxVhmTN");

#[program]
pub mod tip_jar {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn tip(ctx: Context<Tip>, amount: u64) -> Result<()> {
        tip::handler(ctx, amount)
    }

    pub fn delete_tip_record(ctx: Context<DeleteTipRecord>) -> Result<()> {
        delete_tip_record::handler(ctx)
    }
}
