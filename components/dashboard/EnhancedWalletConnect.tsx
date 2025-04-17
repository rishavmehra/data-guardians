"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton, WalletDisconnectButton } from "@solana/wallet-adapter-react-ui";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Wallet, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

const EnhancedWalletConnect = () => {
  const { connected, publicKey, wallet } = useWallet();
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  // Handle hydration issues by only rendering wallet-specific elements on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="h-24 bg-muted/40 rounded-lg animate-pulse"></div>;
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

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
              
              <Badge variant="default" className="ml-auto bg-blue-500 text-white">
                Mainnet
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Your wallet is now authorized to authenticate content
              </span>
            </div>
            
            {/* Mainnet Info */}
            <Alert variant="default" className="mt-3 bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are on Solana Mainnet. All transactions will use real SOL and create permanent records.
              </AlertDescription>
            </Alert>
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
