"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Admin/Admin Guard";
import { Plus, Megaphone } from "lucide-react";

export default function AdsDashboardPage() {
    const router = useRouter();
    const { role } = useAuth();

    // We will populate this logic tomorrow!
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    return (
        <div className="min-h-screen bg-brand-surface p-4 md:p-12 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 md:mb-8">
                    <Link href="/admin" className="text-xs md:text-sm text-brand-secondary font-bold hover:underline">
                        <span className="text-lg leading-none">←</span> Back to Dashboard
                    </Link>
                </div>

                <div className="flex flex-row justify-between items-center mb-8 md:mb-10 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary flex items-center gap-3">
                            <Megaphone className="text-brand-secondary" /> Advertisement Engine
                        </h1>
                        <p className="text-xs text-gray-500 mt-1">Manage promotional banners and clips for the public site.</p>
                    </div>

                    {role !== 'viewer' && (
                        <button
                            onClick={() => router.push("/ads/new")}
                            className="bg-brand-primary text-white px-4 py-3 md:px-6 md:py-2 rounded-xl text-xs md:text-base font-bold shadow-lg shadow-brand-primary/20 active:scale-95 transition-transform whitespace-nowrap flex items-center gap-2"
                        >
                            <Plus size={16} /> New Ad Campaign
                        </button>
                    )}
                </div>

                {/* Grid for Ad Cards will go here tomorrow */}
                <div className="p-20 text-center border-2 border-dashed border-brand-accent rounded-3xl bg-white shadow-sm">
                    <p className="text-sm font-bold text-brand-primary">Ready to build the engine tomorrow!</p>
                </div>
            </div>
        </div>
    );
}