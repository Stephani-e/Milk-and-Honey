import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import "./globals.css";
import React from "react";
import { Toaster } from "sonner";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Milk and Honey • RCCG • Lagos Province 56",
  description: "Administrative Portal for Digital Ministry",
  icons: {
      icon: "/Church-Logo.png",
      shortcut: "/Church-Logo.png",
      apple: "/Church-Logo.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
          lang="en"
          suppressHydrationWarning
          className={`${lora.variable} ${inter.variable} h-full antialiased`}
      >
      <body className="min-h-full flex flex-col font-serif relative">
      
      {/* UPDATED TOASTER CONFIGURATION */}
        <Toaster
          position="top-right"
          toastOptions={{
            unstyled: true, 
            classNames: {
              // 1. Smaller width (340px)
              // 2. Subtle diagonal gradient
              // 3. Tighter padding (p-3)
              toast: `
                group flex w-full relative items-center justify-between overflow-hidden 
                rounded-2xl border border-white/[0.08] 
                bg-gradient-to-br from-[#1c1c1e] via-[#141415] to-[#0a0a0a]
                p-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]
                sm:w-[340px]
                /* Top-down glass glare */
                before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/[0.03] before:to-transparent before:pointer-events-none
                /* Left-side subtle highlight */
                after:absolute after:left-0 after:top-0 after:h-full after:w-16 after:bg-gradient-to-r after:from-white/[0.04] after:to-transparent after:pointer-events-none
              `,
              title: "text-[14px] font-semibold text-white/95 tracking-wide mb-0.5",
              description: "text-[12px] text-[#8f9094] font-medium",
              icon: "mr-3 flex-shrink-0 [&>svg]:w-5 [&>svg]:h-5", // Smaller icon
              content: "flex-1 mr-3 relative z-10",
              
              // Primary action (White button) - Made smaller with hover scale effects
              actionButton: "relative z-10 bg-white/95 px-3 py-1.5 text-xs font-bold text-black rounded-lg hover:bg-white transition-all hover:scale-105 active:scale-95 shadow-sm flex-shrink-0",
              
              // Secondary/Cancel action (Dark translucent button) - Made smaller with hover scale effects
              cancelButton: "relative z-10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/90 rounded-lg hover:bg-white/[0.08] transition-all hover:scale-105 active:scale-95 border border-white/[0.05] flex-shrink-0 backdrop-blur-md",
            },
          }}
      />
      
      <main className='flex-1 relative z-10'>
          {children}
      </main>
      </body>
      </html>
  );
}