"use client";
import React from "react";
import Logo from "@/components/Logo";

interface LoadingProps {
    message?: string;
    variant?: "full" | "overlay" | "inline";
    LogoUrl?: string;
}

export default function LoadingState({
                                         message = "Loading...",
                                         variant = "full",
                                         LogoUrl
                                     }: LoadingProps) {

    //FULL SCREEN: Used for initial entry or big actions
    if (variant === "full") {
        return (
            <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-brand-surface/80 backdrop-blur-md animate-in fade-in duration-500">
                <Logo orientation="vertical" className="animate-pulse" />
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-brand-primary/20 animate-ping" />
                    <div className="relative bg-white p-6 rounded-[2rem] shadow-xl border border-brand-accent">
                        <Spinner className="h-10 w-10 text-brand-primary" />
                    </div>
                </div>
                <p className="mt-6 text-sm font-serif font-bold text-brand-primary tracking-widest uppercase animate-pulse">
                    {message}
                </p>
            </div>
        );
    }

    // OVERLAY: Used for Pagination/Searching (dims the content slightly)
    if (variant === "overlay") {
        return (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-[2px] rounded-3xl animate-in fade-in">
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-brand-accent flex items-center gap-3">
                    <Spinner className="h-5 w-5 text-brand-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">
                        {message}
                    </span>
                </div>
            </div>
        );
    }

    //INLINE: Just the tiny spinner (for small buttons or corner status)
    return (
        <div className="flex items-center gap-2">
            <Spinner className="h-4 w-4 text-current" />
            <span className="text-xs">{message}</span>
        </div>
    );
}

// Sub-component to avoid repeating SVG code
function Spinner({ className }: { className: string }) {
    return (
        <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );
}