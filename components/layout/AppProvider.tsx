"use client";

import React from "react";
import { UploadProvider } from "@/lib/uploadContext";
import { AttestationProvider } from "@/lib/attestationContext";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UploadProvider>
      <AttestationProvider>
        {children}
      </AttestationProvider>
    </UploadProvider>
  );
};

export default AppProvider;