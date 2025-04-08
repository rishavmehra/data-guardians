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

// Define RPC URLs for each network
const RPC_URLS = {
  'devnet': process.env.NEXT_PUBLIC_DEVNET_RPC_URL || 'https://devnet.helius-rpc.com/?api-key=f951b305-fe40-48cd-b999-82a48ef8d595',
  'mainnet-beta': process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=f951b305-fe40-48cd-b999-82a48ef8d595'
};

const NetworkContext = createContext<NetworkContextType>({
  network: 'devnet',
  setNetwork: () => {},
  endpoint: RPC_URLS['devnet'],
  connection: new Connection(RPC_URLS['devnet']),
});

export const NetworkProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [network, setNetwork] = useState<NetworkType>('devnet');
  const [endpoint, setEndpoint] = useState(RPC_URLS['devnet']);
  const [connection, setConnection] = useState(new Connection(RPC_URLS['devnet']));

  // Update connection when network changes
  useEffect(() => {
    const newEndpoint = RPC_URLS[network];
    console.log(`Switching to ${network} network with endpoint: ${newEndpoint}`);
    setEndpoint(newEndpoint);
    setConnection(new Connection(newEndpoint));
    
    // Store the selected network in localStorage to persist between sessions
    localStorage.setItem('selectedNetwork', network);
  }, [network]);

  // Load the previously selected network from localStorage on initial render
  useEffect(() => {
    const savedNetwork = localStorage.getItem('selectedNetwork') as NetworkType | null;
    if (savedNetwork && (savedNetwork === 'devnet' || savedNetwork === 'mainnet-beta')) {
      setNetwork(savedNetwork);
    }
  }, []);

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
