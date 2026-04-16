"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BrandWatermark from "@/components/BrandWatermark";
import ConfirmModal from "@/components/Admin/ConfirmModal";
import {toast} from "sonner";

export default function AdminDashboard() {
    const router = useRouter();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleSignOut = async () => {
        setIsLoggingOut(true)
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                toast.error("Logout failed: " + error.message);
                setIsLoggingOut(false);
            } else {
                toast.success("Signed out successfully");
                setTimeout(() => {
                    router.push("/login");
                    router.refresh();
                }, 800);
            }
        } catch (err) {
            toast.error("An unexpected error occurred");
            setIsLoggingOut(false);
        }
    };

    const goToSermon = () => router.push("/sermons")
    const goToMedia = () => router.push("/sermons")
    const goToEvents = () => router.push("/sermons")


    return (
        <div className="min-h-screen bg-brand-surface p-4 md:p-12">

            <BrandWatermark />

            <div className="relative z-10">
                {/* Header Area */}
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12 gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary ">Ministry Control Center</h1>
                        <p className="text-brand-text mt-2 font-sans uppercase tracking-[0.15em] text-[10px] md:text-xs font-semibold">
                            Lagos Province 56 • Milk and Honey Center
                        </p>
                    </div>

                    <button
                        onClick={() => setIsLogoutOpen(true)}
                        className="w-full md:w-auto px-8 py-2.5 border border-red-200 text-red-600 rounded-full text-sm font-bold hover:bg-red-50 transition-colors cursor-pointer"
                    >
                        Logout
                    </button>
                </div>

                {/* Grid of Actions */}
                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">

                    {/* ACTION 1: SERMONS */}
                    {/*<div className="church-card group cursor-pointer hover:border-brand-secondary transition-all">*/}
                    <div className="bg-white p-8 rounded-3xl border border-brand-accent group hover:shadow-xl hover:shadow-brand-primary/5 transition-all">
                        <div className="h-12 w-12 bg-brand-primary text-white rounded-xl flex items-center justify-center mb-6">
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-brand-primary mb-2">Sermons & Notes</h3>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">Upload weekly sermon clips, outlines, and Sunday rotation host details.</p>
                        <button
                            onClick={goToSermon}
                            className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl text-sm transition-transform active:scale-95 cursor-pointer"
                        >
                            Open Manager
                        </button>
                    </div>

                    {/* ACTION 2: MEDIA GALLERY */}
                    {/*<div className="church-card group cursor-pointer hover:border-brand-secondary transition-all">*/}
                    <div className="bg-white p-8 rounded-3xl border border-brand-accent group hover:shadow-xl transition-all">
                        <div className="h-12 w-12 bg-brand-secondary text-white rounded-xl flex items-center justify-center mb-6">
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-brand-primary mb-2">Media Gallery</h3>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">Update the church photo gallery with images from the latest services and events.</p>
                        <button
                            onClick={goToMedia}
                            className="w-full bg-[#C5A059] text-white font-bold px-6 py-2 rounded-xl text-sm ransition-transform active:scale-95 cursor-pointer"
                        >
                            Manage Photos
                        </button>
                    </div>

                    {/* ACTION 3: EVENTS */}
                    <div className="bg-white p-8 rounded-3xl border border-brand-accent group hover:shadow-xl transition-all sm:col-span-2 lg:col-span-1">
                        <div className="h-12 w-12 bg-slate-200 text-brand-primary rounded-xl flex items-center justify-center mb-6">
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-brand-primary mb-2">Events Calendar</h3>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">Set dates for Provincial meetings, Youth events, and Parish celebrations.</p>
                        <button
                            onClick={goToEvents}
                            className="w-full bg-gray-100 text-brand-primary font-bold px-6 py-2 rounded-xl text-sm ransition-transform active:scale-95 cursor-pointer"
                        >
                            Update Calendar
                        </button>
                    </div>

                </div>

                {/* QUICK STATUS */}
                <div className="max-w-6xl mx-auto mt-8 md:mt-12 p-5 bg-white border border-brand-accent rounded-2xl flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-[10px] font-sans font-black text-gray-400 uppercase tracking-widest">
                            Database Connection: Active • All Systems Operational
                        </p>
                    </div>
                    <div className="hidden md:block w-px h-4 bg-gray-200"></div>
                    <p className="text-[10px] font-sans font-bold text-gray-400 uppercase tracking-widest">
                        Milk and Honey Admin Portal v2.0
                    </p>
                </div>
            </div>

            {/* Vertical Signature */}
            <div className="fixed hidden xl:flex right-8 top-1/2 -translate-y-1/2 flex-col items-center gap-4 origin-center">
                <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gray-600 [writing-mode:vertical-lr] rotate-180">
                    Design & Maintenance by <span className="text-brand-secondary font-bold">The Media Team</span>
                </p>
                <div className="w-[1px] h-12 bg-gray-200"></div>
            </div>

            <ConfirmModal
                isOpen={isLogoutOpen}
                title="End Admin Session?"
                message="Are you sure you want to sign out? You will need to re-authenticate to manage ministry content."
                confirmText={isLoggingOut ? "Signing out..." : "Sign Out"}
                onClose={() => {
                    setIsLogoutOpen(false)
                    setIsLoggingOut(false)
                }}
                onConfirm={handleSignOut}
            />
        </div>
    );
}