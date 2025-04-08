"use client";

import React, { useEffect, useState } from 'react';
import { useNetworkContext } from '@/lib/networkContext';
import VerificationBadge from '@/components/verification/VerificationBadge';
import { Shield, CheckCircle, XCircle, Loader2, ExternalLink, FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function VerifyPage({ params }: { params: { contentCid: string } }) {
  const [verificationData, setVerificationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { network } = useNetworkContext();
  
  useEffect(() => {
    async function verifyContent() {
      try {
        // In a real implementation, you would fetch verification data from your API
        // For now, we'll simulate a successful verification
        
        // This would normally be an API call:
        // const response = await fetch(`/api/verify?contentCid=${params.contentCid}`);
        // const data = await response.json();
        
        // Simulated data for demonstration
        setTimeout(() => {
          setVerificationData({
            verified: true,
            creator: "8YUkX4ckU3KmMM1kNQXJxTgM9V7Vuum5YNQqFcYX7bYa", // example address
            timestamp: new Date().toISOString(),
            contentCid: params.contentCid,
            title: "Sample Content",
            contentType: "image",
            license: {
              type: "open",
              requireAttribution: true,
              allowCommercialUse: false
            }
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Verification error:", err);
        setError("Failed to verify content");
        setLoading(false);
      }
    }

    verifyContent();
  }, [params.contentCid]);

  // Handle the various states
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <h2 className="text-xl font-semibold mb-2">Verifying Content</h2>
              <p className="text-muted-foreground text-center">
                Checking blockchain records for content authenticity...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !verificationData?.verified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <Card className="w-full max-w-md mx-auto border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-8">
              <div className="bg-destructive/10 p-3 rounded-full mb-4">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Content Not Verified</h2>
              <p className="text-muted-foreground text-center">
                {error || "This content could not be verified on the blockchain."}
              </p>
              <Button variant="outline" className="mt-6" asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state with more detailed information
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md mx-auto border-green-500/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-500/10 p-3 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Content Verified</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="my-4">
            <VerificationBadge 
              creator={verificationData.creator}
              contentCid={verificationData.contentCid}
              timestamp={verificationData.timestamp}
              licenseType={verificationData.license?.type}
              licenseAttribution={verificationData.license?.requireAttribution}
              licenseCommercialUse={verificationData.license?.allowCommercialUse}
              size="lg"
            />
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium">Creator</h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {verificationData.creator}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium">Content ID</h3>
                <p className="text-xs text-muted-foreground font-mono break-all">
                  {verificationData.contentCid}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium">Verified On</h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(verificationData.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-3 bg-primary/5 rounded-md border border-primary/20">
            <h3 className="text-sm font-medium mb-1 flex items-center gap-1">
              <Shield className="h-4 w-4 text-primary" />
              Blockchain Verification
            </h3>
            <p className="text-xs text-muted-foreground">
              This content has been verified on the Solana {network} blockchain 
              and is cryptographically linked to its creator.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center pb-6">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-primary" 
            asChild
          >
            <Link href="/">
              <ExternalLink className="h-4 w-4 mr-2" />
              Go to DataGuardians
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
