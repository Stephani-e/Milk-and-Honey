import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import "./globals.css";
import React from "react";
import {Toaster} from "sonner";

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
          className={`${lora.variable} ${inter.variable} h-full antialiased`}
      >
      <body className="min-h-full flex flex-col font-serif relative">
      <Toaster
          position="top-center"
          richColors
          toastOptions={{
              style: {
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
              },
              className: 'flex items-center justify-center text-center',
              closeButton: true,
          }}
      />
      <main className='flex-1 relative z-10'>
          {children}
      </main>
      </body>
      </html>
  );
}