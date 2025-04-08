"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { CompressedNftService } from './compressedNftService';

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
  const [compressedNftService, setCompressedNftService] = useState<CompressedNftService | null>(null);
  const [collectionAddress, setCollectionAddress] = useState<PublicKey | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the service when wallet or collection address changes
  useEffect(() => {
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

    // Create a new service instance with the current wallet and connection
    const service = new CompressedNftService(
      connection,
      wallet,
      collectionAddress || undefined
    );
    
    setCompressedNftService(service);
    setIsInitialized(true);
  }, [publicKey, signTransaction, signAllTransactions, connection, collectionAddress]);

  // Create a new collection
  const createCollection = async (name: string, symbol?: string) => {
    if (!compressedNftService) {
      return { success: false, error: 'Service not initialized' };
    }
    
    const result = await compressedNftService.createCollection(name, symbol);
    
    if (result.success && result.collectionAddress) {
      setCollectionAddress(new PublicKey(result.collectionAddress));
    }
    
    return result;
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
    
    return await compressedNftService.createAttestation(
      contentCid,
      metadataCid,
      title,
      description,
      contentType
    );
  };

  // Verify an attestation
  const verifyAttestation = async (contentCid: string) => {
    if (!compressedNftService) {
      return { verified: false, error: 'Service not initialized' };
    }
    
    return await compressedNftService.verifyAttestation(contentCid);
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