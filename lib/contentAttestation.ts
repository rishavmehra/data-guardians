import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program } from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useCallback, useRef } from 'react';

// Import your IDL directly
import IDL from './idl/content_attestation.json';

// Program ID from the IDL
const PROGRAM_ID = new PublicKey("9YB3E3Eyh71FbgUBxUwd76cKCtdxLKNmq6Cs2ryJ9Egm");

// Maximum retries for RPC calls
const MAX_RETRIES = 3;
// Delay between retries (ms)
const RETRY_DELAY = 1000;

// Helper to wait between retries
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class ContentAttestationClient {
  program: any;
  wallet: any;
  provider: AnchorProvider;

  constructor(connection: Connection, wallet: any) {
    // Create provider with increased commitment for better reliability
    this.wallet = wallet;
    this.provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed', preflightCommitment: 'confirmed' }
    );
    
    // Initialize program with the imported IDL
    this.program = new Program(IDL as any, PROGRAM_ID, this.provider);
  }

  // Find the PDA for an attestation with retry logic
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

  // Register content attestation on-chain with retry logic
  async attestContent(
    contentCid: string,
    metadataCid: string,
    contentType: string,
    title: string,
    description: string
  ): Promise<string> {
    // Validate input parameters
    if (!contentCid || typeof contentCid !== 'string') {
      throw new Error('Content CID is required and must be a string');
    }
    
    if (!metadataCid || typeof metadataCid !== 'string') {
      throw new Error('Metadata CID is required and must be a string');
    }
    
    // Use defaults for optional fields
    contentType = contentType || "image";
    title = title || "Untitled";
    description = description || "";
    
    // Find PDA for this attestation
    const [attestationPda] = await this.findAttestationAddress(contentCid);
    
    console.log("Attestation PDA:", attestationPda.toString());
    
    // Log parameters for debugging
    console.log("Attest Content Parameters:", {
      contentCid,
      metadataCid,
      contentType,
      title,
      description,
      pda: attestationPda.toString(),
      wallet: this.wallet.publicKey.toString(),
      programId: this.program.programId.toString()
    });
    
    // Try to execute the transaction with retries
    let lastError: unknown;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        // Use the correct method name from the IDL
        const methodName = 'attest_content'; // Make sure this matches your IDL
        
        // Submit transaction
        const tx = await this.program.methods
          [methodName](
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
        console.warn(`Transaction attempt ${attempt + 1} failed:`, error);
        lastError = error;
        if (attempt < MAX_RETRIES - 1) await sleep(RETRY_DELAY);
      }
    }
    throw lastError;
  }

  // Update an existing attestation with retry logic
  async updateAttestation(
    contentCid: string,
    newMetadataCid?: string,
    newTitle?: string,
    newDescription?: string
  ): Promise<string> {
    // Validate input parameters
    if (!contentCid || typeof contentCid !== 'string') {
      throw new Error('Content CID is required and must be a string');
    }
    
    // Find PDA for this attestation
    const [attestationPda] = await this.findAttestationAddress(contentCid);
    
    console.log("Attestation PDA for update:", attestationPda.toString());
    
    // Format the option parameters according to Anchor's convention
    const metadataCidOption = newMetadataCid ? { some: newMetadataCid } : { none: {} };
    const titleOption = newTitle ? { some: newTitle } : { none: {} };
    const descriptionOption = newDescription ? { some: newDescription } : { none: {} };
    
    // Log parameters for debugging
    console.log("Update Attestation Parameters:", {
      contentCid,
      metadataCidOption,
      titleOption,
      descriptionOption,
      pda: attestationPda.toString()
    });
    
    // Try to execute the transaction with retries
    let lastError: unknown;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        // Use the correct method name from the IDL
        const methodName = 'update_attestation'; // Make sure this matches your IDL
        
        // Submit transaction
        const tx = await this.program.methods
          [methodName](
            metadataCidOption,
            titleOption,
            descriptionOption
          )
          .accounts({
            attestation: attestationPda,
            creator: this.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        
        console.log("Update transaction successful:", tx);
        return tx;
      } catch (error: unknown) {
        console.warn(`Update transaction attempt ${attempt + 1} failed:`, error);
        lastError = error;
        if (attempt < MAX_RETRIES - 1) await sleep(RETRY_DELAY);
      }
    }
    throw lastError;
  }

  // Revoke an attestation with retry logic
  async revokeAttestation(contentCid: string): Promise<string> {
    // Validate input parameters
    if (!contentCid || typeof contentCid !== 'string') {
      throw new Error('Content CID is required and must be a string');
    }
    
    // Find PDA for this attestation
    const [attestationPda] = await this.findAttestationAddress(contentCid);
    
    // Try to execute the transaction with retries
    let lastError: unknown;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        // Use the correct method name from the IDL
        const methodName = 'revoke_attestation'; // Make sure this matches your IDL
        
        // Submit transaction
        const tx = await this.program.methods
          [methodName]()
          .accounts({
            attestation: attestationPda,
            creator: this.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        
        console.log("Revoke transaction successful:", tx);
        return tx;
      } catch (error: unknown) {
        console.warn(`Revoke transaction attempt ${attempt + 1} failed:`, error);
        lastError = error;
        if (attempt < MAX_RETRIES - 1) await sleep(RETRY_DELAY);
      }
    }
    throw lastError;
  }

  // Get attestation data for a content CID with caching
  async getAttestation(contentCid: string, cacheKey?: string): Promise<any> {
    // Validate input parameters
    if (!contentCid || typeof contentCid !== 'string') {
      return null;
    }
    
    try {
      // Check cache if key provided
      if (cacheKey && typeof window !== 'undefined' && window.sessionStorage) {
        const cached = sessionStorage.getItem(`attestation_${cacheKey}_${contentCid}`);
        if (cached) {
          return JSON.parse(cached);
        }
      }
      
      // Find PDA for this attestation
      const [attestationPda] = await this.findAttestationAddress(contentCid);
      
      // Try to fetch the account with retries
      let lastError: unknown;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          // Get the account data using the correct account structure from IDL
          const attestation = await this.program.account.ContentAttestation.fetch(attestationPda);
          
          // Cache result if key provided
          if (cacheKey && typeof window !== 'undefined' && window.sessionStorage) {
            sessionStorage.setItem(`attestation_${cacheKey}_${contentCid}`, JSON.stringify(attestation));
          }
          
          return attestation;
        } catch (error: any) {
          console.warn(`Fetch attestation attempt ${attempt + 1} failed:`, error);
          lastError = error;
          
          // If not found, don't retry
          if (error.message && (error.message.includes("not found") || error.message.includes("does not exist"))) {
            return null;
          }
          
          if (attempt < MAX_RETRIES - 1) await sleep(RETRY_DELAY);
        }
      }
      
      // If we get here after retries, there was an error but it wasn't a "not found" error
      throw lastError;
    } catch (error) {
      console.error('Error fetching attestation:', error);
      return null;
    }
  }

  // Get all attestations by the current user with caching
  async getAttestationsByUser(cacheKey?: string): Promise<any[]> {
    try {
      // Check cache if key provided
      if (cacheKey && typeof window !== 'undefined' && window.sessionStorage) {
        const cached = sessionStorage.getItem(`user_attestations_${cacheKey}_${this.wallet.publicKey.toString()}`);
        if (cached) {
          return JSON.parse(cached);
        }
      }
      
      // Try to fetch attestations with retries
      let lastError: unknown;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          // Query by creator
          const attestations = await this.program.account.ContentAttestation.all([
            {
              memcmp: {
                offset: 8, // after discriminator
                bytes: this.wallet.publicKey.toBase58(),
              },
            },
          ]);
          
          // Cache result if key provided
          if (cacheKey && typeof window !== 'undefined' && window.sessionStorage) {
            sessionStorage.setItem(
              `user_attestations_${cacheKey}_${this.wallet.publicKey.toString()}`, 
              JSON.stringify(attestations)
            );
          }
          
          return attestations;
        } catch (error: unknown) {
          console.warn(`Fetch user attestations attempt ${attempt + 1} failed:`, error);
          lastError = error;
          if (attempt < MAX_RETRIES - 1) await sleep(RETRY_DELAY);
        }
      }
      throw lastError;
    } catch (error) {
      console.error('Error fetching user attestations:', error);
      return [];
    }
  }
}

// React hook for using the attestation client
export function useContentAttestation() {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<string | null>(null);
  
  // Use refs to prevent unnecessary rerenders
  const clientRef = useRef<ContentAttestationClient | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Create client only once when wallet is connected
  const getClient = useCallback(() => {
    if (!publicKey || !signTransaction || !signAllTransactions) {
      throw new Error('Wallet not connected');
    }

    // Reuse existing client if available
    if (clientRef.current) {
      return clientRef.current;
    }

    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );

    const wallet = {
      publicKey,
      signTransaction,
      signAllTransactions,
    };

    clientRef.current = new ContentAttestationClient(connection, wallet);
    return clientRef.current;
  }, [publicKey, signTransaction, signAllTransactions]);

  // Cancel any ongoing operations when component unmounts
  const cancelOperations = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Attest content
  const attestContent = useCallback(async (
    contentCid: string,
    metadataCid: string,
    contentType: string,
    title: string,
    description: string
  ) => {
    cancelOperations();
    setLoading(true);
    setError(null);
    setTransaction(null);
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // Check if operation was cancelled
      if (signal.aborted) {
        throw new Error('Operation cancelled');
      }
      
      const client = getClient();
      
      // Ensure all inputs are valid strings
      contentCid = String(contentCid).trim();
      metadataCid = String(metadataCid).trim();
      contentType = String(contentType || 'image').trim();
      title = String(title || 'Untitled').trim();
      description = String(description || '').trim();
      
      // Execute attestation
      const tx = await client.attestContent(
        contentCid,
        metadataCid,
        contentType,
        title,
        description
      );
      
      // Check if operation was cancelled
      if (signal.aborted) {
        throw new Error('Operation cancelled');
      }
      
      setTransaction(tx);
      return tx;
    } catch (err) {
      // Ignore errors from cancelled operations
      if (signal.aborted) {
        return null;
      }
      
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    } finally {
      // Only update state if not cancelled
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [getClient, cancelOperations]);

  // Update attestation
  const updateAttestation = useCallback(async (
    contentCid: string,
    newMetadataCid?: string,
    newTitle?: string,
    newDescription?: string
  ) => {
    cancelOperations();
    setLoading(true);
    setError(null);
    setTransaction(null);
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // Check if operation was cancelled
      if (signal.aborted) {
        throw new Error('Operation cancelled');
      }
      
      const client = getClient();
      
      // Ensure content CID is a valid string
      contentCid = String(contentCid).trim();
      
      // Only pass non-empty strings for optional parameters
      if (newMetadataCid) newMetadataCid = String(newMetadataCid).trim();
      if (newTitle) newTitle = String(newTitle).trim();
      if (newDescription) newDescription = String(newDescription).trim();
      
      const tx = await client.updateAttestation(
        contentCid,
        newMetadataCid,
        newTitle,
        newDescription
      );
      
      // Check if operation was cancelled
      if (signal.aborted) {
        throw new Error('Operation cancelled');
      }
      
      setTransaction(tx);
      return tx;
    } catch (err) {
      // Ignore errors from cancelled operations
      if (signal.aborted) {
        return null;
      }
      
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    } finally {
      // Only update state if not cancelled
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [getClient, cancelOperations]);

  // Revoke attestation
  const revokeAttestation = useCallback(async (contentCid: string) => {
    cancelOperations();
    setLoading(true);
    setError(null);
    setTransaction(null);
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // Check if operation was cancelled
      if (signal.aborted) {
        throw new Error('Operation cancelled');
      }
      
      const client = getClient();
      const tx = await client.revokeAttestation(contentCid);
      
      // Check if operation was cancelled
      if (signal.aborted) {
        throw new Error('Operation cancelled');
      }
      
      setTransaction(tx);
      return tx;
    } catch (err) {
      // Ignore errors from cancelled operations
      if (signal.aborted) {
        return null;
      }
      
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    } finally {
      // Only update state if not cancelled
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [getClient, cancelOperations]);

  // Get attestation with caching
  const getAttestation = useCallback(async (contentCid: string) => {
    // Don't show loading state for reads to avoid UI flickering
    setError(null);
    
    try {
      const client = getClient();
      // Use wallet public key as cache key
      const cacheKey = publicKey?.toString();
      const attestation = await client.getAttestation(contentCid, cacheKey);
      return attestation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return null;
    }
  }, [getClient, publicKey]);

  // Get user attestations with caching
  const getUserAttestations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const client = getClient();
      // Use wallet public key as cache key
      const cacheKey = publicKey?.toString();
      const attestations = await client.getAttestationsByUser(cacheKey);
      return attestations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getClient, publicKey]);

  // Cleanup function for React effects
  const cleanup = useCallback(() => {
    cancelOperations();
  }, [cancelOperations]);

  return {
    attestContent,
    updateAttestation,
    revokeAttestation,
    getAttestation,
    getUserAttestations,
    loading,
    error,
    transaction,
    cleanup,
  };
}