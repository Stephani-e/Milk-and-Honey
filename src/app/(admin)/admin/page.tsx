"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BrandWatermark from "@/components/BrandWatermark";
import LoadingState from "@/components/Admin/LoadingPage";

export default function AdminDashboard() {
    const router = useRouter();
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setInitialLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const goToSermon = () => router.push("/sermons");
    const goToMedia = () => router.push("/gallery");
    const goToEvents = () => router.push("/events");
    const goToDepartments = () => router.push("/departments")
    const goToLifeStages = () => router.push("/life-stages")
    const goToLeadership = () => router.push("/leadership")
    const goToParishes = () => router.push("/parishes")

    if (initialLoading) {
        return <LoadingState variant="full" message="Opening Control Center..." />;
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-brand-surface p-6 md:p-12">
            <BrandWatermark />

            <div className="relative z-10 max-w-6xl mx-auto">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-primary tracking-tight">
                        Ministry Control Center
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium text-sm md:text-base">
                        Select a module below to manage church content.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">

                    <div className="bg-white p-8 rounded-3xl border border-brand-accent hover:shadow-xl hover:shadow-brand-primary/5 transition-all flex flex-col justify-between">
                        <div>
                            <div className="h-12 w-12 bg-blue-100 text-blue-900 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-brand-primary/20">
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                            </div>
                            <h3 className="text-xl font-serif font-bold text-blue-900 mb-2">Sermons & Notes</h3>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">Upload weekly sermon clips, outlines, and rotation details.</p>
                        </div>
                        <button
                            onClick={goToSermon}
                            className="w-full bg-blue-900 text-white font-bold py-3.5 rounded-xl text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                        >
                            Open Manager
                        </button>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-brand-accent hover:shadow-xl transition-all flex flex-col justify-between">
                        <div>
                            <div className="h-12 w-12 bg-orange-100 text-orange-900 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-brand-secondary/20">
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                            </div>
                            <h3 className="text-xl font-serif font-bold text-orange-900 mb-2">Media Gallery</h3>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">Update the church media gallery with images & videos from latest events.</p>
                        </div>
                        <button
                            onClick={goToMedia}
                            className="w-full bg-orange-900 text-white font-bold py-3.5 rounded-xl text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                        >
                            Manage Media
                        </button>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-brand-accent hover:shadow-xl transition-all flex flex-col justify-between">
                        <div>
                            <div className="h-12 w-12 bg-purple-100 text-purple-900 rounded-xl flex items-center justify-center mb-6">
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                            </div>
                            <h3 className="text-xl font-serif font-bold text-purple-900  mb-2">Events Calendar</h3>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">Set dates for Provincial meetings and Parish celebrations.</p>
                        </div>
                        <button
                            onClick={goToEvents}
                            className="w-full bg-purple-900 text-white font-bold py-3.5 rounded-xl text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                        >
                            Update Calendar
                        </button>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-brand-accent hover:shadow-xl transition-all flex flex-col justify-between">
                        <div>
                            <div className="h-12 w-12 bg-emerald-100 text-emerald-900 rounded-xl flex items-center justify-center mb-6">
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m12-10a4 4 0 11-8 0 4 4 0 018 0zM23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/></svg>
                            </div>
                            <h3 className="text-xl font-serif font-bold text-emerald-900 mb-2">Workforce Units</h3>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">Organize church departments, duty rosters, and head of departments.</p>
                        </div>
                        <button onClick={goToDepartments} className="w-full bg-emerald-900 text-white font-bold py-3.5 rounded-xl text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer">
                            Manage Units
                        </button>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-brand-accent hover:shadow-xl transition-all flex flex-col justify-between">
                        <div>
                            <div className="h-12 w-12 bg-red-100 text-red-900 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-brand-secondary/20">
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>
                            </div>
                            <h3 className="text-xl font-serif font-bold text-red-900 mb-2">Life Stages</h3>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">Dedicated portals for Youth, Teens, Women (Good Women), and Men (Excellent Men).</p>
                        </div>
                        <button onClick={goToLifeStages} className="w-full bg-red-900 text-white font-bold py-3.5 rounded-xl text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer">
                            Open Fellowships
                        </button>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-brand-accent hover:shadow-xl transition-all flex flex-col justify-between">
                        <div>
                            <div className="h-12 w-12 bg-olive-100 text-olive-900 rounded-xl flex items-center justify-center mb-6">
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m0 0A9.954 9.954 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10c0 2.478-.897 4.747-2.387 6.5m-3.226 3.123c-1.047.23-2.134.377-3.253.377a10.003 10.003 0 01-4.387-.999"/></svg>
                            </div>
                            <h3 className="text-xl font-serif font-bold text-olive-900 mb-2">Leadership Registry</h3>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">Directory of Pastors, Secretaries, and Board Members across the Province.</p>
                        </div>
                        <button onClick={goToLeadership} className="w-full bg-olive-900 text-white font-bold py-3.5 rounded-xl text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer">
                            View Registry
                        </button>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-brand-accent hover:shadow-xl transition-all flex flex-col justify-between sm:col-span-2 lg:col-span-3">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="h-16 w-16 bg-mauve-100 text-mauve-900 border border-brand-accent rounded-2xl flex items-center justify-center shrink-0">
                                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            </div>
                            <div className='flex-1'>
                                <h3 className="text-2xl font-serif font-bold text-mauve-900 mb-2">Parish & Hierarchy Network</h3>
                                <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
                                    Map out the organizational flow of the church. Manage data for **Zonal**, **Area**, and **Parish** levels, including their unique locations and ranking within Lagos Province 56.
                                </p>
                            </div>
                            <button onClick={goToParishes} className="w-full md:w-auto px-10 bg-mauve-900 text-white font-bold py-3.5 rounded-xl text-sm hhover:brightness-110 active:scale-95 transition-all cursor-pointer">
                                Explore Network
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 md:mt-12 p-5 bg-white/50 backdrop-blur-sm border border-brand-accent rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                    {/* Left Side: Status */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-2 w-2">
                            {/* Added a ping effect for a more "live" feel */}
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </div>
                        <p className="text-[10px] font-sans font-black text-gray-400 uppercase tracking-widest">
                            System Status: <span className="text-brand-primary">Operational</span>
                        </p>
                    </div>

                    {/* Right Side: Version & Branding */}
                    <div className="flex items-center gap-4">
                        {/* The divider now only shows on desktop to separate the two pieces of info */}
                        <div className="hidden md:block w-px h-3 bg-gray-200"></div>
                        <p className="text-[10px] font-sans font-bold text-gray-300 uppercase tracking-widest">
                            Milk and Honey <span className="text-gray-400">v2.1</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Vertical Signature */}
            <div className="fixed hidden xl:flex right-8 bottom-12 flex-col items-center gap-4 z-0">
                <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gray-400 [writing-mode:vertical-lr] rotate-180">
                    Design & Maintenance by <span className="text-brand-secondary font-bold">The Media Team</span>
                </p>
                <div className="w-[1px] h-12 bg-gray-200"></div>
            </div>
        </div>
    );
}