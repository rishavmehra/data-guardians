// contentAttestation.ts - Client-side Solana program integration
import * as anchor from '@project-serum/anchor';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program } from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';

// Import your IDL directly
import IDL from './idl/content_attestation.json';

// Create a proper type for the custom IDL format
interface ContentAttestationTypes {
  address: string;
  metadata: {
    name: string;
    version: string;
    spec: string;
    description: string;
  };
  instructions: any[];
  accounts: any[];
  events: any[];
  errors: any[];
  types: any[];
}

// Program ID from the IDL
const PROGRAM_ID = new PublicKey(IDL.address);

export class ContentAttestationClient {
  program: any;
  wallet: any;
  provider: AnchorProvider;

  constructor(connection: Connection, wallet: any) {
    // Create provider
    this.wallet = wallet;
    this.provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );
    
    // Initialize program with the imported IDL
    // Cast to any to avoid TypeScript errors with the IDL format
    this.program = new Program(IDL as any, PROGRAM_ID, this.provider);
  }

  // Find the PDA for an attestation
  async findAttestationAddress(contentCid: string): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [
        Buffer.from('attestation'),
        this.wallet.publicKey.toBuffer(),
        Buffer.from(contentCid),
      ],
      this.program.programId
    );
  }

  // Register content attestation on-chain
  // Note: Using snake_case method names to match IDL
  async attestContent(
    contentCid: string,
    metadataCid: string,
    contentType: string,
    title: string,
    description: string
  ): Promise<string> {
    try {
      // Find PDA for this attestation
      const [attestationPda] = await this.findAttestationAddress(contentCid);
      
      // Submit transaction using the snake_case method name from IDL
      const tx = await this.program.methods
        .attest_content( // Note: using snake_case from IDL
          contentCid,
          metadataCid,
          contentType,
          title,
          description,
        )
        .accounts({
          attestation: attestationPda,
          creator: this.wallet.publicKey,
          system_program: SystemProgram.programId, // Also uses snake_case
        })
        .rpc();
      
      return tx;
    } catch (error) {
      console.error('Error attesting content:', error);
      throw error;
    }
  }

  // Update an existing attestation
  async updateAttestation(
    contentCid: string,
    newMetadataCid?: string,
    newTitle?: string,
    newDescription?: string
  ): Promise<string> {
    try {
      // Find PDA for this attestation
      const [attestationPda] = await this.findAttestationAddress(contentCid);
      
      // Submit transaction using the snake_case method name from IDL
      const tx = await this.program.methods
        .update_attestation( // Note: using snake_case from IDL
          newMetadataCid ? newMetadataCid : null,
          newTitle ? newTitle : null,
          newDescription ? newDescription : null,
        )
        .accounts({
          attestation: attestationPda,
          creator: this.wallet.publicKey,
          system_program: SystemProgram.programId, // Also uses snake_case
        })
        .rpc();
      
      return tx;
    } catch (error) {
      console.error('Error updating attestation:', error);
      throw error;
    }
  }

  // Revoke an attestation
  async revokeAttestation(contentCid: string): Promise<string> {
    try {
      // Find PDA for this attestation
      const [attestationPda] = await this.findAttestationAddress(contentCid);
      
      // Submit transaction using the snake_case method name from IDL
      const tx = await this.program.methods
        .revoke_attestation() // Note: using snake_case from IDL
        .accounts({
          attestation: attestationPda,
          creator: this.wallet.publicKey,
          system_program: SystemProgram.programId, // Also uses snake_case
        })
        .rpc();
      
      return tx;
    } catch (error) {
      console.error('Error revoking attestation:', error);
      throw error;
    }
  }

  // Get attestation data for a content CID
  async getAttestation(contentCid: string): Promise<any> {
    try {
      // Find PDA for this attestation
      const [attestationPda] = await this.findAttestationAddress(contentCid);
      
      // Fetch the account data
      // Note: Using ContentAttestation type name as defined in your IDL
      const attestation = await this.program.account.ContentAttestation.fetch(attestationPda);
      return attestation;
    } catch (error) {
      console.error('Error fetching attestation:', error);
      return null;
    }
  }

  // Get all attestations by the current user
  async getAttestationsByUser(): Promise<any[]> {
    try {
      // Query by creator
      // Note: Using ContentAttestation type name as defined in your IDL
      const attestations = await this.program.account.ContentAttestation.all([
        {
          memcmp: {
            offset: 8, // after discriminator
            bytes: this.wallet.publicKey.toBase58(),
          },
        },
      ]);
      
      return attestations;
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

  // Create client when wallet is connected
  const getClient = () => {
    if (!publicKey || !signTransaction || !signAllTransactions) {
      throw new Error('Wallet not connected');
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

    return new ContentAttestationClient(connection, wallet);
  };

  // Attest content
  const attestContent = async (
    contentCid: string,
    metadataCid: string,
    contentType: string,
    title: string,
    description: string
  ) => {
    setLoading(true);
    setError(null);
    setTransaction(null);

    try {
      const client = getClient();
      const tx = await client.attestContent(
        contentCid,
        metadataCid,
        contentType,
        title,
        description
      );
      
      setTransaction(tx);
      return tx;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update attestation
  const updateAttestation = async (
    contentCid: string,
    newMetadataCid?: string,
    newTitle?: string,
    newDescription?: string
  ) => {
    setLoading(true);
    setError(null);
    setTransaction(null);

    try {
      const client = getClient();
      const tx = await client.updateAttestation(
        contentCid,
        newMetadataCid,
        newTitle,
        newDescription
      );
      
      setTransaction(tx);
      return tx;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Revoke attestation
  const revokeAttestation = async (contentCid: string) => {
    setLoading(true);
    setError(null);
    setTransaction(null);

    try {
      const client = getClient();
      const tx = await client.revokeAttestation(contentCid);
      
      setTransaction(tx);
      return tx;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get attestation
  const getAttestation = async (contentCid: string) => {
    setLoading(true);
    setError(null);

    try {
      const client = getClient();
      const attestation = await client.getAttestation(contentCid);
      return attestation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get user attestations
  const getUserAttestations = async () => {
    setLoading(true);
    setError(null);

    try {
      const client = getClient();
      const attestations = await client.getAttestationsByUser();
      return attestations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    attestContent,
    updateAttestation,
    revokeAttestation,
    getAttestation,
    getUserAttestations,
    loading,
    error,
    transaction,
  };
}