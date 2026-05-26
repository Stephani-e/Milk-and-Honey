import React from "react";
import AdminGuard from "@/components/Admin/AdminGuard";
import Navbar from "./NavBar";
import BackToTop from "@/components/Admin/BackToTop";

export const dynamic = 'force-dynamic';

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return (
        <AdminGuard>
            <div className="min-h-screen bg-brand-surface">
                <Navbar/>
                <main>
                    {children}
                </main>
                <BackToTop/>
            </div>
        </AdminGuard>
    );
}