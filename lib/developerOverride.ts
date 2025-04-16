/**
 * Local development environment override settings
 * This file allows forcing specific behaviors when running in development mode
 */

export const DEV_OVERRIDES = {
    // Force the wallet to be treated as connected to this network regardless of detection
    FORCE_WALLET_NETWORK: 'mainnet-beta', // 'mainnet-beta' or 'devnet' or null to disable
  
    // Force skip network validation in development - CRITICAL FOR ATTESTATION
    SKIP_NETWORK_VALIDATION: true,
  
    // Development RPC endpoints - use these for better reliability during development
    RPC_ENDPOINTS: {
      'devnet': 'https://api.devnet.solana.com',
      'mainnet-beta': 'https://api.mainnet-beta.solana.com',
    },
    
    // For local development, provide a mock attestation response
    MOCK_ATTESTATION_RESPONSE: {
      success: true,
      mintAddress: "mock-mint-address-for-development-only",
      metadataUri: "https://gateway.pinata.cloud/ipfs/mock-metadata-cid",
      network: "mainnet-beta"
    },
    
    // Enable mock responses for development
    ENABLE_MOCK_RESPONSES: true
  };
  
  /**
   * Check if we're running in development mode
   */
  export const isDevelopment = () => {
    return process.env.NODE_ENV === 'development' || 
      typeof window !== 'undefined' && window.location.hostname === 'localhost';
  };