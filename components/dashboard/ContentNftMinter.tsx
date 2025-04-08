"use client";

import React, { useState, useEffect } from "react";
import { Connection, PublicKey } from '@solana/web3.js';
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle2, Copy, AlertCircle, ExternalLink, ArrowRight } from "lucide-react";
import { NFTService } from "@/lib/nftService";
import VerificationBadge from "../verification/VerificationBadge";

interface ContentNftMinterProps {
  contentCid: string;
  metadataCid: string;
  contentType: string;
  title: string;
  description: string;
  isAttestationSuccessful: boolean;
  txSignature: string;
}

const ContentNftMinter: React.FC<ContentNftMinterProps> = ({
  contentCid,
  metadataCid,
  contentType,
  title,
  description,
  isAttestationSuccessful,
  txSignature
}) => {
  const { publicKey, signTransaction, connected } = useWallet();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [minted, setMinted] = useState(false);
  const [nftAddress, setNftAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If attestation is successful and no NFT has been minted yet, auto-mint
  useEffect(() => {
    if (isAttestationSuccessful && !minted && !loading && !error && contentCid && metadataCid) {
      handleMintNft();
    }
  }, [isAttestationSuccessful, contentCid, metadataCid]);

  const handleMintNft = async () => {
    if (!connected || !publicKey) {
      setError("Wallet connection required");
      return;
    }

    if (!contentCid || !metadataCid) {
      setError("Content and metadata CIDs are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
        'confirmed'
      );

      // Create wallet with required signTransaction function
      const wallet = {
        publicKey,
        signTransaction,
        signAllTransactions: signTransaction ? (txs: any[]) => Promise.all(txs.map(tx => signTransaction(tx))) : undefined
      };

      const nftService = new NFTService(connection, wallet);

      const result = await nftService.mintAttestationNFT(
        contentCid,
        metadataCid,
        title || "Content Attestation",
        description || "",
        contentType || "unknown"
      );

      if (result.success) {
        setMinted(true);
        // @ts-ignore
        setNftAddress(result.mintAddress);

        toast({
          title: "NFT Created Successfully",
          description: "Your content attestation has been minted as an NFT",
        });
      } else {
        setError(result.error || "Failed to mint NFT");

        toast({
          variant: "destructive",
          title: "NFT Minting Failed",
          description: result.error || "There was an error creating the NFT.",
        });
      }
    } catch (err: any) {
      console.error("Error minting NFT:", err);
      setError(err.message || "Unknown error minting NFT");

      toast({
        variant: "destructive",
        title: "NFT Minting Failed",
        description: "There was an unexpected error creating the NFT.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard.",
    });
  };

  // Only show if attestation was successful
  if (!isAttestationSuccessful) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-500/10 text-primary border-primary/20">
            NFT
          </Badge>
          NFT Creation
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 mr-2 animate-spin text-primary" />
            <span>Minting NFT for your content...</span>
          </div>
        )}

        {error && !minted && (
          <div className="rounded-md bg-red-500/10 p-4 border border-red-200 dark:border-red-900">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">NFT Minting Error</p>
                <p className="text-xs text-red-500 dark:text-red-300 mt-1">{error}</p>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={handleMintNft}
                  disabled={loading}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {minted && nftAddress && (
          <div className="space-y-4">
            <div className="rounded-md bg-green-500/10 p-4 border border-green-200 dark:border-green-900">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  NFT created successfully!
                </span>
              </div>

              <div className="text-xs font-mono my-2">
                <span className="text-muted-foreground">NFT Address: </span>
                <a
                  href={`https://explorer.solana.com/address/${nftAddress}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  {nftAddress.slice(0, 12)}...{nftAddress.slice(-8)}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => copyToClipboard(nftAddress)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Verification Badge Preview:</h4>
              <VerificationBadge
                creator={publicKey?.toString() || ""}
                contentCid={contentCid}
                timestamp={new Date().toISOString()}
              />

              <Button
                type="button" // Add this line to prevent form submission
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={(e) => {
                  e.preventDefault(); // Add this line to prevent any default behavior
                  const embedCode = `<iframe src="${window.location.origin}/verify/${contentCid}" width="300" height="80" frameborder="0"></iframe>`;
                  copyToClipboard(embedCode);
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Embed Code
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => {
                  // Generate shareable URL for verification
                  const verifyUrl = `${window.location.origin}/verify/${contentCid}`;
                  copyToClipboard(verifyUrl);
                }}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Share Verification Link
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentNftMinter;
