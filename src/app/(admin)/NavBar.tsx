"use client";
import Link from "next/link";
import { LogOut, Home, ShieldCheck, Users } from "lucide-react";

interface NavbarProps {
    profile: {
        full_name?: string;
        email?: string;
        role?: string;
    } | null;
    onLogout: () => void;
}

export default function Navbar({ profile, onLogout }: NavbarProps) {

    const userInitial = profile?.full_name
        ? profile.full_name.charAt(0).toUpperCase()
        : (profile?.email?.charAt(0).toUpperCase() || "A");

    return (
        <nav className="sticky top-0 z-[50] bg-white/90 backdrop-blur-md border-b border-brand-accent px-4 md:px-6">
            <div className="max-w-7xl mx-auto h-16 md:h-20 flex items-center justify-between">

                <Link href="/admin" className="flex items-center gap-3 md:gap-4 group">
                    <div className="h-12 w-12 md:h-11 bg-brand-primary md:rounded-xl flex items-center justify-center text-white font-serif font-bold text-base md:text-lg shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform">
                        M&H
                    </div>
                    <div className="hidden sm:block">
                        <h2 className="text-brand-primary font-serif font-bold leading-none text-sm md:text-lg">Milk & Honey</h2>
                        <p className="text-[8px] md:text-[9px] uppercase tracking-widest font-black text-brand-secondary mt-0.5 md:mt-1">Admin Portal</p>
                    </div>
                </Link>

                <div className="flex items-center gap-2 md:gap-4">

                    {profile?.role === 'super-admin' && (
                        <Link
                            href="/admin/profiles"
                            className="flex items-center gap-2 px-3 py-2 bg-brand-primary/5 text-brand-primary rounded-full hover:bg-brand-primary hover:text-white transition-all group border border-brand-primary/10 shadow-sm"
                        >
                            <Users size={16} className="shrink-0" />
                            <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest">Manage Access</span>
                        </Link>
                    )}

                    {/* USER PROFILE CHIP */}
                    <div className="flex items-center gap-2 md:gap-3 bg-brand-surface border border-brand-accent p-1 md:pl-2 md:pr-4 md:py-1.5 rounded-full min-w-max">
                        <div className="h-7 w-7 md:h-8 bg-brand-secondary text-white rounded-full flex items-center justify-center font-bold text-xs md:text-sm shadow-inner shrink-0">
                            {userInitial}
                        </div>

                        <div className="hidden md:flex flex-col pr-1">
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] font-black text-brand-primary leading-none uppercase tracking-tighter whitespace-nowrap">
                                    {profile?.role ? profile.role.replace('-', ' ') : 'Loading...'}
                                </span>
                                {profile?.role === 'super-admin' && <ShieldCheck size={10} className="text-brand-secondary" />}
                            </div>
                            <span className="text-[11px] text-brand-secondary font-medium whitespace-nowrap">
                                {profile?.full_name || profile?.email || "Accessing..."}
                            </span>
                        </div>
                    </div>

                    <div className="w-px h-6 bg-gray-100 mx-1 hidden sm:block" />

                    <Link
                        href="/admin"
                        className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-surface rounded-lg md:rounded-xl transition-all"
                        title="Dashboard Home"
                    >
                        <Home size={18} className="md:w-5 md:h-5" />
                    </Link>

                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 border border-red-100 text-red-600 rounded-full text-xs md:text-sm font-bold hover:bg-red-50 transition-all active:scale-95 cursor-pointer"
                    >
                        <LogOut size={14} strokeWidth={2.5} />
                        <span className="hidden xs:inline">Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}