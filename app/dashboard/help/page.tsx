"use client";

import React from "react";
import { DashboardNavbar } from "@/components/layout/sections/dashboard/DashboardNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileQuestion, Mail, ExternalLink, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Help & Documentation</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Get quick answers to common questions about DataGuardians
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How does content attestation work?</AccordionTrigger>
                    <AccordionContent>
                      Content attestation works by creating a cryptographic signature using your wallet that links your identity to the content. This creates a verifiable record on the Solana blockchain that proves you are the creator of the content. The attestation includes a timestamp and content identifier, making it tamper-proof.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>What types of content can I upload?</AccordionTrigger>
                    <AccordionContent>
                      DataGuardians supports various content types including images, audio files, documents, and videos. All content is securely stored on IPFS (InterPlanetary File System), a decentralized storage network, ensuring your content remains accessible and tamper-proof.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>How do I create a license for my content?</AccordionTrigger>
                    <AccordionContent>
                      To create a license, navigate to the License tab after uploading and attesting your content. You can select from predefined license types or create a custom license. The license terms are stored along with your content attestation, providing clear usage rights for others.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>What blockchain network does DataGuardians use?</AccordionTrigger>
                    <AccordionContent>
                      DataGuardians uses the Solana blockchain for its attestations and licensing due to its high speed and low transaction costs. Currently, the application operates on Solana Devnet, with plans to move to Mainnet in the future.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>How can others verify my content?</AccordionTrigger>
                    <AccordionContent>
                      After attesting your content, you'll receive a verification badge and embed code. Others can verify your content by checking this badge, which connects to the blockchain to confirm your attestation. The verification process is transparent and can be performed by anyone.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Start Guide</CardTitle>
                <CardDescription>
                  Learn how to use DataGuardians in a few simple steps
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ol className="space-y-4 list-decimal ml-4">
                  <li className="pl-2">
                    <h3 className="text-base font-medium">Connect Your Wallet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start by connecting your Solana wallet. This will be used to sign your content 
                      attestations and licenses.
                    </p>
                  </li>
                  
                  <li className="pl-2">
                    <h3 className="text-base font-medium">Upload Your Content</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Navigate to the Upload tab and select the file you want to protect. 
                      Add a title and description to help identify your content.
                    </p>
                  </li>
                  
                  <li className="pl-2">
                    <h3 className="text-base font-medium">Attest Your Content</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Go to the Attest tab and confirm the content details. Sign the transaction 
                      to create a permanent record of your content ownership on the blockchain.
                    </p>
                  </li>
                  
                  <li className="pl-2">
                    <h3 className="text-base font-medium">License Your Content</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      In the License tab, define how others can use your content by selecting 
                      license terms. The license is linked to your attestation.
                    </p>
                  </li>
                  
                  <li className="pl-2">
                    <h3 className="text-base font-medium">Share Your Verification Badge</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      After attestation, you'll receive a verification badge and embed code. Add this 
                      to your website or platform to prove content authenticity.
                    </p>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Need Help?
                </CardTitle>
                <CardDescription>
                  Get support from our team
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="mailto:support@dataguardians.com" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Support</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="https://discord.com/" target="_blank" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <span>Join Discord Community</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/dashboard/help/tickets" className="flex items-center gap-2">
                    <FileQuestion className="h-4 w-4" />
                    <span>Submit Support Ticket</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Detailed guides and resources
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div>
                  <Link 
                    href="/dashboard/help/guides/attestation" 
                    className="text-sm font-medium hover:underline flex items-center justify-between"
                  >
                    <span>Content Attestation Guide</span>
                    <Badge variant="outline">New</Badge>
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Detailed walkthrough of the attestation process
                  </p>
                </div>
                
                <div>
                  <Link 
                    href="/dashboard/help/guides/licensing" 
                    className="text-sm font-medium hover:underline"
                  >
                    Universal Data License (UDL) Overview
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Understanding license options and terms
                  </p>
                </div>
                
                <div>
                  <Link 
                    href="/dashboard/help/guides/verification" 
                    className="text-sm font-medium hover:underline"
                  >
                    Verification Badge Implementation
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    How to add verification to your website
                  </p>
                </div>
                
                <div className="pt-2">
                  <Button 
                    asChild
                    variant="link"
                    className="p-0 h-auto text-primary"
                  >
                    <Link href="/dashboard/help/docs">
                      View all documentation →
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Toaster />
    </div>
  );
}