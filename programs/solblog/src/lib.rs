use anchor_lang::prelude::*;
use std::str::from_utf8;

declare_id!("BLoG9PtBTkhUbGRAYVe8jzd5ji1G2VPkzwbsRV3bnteD");

#[program]
pub mod solblog {
    use super::*;
    pub fn initialize(
        ctx: Context<Initialize>, // <-- Anchor context that holds all the account data (structs) below
        new_bio: Vec<u8>,         // <--- our blog post bio
    ) -> ProgramResult {
        // <--- These functions are snake_case of the CamelCase struct below
        let b_p_a = &mut ctx.accounts.blog_account; // grab a mutable reference to our BlogAccount struct
        b_p_a.authority = *ctx.accounts.authority.key; // set the BlogAccount.authority to the pubkey of the authority
        b_p_a.bio = new_bio.to_vec(); // save the latest bio in the account.
        let bio = from_utf8(&new_bio) // convert the array of bytes into a string slice
            .map_err(|err| {
                msg!("Invalid UTF-8, from byte {}", err.valid_up_to());
                ProgramError::InvalidInstructionData
            })?;
        msg!(bio);
        Ok(()) // return the Result
    }

    pub fn make_post(
        ctx: Context<MutateAccount>,
        new_post: Vec<u8>, // <--- our blog post data
    ) -> ProgramResult {
        let post = from_utf8(&new_post) // convert the array of bytes into a string slice
            .map_err(|err| {
                msg!("Invalid UTF-8, from byte {}", err.valid_up_to());
                ProgramError::InvalidInstructionData
            })?;
        msg!(post); // msg!() is a Solana macro that prints string slices to the program log, which we can grab from the transaction block data

        let b_acc = &mut ctx.accounts.blog_account;
        b_acc.latest_post = new_post; // save the latest post in the account.
                                      // past posts will be saved in transaction logs

        Ok(()) // return ok result
    }
    pub fn update_bio(
        ctx: Context<MutateAccount>,
        new_bio: Vec<u8>, // <--- our blog post bio
    ) -> ProgramResult {
        let b_acc = &mut ctx.accounts.blog_account;
        b_acc.bio = new_bio; // save the latest bio in the account.
        Ok(()) // return ok result
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init, // hey Anchor, initialize an account with these details for me
        payer = authority, // See that authority Signer (pubkey) down there? They're paying for this 
        space = 8 // all accounts need 8 bytes for the account discriminator prepended to the account
        + 32 // authority: Pubkey needs 32 bytes
        + 566 // latest_post: post bytes could need up to 566 bytes for the memo
        + 256 // bytes of meta data (name, about, link.in.bio, etc)
        // You have to do this math yourself, there's no macro for this
    )]
    pub blog_account: Account<'info, BlogAccount>, // <--- initialize this account variable & add it to Context and can be used above ^^ in our initialize function
    #[account(mut)]
    pub authority: Signer<'info>, // <--- let's name the account that signs this transaction "authority" and make it mutable so we can set the value to it in `initialize` function above
    pub system_program: Program<'info, System>, // <--- Anchor boilerplate
}

#[derive(Accounts)]
pub struct MutateAccount<'info> {
    #[account(
        mut, // we can make changes to this account
        has_one = authority)] // the authority has signed this post, allowing it to happen
    // this is here again because it holds that .latest_post field where our post is saved
    pub blog_account: Account<'info, BlogAccount>, // <-- enable this account to also be used in the make_post function
    // Also put authority here
    // has_one = authority ensure it was provided as a function arg
    // ensures the poster has the keys
    // has to come after the Account statement above
    // no mut this time, because we don't change authority when we post
    pub authority: Signer<'info>,
}

#[account]
pub struct BlogAccount {
    pub authority: Pubkey,    // save the posting authority to this authority field
    pub latest_post: Vec<u8>, // <-- where the latest blog post will be stored
    pub bio: Vec<u8>,
}
