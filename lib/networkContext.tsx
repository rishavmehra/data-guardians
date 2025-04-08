"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl, Connection } from "@solana/web3.js";

type NetworkType = 'devnet' | 'mainnet-beta';

interface NetworkContextType {
  network: NetworkType;
  setNetwork: (network: NetworkType) => void;
  endpoint: string;
  connection: Connection;
}

const NetworkContext = createContext<NetworkContextType>({
  network: 'devnet',
  setNetwork: () => {},
  endpoint: clusterApiUrl('devnet'),
  connection: new Connection(clusterApiUrl('devnet')),
});

export const NetworkProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [network, setNetwork] = useState<NetworkType>('devnet');
  const [endpoint, setEndpoint] = useState(clusterApiUrl('devnet'));
  const [connection, setConnection] = useState(new Connection(clusterApiUrl('devnet')));

  // Update connection when network changes
  useEffect(() => {
    const newEndpoint = clusterApiUrl(network);
    setEndpoint(newEndpoint);
    setConnection(new Connection(newEndpoint));
  }, [network]);

  return (
    <NetworkContext.Provider value={{ 
      network, 
      setNetwork, 
      endpoint,
      connection 
    }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = () => useContext(NetworkContext);