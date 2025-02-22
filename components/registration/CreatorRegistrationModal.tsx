"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@solana/wallet-adapter-react";

interface CreatorRegistrationModalProps {
  open: boolean;
  onClose: () => void;
}

const CreatorRegistrationModal = ({
  open,
  onClose,
}: CreatorRegistrationModalProps) => {
  const [creatorName, setCreatorName] = useState("");
  const [bio, setBio] = useState("");
  const { publicKey } = useWallet();

  const handleRegister = () => {
    // TODO: Implement your registration logic (API call or on-chain transaction)
    console.log("Registering creator:", {
      creatorName,
      bio,
      wallet: publicKey?.toBase58(),
    });
    setCreatorName("");
    setBio("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Register as Creator</h2>
        <p className="mb-4">
          Wallet: <span className="font-mono">{publicKey?.toBase58()}</span>
        </p>
        <div className="mb-4">
          <Label htmlFor="creatorName" className="block mb-1">
            Name
          </Label>
          <Input
            id="creatorName"
            type="text"
            placeholder="Your Name"
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="bio" className="block mb-1">
            Bio
          </Label>
          <Input
            id="bio"
            type="text"
            placeholder="Tell us about yourself"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full"
          />
        </div>
        <Button onClick={handleRegister} className="w-full">
          Register
        </Button>
        <Button
          variant="secondary"
          onClick={onClose}
          className="w-full mt-4"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CreatorRegistrationModal;
