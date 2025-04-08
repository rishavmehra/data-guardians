"use client";

import React, { useEffect, useState } from 'react';
import { Connection } from '@solana/web3.js';
import { useAttestation } from '@/lib/attestationContext';
import VerificationBadge from './VerificationBadge';
import { Shield, XCircle, Loader2 } from 'lucide-react';

export default function VerifyComponent({ contentCid }: { contentCid: string }) {
  const [verificationData, setVerificationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { verifyAttestation, isInitialized } = useAttestation();
  
  useEffect(() => {
    async function verifyContent() {
      if (!isInitialized) {
        // Wait for attestation service to initialize
        return;
      }
      
      try {
        setLoading(true);
        
        // Use our attestation context to verify the content
        const result = await verifyAttestation(contentCid);
        
        if (result.verified) {
          setVerificationData({
            verified: true,
            creator: result.metadata?.creator || "Unknown",
            timestamp: result.createdAt || new Date().toISOString(),
            contentCid: contentCid,
            // Include license information if available in metadata
            licenseType: result.metadata?.properties?.license?.type,
            licenseAttribution: result.metadata?.properties?.license?.requireAttribution,
            licenseCommercialUse: result.metadata?.properties?.license?.allowCommercialUse
          });
        } else {
          setError(result.message || "Content verification failed");
        }
      } catch (err: any) {
        console.error("Verification error:", err);
        setError("Failed to verify content");
      } finally {
        setLoading(false);
      }
    }

    verifyContent();
  }, [contentCid, isInitialized, verifyAttestation]);

  // This is designed to be embedded as an iframe
  
  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-16 w-full p-2">
        <Loader2 className="h-5 w-5 text-primary animate-spin" />
        <span className="ml-2 text-sm">Verifying...</span>
      </div>
    );
  }

  if (error || !verificationData?.verified) {
    return (
      <div className="flex items-center justify-center h-full w-full p-2 text-destructive">
        <XCircle className="h-5 w-5 mr-2" />
        <span className="text-sm">Content not verified</span>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-2">
      <VerificationBadge
        creator={verificationData.creator}
        contentCid={verificationData.contentCid}
        timestamp={verificationData.timestamp}
        licenseType={verificationData.licenseType}
        licenseAttribution={verificationData.licenseAttribution}
        licenseCommercialUse={verificationData.licenseCommercialUse}
      />
    </div>
  );
}