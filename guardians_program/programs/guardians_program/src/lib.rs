use anchor_lang::prelude::*;

declare_id!("9YB3E3Eyh71FbgUBxUwd76cKCtdxLKNmq6Cs2ryJ9Egm"); 

#[program]
pub mod content_attestation {
    use super::*;

    // Register new content attestation
    pub fn attest_content(
        ctx: Context<AttestContent>,
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
        attestation.is_active = true;
        
        // Emit an event for indexing
        emit!(ContentAttestedEvent {
            creator: creator.key(),
            attestation: attestation.key(),
            content_cid: attestation.content_cid.clone(),
            metadata_cid: attestation.metadata_cid.clone(),
            timestamp: attestation.timestamp,
        });
        
        Ok(())
    }
    
    // Update an existing attestation
    pub fn update_attestation(
        ctx: Context<UpdateAttestation>,
        new_metadata_cid: Option<String>,
        new_title: Option<String>,
        new_description: Option<String>,
    ) -> Result<()> {
        let attestation = &mut ctx.accounts.attestation;
        
        // Update fields if provided
        if let Some(metadata_cid) = new_metadata_cid {
            attestation.metadata_cid = metadata_cid;
        }
        
        if let Some(title) = new_title {
            attestation.title = title;
        }
        
        if let Some(description) = new_description {
            attestation.description = description;
        }
        
        // Update timestamp
        attestation.timestamp = Clock::get()?.unix_timestamp;
        
        // Emit update event
        emit!(AttestationUpdatedEvent {
            attestation: attestation.key(),
            metadata_cid: attestation.metadata_cid.clone(),
            timestamp: attestation.timestamp,
        });
        
        Ok(())
    }
    
    // Revoke an attestation
    pub fn revoke_attestation(ctx: Context<RevokeAttestation>) -> Result<()> {
        let attestation = &mut ctx.accounts.attestation;
        
        // Mark as inactive (revoked)
        attestation.is_active = false;
        attestation.timestamp = Clock::get()?.unix_timestamp;
        
        // Emit revoke event
        emit!(AttestationRevokedEvent {
            attestation: attestation.key(),
            timestamp: attestation.timestamp,
        });
        
        Ok(())
    }
}

// Account structure to store content attestation data
#[account]
pub struct ContentAttestation {
    pub creator: Pubkey,           
    pub content_cid: String,       
    pub metadata_cid: String,      
    pub content_type: String,      // Type of content (image, audio, document, etc.)
    pub title: String,             // Content title
    pub description: String,       // Content description
    pub timestamp: i64,            // Unix timestamp
    pub is_active: bool,           // Whether attestation is active or revoked
}

// Context for creating a new attestation
#[derive(Accounts)]
#[instruction(content_cid: String, metadata_cid: String, content_type: String, title: String, description: String)]
pub struct AttestContent<'info> {
    #[account(
        init,
        payer = creator,
        space = 8  // Discriminator
            + 32   // Creator pubkey
            + 4 + content_cid.len()  // Content CID (string)
            + 4 + metadata_cid.len() // Metadata CID (string)
            + 4 + content_type.len() // Content type (string)
            + 4 + title.len()        // Title (string)
            + 4 + description.len()  // Description (string)
            + 8    // Timestamp
            + 1,   // Is active flag
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

// Context for updating an attestation
#[derive(Accounts)]
pub struct UpdateAttestation<'info> {
    #[account(
        mut,
        seeds = [
            b"attestation",
            creator.key().as_ref(),
            attestation.content_cid.as_bytes(),
        ],
        bump,
        has_one = creator @ ErrorCode::UnauthorizedUpdate
    )]
    pub attestation: Account<'info, ContentAttestation>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// Context for revoking an attestation
#[derive(Accounts)]
pub struct RevokeAttestation<'info> {
    #[account(
        mut,
        seeds = [
            b"attestation",
            creator.key().as_ref(),
            attestation.content_cid.as_bytes(),
        ],
        bump,
        has_one = creator @ ErrorCode::UnauthorizedRevocation
    )]
    pub attestation: Account<'info, ContentAttestation>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// Events
#[event]
pub struct ContentAttestedEvent {
    pub creator: Pubkey,
    pub attestation: Pubkey,
    pub content_cid: String,
    pub metadata_cid: String,
    pub timestamp: i64,
}

#[event]
pub struct AttestationUpdatedEvent {
    pub attestation: Pubkey,
    pub metadata_cid: String,
    pub timestamp: i64,
}

#[event]
pub struct AttestationRevokedEvent {
    pub attestation: Pubkey,
    pub timestamp: i64,
}

// Error codes
#[error_code]
pub enum ErrorCode {
    #[msg("Only the creator can update this attestation")]
    UnauthorizedUpdate,
    
    #[msg("Only the creator can revoke this attestation")]
    UnauthorizedRevocation,
}