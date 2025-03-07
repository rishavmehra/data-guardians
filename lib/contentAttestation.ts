// lib/contentAttestation.ts
import { 
  Connection, 
  PublicKey, 
  SystemProgram, 
  Transaction 
} from '@solana/web3.js';
import { 
  AnchorProvider, 
  Program,
  BN
} from '@project-serum/anchor';
import { useState } from 'react';

// Import your IDL
import IDL from './idl/content_attestation.json';

// Define Anchor wallet interface
export interface AnchorWallet {
  publicKey: PublicKey;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
  signAllTransactions: (txs: Transaction[]) => Promise<Transaction[]>;
}

// Define ContentAttestation interface matching your IDL's field naming
export interface ContentAttestation {
  creator: PublicKey;
  contentCid: string;
  metadataCid: string;
  contentType: string;
  title: string;
  description: string;
  timestamp: number;
}

// Your program ID from your IDL
const PROGRAM_ID = new PublicKey("9YB3E3Eyh71FbgUBxUwd76cKCtdxLKNmq6Cs2ryJ9Egm");

// Maximum retries for RPC calls
const MAX_RETRIES = 3;

// Delay between retries (ms)
const RETRY_DELAY = 1000;

// Helper to wait between retries
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Client class for content attestation
 */
export class ContentAttestationClient {
  program: Program;
  wallet: AnchorWallet;
  provider: AnchorProvider;

  /**
   * Create a new client instance
   */
  constructor(connection: Connection, wallet: AnchorWallet) {
    this.wallet = wallet;
    this.provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed', preflightCommitment: 'processed' }
    );
    
    // Initialize program with the imported IDL
    this.program = new Program(IDL as any, PROGRAM_ID, this.provider);
  }

  /**
   * Find the PDA for content attestation
   */
  async findAttestationAddress(contentCid: string): Promise<[PublicKey, number]> {
    let lastError: unknown;
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await PublicKey.findProgramAddress(
          [
            Buffer.from('attestation'),
            this.wallet.publicKey.toBuffer(),
            Buffer.from(contentCid),
          ],
          this.program.programId
        );
      } catch (error: unknown) {
        console.warn(`PDA derivation attempt ${attempt + 1} failed:`, error);
        lastError = error;
        
        if (attempt < MAX_RETRIES - 1) await sleep(RETRY_DELAY);
      }
    }
    
    throw lastError;
  }

  /**
   * Register content on the Solana blockchain
   * Note: Using register_content method name to match your IDL
   */
  async registerContent(
    contentCid: string,
    metadataCid: string,
    contentType: string = "image",
    title: string = "Untitled",
    description: string = ""
  ): Promise<string> {
    // Validate input parameters
    if (!contentCid || typeof contentCid !== 'string') {
      throw new Error('Content CID is required and must be a string');
    }
    
    if (!metadataCid || typeof metadataCid !== 'string') {
      throw new Error('Metadata CID is required and must be a string');
    }
    
    // Clean input values
    contentCid = contentCid.trim();
    metadataCid = metadataCid.trim();
    contentType = (contentType || "image").trim();
    title = (title || "Untitled").trim();
    description = (description || "").trim();
    
    // Find PDA for this attestation
    const [attestationPda] = await this.findAttestationAddress(contentCid);
    
    console.log('Attestation PDA:', attestationPda.toString());
    
    // Log parameters for debugging
    console.log("Register Content Parameters:", {
      contentCid,
      metadataCid,
      contentType,
      title,
      description,
      pda: attestationPda.toString(),
      wallet: this.wallet.publicKey.toString()
    });
    
    // Try to execute the transaction with retries
    let lastError: unknown;
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        // Use register_content (with underscore) to match your IDL exactly
        const tx = await this.program.methods
          .register_content(
            contentCid,
            metadataCid,
            contentType,
            title,
            description
          )
          .accounts({
            attestation: attestationPda,
            creator: this.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        
        console.log("Transaction successful:", tx);
        return tx;
      } catch (error: unknown) {
        console.error(`Transaction attempt ${attempt + 1} failed:`, error);
        lastError = error;
        
        if (attempt < MAX_RETRIES - 1) await sleep(RETRY_DELAY);
      }
    }
    
    throw lastError;
  }

  /**
   * Get attestation data for a content CID
   */
  async getAttestation(contentCid: string): Promise<ContentAttestation | null> {
    // Validate input parameters
    if (!contentCid || typeof contentCid !== 'string') {
      return null;
    }
    
    try {
      // Find PDA for this attestation
      const [attestationPda] = await this.findAttestationAddress(contentCid);
      
      // Try to fetch the account with retries
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          // Use ContentAttestation as per your IDL
          const attestation = await this.program.account.ContentAttestation.fetch(attestationPda);
          
          // Convert from snake_case fields in the account to camelCase for JS
          return {
            creator: attestation.creator,
            contentCid: attestation.content_cid,
            metadataCid: attestation.metadata_cid,
            contentType: attestation.content_type,
            title: attestation.title,
            description: attestation.description,
            timestamp: attestation.timestamp.toNumber()
          };
        } catch (error: any) {
          console.warn(`Fetch attestation attempt ${attempt + 1} failed:`, error);
          
          // If not found, don't retry
          if (error.message && (
            error.message.includes("Account does not exist") || 
            error.message.includes("not found")
          )) {
            return null;
          }
          
          if (attempt < MAX_RETRIES - 1) await sleep(RETRY_DELAY);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching attestation:', error);
      return null;
    }
  }

  /**
   * Get all attestations by the current user
   */
  async getAttestationsByUser(): Promise<ContentAttestation[]> {
    try {
      // Try to fetch attestations with retries
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          // Use ContentAttestation as per your IDL
          const attestations = await this.program.account.ContentAttestation.all([
            {
              memcmp: {
                offset: 8, // after discriminator
                bytes: this.wallet.publicKey.toBase58(),
              },
            },
          ]);
          
          return attestations.map(item => ({
            creator: item.account.creator,
            contentCid: item.account.content_cid,
            metadataCid: item.account.metadata_cid,
            contentType: item.account.content_type,
            title: item.account.title,
            description: item.account.description,
            timestamp: item.account.timestamp.toNumber()
          }));
        } catch (error: unknown) {
          console.warn(`Fetch user attestations attempt ${attempt + 1} failed:`, error);
          
          if (attempt < MAX_RETRIES - 1) await sleep(RETRY_DELAY);
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching user attestations:', error);
      return [];
    }
  }
}

/**
 * Standalone function to register content - convenient for one-off use
 */
export async function registerContent(
  connection: Connection, 
  wallet: AnchorWallet,
  contentCid: string,
  metadataCid: string,
  contentType: string = "image",
  title: string = "Untitled",
  description: string = ""
): Promise<string> {
  const client = new ContentAttestationClient(connection, wallet);
  return client.registerContent(
    contentCid,
    metadataCid,
    contentType,
    title,
    description
  );
}

/**
 * React hook for using content registration
 */
export function useContentRegistration(
  connection: Connection, 
  wallet: AnchorWallet | null
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<string | null>(null);
  
  const register = async (
    contentCid: string,
    metadataCid: string,
    contentType: string = "image",
    title: string = "Untitled",
    description: string = ""
  ): Promise<string | null> => {
    if (!wallet) {
      setError("Wallet not connected");
      return null;
    }
    
    setLoading(true);
    setError(null);
    setTransaction(null);
    
    try {
      const tx = await registerContent(
        connection,
        wallet,
        contentCid,
        metadataCid,
        contentType,
        title,
        description
      );
      
      setTransaction(tx);
      return tx;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    register,
    loading,
    error,
    transaction
  };
}