"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Loader2, Shield, ArrowRight, ExternalLink, Copy } from "lucide-react";
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

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Error boundary wrapper component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode, fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode, fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ContentAttestationComponent error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export const ContentAttestationComponent: React.FC<ContentAttestationProps> = ({
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
  
  // State for form fields
  const [contentCid, setContentCid] = useState(uploadContext.contentCid || initialContentCid);
  const [metadataCid, setMetadataCid] = useState(uploadContext.metadataCid || initialMetadataCid);
  const [contentType, setContentType] = useState(uploadContext.contentType || initialContentType || "image");
  const [title, setTitle] = useState(uploadContext.title || initialTitle);
  const [description, setDescription] = useState(uploadContext.description || initialDescription);

  // Debounce content CID to prevent excessive blockchain calls
  const debouncedContentCid = useDebounce(contentCid, 500);
  
  // State for component status
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [attestationSuccess, setAttestationSuccess] = useState(false);
  const [txSignature, setTxSignature] = useState("");
  const [existingAttestation, setExistingAttestation] = useState<any>(null);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);

  // Get attestation functions from hook
  const {
    attestContent,
    getAttestation,
    updateAttestation,
    loading,
    error
  } = useContentAttestation();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Update form when upload context changes
  useEffect(() => {
    if (uploadContext.contentCid) {
      setContentCid(uploadContext.contentCid);
      setMetadataCid(uploadContext.metadataCid);
      setContentType(uploadContext.contentType || "image");
      setTitle(uploadContext.title);
      setDescription(uploadContext.description);
    }
  }, [uploadContext]);

  // Memoize the check attestation function to prevent recreation on every render
  const checkExistingAttestation = useCallback(async (cid: string) => {
    if (!cid || !connected) return;
    
    try {
      setIsCheckingExisting(true);
      
      const attestation = await getAttestation(cid);
      
      if (!isMounted.current) return;
      
      setExistingAttestation(attestation);
      
      // Pre-fill form if attestation exists
      if (attestation) {
        setMetadataCid(attestation.metadataCid);
        setContentType(attestation.contentType || "image");
        setTitle(attestation.title);
        setDescription(attestation.description);
      }
    } catch (error) {
      console.error("Error checking existing attestation:", error);
    } finally {
      if (isMounted.current) {
        setIsCheckingExisting(false);
      }
    }
  }, [connected, getAttestation]);

  // Check for existing attestation when debounced CID changes
  useEffect(() => {
    if (debouncedContentCid) {
      checkExistingAttestation(debouncedContentCid);
    } else {
      setExistingAttestation(null);
    }
  }, [debouncedContentCid, checkExistingAttestation]);

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
      
      // Ensure all values are proper strings and trimmed
      const cleanContentCid = String(contentCid).trim();
      const cleanMetadataCid = String(metadataCid).trim();
      const cleanContentType = contentType ? String(contentType).trim() : "image";
      const cleanTitle = title ? String(title).trim() : "Untitled";
      const cleanDescription = description ? String(description).trim() : "";
      
      console.log("Attempting attestation with parameters:", {
        contentCid: cleanContentCid,
        metadataCid: cleanMetadataCid,
        contentType: cleanContentType, 
        title: cleanTitle,
        description: cleanDescription,
        existingAttestation: existingAttestation ? true : false
      });
      
      if (existingAttestation) {
        // Update existing attestation
        setStatusMessage("Updating existing attestation on Solana blockchain...");
        tx = await updateAttestation(
          cleanContentCid,
          cleanMetadataCid,
          cleanTitle,
          cleanDescription
        );
      } else {
        // Create new attestation
        setStatusMessage("Registering attestation on Solana blockchain...");
        
        tx = await attestContent(
          cleanContentCid,
          cleanMetadataCid,
          cleanContentType,
          cleanTitle,
          cleanDescription
        );
      }
      
      if (!isMounted.current) return;
      
      setTxSignature(tx);
      setAttestationSuccess(true);
      setStatusMessage("Successfully attested content on the blockchain!");
      
      toast({
        title: "Content Attestation Successful",
        description: "Your content has been successfully attested on the Solana blockchain.",
      });
      
    } catch (error) {
      console.error('Error attesting content:', error);
      
      if (!isMounted.current) return;
      
      // More descriptive error handling
      let errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes("kind")) {
        errorMsg = "There was an issue with the blockchain transaction format. Please check your input values and try again.";
      }
      
      setErrorMessage(`Failed to attest content: ${errorMsg}`);
      
      toast({
        variant: "destructive",
        title: "Attestation Failed",
        description: "There was an error creating the blockchain attestation.",
      });
    }
  };

  // Fallback content for error boundary
  const errorFallback = (
    <Card className="mt-6">
      <CardContent className="pt-6 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
        <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
        <p className="text-sm text-muted-foreground mb-4">
          There was an error loading the attestation component
        </p>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Reload page
        </Button>
      </CardContent>
    </Card>
  );

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
    <ErrorBoundary fallback={errorFallback}>
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
              </div>
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
              disabled={loading || !contentCid || !metadataCid || isCheckingExisting}
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
    </ErrorBoundary>
  );
}