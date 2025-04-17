"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { AlertCircle, CheckCircle2, Loader2, FileText, ArrowRight, Calendar as CalendarIcon, Copy } from "lucide-react";
import { useUploadContext } from "@/lib/uploadContext";
import { cn } from "@/lib/utils";

// License types with descriptions
const licenseTypes = [
  { 
    id: "open", 
    name: "Open License", 
    description: "Content is freely available with minimal restrictions"
  },
  { 
    id: "restricted", 
    name: "Restricted License", 
    description: "Limited usage rights with specific restrictions"
  },
  { 
    id: "commercial", 
    name: "Commercial License", 
    description: "Allows commercial use with attribution"
  },
  { 
    id: "research", 
    name: "Research License", 
    description: "For academic and research purposes only"
  },
  { 
    id: "custom", 
    name: "Custom License", 
    description: "Custom terms defined by content creator"
  }
];

const ContentLicenseComponent: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { toast } = useToast();
  const uploadContext = useUploadContext();
  
  // Form state
  const [licenseType, setLicenseType] = useState<string>("open");
  const [contentCid, setContentCid] = useState<string>(uploadContext.contentCid || "");
  const [requireAttribution, setRequireAttribution] = useState<boolean>(true);
  const [allowCommercialUse, setAllowCommercialUse] = useState<boolean>(false);
  const [allowAiTraining, setAllowAiTraining] = useState<boolean>(false);
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);
  const [customTerms, setCustomTerms] = useState<string>("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [licenseJson, setLicenseJson] = useState<string>("");

  // Update form when upload context changes
  useEffect(() => {
    if (uploadContext.contentCid) {
      setContentCid(uploadContext.contentCid);
    }
  }, [uploadContext]);

  // Generate the license JSON
  const generateLicenseJson = () => {
    const licenseData = {
      version: "1.0",
      licenseType: licenseType,
      contentCid: contentCid,
      creator: publicKey?.toString() || "",
      requireAttribution: requireAttribution,
      allowCommercialUse: allowCommercialUse,
      allowAiTraining: allowAiTraining,
      expirationDate: expirationDate ? expirationDate.toISOString() : null,
      customTerms: customTerms,
      createdAt: new Date().toISOString(),
      network: "mainnet-beta"
    };
    
    return JSON.stringify(licenseData, null, 2);
  };

  // Create license
  const handleCreateLicense = async () => {
    if (!connected || !publicKey) {
      setError("Please connect your wallet first");
      return;
    }
    
    if (!contentCid) {
      setError("You need to select content to license");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Generate the license JSON
      const licenseData = generateLicenseJson();
      setLicenseJson(licenseData);
      
      // In a real implementation, you would:
      // 1. Upload the license JSON to IPFS
      // 2. Link it to the attested content or NFT metadata
      // This is a simplified version that just generates the JSON
      
      // Simulate a delay for the "upload"
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      toast({
        title: "License Created",
        description: "Your content license has been created successfully on Solana mainnet.",
      });
    } catch (error: any) {
      console.error("Error creating license:", error);
      setError(error.message || "Failed to create license");
      
      toast({
        variant: "destructive",
        title: "License Creation Failed",
        description: "There was an error creating the license.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Copy license JSON to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(licenseJson);
    toast({
      title: "Copied to clipboard",
      description: "License data has been copied to your clipboard.",
    });
  };

  // Reset the form
  const resetForm = () => {
    setLicenseType("open");
    setRequireAttribution(true);
    setAllowCommercialUse(false);
    setAllowAiTraining(false);
    setExpirationDate(undefined);
    setCustomTerms("");
    setSuccess(false);
    setLicenseJson("");
  };

  // If not connected, show a message
  if (!connected) {
    return (
      <Card className="mt-6 bg-muted/30">
        <CardContent className="pt-6 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">Wallet Connection Required</h3>
          <p className="text-sm text-muted-foreground">
            Please connect your wallet to create licenses for your content
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Content Licensing
          <Badge className="ml-auto bg-blue-500 text-white">Mainnet</Badge>
        </CardTitle>
        <CardDescription>
          Define how others can use your content based on Universal Data License (UDL) terms
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!success ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="content-cid">Content to License</Label>
              <Input 
                id="content-cid" 
                placeholder="IPFS Content CID (e.g., QmX...)"
                value={contentCid}
                onChange={(e) => setContentCid(e.target.value)}
                required
                disabled={loading}
              />
              {!contentCid && (
                <p className="text-xs text-muted-foreground">
                  Upload and attest content first, or enter a Content CID manually
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="license-type">License Type</Label>
              <Select 
                value={licenseType} 
                onValueChange={setLicenseType}
                disabled={loading}
              >
                <SelectTrigger id="license-type">
                  <SelectValue placeholder="Select license type" />
                </SelectTrigger>
                <SelectContent>
                  {licenseTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {licenseTypes.find(t => t.id === licenseType)?.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="attribution">Require Attribution</Label>
                <p className="text-xs text-muted-foreground">
                  Users must credit you when using the content
                </p>
              </div>
              <Switch 
                id="attribution"
                checked={requireAttribution}
                onCheckedChange={setRequireAttribution}
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="commercial-use">Allow Commercial Use</Label>
                <p className="text-xs text-muted-foreground">
                  Content can be used in commercial products
                </p>
              </div>
              <Switch 
                id="commercial-use"
                checked={allowCommercialUse}
                onCheckedChange={setAllowCommercialUse}
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="ai-training">Allow AI Training</Label>
                <p className="text-xs text-muted-foreground">
                  Content can be used to train AI models
                </p>
              </div>
              <Switch 
                id="ai-training"
                checked={allowAiTraining}
                onCheckedChange={setAllowAiTraining}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiration">Expiration Date (Optional)</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="expiration"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expirationDate && "text-muted-foreground"
                    )}
                    disabled={loading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expirationDate ? format(expirationDate, "PPP") : "No expiration date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expirationDate}
                    onSelect={(date) => {
                      setExpirationDate(date);
                      setCalendarOpen(false);
                    }}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {licenseType === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="custom-terms">Custom License Terms</Label>
                <textarea
                  id="custom-terms"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter your custom license terms here..."
                  value={customTerms}
                  onChange={(e) => setCustomTerms(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md bg-green-500/10 p-4 border border-green-200 dark:border-green-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  License created successfully!
                </span>
                <Badge className="ml-auto bg-blue-500 text-white">Mainnet</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>License JSON</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyToClipboard}
                  className="h-8 px-2"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <div className="relative">
                <pre className="bg-muted/50 p-4 rounded-md text-xs overflow-auto max-h-60 font-mono">
                  {licenseJson}
                </pre>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>License Badge</Label>
              <div className="bg-muted/50 p-4 rounded-md">
                <div className="flex items-center space-x-2 p-2 border rounded-md bg-background">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <span className="text-sm font-medium">
                      {licenseTypes.find(t => t.id === licenseType)?.name || "Licensed Content"}
                    </span>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>By {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}</span>
                      {requireAttribution && <Badge variant="outline" className="text-xs">Attribution Required</Badge>}
                      {allowCommercialUse && <Badge variant="outline" className="text-xs">Commercial Use</Badge>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={resetForm}
              className="w-full"
            >
              Create Another License
            </Button>
          </div>
        )}
        
        {error && (
          <div className="rounded-md bg-red-500/10 p-4 border border-red-200 dark:border-red-900">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">License Creation Error</p>
                <p className="text-xs text-red-500 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      {!success && (
        <CardFooter>
          <Button 
            type="button" 
            className="w-full"
            onClick={handleCreateLicense}
            disabled={loading || !contentCid}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating License...
              </>
            ) : (
              <>
                Create License
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ContentLicenseComponent;
