use anchor_lang::prelude::*;

declare_id!("8LZeYCxDPhGyMd8Fc4aumD1WuHmh2GUcvpQKJEZa9ycC");

#[program]
pub mod content_attestation {
    use super::*;

    // Register content attestation
    pub fn register_content(
        ctx: Context<RegisterContent>,
        content_cid: String,
        metadata_cid: String,
        content_type: String,
        title: String,
        description: String,
    ) -> Result<()> {
        let attestation = &mut ctx.accounts.attestation;
        let creator = &ctx.accounts.creator;
        
        // Set attestation data
        attestation.creator = creator.key();
        attestation.content_cid = content_cid;
        attestation.metadata_cid = metadata_cid;
        attestation.content_type = content_type;
        attestation.title = title;
        attestation.description = description;
        attestation.timestamp = Clock::get()?.unix_timestamp;
        
        // Emit an event for indexing
        emit!(ContentRegisteredEvent {
            creator: creator.key(),
            content_cid: attestation.content_cid.clone(),
            timestamp: attestation.timestamp,
        });
        
        Ok(())
    }
}

// Simple account structure to store content attestation data
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

// Context for creating a new attestation
#[derive(Accounts)]
#[instruction(content_cid: String)]
pub struct RegisterContent<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + ContentAttestation::INIT_SPACE,
        seeds = [
            b"attestation",
            creator.key().as_ref(),
            content_cid.as_bytes(),
        ],
        bump
    )]
    pub attestation: Account<'info, ContentAttestation>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// Simple event
#[event]
pub struct ContentRegisteredEvent {
    pub creator: Pubkey,
    pub content_cid: String,
    pub timestamp: i64,
}