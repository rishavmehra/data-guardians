import { Connection, PublicKey } from '@solana/web3.js';
import { 
  Metaplex, 
  walletAdapterIdentity,
  keypairIdentity
} from '@metaplex-foundation/js';

// This is where you would define the collection address for your DataGuardians attestations
// You'll need separate collections for Devnet and Mainnet
const COLLECTION_ADDRESSES = {
  'devnet': new PublicKey('J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w'),
  'mainnet-beta': new PublicKey('J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w') // Replace with actual Mainnet collection when ready
};

export class CompressedNftService {
  private connection: Connection;
  private metaplex: Metaplex;
  private collectionAddress: PublicKey;
  private network: string;

  constructor(connection: Connection, wallet: any, network: string = 'devnet', collectionAddress?: PublicKey) {
    this.connection = connection;
    this.network = network;
    
    // Create Metaplex instance with appropriate identity
    this.metaplex = Metaplex.make(this.connection);
    
    // Set the wallet identity using the appropriate method
    if (wallet.publicKey && wallet.signTransaction) {
      this.metaplex = this.metaplex.use(walletAdapterIdentity(wallet));
    } 
    // For keypair (from backend/scripts)
    else if (wallet.secretKey) {
      this.metaplex = this.metaplex.use(keypairIdentity(wallet));
    }
    
    // Set collection address based on network if not explicitly provided
    this.collectionAddress = collectionAddress || COLLECTION_ADDRESSES[network as keyof typeof COLLECTION_ADDRESSES];
    
    console.log(`CompressedNftService initialized on ${network} with collection: ${this.collectionAddress.toString()}`);
  }

  /**
   * Create a DataGuardians collection for compressed NFTs (only needs to be done once)
   */
  async createCollection(name: string, symbol: string = 'DG') {
    try {
      console.log(`Creating DataGuardians Collection for compressed NFTs on ${this.network}`);
      
      // Create the collection NFT
      const { nft } = await this.metaplex.nfts().create({
        name: name,
        symbol: symbol,
        uri: 'https://raw.githubusercontent.com/metaplex-foundation/mpl-token-metadata/main/assets/example-metadata.json', // Replace with your collection metadata
        sellerFeeBasisPoints: 0, // No royalties
        isCollection: true,
      });
      
      console.log(`Collection created with address: ${nft.address.toString()} on ${this.network}`);
      
      return {
        success: true,
        collectionAddress: nft.address.toString(),
        collectionNft: nft,
        network: this.network
      };
    } catch (error: any) {
      console.error(`Error creating collection on ${this.network}:`, error);
      return {
        success: false,
        error: error.message,
        network: this.network
      };
    }
  }

  /**
   * Create a regular NFT attestation for content
   * Note: We're using regular NFTs instead of compressed NFTs due to the simplified implementation
   */
  async createAttestation(
    contentCid: string,
    metadataCid: string,
    title: string,
    description: string,
    contentType: string
  ) {
    try {
      console.log(`Creating NFT attestation for content: ${contentCid} on ${this.network}`);
      
      // Validate that the network connection matches the expected network
      const genesisHash = await this.connection.getGenesisHash();
      const expectedHash = this.network === 'mainnet-beta' 
        ? "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d" 
        : "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG";
      
      if (genesisHash !== expectedHash) {
        throw new Error(`Network mismatch. Connected to ${genesisHash === "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d" ? "mainnet" : "devnet"} but expected ${this.network}`);
      }
      
      // The metadata URI from Pinata (already uploaded)
      // This assumes you've already created proper metadata with the contentCid in it
      const metadataUri = `https://gateway.pinata.cloud/ipfs/${metadataCid}`;
      
      // Create an NFT with the metadata URI
      const { nft } = await this.metaplex.nfts().create({
        uri: metadataUri,
        name: title,
        sellerFeeBasisPoints: 0, // No royalties
        symbol: 'ATTST',
        // Use the collection if available
        collection: this.collectionAddress
      });
      
      console.log(`NFT attestation created with address: ${nft.address.toString()} on ${this.network}`);
      
      return {
        success: true,
        mintAddress: nft.address.toString(),
        metadataUri: metadataUri,
        network: this.network
      };
    } catch (error: any) {
      console.error(`Error creating NFT attestation on ${this.network}:`, error);
      return {
        success: false,
        error: error.message,
        network: this.network
      };
    }
  }

  /**
   * Verify a content attestation based on the content CID
   */
  async verifyAttestation(contentCid: string) {
    try {
      console.log(`Verifying attestation for content: ${contentCid} on ${this.network}`);
      
      // Find NFTs by creator or collection
      const nfts = await this.metaplex.nfts().findAllByCreator({
        creator: this.metaplex.identity().publicKey,
      });
      
      // Filter NFTs that belong to our collection
      const collectionNfts = nfts.filter(nft => 
        nft.collection?.address.equals(this.collectionAddress)
      );
      
      // Find the NFT that matches this content CID - this requires the metadata to include the contentCid
      const matchingNft = collectionNfts.find(nft => {
        if (!nft.json) return false;
        
        // Check if the NFT metadata contains a reference to our content CID
        // This could be in attributes, properties, or a direct field
        const attributes = nft.json.attributes || [];
        const hasContentCid = attributes.some(
          attr => attr.trait_type === "Content CID" && attr.value === contentCid
        );
        
        // Also check properties if it exists
        const properties = nft.json.properties || {};
        const hasContentCidInProperties = properties.contentCid === contentCid;
        
        return hasContentCid || hasContentCidInProperties;
      });

      if (matchingNft) {
        // Extract the creation date from metadata if available, otherwise use current date
        let creationDate = new Date().toISOString();
        if (matchingNft.json?.properties?.createdAt) {
          creationDate = matchingNft.json.properties.createdAt as string;
        }
        
        return {
          verified: true,
          nftAddress: matchingNft.address.toString(),
          metadata: matchingNft.json,
          createdAt: creationDate,
          network: this.network
        };
      }

      return {
        verified: false,
        message: `No attestation found for this content on ${this.network}`,
        network: this.network
      };
    } catch (error: any) {
      console.error(`Error verifying attestation on ${this.network}:`, error);
      return {
        verified: false,
        error: error.message,
        network: this.network
      };
    }
  }

  /**
   * Utility method to check if a collection exists
   */
  async collectionExists() {
    try {
      const nft = await this.metaplex.nfts().findByMint({ mintAddress: this.collectionAddress });
      return !!nft;
    } catch (error) {
      return false;
    }
  }
}