"use client";

import React, { createContext, useContext, useState } from 'react';

// Define the context shape
interface UploadContextType {
  contentCid: string;
  metadataCid: string;
  contentType: string;
  title: string;
  description: string;
  setUploadedContent: (data: {
    contentCid: string;
    metadataCid: string;
    contentType: string;
    title: string;
    description: string;
  }) => void;
  clearUploadedContent: () => void;
}

// Create the context with default values
const UploadContext = createContext<UploadContextType>({
  contentCid: '',
  metadataCid: '',
  contentType: '',
  title: '',
  description: '',
  setUploadedContent: () => {},
  clearUploadedContent: () => {},
});

// Provider component
export const UploadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contentCid, setContentCid] = useState('');
  const [metadataCid, setMetadataCid] = useState('');
  const [contentType, setContentType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const setUploadedContent = (data: {
    contentCid: string;
    metadataCid: string;
    contentType: string;
    title: string;
    description: string;
  }) => {
    setContentCid(data.contentCid);
    setMetadataCid(data.metadataCid);
    setContentType(data.contentType);
    setTitle(data.title);
    setDescription(data.description);
  };

  const clearUploadedContent = () => {
    setContentCid('');
    setMetadataCid('');
    setContentType('');
    setTitle('');
    setDescription('');
  };

  return (
    <UploadContext.Provider
      value={{
        contentCid,
        metadataCid,
        contentType,
        title,
        description,
        setUploadedContent,
        clearUploadedContent,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};

// Hook to use the upload context
export const useUploadContext = () => useContext(UploadContext);