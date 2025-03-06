"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { AnchorProvider, Program } from '@project-serum/anchor';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, Loader2, Shield, ArrowRight, ExternalLink, Copy } from "lucide-react";
import { useUploadContext } from "@/lib/uploadContext";

// Import IDL - bypass TypeScript errors with direct require and any type
// eslint-disable-next-line @typescript-eslint/no-var-requires
import IDL from '@/lib/idl/content_attestation.json';

// Fixed program ID from your IDL
const PROGRAM_ID = new PublicKey("9YB3E3Eyh71FbgUBxUwd76cKCtdxLKNmq6Cs2ryJ9Egm");

// Custom wallet wrapper type that matches what Anchor expects
interface AnchorWallet {
  publicKey: PublicKey;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
  signAllTransactions: (txs: Transaction[]) => Promise<Transaction[]>;
}

export const ContentAttestationComponent: React.FC = () => {
  const { publicKey, signTransaction, signAllTransactions, connected } = useWallet();
  const { toast } = useToast();
  
  // Get data from upload context
  const uploadContext = useUploadContext();
  
  // Form state
  const [contentCid, setContentCid] = useState<string>(uploadContext.contentCid || "");
  const [metadataCid, setMetadataCid] = useState<string>(uploadContext.metadataCid || "");
  const [contentType, setContentType] = useState<string>(uploadContext.contentType || "image");
  const [title, setTitle] = useState<string>(uploadContext.title || "");
  const [description, setDescription] = useState<string>(uploadContext.description || "");
  
  // Status state
  const [loading, setLoading] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [attestationSuccess, setAttestationSuccess] = useState<boolean>(false);
  const [txSignature, setTxSignature] = useState<string>("");
  const [existingAttestation, setExistingAttestation] = useState<any>(null);

  // Update form from upload context when it changes
  useEffect(() => {
    if (uploadContext.contentCid) {
      setContentCid(uploadContext.contentCid);
      setMetadataCid(uploadContext.metadataCid);
      setContentType(uploadContext.contentType || "image");
      setTitle(uploadContext.title || "");
      setDescription(uploadContext.description || "");
    }
  }, [uploadContext]);

  // Clear status on form change
  useEffect(() => {
    setErrorMessage("");
    setAttestationSuccess(false);
    setExistingAttestation(null);
  }, [contentCid]);

  // Copy to clipboard function
  const copyToClipboard = (e: React.MouseEvent<HTMLButtonElement>, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The value has been copied to your clipboard.",
    });
  };

  // Create a wallet object compatible with Anchor
  const getAnchorWallet = (): AnchorWallet | null => {
    if (!publicKey || !signTransaction || !signAllTransactions) {
      return null;
    }
    
    return {
      publicKey,
      // Cast the wallet adapter functions to the types Anchor expects
      signTransaction: (tx: Transaction) => signTransaction(tx) as Promise<Transaction>,
      signAllTransactions: (txs: Transaction[]) => signAllTransactions(txs) as Promise<Transaction[]>
    };
  };

  // Check for existing attestation
  const checkExistingAttestation = async (): Promise<void> => {
    if (!connected || !publicKey || !contentCid) return;
    
    setChecking(true);
    try {
      // Create connection
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com', 
        'confirmed'
      );
      
      // Get anchor wallet
      const wallet = getAnchorWallet();
      if (!wallet) {
        throw new Error("Wallet not ready");
      }
      
      // Create provider
      const provider = new AnchorProvider(
        connection,
        wallet,
        { commitment: 'confirmed' }
      );
      
      // Initialize program
      const program = new Program(IDL as any, PROGRAM_ID, provider);
      
      // Find PDA
      const [attestationPda] = await PublicKey.findProgramAddress(
        [
          Buffer.from('attestation'),
          publicKey.toBuffer(),
          Buffer.from(contentCid),
        ],
        program.programId
      );
      
      try {
        // Try to fetch the account
        const attestation: any = await program.account.ContentAttestation.fetch(attestationPda);
        
        // Using any type to bypass TypeScript checking
        setExistingAttestation(attestation);
        
        // Pre-fill form with existing data - with explicit any casts
        if (attestation) {
          // Use type assertion to bypass TypeScript errors
          setMetadataCid((attestation as any).metadataCid || "");
          setContentType((attestation as any).contentType || "image");
          setTitle((attestation as any).title || "");
          setDescription((attestation as any).description || "");
          
          toast({
            title: "Existing attestation found",
            description: "This content is already attested. You can update it.",
          });
        }
      } catch (error: any) {
        // Account doesn't exist or other error
        if (error.message?.includes("Account does not exist")) {
          setExistingAttestation(null);
        } else {
          console.error("Error fetching attestation:", error);
        }
      }
    } catch (error: any) {
      console.error("Error checking for existing attestation:", error);
    } finally {
      setChecking(false);
    }
  };

  // Handle form submission - create or update attestation
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!connected || !publicKey) {
      setErrorMessage("Please connect your wallet first");
      return;
    }
    
    if (!contentCid || !metadataCid) {
      setErrorMessage("Content CID and Metadata CID are required");
      return;
    }
    
    setLoading(true);
    setErrorMessage("");
    setStatusMessage("Preparing attestation transaction...");
    setAttestationSuccess(false);
    
    try {
      // Create connection
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com', 
        'confirmed'
      );
      
      // Get anchor wallet
      const wallet = getAnchorWallet();
      if (!wallet) {
        throw new Error("Wallet not ready");
      }
      
      // Create provider
      const provider = new AnchorProvider(
        connection,
        wallet,
        { commitment: 'confirmed', preflightCommitment: 'confirmed' }
      );
      
      // Initialize program
      const program = new Program(IDL as any, PROGRAM_ID, provider);
      
      // Find PDA
      const [attestationPda] = await PublicKey.findProgramAddress(
        [
          Buffer.from('attestation'),
          publicKey.toBuffer(),
          Buffer.from(contentCid),
        ],
        program.programId
      );
      
      console.log('Attestation PDA:', attestationPda.toString());
      
      // Clean input values
      const cleanContentCid = contentCid.trim();
      const cleanMetadataCid = metadataCid.trim();
      const cleanContentType = contentType.trim() || "image";
      const cleanTitle = title.trim() || "Untitled";
      const cleanDescription = description.trim() || "";
      
      let tx: string;
      
      if (existingAttestation) {
        // Update existing attestation
        setStatusMessage("Updating attestation on Solana blockchain...");
        
        // Format option parameters according to Anchor convention
        const metadataCidOption = { some: cleanMetadataCid };
        const titleOption = { some: cleanTitle };
        const descriptionOption = { some: cleanDescription };
        
        console.log("Update parameters:", {
          pda: attestationPda.toString(),
          metadataCidOption,
          titleOption,
          descriptionOption
        });
        
        tx = await program.methods
          .update_attestation(
            metadataCidOption,
            titleOption,
            descriptionOption
          )
          .accounts({
            attestation: attestationPda,
            creator: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
      } else {
        // Create new attestation
        setStatusMessage("Creating attestation on Solana blockchain...");
        
        console.log("Create parameters:", {
          contentCid: cleanContentCid,
          metadataCid: cleanMetadataCid,
          contentType: cleanContentType,
          title: cleanTitle,
          description: cleanDescription
        });
        
        tx = await program.methods
          .attest_content(
            cleanContentCid,
            cleanMetadataCid,
            cleanContentType,
            cleanTitle,
            cleanDescription
          )
          .accounts({
            attestation: attestationPda,
            creator: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
      }
      
      console.log("Transaction successful:", tx);
      setTxSignature(tx);
      setAttestationSuccess(true);
      setStatusMessage("Successfully attested content on the blockchain!");
      
      toast({
        title: existingAttestation ? "Attestation Updated" : "Attestation Created",
        description: "Your content has been successfully attested on the Solana blockchain.",
      });
    } catch (error: any) {
      console.error("Error creating attestation:", error);
      
      let errorMsg = "Failed to attest content";
      if (error.message) {
        if (error.message.includes("kind")) {
          errorMsg = "There was an issue with the blockchain transaction format. Please check your input values and try again.";
        } else {
          errorMsg += `: ${error.message}`;
        }
      }
      
      setErrorMessage(errorMsg);
      
      toast({
        variant: "destructive",
        title: "Attestation Failed",
        description: "There was an error creating the blockchain attestation.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <Card className="mt-6 bg-muted/30">
        <CardContent className="pt-6 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">Wallet Connection Required</h3>
          <p className="text-sm text-muted-foreground">
            Please connect your wallet to attest content on the blockchain
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Content Attestation
        </CardTitle>
        <CardDescription>
          Register your content on the Solana blockchain to prove authenticity and ownership
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content-cid">Content CID</Label>
            <div className="flex gap-2">
              <Input 
                id="content-cid" 
                placeholder="IPFS Content CID (e.g., QmX...)"
                value={contentCid}
                onChange={(e) => setContentCid(e.target.value)}
                required
                className="flex-1"
                disabled={loading}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={(e) => copyToClipboard(e, contentCid)}
                title="Copy Content CID"
                disabled={!contentCid || loading}
              >
                <Copy className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={checkExistingAttestation}
                disabled={!contentCid || checking || loading}
              >
                {checking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : "Check"}
              </Button>
            </div>
            
            {checking && (
              <p className="text-xs text-muted-foreground">Checking for existing attestation...</p>
            )}
            
            {existingAttestation && (
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  Existing
                </Badge>
                <span className="text-xs ml-2 text-muted-foreground">
                  This content has an existing attestation that will be updated
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="metadata-cid">Metadata CID</Label>
            <div className="flex gap-2">
              <Input 
                id="metadata-cid" 
                placeholder="IPFS Metadata CID (e.g., QmY...)"
                value={metadataCid}
                onChange={(e) => setMetadataCid(e.target.value)}
                required
                className="flex-1"
                disabled={loading}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={(e) => copyToClipboard(e, metadataCid)}
                title="Copy Metadata CID"
                disabled={!metadataCid || loading}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content-type">Content Type</Label>
            <Select 
              value={contentType} 
              onValueChange={setContentType}
              disabled={loading}
            >
              <SelectTrigger id="content-type" className="w-full">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              placeholder="Content title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Content description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>
          
          {statusMessage && !errorMessage && !attestationSuccess && (
            <div className="rounded-md bg-blue-500/10 p-3 border border-blue-200 dark:border-blue-900">
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 text-blue-600 mr-2 animate-spin" />
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">{statusMessage}</p>
              </div>
            </div>
          )}
          
          {errorMessage && (
            <div className="rounded-md bg-red-500/10 p-4 border border-red-200 dark:border-red-900">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">Attestation Error</p>
                  <p className="text-xs text-red-500 dark:text-red-300 mt-1">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          {attestationSuccess && (
            <div className="rounded-md bg-green-500/10 p-4 border border-green-200 dark:border-green-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  {existingAttestation ? "Attestation updated successfully!" : "Content successfully attested!"}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="text-xs font-mono mb-2 overflow-hidden text-ellipsis">
                <span className="text-muted-foreground">Transaction: </span>
                <a 
                  href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  {txSignature.slice(0, 14)}...{txSignature.slice(-14)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your content is now verifiably authenticated on the Solana blockchain.
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading || !contentCid || !metadataCid}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {existingAttestation ? "Updating Attestation..." : "Creating Attestation..."}
              </>
            ) : (
              <>
                {existingAttestation ? "Update Attestation" : "Create Attestation"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};