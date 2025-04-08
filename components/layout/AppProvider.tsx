"use client";

import React from "react";
import { UploadProvider } from "@/lib/uploadContext";
import { AttestationProvider } from "@/lib/attestationContext";
import { NetworkProvider } from "@/lib/networkContext";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NetworkProvider>
      <UploadProvider>
        <AttestationProvider>
          {children}
        </AttestationProvider>
      </UploadProvider>
    </NetworkProvider>
  );
};

export default AppProvider;
