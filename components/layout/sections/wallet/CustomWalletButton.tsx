"use client";

import React from "react";
import { WalletMultiButton, WalletDisconnectButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
require("@solana/wallet-adapter-react-ui/styles.css");
const CustomWalletButton = () => {
  const { connected } = useWallet();
  return connected ? (
    <WalletDisconnectButton className="w-5/6 md:w-1/4 font-bold" />
  ) : (
    <WalletMultiButton className="w-5/6 md:w-1/4 font-bold" />
  );
};

export default CustomWalletButton;
