import React from 'react';
import { Shield, CheckCircle } from 'lucide-react';

interface VerificationBadgeProps {
  creator: string;
  contentCid: string;
  timestamp: string;
  size?: 'sm' | 'md' | 'lg';
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  creator,
  contentCid,
  timestamp,
  size = 'md'
}) => {
  // Truncate the address for display
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Format the date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-xs p-2',
    md: 'text-sm p-3',
    lg: 'text-base p-4'
  };

  return (
    <div className={`flex items-center space-x-2 rounded-md border border-primary/30 bg-primary/5 ${sizeClasses[size]}`}>
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
      </div>
    </div>
  );
};

export default VerificationBadge;