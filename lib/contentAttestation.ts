import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import rawIdlJson from './idl/content_attestation.json';

// Cast the imported JSON to the Anchor Idl type.
const rawIdl = rawIdlJson as unknown as anchor.Idl;

// Define an interface for a patched account that might include a 'type' property.
interface PatchedAccount {
  name: string;
  discriminator: number[];
  type?: any;
}

// Patch the accounts array to add the 'type' property to the ContentAttestation account.
if (rawIdl.accounts) {
  rawIdl.accounts = (rawIdl.accounts as PatchedAccount[]).map(acc => {
    if (acc.name === "ContentAttestation" && !acc.type) {
      const typeDef = rawIdl.types?.find((t: any) => t.name === "ContentAttestation");
      if (typeDef) {
        return { ...acc, type: typeDef.type };
      }
    }
    return acc;
  });
}

export class ContentAttestationClient {
  connection: Connection;
  wallet: any;
  program: anchor.Program;

  constructor(connection: Connection, wallet: any) {
    // Ensure the wallet object is provided and contains a publicKey.
    if (!wallet || !wallet.publicKey) {
      throw new Error("Wallet is not provided or missing publicKey");
    }
    this.connection = connection;
    this.wallet = wallet;
    const provider = new anchor.AnchorProvider(connection, wallet, {});
    anchor.setProvider(provider);
    this.program = new anchor.Program(rawIdl, provider);
  }

  async getAttestation(contentCid: string): Promise<any> {
    // Use only the first 5 characters of contentCid for PDA derivation.
    const contentCidSliced = contentCid.slice(0, 5);
    const contentCidBuffer = Buffer.from(contentCidSliced, 'utf-8');
  
    // Derive the PDA using the seeds: "attestation", creator's public key, and the sliced CID.
    const [attestationPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from('attestation'),
        this.wallet.publicKey.toBuffer(),
        contentCidBuffer,
      ],
      this.program.programId
    );
  
    // Retrieve the account info from the blockchain.
    const accountInfo = await this.connection.getAccountInfo(attestationPda);
    return accountInfo ? accountInfo : null;
  }
  
  async registerContent(
    contentCid: string,
    metadataCid: string,
    contentType: string,
    title: string,
    description: string
  ): Promise<string> {
    // Use only the first 5 characters of contentCid for PDA derivation.
    const contentCidSliced = contentCid.slice(0, 5);
    const contentCidBuffer = Buffer.from(contentCidSliced, 'utf-8');

    // Derive the PDA using the seeds: constant "attestation", creator's public key, and the sliced CID.
    const [attestationPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from('attestation'),
        this.wallet.publicKey.toBuffer(),
        contentCidBuffer,
      ],
      this.program.programId
    );

    // Check if the attestation already exists.
    const accountInfo = await this.connection.getAccountInfo(attestationPda);
    if (accountInfo !== null) {
      throw new Error(`Attestation account already exists at PDA: ${attestationPda.toBase58()}`);
    }

    // Execute the transaction to register the content.
    const txSignature = await this.program.methods.registerContent(
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
      // If using a wallet adapter, the signing is handled automatically so you may omit signers.
      // .signers([this.wallet.payer])
      .rpc();

    return txSignature;
  }
}
