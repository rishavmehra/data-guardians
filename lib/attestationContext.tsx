"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { CompressedNftService } from './compressedNftService';
import { useNetworkContext } from './networkContext';

// Attestation Context Type
interface AttestationContextType {
  compressedNftService: CompressedNftService | null;
  collectionAddress: PublicKey | null;
  setCollectionAddress: (address: PublicKey) => void;
  isInitialized: boolean;
  createCollection: (name: string, symbol?: string) => Promise<any>;
  createAttestation: (
    contentCid: string,
    metadataCid: string,
    title: string,
    description: string,
    contentType: string
  ) => Promise<any>;
  verifyAttestation: (contentCid: string) => Promise<any>;
}

// Create the context
const AttestationContext = createContext<AttestationContextType>({
  compressedNftService: null,
  collectionAddress: null,
  setCollectionAddress: () => {},
  isInitialized: false,
  createCollection: async () => ({}),
  createAttestation: async () => ({}),
  verifyAttestation: async () => ({}),
});

// Provider component
export const AttestationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const { network } = useNetworkContext();
  const [compressedNftService, setCompressedNftService] = useState<CompressedNftService | null>(null);
  const [collectionAddress, setCollectionAddress] = useState<PublicKey | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Collection addresses by network
  const COLLECTION_ADDRESSES = {
    'devnet': new PublicKey('J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w'),
    'mainnet-beta': new PublicKey('J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w') // Replace with actual mainnet address
  };

  // Initialize the service when wallet, connection, or network changes
  useEffect(() => {
    const initializeService = async () => {
      if (!publicKey || !signTransaction || !connection) {
        setCompressedNftService(null);
        setIsInitialized(false);
        return;
      }
  
      const wallet = {
        publicKey,
        signTransaction,
        signAllTransactions
      };
  
      const networkSpecificCollection = COLLECTION_ADDRESSES[network as keyof typeof COLLECTION_ADDRESSES];
      
      // Create a new service instance with the current wallet, connection, and network
      const service = new CompressedNftService(
        connection,
        wallet,
        network,
        collectionAddress || networkSpecificCollection
      );
      
      setCompressedNftService(service);
      
      // If no specific collection is set, use the network default
      if (!collectionAddress) {
        setCollectionAddress(networkSpecificCollection);
      }
      
      console.log(`Attestation service initialized for ${network} network`);
      setIsInitialized(true);
    };

    initializeService();
  }, [publicKey, signTransaction, signAllTransactions, connection, network, collectionAddress]);

  // Create a new collection
  const createCollection = async (name: string, symbol?: string) => {
    if (!compressedNftService) {
      return { success: false, error: 'Service not initialized' };
    }
    
    const result = await compressedNftService.createCollection(name, symbol);
    
    if (result.success && result.collectionAddress) {
      setCollectionAddress(new PublicKey(result.collectionAddress));
    }
    
    return {
      ...result,
      network
    };
  };

  // Create an attestation
  const createAttestation = async (
    contentCid: string,
    metadataCid: string,
    title: string,
    description: string,
    contentType: string
  ) => {
    if (!compressedNftService) {
      return { success: false, error: 'Service not initialized' };
    }
    
    const result = await compressedNftService.createAttestation(
      contentCid,
      metadataCid,
      title,
      description,
      contentType
    );
    
    return {
      ...result,
      network
    };
  };

  // Verify an attestation
  const verifyAttestation = async (contentCid: string) => {
    if (!compressedNftService) {
      return { verified: false, error: 'Service not initialized' };
    }
    
    const result = await compressedNftService.verifyAttestation(contentCid);
    
    return {
      ...result,
      network
    };
  };

  return (
    <AttestationContext.Provider
      value={{
        compressedNftService,
        collectionAddress,
        setCollectionAddress,
        isInitialized,
        createCollection,
        createAttestation,
        verifyAttestation,
      }}
    >
      {children}
    </AttestationContext.Provider>
  );
};

// Hook to use the attestation context
export const useAttestation = () => useContext(AttestationContext);
