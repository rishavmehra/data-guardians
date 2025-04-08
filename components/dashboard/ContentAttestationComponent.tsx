"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from '@solana/web3.js';
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
import { useAttestation } from "@/lib/attestationContext";
import VerificationBadge from "../verification/VerificationBadge";

export const ContentAttestationComponent: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { toast } = useToast();
  const { createAttestation, verifyAttestation, isInitialized } = useAttestation();
  
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
  const [mintAddress, setMintAddress] = useState<string>("");

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

  // Check for existing attestation
  const checkExistingAttestation = async (): Promise<void> => {
    if (!connected || !publicKey || !contentCid) return;
    
    setChecking(true);
    try {
      const result = await verifyAttestation(contentCid);
      
      if (result.verified) {
        setExistingAttestation(result);
        
        // Pre-fill form with existing data if available
        if (result.metadata) {
          const metadata = result.metadata;
          // Extract data from metadata if available
          setTitle(metadata.name || title);
          setDescription(metadata.description || description);
          
          // Try to find content type in attributes
          if (metadata.attributes) {
            const contentTypeAttr = metadata.attributes.find(
              (attr: any) => attr.trait_type === "Content Type"
            );
            if (contentTypeAttr) {
              setContentType(contentTypeAttr.value);
            }
          }
        }
        
        toast({
          title: "Existing attestation found",
          description: "This content is already attested. Creating a new attestation will make a duplicate.",
        });
      } else {
        setExistingAttestation(null);
        toast({
          title: "No existing attestation",
          description: "This content has not been attested yet.",
        });
      }
    } catch (error: any) {
      console.error("Error checking for existing attestation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to check attestation: ${error.message}`,
      });
    } finally {
      setChecking(false);
    }
  };

  // Handle form submission - create attestation
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
    
    // Warning if attestation already exists
    if (existingAttestation) {
      toast({
        variant: "default",
        title: "Attestation already exists",
        description: "This will create a duplicate attestation for the same content."
      });
    }
    
    setLoading(true);
    setErrorMessage("");
    setStatusMessage("Preparing attestation transaction...");
    setAttestationSuccess(false);
    
    try {
      // Clean input values
      const cleanContentCid = contentCid.trim();
      const cleanMetadataCid = metadataCid.trim();
      const cleanContentType = contentType.trim() || "image";
      const cleanTitle = title.trim() || "Untitled";
      const cleanDescription = description.trim() || "";
      
      setStatusMessage("Creating compressed NFT attestation...");
      
      console.log("Attestation parameters:", {
        contentCid: cleanContentCid,
        metadataCid: cleanMetadataCid,
        contentType: cleanContentType,
        title: cleanTitle,
        description: cleanDescription
      });
      
      // Use the updated createAttestation method
      const result = await createAttestation(
        cleanContentCid,
        cleanMetadataCid,
        cleanTitle,
        cleanDescription,
        cleanContentType
      );
      
      if (result.success) {
        console.log("Attestation successful:", result);
        setMintAddress(result.mintAddress || "");
        // Since this is a Metaplex transaction, we might not get a specific txSignature
        setTxSignature(result.signature || "Transaction completed");
        setAttestationSuccess(true);
        setStatusMessage("Successfully created compressed NFT attestation!");
        
        toast({
          title: "Attestation Created",
          description: "Your content has been successfully attested as a compressed NFT.",
        });
      } else {
        throw new Error(result.error || "Failed to create attestation");
      }
    } catch (error: any) {
      console.error("Error creating attestation:", error);
      
      setErrorMessage(`Failed to create attestation: ${error.message}`);
      
      toast({
        variant: "destructive",
        title: "Attestation Failed",
        description: "There was an error creating the compressed NFT attestation.",
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

  if (!isInitialized) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 text-primary animate-spin" />
          <h3 className="text-lg font-medium mb-2">Initializing</h3>
          <p className="text-sm text-muted-foreground">
            Setting up the attestation service...
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
          Content Attestation with Compressed NFTs
        </CardTitle>
        <CardDescription>
          Register your content on the Solana blockchain as a compressed NFT to prove authenticity and ownership
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content-cid">Content CID</Label>
            <div className="flex gap-2">
              <Input 
                id="content-cid" 
                placeholder="IPFS Content CID (e.g., baf...)"
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
                  This content already has an attestation. Creating a new one will make a duplicate.
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
                  Content successfully attested as a compressed NFT!
                </span>
              </div>
              <Separator className="my-2" />
              
              {mintAddress && (
                <div className="text-xs font-mono mb-2 overflow-hidden text-ellipsis">
                  <span className="text-muted-foreground">NFT Address: </span>
                  <a
                    href={`https://explorer.solana.com/address/${mintAddress}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {mintAddress.slice(0, 14)}...{mintAddress.slice(-14)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mt-2">
                Your content is now verifiably authenticated on the Solana blockchain using a compressed NFT.
              </p>
              
              {/* Verification Badge Preview */}
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Verification Badge Preview:</h4>
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
                  copyToClipboard(e, embedCode);
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Embed Code
              </Button>
              </div>
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
                Creating Attestation...
              </>
            ) : (
              <>
                Create Compressed NFT Attestation
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};