"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Connection } from "@solana/web3.js";

interface NetworkContextType {
  endpoint: string;
  connection: Connection;
}

// Define RPC URL for mainnet
const MAINNET_RPC_URL = process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=f951b305-fe40-48cd-b999-82a48ef8d595';

const NetworkContext = createContext<NetworkContextType>({
  endpoint: MAINNET_RPC_URL,
  connection: new Connection(MAINNET_RPC_URL),
});

export const NetworkProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [connection, setConnection] = useState(new Connection(MAINNET_RPC_URL));

  // Initialize connection
  useEffect(() => {
    console.log(`Initializing connection to Solana mainnet with endpoint: ${MAINNET_RPC_URL}`);
    setConnection(new Connection(MAINNET_RPC_URL));
  }, []);

  return (
    <NetworkContext.Provider value={{ 
      endpoint: MAINNET_RPC_URL,
      connection 
    }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = () => useContext(NetworkContext);
