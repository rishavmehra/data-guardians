import React from 'react';
import { Shield, CheckCircle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VerificationBadgeProps {
  creator: string;
  contentCid: string;
  timestamp: string;
  licenseType?: string;
  licenseAttribution?: boolean;
  licenseCommercialUse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  creator,
  contentCid,
  timestamp,
  licenseType,
  licenseAttribution,
  licenseCommercialUse,
  size = 'md',
}) => {
  // Truncate the address for display
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Format the date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  // Get a human-readable license name
  const getLicenseName = (type?: string) => {
    switch (type) {
      case 'open': return 'Open License';
      case 'restricted': return 'Restricted License';
      case 'commercial': return 'Commercial License';
      case 'research': return 'Research License';
      case 'custom': return 'Custom License';
      default: return undefined;
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-xs p-2',
    md: 'text-sm p-3',
    lg: 'text-base p-4'
  };

  return (
    <div className={`flex items-center space-x-2 rounded-md border border-primary/30 bg-primary/5 ${sizeClasses[size]} relative`}>
      <div className="bg-primary/20 p-2 rounded-full">
        <Shield className="h-4 w-4 text-primary" />
      </div>
      
      <div className="flex flex-col">
        <div className="flex items-center">
          <span className="font-semibold mr-2">Verified Content</span>
          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
        </div>
        
        <div className="text-xs text-muted-foreground">
          Created by {truncateAddress(creator)} on {formatDate(timestamp)}
        </div>
        
        {/* Show license information if available */}
        {licenseType && (
          <div className="flex items-center mt-1">
            <FileText className="h-3 w-3 mr-1 text-primary" />
            <span className="text-xs">
              {getLicenseName(licenseType)}
              {licenseAttribution && ' • Attribution Required'}
              {licenseCommercialUse && ' • Commercial Use Allowed'}
            </span>
          </div>
        )}
      </div>

      {/* Mainnet badge - positioned to the right */}
      <div className="absolute top-2 right-2">
        <Badge className="text-xs h-5 bg-blue-500 text-white">Mainnet</Badge>
      </div>
    </div>
  );
};

export default VerificationBadge;
