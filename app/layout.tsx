import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import AppWalletProvider from "@/components/layout/sections/wallet/AppWalletProvider";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import AppProvider from "@/components/layout/AppProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Data guardians",
  description: "Protect your online data with - Data guardians",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background", inter.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppWalletProvider>
            <AppProvider>
              <ConditionalNavbar />
              {children}
            </AppProvider>
          </AppWalletProvider>  
        </ThemeProvider>
      </body>
    </html>
  );
}