use anchor_lang::prelude::*;
use std::str::from_utf8;

declare_id!("5JBjXWwqWHwPK1NRgV8d9XQ87wtGDKTmkv4LPZjfZZxa");

#[program]
pub mod solblog {
    use super::*;
    pub fn initialize(
        ctx: Context<Initialize>, // <-- Anchor context that holds all the account data (structs) below
    ) -> ProgramResult { // <--- These functions are snake_case of the CamelCase struct below
        let b_p_a = &mut ctx.accounts.blog_account;
        b_p_a.authority = *ctx.accounts.authority.key;
        Ok(())
    }

    pub fn make_post(
        ctx: Context<MakePost>, 
        new_post: Vec<u8> // <--- our blog post data
    ) -> ProgramResult {
        // msg!("Signed by {:?}", ctx.accounts.authority.key.to_string());
        let memo = from_utf8(&new_post).map_err(|err| {
            msg!("Invalid UTF-8, from byte {}", err.valid_up_to());
            ProgramError::InvalidInstructionData
        })?;
        msg!("Memo (len {}): {:?}", memo.len(), memo);

        let b_acc = &mut ctx.accounts.blog_account;
        b_acc.latest_post = new_post; // save the latest post in the account. 
        // past posts will be in transaction memes (below)
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init, // hey Anchor, initialize an account with these details for me
        payer = authority, // See that authority Signer (pubkey)? They're paying for this 
        space = 8 // all accounts need 8 bytes for the account discriminator prepended to the account
        + 32 // authority: Pubkey needs 32 bytes
        + 566 // string could need up to 566 bytes for the memo?
    )]
    pub blog_account: Account<'info, BlogAccount>, // <--- initialize this account variable & add it to Context and can be used above ^^
    #[account(mut)]
    pub authority: Signer<'info>, // <--- let's name the account that signs this transaction "authority" and save it to the struct below during `initialize`
    pub system_program: Program<'info, System>, // <--- Anchor boilerplate
}

#[derive(Accounts)]
pub struct MakePost<'info> {
    #[account(
        mut, // we can make changes to this account
        has_one = authority)] // the user has signed this post, allowing it to happen
    // this is here again because it holds that .latest_post field where our post is saved
    pub blog_account: Account<'info, BlogAccount>, // <-- enable this account to also be used in the make_post function
    // Also put authority here
    // has_one = authority ensure it was provided as a function arg
    // ensures the poster has the keys
    // has to come after the Account statement above
    pub authority: Signer<'info> 
}

#[account]
pub struct BlogAccount {
    // save the posting authority to this authority field
    pub authority: Pubkey,
    pub latest_post: Vec<u8>, // <-- where the latest blog post will be stored
}