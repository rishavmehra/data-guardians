"use client";

import React, { useState, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, FileType2, Music, Image, Shield, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const ContentUpload = () => {
  const { connected, publicKey } = useWallet();
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [ipfsCid, setIpfsCid] = useState("");
  const [contentType, setContentType] = useState("image");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileSelected, setFileSelected] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contentTypeIcons = {
    image: <Image className="h-5 w-5" />,
    audio: <Music className="h-5 w-5" />,
    document: <FileType2 className="h-5 w-5" />,
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileSelected(true);
      setErrorMessage("");
    } else {
      setFileSelected(false);
    }
  };

  const uploadToPinata = async (file: File) => {
    // IMPORTANT: Replace with your Pinata JWT token
    // This should be stored in an environment variable in production
    const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || "YOUR_PINATA_JWT_HERE";

    try {
      // Step 1: Prepare the file metadata
      const pinataMetadata = {
        name: title || "Untitled",
        keyvalues: {
          description: description,
          contentType: contentType,
          creator: publicKey?.toString() || "unknown",
          createdAt: new Date().toISOString()
        }
      };

      setStatusMessage("Preparing upload to Pinata IPFS...");
      
      // Step 2: Create form data for the API request
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
      
      // Optional: Add pinataOptions for controlling the pinning process
      const pinataOptions = {
        cidVersion: 1,
        wrapWithDirectory: false
      };
      formData.append('pinataOptions', JSON.stringify(pinataOptions));
      
      setStatusMessage("Uploading content to IPFS via Pinata...");
      
      // Step 3: Upload the file to Pinata
      const fileUploadResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`
        },
        body: formData
      });
      
      // Check if the upload was successful
      if (!fileUploadResponse.ok) {
        let errorData;
        try {
          errorData = await fileUploadResponse.json();
        } catch (e) {
          errorData = await fileUploadResponse.text();
        }
        
        console.error("Pinata upload error details:", errorData);
        throw new Error(`Pinata API error (${fileUploadResponse.status}): ${fileUploadResponse.statusText}`);
      }
      
      // Parse the response
      const fileData = await fileUploadResponse.json();
      const fileCid = fileData.IpfsHash;
      console.log("File successfully uploaded to IPFS with CID:", fileCid);
      
      setStatusMessage("Creating metadata...");
      
      // Step 4: Create JSON metadata referencing the uploaded file
      const metadataContent = {
        name: title || "Untitled",
        description: description || "",
        image: `ipfs://${fileCid}`,
        contentType: contentType,
        creator: publicKey?.toString() || "unknown",
        createdAt: new Date().toISOString(),
        properties: {
          type: contentType,
          size: file.size,
          filename: file.name
        }
      };
      
      const jsonMetadata = {
        pinataMetadata: {
          name: `${title || "Untitled"} - Metadata`
        },
        pinataContent: metadataContent
      };
      
      setStatusMessage("Uploading metadata to IPFS...");
      
      // Step 5: Upload the metadata JSON to Pinata
      const jsonUploadResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PINATA_JWT}`
        },
        body: JSON.stringify(jsonMetadata)
      });
      
      // Check if the metadata upload was successful
      if (!jsonUploadResponse.ok) {
        let errorData;
        try {
          errorData = await jsonUploadResponse.json();
        } catch (e) {
          errorData = await jsonUploadResponse.text();
        }
        
        console.error("Pinata JSON upload error details:", errorData);
        throw new Error(`Pinata metadata upload error (${jsonUploadResponse.status}): ${jsonUploadResponse.statusText}`);
      }
      
      // Parse the metadata response
      const metadataData = await jsonUploadResponse.json();
      const metadataCid = metadataData.IpfsHash;
      console.log("Metadata successfully uploaded to IPFS with CID:", metadataCid);
      
      setStatusMessage("Upload complete!");
      
      // Return both CIDs and gateway URLs
      return {
        contentCid: fileCid,
        metadataCid: metadataCid,
        contentUrl: `https://gateway.pinata.cloud/ipfs/${fileCid}`,
        metadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataCid}`
      };
    } catch (error) {
      console.error("Error in Pinata upload:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileInputRef.current?.files?.length) {
      setErrorMessage("Please select a file to upload");
      return;
    }

    setErrorMessage("");
    setStatusMessage("");
    setUploading(true);
    setUploadSuccess(false);

    try {
      const file = fileInputRef.current.files[0];
      
      // Upload the content to Pinata IPFS
      const result = await uploadToPinata(file);
      
      console.log('Content uploaded with CID:', result.contentCid);
      console.log('Metadata uploaded with CID:', result.metadataCid);
      
      setIpfsCid(result.contentCid);
      setIpfsUrl(result.contentUrl);
      setUploadSuccess(true);
      
      // Here you would add code to register the content with your Solana smart contract
      // Examples:
      // await registerContentOnChain(result.contentCid, result.metadataCid);
      
    } catch (error: any) {
      console.error('Error uploading to IPFS:', error);
      setErrorMessage(`Failed to upload to Pinata IPFS: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (!connected) {
    return (
      <Card className="mt-6 bg-muted/30">
        <CardContent className="pt-6 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">Wallet Connection Required</h3>
          <p className="text-sm text-muted-foreground">
            Please connect your wallet to upload and authenticate content
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload Content
        </CardTitle>
        <CardDescription>
          Upload your digital content to IPFS via Pinata for secure blockchain authentication
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              placeholder="Name of your creation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content-type">Content Type</Label>
            <Select 
              value={contentType} 
              onValueChange={setContentType}
            >
              <SelectTrigger id="content-type">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Describe your content"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">Upload File</Label>
            <div className="border border-input rounded-md p-2">
              <Input 
                id="file" 
                ref={fileInputRef}
                type="file" 
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {fileSelected && (
                <p className="text-xs text-muted-foreground mt-2">
                  File selected. Click upload to proceed.
                </p>
              )}
            </div>
          </div>
          
          {statusMessage && !errorMessage && !uploadSuccess && (
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
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">Upload Error</p>
                  <p className="text-xs text-red-500 dark:text-red-300 mt-1">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          {uploadSuccess && (
            <div className="rounded-md bg-green-500/10 p-4 border border-green-200 dark:border-green-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Content successfully uploaded!
                </span>
              </div>
              <Separator className="my-2" />
              <div className="text-xs font-mono mb-2 overflow-hidden text-ellipsis">
                <span className="text-muted-foreground">IPFS CID: </span>
                <span className="text-green-700 dark:text-green-300">{ipfsCid}</span>
              </div>
              <div className="text-xs font-mono overflow-hidden text-ellipsis">
                <span className="text-muted-foreground">Gateway URL: </span>
                <a 
                  href={ipfsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:underline"
                >
                  {ipfsUrl}
                </a>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your content is now stored on IPFS and ready for attestation.
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={uploading || !fileSelected}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading to IPFS...
              </>
            ) : (
              <>Upload & Authenticate</>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ContentUpload;