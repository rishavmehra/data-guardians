"use client";

import React, { useEffect, useState } from 'react';
import { Connection } from '@solana/web3.js';
import VerificationBadge from '@/components/verification/VerificationBadge';
import { Shield, XCircle, Loader2 } from 'lucide-react';

export default function VerifyPage({ params }: { params: { contentCid: string } }) {
  const [verificationData, setVerificationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
            contentCid: params.contentCid
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

  // This is a minimal page designed to be embedded as an iframe
  
  if (loading) {
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
      />
    </div>
  );
}