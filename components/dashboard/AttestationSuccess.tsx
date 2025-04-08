import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Copy, ExternalLink, Twitter, Linkedin, LinkIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import VerificationBadge from "../verification/VerificationBadge";
import { useNetworkContext } from "@/lib/networkContext";

interface AttestationSuccessProps {
  contentCid: string;
  mintAddress: string;
  creator: string;
  copyToClipboard: (e: React.MouseEvent<HTMLButtonElement>, text: string) => void;
}

const AttestationSuccess: React.FC<AttestationSuccessProps> = ({
  contentCid,
  mintAddress,
  creator,
  copyToClipboard
}) => {
  const { toast } = useToast();
  const { network } = useNetworkContext();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const verificationUrl = `${baseUrl}/verify/${contentCid}`;
  
  // Prepare social sharing links
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`I've just verified my content with DataGuardians on Solana ${network}! Check it out:`)}%0A${encodeURIComponent(verificationUrl)}`;
  
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}&title=${encodeURIComponent(`Content Verified with DataGuardians on Solana ${network}`)}&summary=${encodeURIComponent('I\'ve verified my digital content authenticity with DataGuardians blockchain technology.')}`;

  const embedCode = `<iframe src="${verificationUrl}" width="300" height="80" frameborder="0"></iframe>`;

  // Get the Solana explorer URL for the correct network
  const getExplorerUrl = (address: string) => {
    const baseExplorerUrl = 'https://explorer.solana.com/address/';
    return network === 'mainnet-beta' 
      ? `${baseExplorerUrl}${address}` 
      : `${baseExplorerUrl}${address}?cluster=devnet`;
  };

  // Explicit handlers to prevent form submission
  const handleTwitterShare = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling
    window.open(twitterShareUrl, '_blank');
  };

  const handleLinkedInShare = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling
    window.open(linkedinShareUrl, '_blank');
  };

  const isMainnet = network === 'mainnet-beta';

  return (
    <div className="rounded-md bg-green-500/10 p-4 border border-green-200 dark:border-green-900">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
        <span className="text-sm font-medium text-green-700 dark:text-green-300">
          Content successfully attested as a compressed NFT!
        </span>
        {isMainnet ? (
          <Badge className="ml-auto bg-blue-500 text-white">Mainnet</Badge>
        ) : (
          <Badge variant="outline" className="ml-auto bg-orange-500/10 text-orange-600 border-orange-500/20">
            Devnet
          </Badge>
        )}
      </div>
      <Separator className="my-2" />
      
      {mintAddress && (
        <div className="text-xs font-mono mb-2 overflow-hidden text-ellipsis">
          <span className="text-muted-foreground">NFT Address: </span>
          <a
            href={getExplorerUrl(mintAddress)}
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
        Your content is now verifiably authenticated on the Solana {network} blockchain using a compressed NFT.
      </p>
      
      {/* Verification Badge Preview */}
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Verification Badge Preview:</h4>
        <VerificationBadge 
          creator={creator}
          contentCid={contentCid}
          timestamp={new Date().toISOString()}
          network={network}
        />
        
        <div className="grid grid-cols-2 gap-2 mt-3">
          {/* Embed Code Button */}
          <Button
            type="button" // Explicitly set type to button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={(e) => copyToClipboard(e, embedCode)}
          >
            <Code className="h-4 w-4" />
            <span>Copy Embed Code</span>
          </Button>
          
          {/* Copy Link Button */}
          <Button
            type="button" // Explicitly set type to button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={(e) => copyToClipboard(e, verificationUrl)}
          >
            <LinkIcon className="h-4 w-4" />
            <span>Copy Link</span>
          </Button>
        </div>
        
        {/* Social Sharing Section */}
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Share on social media:</h4>
          <div className="flex gap-2">
            <Button
              type="button" // Explicitly set type to button
              variant="outline"
              size="sm"
              className="flex-1 flex items-center justify-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600"
              onClick={handleTwitterShare}
            >
              <Twitter className="h-4 w-4" />
              <span>Share on X</span>
            </Button>
            
            <Button
              type="button" // Explicitly set type to button
              variant="outline"
              size="sm"
              className="flex-1 flex items-center justify-center gap-1 bg-blue-700/10 hover:bg-blue-700/20 text-blue-700"
              onClick={handleLinkedInShare}
            >
              <Linkedin className="h-4 w-4" />
              <span>Share on LinkedIn</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttestationSuccess;

// Including a Code icon component since Lucide-React might not have it
const Code = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);
