"use client";

import { useEffect, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNetworkContext } from './networkContext';
import { Connection } from '@solana/web3.js';

/**
 * Hook to ensure wallet and app network are synchronized
 * Returns network status and validation information
 */
export function useNetworkSync() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const { network, endpoint, setNetwork } = useNetworkContext();
  const [isNetworkSynced, setIsNetworkSynced] = useState<boolean>(true);
  const [actualNetwork, setActualNetwork] = useState<string | null>(null);
  const [checking, setChecking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if wallet is connected to the expected network
  useEffect(() => {
    async function validateNetwork() {
      if (!connected || !publicKey) {
        setIsNetworkSynced(true);
        setActualNetwork(null);
        return;
      }

      setChecking(true);
      try {
        // Get genesis hash for the current connection
        const genesisHash = await connection.getGenesisHash();
        
        // Known genesis hashes for different Solana networks
        const MAINNET_GENESIS = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d";
        const DEVNET_GENESIS = "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG";
        const TESTNET_GENESIS = "4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY";
        
        let detectedNetwork = null;
        if (genesisHash === MAINNET_GENESIS) detectedNetwork = "mainnet-beta";
        else if (genesisHash === DEVNET_GENESIS) detectedNetwork = "devnet";
        else if (genesisHash === TESTNET_GENESIS) detectedNetwork = "testnet";
        else detectedNetwork = "unknown";
        
        setActualNetwork(detectedNetwork);
        
        // Check if UI network matches actual network
        const isSync = (network === detectedNetwork) || 
                       (network === "mainnet-beta" && detectedNetwork === "mainnet");
        setIsNetworkSynced(isSync);
        
        if (!isSync) {
          console.warn(`Network mismatch: UI shows "${network}" but wallet is connected to "${detectedNetwork}"`);
          setErrorMessage(`Your wallet is connected to ${detectedNetwork} but the app is set to ${network}. Please switch to match.`);
        } else {
          setErrorMessage(null);
        }
      } catch (error) {
        console.error("Error validating network:", error);
        setIsNetworkSynced(false);
        setErrorMessage("Could not verify wallet network. Please check your connection.");
      } finally {
        setChecking(false);
      }
    }

    validateNetwork();
    
    // Set up an interval to periodically check network sync
    const interval = setInterval(validateNetwork, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [connection, publicKey, connected, network]);

  return {
    isNetworkSynced,
    actualNetwork,
    checking,
    errorMessage,
    expectedNetwork: network,
    synchronize: () => {
      if (actualNetwork && actualNetwork !== "unknown") {
        setNetwork(actualNetwork as any);
        return true;
      }
      return false;
    }
  };
}
