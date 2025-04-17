import { Connection, PublicKey } from '@solana/web3.js';
import { 
  Metaplex, 
  walletAdapterIdentity,
  keypairIdentity
} from '@metaplex-foundation/js';

// This is the collection address for DataGuardians attestations on mainnet
const MAINNET_COLLECTION_ADDRESS = new PublicKey('J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w');

export class CompressedNftService {
  private connection: Connection;
  private metaplex: Metaplex;
  private collectionAddress: PublicKey;

  constructor(connection: Connection, wallet: any, network: string = 'mainnet-beta', collectionAddress?: PublicKey) {
    this.connection = connection;
    
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
    
    // Set collection address if provided, otherwise use default mainnet address
    this.collectionAddress = collectionAddress || MAINNET_COLLECTION_ADDRESS;
    
    console.log(`CompressedNftService initialized on mainnet with collection: ${this.collectionAddress.toString()}`);
  }

  /**
   * Create a DataGuardians collection for compressed NFTs (only needs to be done once)
   */
  async createCollection(name: string, symbol: string = 'DG') {
    try {
      console.log(`Creating DataGuardians Collection for compressed NFTs on mainnet`);
      
      // Create the collection NFT
      const { nft } = await this.metaplex.nfts().create({
        name: name,
        symbol: symbol,
        uri: 'https://raw.githubusercontent.com/metaplex-foundation/mpl-token-metadata/main/assets/example-metadata.json', // Replace with your collection metadata
        sellerFeeBasisPoints: 0, // No royalties
        isCollection: true,
      });
      
      console.log(`Collection created with address: ${nft.address.toString()} on mainnet`);
      
      return {
        success: true,
        collectionAddress: nft.address.toString(),
        collectionNft: nft,
        network: 'mainnet-beta'
      };
    } catch (error: any) {
      console.error(`Error creating collection on mainnet:`, error);
      return {
        success: false,
        error: error.message,
        network: 'mainnet-beta'
      };
    }
  }

  /**
   * Create a regular NFT attestation for content
   */
  async createAttestation(
    contentCid: string,
    metadataCid: string,
    title: string,
    description: string,
    contentType: string
  ) {
    try {
      console.log(`Creating NFT attestation for content: ${contentCid} on mainnet`);
      
      // Validate that the network connection matches mainnet
      const genesisHash = await this.connection.getGenesisHash();
      const MAINNET_GENESIS = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d";
      
      if (genesisHash !== MAINNET_GENESIS) {
        throw new Error(`Network mismatch. Connected to a non-mainnet environment. Please use a mainnet connection.`);
      }
      
      // The metadata URI from Pinata (already uploaded)
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
      
      console.log(`NFT attestation created with address: ${nft.address.toString()} on mainnet`);
      
      return {
        success: true,
        mintAddress: nft.address.toString(),
        metadataUri: metadataUri,
        network: 'mainnet-beta'
      };
    } catch (error: any) {
      console.error(`Error creating NFT attestation on mainnet:`, error);
      return {
        success: false,
        error: error.message,
        network: 'mainnet-beta'
      };
    }
  }

  /**
   * Verify a content attestation based on the content CID
   */
  async verifyAttestation(contentCid: string) {
    try {
      console.log(`Verifying attestation for content: ${contentCid} on mainnet`);
      
      // Find NFTs by creator or collection
      const nfts = await this.metaplex.nfts().findAllByCreator({
        creator: this.metaplex.identity().publicKey,
      });
      
      // Filter NFTs that belong to our collection
      const collectionNfts = nfts.filter(nft => 
        nft.collection?.address.equals(this.collectionAddress)
      );
      
      // Find the NFT that matches this content CID
      const matchingNft = collectionNfts.find(nft => {
        if (!nft.json) return false;
        
        // Check attributes array
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
          network: 'mainnet-beta'
        };
      }

      return {
        verified: false,
        message: `No attestation found for this content on mainnet`,
        network: 'mainnet-beta'
      };
    } catch (error: any) {
      console.error(`Error verifying attestation on mainnet:`, error);
      return {
        verified: false,
        error: error.message,
        network: 'mainnet-beta'
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
