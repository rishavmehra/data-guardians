"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, Loader2, Shield, ArrowRight, ExternalLink } from "lucide-react";
import { useContentAttestation } from "@/lib/contentAttestation";
import { useUploadContext } from "@/lib/uploadContext";

interface ContentAttestationProps {
  // Props from parent component (if any)
  initialContentCid?: string;
  initialMetadataCid?: string;
  initialContentType?: string;
  initialTitle?: string;
  initialDescription?: string;
}

const ContentAttestationComponent: React.FC<ContentAttestationProps> = ({
  initialContentCid = "",
  initialMetadataCid = "",
  initialContentType = "",
  initialTitle = "",
  initialDescription = "",
}) => {
  const { connected } = useWallet();
  const { toast } = useToast();
  
  // Get data from upload context
  const uploadContext = useUploadContext();
  
  const [contentCid, setContentCid] = useState(uploadContext.contentCid || initialContentCid);
  const [metadataCid, setMetadataCid] = useState(uploadContext.metadataCid || initialMetadataCid);
  const [contentType, setContentType] = useState(uploadContext.contentType || initialContentType);
  const [title, setTitle] = useState(uploadContext.title || initialTitle);
  const [description, setDescription] = useState(uploadContext.description || initialDescription);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [attestationSuccess, setAttestationSuccess] = useState(false);
  const [txSignature, setTxSignature] = useState("");
  const [existingAttestation, setExistingAttestation] = useState<any>(null);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);

  // Get attestation functions from hook
  const {
    attestContent,
    getAttestation,
    updateAttestation,
    loading,
    error
  } = useContentAttestation();

  // Update form when upload context changes
  useEffect(() => {
    if (uploadContext.contentCid) {
      setContentCid(uploadContext.contentCid);
      setMetadataCid(uploadContext.metadataCid);
      setContentType(uploadContext.contentType);
      setTitle(uploadContext.title);
      setDescription(uploadContext.description);
    }
  }, [uploadContext]);

  // Check if existing attestation exists when contentCid changes
  useEffect(() => {
    const checkExistingAttestation = async () => {
      if (!contentCid || !connected) return;
      
      setIsCheckingExisting(true);
      try {
        const attestation = await getAttestation(contentCid);
        setExistingAttestation(attestation);
        
        // Pre-fill form if attestation exists
        if (attestation) {
          setMetadataCid(attestation.metadataCid);
          setContentType(attestation.contentType);
          setTitle(attestation.title);
          setDescription(attestation.description);
        }
      } catch (error) {
        console.error("Error checking existing attestation:", error);
      } finally {
        setIsCheckingExisting(false);
      }
    };

    checkExistingAttestation();
  }, [contentCid, connected, getAttestation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contentCid || !metadataCid) {
      setErrorMessage("Content CID and Metadata CID are required");
      return;
    }

    setErrorMessage("");
    setStatusMessage("Preparing attestation transaction...");
    setAttestationSuccess(false);

    try {
      let tx;
      
      if (existingAttestation) {
        // Update existing attestation
        setStatusMessage("Updating existing attestation on Solana blockchain...");
        tx = await updateAttestation(
          contentCid,
          metadataCid,
          title,
          description
        );
      } else {
        // Create new attestation
        setStatusMessage("Registering attestation on Solana blockchain...");
        tx = await attestContent(
          contentCid,
          metadataCid,
          contentType || "unknown",
          title || "Untitled",
          description || ""
        );
      }
      
      setTxSignature(tx);
      setAttestationSuccess(true);
      setStatusMessage("Successfully attested content on the blockchain!");
      
      toast({
        title: "Content Attestation Successful",
        description: "Your content has been successfully attested on the Solana blockchain.",
      });
      
    } catch (error) {
      console.error('Error attesting content:', error);
      setErrorMessage(`Failed to attest content: ${error instanceof Error ? error.message : String(error)}`);
      
      toast({
        variant: "destructive",
        title: "Attestation Failed",
        description: "There was an error creating the blockchain attestation.",
      });
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
            <Input 
              id="content-cid" 
              placeholder="IPFS Content CID (e.g., QmX...)"
              value={contentCid}
              onChange={(e) => setContentCid(e.target.value)}
              required
            />
            {isCheckingExisting && (
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
            <Input 
              id="metadata-cid" 
              placeholder="IPFS Metadata CID (e.g., QmY...)"
              value={metadataCid}
              onChange={(e) => setMetadataCid(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content-type">Content Type</Label>
            <Input
              id="content-type"
              placeholder="Type of content (image, audio, document, etc.)"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              placeholder="Content title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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

export default ContentAttestationComponent;