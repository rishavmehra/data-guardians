use anchor_lang::prelude::*;
use sha2::{Sha256, Digest};

declare_id!("AE72qUK1KsBamJKDQ3BDvcnjAgc9JaA3Bg4ATCaNpst6");

#[program]
pub mod content_attestation {
    use super::*;

    pub fn register_content(
        ctx: Context<RegisterContent>,
        content_cid: String,
        content_cid_hash: [u8; 32], // Hash of content_cid passed as an argument
        metadata_cid: String,
        content_type: String,
        title: String,
        description: String,
    ) -> Result<()> {
        // Verify the provided hash matches the content_cid
        let mut hasher = Sha256::new();
        hasher.update(content_cid.as_bytes());
        let computed_hash = hasher.finalize();
        require!(
            computed_hash.as_slice() == content_cid_hash,
            ErrorCode::InvalidHash
        );

        let attestation = &mut ctx.accounts.attestation;
        let creator = &ctx.accounts.creator;
        
        attestation.creator = creator.key();
        attestation.content_cid = content_cid;
        attestation.metadata_cid = metadata_cid;
        attestation.content_type = content_type;
        attestation.title = title;
        attestation.description = description;
        attestation.timestamp = Clock::get()?.unix_timestamp;
        
        emit!(ContentRegisteredEvent {
            creator: creator.key(),
            content_cid: attestation.content_cid.clone(),
            timestamp: attestation.timestamp,
        });
        
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct ContentAttestation {
    pub creator: Pubkey,
    #[max_len(100)]
    pub content_cid: String,       
    #[max_len(100)]
    pub metadata_cid: String,      
    #[max_len(100)]
    pub content_type: String,      
    #[max_len(50)]
    pub title: String,             
    #[max_len(100)]
    pub description: String,       
    pub timestamp: i64,
}

#[derive(Accounts)]
#[instruction(content_cid: String, content_cid_hash: [u8; 32])]
pub struct RegisterContent<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + ContentAttestation::INIT_SPACE,
        seeds = [
            b"attestation",
            creator.key().as_ref(),
            &content_cid_hash,
        ],
        bump
    )]
    pub attestation: Account<'info, ContentAttestation>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct ContentRegisteredEvent {
    pub creator: Pubkey,
    pub content_cid: String,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The provided content CID hash does not match the actual hash.")]
    InvalidHash,
}