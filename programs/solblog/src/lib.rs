use anchor_lang::prelude::*;

declare_id!("3v1Y5wFi4fn3wij7W6hJztdYoLgVqR9a4n8ARpaGNqW9");

#[program] // all your RPC instruction handlers go here
pub mod solblog {
    use super::*;
    pub fn initialize(_ctx: Context<Initialize>) -> ProgramResult {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
