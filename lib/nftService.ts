import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex, keypairIdentity, walletAdapterIdentity } from '@metaplex-foundation/js';

export class NFTService {
  private connection: Connection;
  private metaplex: Metaplex;

  constructor(connection: Connection, wallet: any) {
    this.connection = connection;
    
    // Create Metaplex instance
    this.metaplex = Metaplex.make(this.connection);
    
    // Set the wallet identity using the appropriate method
    // For wallet adapter (from UI)
    if (wallet.publicKey && wallet.signTransaction) {
      this.metaplex = this.metaplex.use(walletAdapterIdentity(wallet));
    } 
    // For keypair (from backend/scripts)
    else if (wallet.secretKey) {
      this.metaplex = this.metaplex.use(keypairIdentity(wallet));
    }
  }

  /**
   * Mints an NFT for attested content
   */
  async mintAttestationNFT(
    contentCid: string,
    metadataCid: string,
    title: string,
    description: string,
    contentType: string
  ) {
    try {
      console.log(`Minting NFT for content: ${contentCid}`);
      
      // The metadata URI should already exist from the content upload
      const metadataUri = `https://gateway.pinata.cloud/ipfs/${metadataCid}`;
      
      // Prepare the NFT metadata
      const nftMetadata = {
        name: title,
        description: description,
        image: `https://gateway.pinata.cloud/ipfs/${contentCid}`,
        attributes: [
          {
            trait_type: "Content CID",
            value: contentCid
          },
          {
            trait_type: "Content Type",
            value: contentType
          },
          {
            trait_type: "Attestation Time",
            value: new Date().toISOString()
          }
        ],
        properties: {
          files: [
            {
              uri: `https://gateway.pinata.cloud/ipfs/${contentCid}`,
              type: contentType
            }
          ]
        }
      };

      // Create NFT using the existing metadata URI
      // This assumes you already have uploaded the metadata JSON to IPFS
      const { nft } = await this.metaplex.nfts().create({
        uri: metadataUri,
        name: title,
        sellerFeeBasisPoints: 0, // No royalties for attestations
        symbol: "ATTST"
      });

      console.log(`NFT minted successfully: ${nft.address.toString()}`);
      
      return {
        mintAddress: nft.address.toString(),
        metadataUri: metadataUri,
        success: true
      };
    } catch (error: any) {
      console.error("Error minting NFT:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verifies if a content has an NFT attestation
   */
  async verifyContentNFT(contentCid: string) {
    try {
      // Find NFTs by creator
      const nfts = await this.metaplex.nfts().findAllByCreator({
        creator: this.metaplex.identity().publicKey
      });

      // Find the NFT that matches this content CID
      const matchingNft = nfts.find(nft => {
        if (!nft.json) return false;
        
        // Check attributes array
        const attributes = nft.json.attributes || [];
        return attributes.some(
          attr => attr.trait_type === "Content CID" && attr.value === contentCid
        );
      });

      if (matchingNft) {
        return {
          verified: true,
          nftAddress: matchingNft.address.toString(),
          metadata: matchingNft.json
        };
      }

      return {
        verified: false,
        message: "No NFT attestation found for this content"
      };
    } catch (error: any) {
      console.error("Error verifying content NFT:", error);
      return {
        verified: false,
        error: error.message
      };
    }
  }
}