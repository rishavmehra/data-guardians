"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton, WalletDisconnectButton } from "@solana/wallet-adapter-react-ui";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Wallet, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNetworkContext } from "@/lib/networkContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNetworkSync } from "@/lib/networksync";
import { useToast } from "@/components/ui/use-toast";

const EnhancedWalletConnect = () => {
  const { connected, publicKey, wallet } = useWallet();
  const { network, setNetwork } = useNetworkContext();
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const { 
    isNetworkSynced, 
    actualNetwork, 
    checking, 
    errorMessage, 
    synchronize 
  } = useNetworkSync();

  // Handle hydration issues by only rendering wallet-specific elements on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle network switch - only allow if wallet is not connected
  const handleNetworkChange = (checked: boolean) => {
    if (connected && !isNetworkSynced) {
      toast({
        variant: "destructive",
        title: "Network mismatch",
        description: "Cannot change network while wallet is connected to a different network"
      });
      return;
    }
    
    const newNetwork = checked ? 'mainnet-beta' : 'devnet';
    setNetwork(newNetwork);
  };

  // Handle synchronizing the app to the wallet's network
  const handleSynchronize = () => {
    if (synchronize()) {
      toast({
        title: "Network synchronized",
        description: `Application switched to ${actualNetwork} to match your wallet`
      });
    } else {
      toast({
        variant: "destructive",
        title: "Synchronization failed",
        description: "Could not detect wallet network. Try reconnecting your wallet."
      });
    }
  };

  if (!isClient) {
    return <div className="h-24 bg-muted/40 rounded-lg animate-pulse"></div>;
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isMainnet = network === 'mainnet-beta';

  return (
    <Card className="mb-8 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Wallet Connection
        </CardTitle>
        <CardDescription>
          Connect your Solana wallet to authenticate and upload content
        </CardDescription>
      </CardHeader>
      <CardContent>
        {connected && publicKey ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1">
                Connected
              </Badge>
              <span className="text-sm text-muted-foreground font-mono">
                {truncateAddress(publicKey.toString())}
              </span>
              
              {checking ? (
                <Badge variant="outline" className="ml-auto animate-pulse">
                  Checking Network...
                </Badge>
              ) : isNetworkSynced ? (
                <Badge variant="outline" className="ml-auto bg-green-500/10 text-green-500 border-green-500/20">
                  Network Synced
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-auto bg-red-500/10 text-red-500 border-red-500/20">
                  Network Mismatch
                </Badge>
              )}
            </div>
            
            {/* Network Mismatch Warning */}
            {connected && !isNetworkSynced && errorMessage && (
              <Alert variant="destructive" className="mb-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex justify-between items-center">
                  <span>{errorMessage}</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex items-center gap-1" 
                    onClick={handleSynchronize}
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Sync</span>
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Your wallet is now authorized to authenticate content
              </span>
            </div>
            
            {/* Network Toggle */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-muted">
              <div>
                <Label htmlFor="network-toggle" className="font-medium">Network</Label>
                <p className="text-xs text-muted-foreground">
                  Currently on: <Badge variant={isMainnet ? "default" : "outline"} className={isMainnet ? "bg-blue-500" : "bg-orange-500/20 text-orange-600"}>
                    {isMainnet ? 'Mainnet' : 'Devnet'}
                  </Badge>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Devnet</span>
                <Switch 
                  id="network-toggle" 
                  checked={isMainnet}
                  onCheckedChange={handleNetworkChange}
                  disabled={connected && !isNetworkSynced}
                />
                <span className="text-xs text-muted-foreground">Mainnet</span>
              </div>
            </div>
            
            {/* Network Warning for Mainnet */}
            {isMainnet && (
              <Alert variant="warning" className="mt-3 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You are on Mainnet. All transactions will use real SOL and create permanent records.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Additional information about wallet network */}
            {actualNetwork && (
              <div className="mt-2 text-xs text-muted-foreground">
                Your wallet is connected to: <Badge variant="outline">{actualNetwork}</Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground mb-4">
            Connect your wallet to start protecting your digital content with blockchain verification.
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        {connected ? (
          <WalletDisconnectButton className="wallet-adapter-button-trigger bg-primary hover:bg-primary/90 text-white font-medium" />
        ) : (
          <WalletMultiButton className="wallet-adapter-button-trigger bg-primary hover:bg-primary/90 text-white font-medium" />
        )}
      </CardFooter>
    </Card>
  );
};

export default EnhancedWalletConnect;