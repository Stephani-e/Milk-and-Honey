import React from "react";
import Navbar from "./NavBar";

// This protects the entire admin folder from Vercel build crashes
export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-surface">
      <Navbar />
      <main>
        {children}
      </main>
    </div>
  );
}