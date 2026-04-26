import React from "react";
import AdminGuard from "@/components/Admin/Admin Guard";
import Navbar from "./NavBar";

export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <AdminGuard>
          <div className="min-h-screen bg-brand-surface">
              <Navbar />
              <main>
                  {children}
              </main>
          </div>
      </AdminGuard>
  );
}