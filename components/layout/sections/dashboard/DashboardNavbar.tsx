"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  FileUp, 
  Shield, 
  Key, 
  User, 
  Settings, 
  HelpCircle, 
  Menu, 
  X, 
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWallet } from "@solana/wallet-adapter-react";
import { ToggleTheme } from "@/components/layout/toogle-theme";
import { cn } from "@/lib/utils";

// Navigation items for the dashboard
const navItems = [
  { 
    icon: LayoutDashboard, 
    label: "Dashboard", 
    href: "/dashboard",
    description: "Overview and statistics"
  },
  { 
    icon: FileUp, 
    label: "Upload Content", 
    href: "/dashboard?tab=upload",
    description: "Upload new content"
  },
  { 
    icon: Shield, 
    label: "Attestation", 
    href: "/dashboard?tab=attest",
    description: "Verify content ownership"
  },
  { 
    icon: Key, 
    label: "Licensing", 
    href: "/dashboard?tab=license",
    description: "Manage content licenses"
  },
  { 
    icon: User, 
    label: "Profile", 
    href: "/dashboard/profile",
    description: "Manage your account"
  },
  { 
    icon: Settings, 
    label: "Settings", 
    href: "/dashboard/settings",
    description: "App configuration"
  }
];

// Secondary nav items
const secondaryNavItems = [
  { 
    icon: HelpCircle, 
    label: "Help & Documentation", 
    href: "/dashboard/help"
  }
];

export const DashboardNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { publicKey, connected } = useWallet();
  
  // Active tab handling
  const currentPath = pathname;
  const searchParams = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search) 
    : new URLSearchParams();
  const activeTab = searchParams.get('tab');

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!publicKey) return 'DG';
    return publicKey.toString().slice(0, 2).toUpperCase();
  };

  // Truncate wallet address
  const truncateAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Check if a nav item is active
  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard' && !activeTab) {
      return true;
    }
    
    if (activeTab && href.includes(`tab=${activeTab}`)) {
      return true;
    }
    
    return href !== '/dashboard' && pathname === href;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-16 items-center">
        <div className="flex items-center justify-between w-full">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              
              <SheetContent side="left" className="flex flex-col p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="flex items-center">
                    <Link
                      href="/dashboard"
                      className="flex items-center"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="bg-gradient-to-tr from-primary via-primary/70 to-primary rounded-lg w-8 h-8 mr-2 border text-white flex justify-center items-center">
                        DG
                      </span>
                      <span className="font-bold">DataGuardians</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex-1 overflow-auto">
                  {/* User Section */}
                  {connected && publicKey && (
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-10 w-10 border">
                          <AvatarFallback>{getInitials()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">Connected Wallet</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {truncateAddress(publicKey.toString())}
                          </p>
                        </div>
                      </div>
                      <Separator className="mb-4" />
                    </div>
                  )}
                  
                  {/* Navigation Items */}
                  <div className="px-2">
                    <nav className="flex flex-col gap-1">
                      {navItems.map((item) => (
                        <SheetClose asChild key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              isActive(item.href) 
                                ? "bg-primary/10 text-primary" 
                                : "hover:bg-muted"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                            {isActive(item.href) && (
                              <ChevronRight className="ml-auto h-4 w-4" />
                            )}
                          </Link>
                        </SheetClose>
                      ))}
                    </nav>
                  </div>
                  
                  {/* Secondary Navigation */}
                  <div className="mt-4 px-2">
                    <div className="py-2">
                      <h3 className="px-3 text-xs font-medium text-muted-foreground">Support</h3>
                    </div>
                    <nav className="flex flex-col gap-1">
                      {secondaryNavItems.map((item) => (
                        <SheetClose asChild key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              isActive(item.href) 
                                ? "bg-primary/10 text-primary" 
                                : "hover:bg-muted"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
                        </SheetClose>
                      ))}
                    </nav>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="p-4 border-t">
                  <div className="flex items-center justify-between">
                    <ToggleTheme />
                    <Link
                      href="/"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Back to Home
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span className="bg-gradient-to-tr from-primary via-primary/70 to-primary rounded-lg w-8 h-8 border text-white flex justify-center items-center">
                DG
              </span>
              <span className="hidden md:inline">DataGuardians</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 mx-6">
            {navItems.slice(0, 4).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href) 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          
          {/* Right Side Controls */}
          <div className="flex items-center gap-2">
            <ToggleTheme />
            
            {/* User Menu */}
            {connected && publicKey ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium hidden md:block">
                  {truncateAddress(publicKey.toString())}
                </span>
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </div>
            ) : (
              <Button size="sm" variant="outline" asChild>
                <Link href="/dashboard">Connect Wallet</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};