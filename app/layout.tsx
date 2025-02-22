// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";
// import { cn } from "@/lib/utils";
// import { ThemeProvider } from "@/components/layout/theme-provider";
// import ConditionalNavbar from "@/components/ConditionalNavbar";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Shadcn - Landing template",
//   description: "Landing template from Shadcn",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="pt-br" suppressHydrationWarning>
//       <body className={cn("min-h-screen bg-background", inter.className)}>
//         <ThemeProvider
//           attribute="class"
//           defaultTheme="system"
//           enableSystem
//           disableTransitionOnChange
//         >
//           {/* This client component conditionally renders the Navbar */}
//           <ConditionalNavbar />
//           {children}
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }


// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import AppWalletProvider from "@/components/layout/sections/wallet/AppWalletProvider";
import ConditionalNavbar from "@/components/ConditionalNavbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shadcn - Landing template",
  description: "Landing template from Shadcn",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background", inter.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppWalletProvider>
            <ConditionalNavbar />
            {children}
          </AppWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
