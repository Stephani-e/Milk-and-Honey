"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    Play, Search, Calendar, User,
    BookOpen, Headphones, ArrowRight, PlayCircle, Loader2
} from "lucide-react";

export default function SermonsPage() {
    const [sermons, setSermons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState<"All" | "Sunday" | "Tuesday" | "Thursday" | "Special">("All");

    useEffect(() => {
        fetchPublicSermons();
    }, []);

    async function fetchPublicSermons() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("sermons")
                .select("*")
                .eq("status", "published")
                .eq("is_archived", false)
                .is("deleted_at", null)
                .order("service_date", { ascending: false });

            if (error) throw error;
            if (data) setSermons(data);
        } catch (error) {
            console.error("Error fetching public sermons:", error);
        } finally {
            setLoading(false);
        }
    }

    // Dynamic filtering based on your database schema
    // Dynamic filtering based on your database schema
    const filteredSermons = sermons.filter(sermon => {
        // Search Match (Bulletproof against null/empty fields)
        const safeTitle = sermon.title || "";
        const safePreacher = sermon.preacher || "";

        const matchesSearch =
            safeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            safePreacher.toLowerCase().includes(searchQuery.toLowerCase());

        // Category Match
        let matchesCategory = true;
        if (filterCategory === "Sunday") {
            matchesCategory = sermon.service_category === "Weekly" && sermon.weekly_type === "Sunday";
        } else if (filterCategory === "Tuesday") {
            matchesCategory = sermon.service_category === "Weekly" && sermon.weekly_type === "Tuesday";
        } else if (filterCategory === "Thursday") {
            matchesCategory = sermon.service_category === "Weekly" && sermon.weekly_type === "Thursday";
        } else if (filterCategory === "Special") {
            matchesCategory = sermon.service_category === "Special";
        }

        return matchesSearch && matchesCategory;
    });

    // The featured sermon is the latest Sunday Service with a YouTube URL
    const featuredSermon = sermons.find(s =>
        s.service_category === "Weekly" &&
        s.weekly_type === "Sunday" &&
        s.youtube_url
    ) || sermons[0];

    // Helper to format the beautiful badges based on your DB logic
    const getSermonBadge = (sermon: any) => {
        if (sermon.service_category === "Weekly") {
            if (sermon.weekly_type === "Sunday") {
                if (sermon.is_thanksgiving) return "Thanksgiving Service";
                if (sermon.service_number) return `Sunday • ${sermon.service_number}`;
                return "Sunday Service";
            }
            if (sermon.weekly_type === "Tuesday") return "Digging Deep";
            if (sermon.weekly_type === "Thursday") return "Faith Clinic";
            return sermon.weekly_type;
        } else {
            return `Special: ${sermon.special_service_name || "Event"}`;
        }
    };

    // Helper for fallbacks if they didn't upload a banner
    const getThumbnail = (sermon: any) => {
        if (sermon?.banner_url) return sermon.banner_url;
        // If it's a Youtube link, attempt to extract the high-res Youtube thumbnail
        if (sermon?.youtube_url) {
            const videoIdMatch = sermon.youtube_url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
            if (videoIdMatch && videoIdMatch[1]) {
                return `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
            }
        }
        // Generic Church Fallback
        return "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=800&auto=format&fit=crop";
    };

    return (
        <div className="flex flex-col bg-slate-50 min-h-screen pb-24">

            {/* 1. HERO SECTION */}
            <section className="relative py-20 bg-brand-primary overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <span className="text-amber-400 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 block">
                        Media Library
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif font-black text-white leading-tight mb-6">
                        Experience the Word.
                    </h1>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                        Watch recent messages, explore past series, and let the undiluted word of God transform your life.
                    </p>
                </div>
            </section>

            {loading ? (
                <div className="py-32 flex flex-col items-center justify-center text-brand-primary">
                    <Loader2 size={48} className="animate-spin mb-4" />
                    <p className="font-bold tracking-widest uppercase text-xs">Loading Library...</p>
                </div>
            ) : (
                <>
                    {/* 2. LATEST / FEATURED MESSAGE */}
                    {featuredSermon && (
                        <section className="max-w-7xl mx-auto px-6 -mt-10 relative z-20 mb-16">
                            <a
                                href={featuredSermon.youtube_url || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col lg:flex-row group cursor-pointer block"
                            >
                                {/* Featured Thumbnail */}
                                <div className="w-full lg:w-3/5 h-64 md:h-96 relative overflow-hidden bg-slate-900">
                                    <div className="absolute inset-0 bg-brand-primary/20 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
                                    <img
                                        src={getThumbnail(featuredSermon)}
                                        alt={featuredSermon.title}
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                    />
                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                                        <div className="w-20 h-20 bg-brand-primary/90 backdrop-blur-md rounded-full flex items-center justify-center text-white group-hover:bg-amber-500 group-hover:scale-110 transition-all shadow-2xl">
                                            <Play size={32} className="ml-2" fill="currentColor" />
                                        </div>
                                    </div>
                                    <span className="absolute top-6 left-6 z-20 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                        Latest Message
                                    </span>
                                </div>

                                {/* Featured Info */}
                                <div className="w-full lg:w-2/5 p-8 md:p-12 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 text-amber-600 mb-4 text-xs font-bold uppercase tracking-widest">
                                        <BookOpen size={16} /> {getSermonBadge(featuredSermon)}
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-serif font-black text-brand-primary mb-4 leading-tight group-hover:text-amber-600 transition-colors">
                                        {featuredSermon.title}
                                    </h2>
                                    <div className="space-y-3 mb-8">
                                        <p className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                            <User size={16} className="text-gray-400" /> {featuredSermon.preacher}
                                        </p>
                                        <p className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                            <Calendar size={16} className="text-gray-400" /> {new Date(featuredSermon.service_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-brand-primary group-hover:text-amber-600 transition-colors">
                                        Watch Now <ArrowRight size={18} />
                                    </div>
                                </div>
                            </a>
                        </section>
                    )}

                    {/* 3. SEARCH & FILTER BAR */}
                    <section className="max-w-7xl mx-auto px-6 mb-12">
                        <div className="bg-white p-4 rounded-2xl md:rounded-full shadow-lg border border-gray-100 flex flex-col md:flex-row gap-4 items-center relative z-30">

                            {/* Filter Tabs */}
                            <div className="flex overflow-x-auto no-scrollbar w-full md:w-auto gap-2 md:pl-2">
                                {["All", "Sunday", "Tuesday", "Thursday", "Special"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setFilterCategory(tab as any)}
                                        className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                                            filterCategory === tab
                                                ? "bg-brand-primary text-white shadow-md"
                                                : "bg-slate-50 text-gray-500 hover:bg-slate-100"
                                        }`}
                                    >
                                        {tab === "Tuesday" ? "Digging Deep" : tab === "Thursday" ? "Faith Clinic" : tab}
                                    </button>
                                ))}
                            </div>

                            <div className="hidden md:block w-[1px] h-8 bg-gray-200 mx-2"></div>

                            {/* Search Input */}
                            <div className="flex-1 w-full relative flex items-center">
                                <Search className="absolute left-4 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by title or preacher..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-2.5 bg-transparent border-none focus:ring-0 text-brand-primary font-bold placeholder-gray-400 outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* 4. SERMONS GRID */}
                    <section className="max-w-7xl mx-auto px-6 mb-24">
                        {filteredSermons.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredSermons.map((sermon) => (
                                    <a
                                        key={sermon.id}
                                        href={sermon.youtube_url || "#"}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 border border-gray-100 group cursor-pointer hover:-translate-y-2 transition-all duration-300 flex flex-col"
                                    >
                                        {/* Thumbnail */}
                                        <div className="h-52 relative overflow-hidden bg-slate-900">
                                            <div className="absolute inset-0 bg-brand-primary/20 group-hover:bg-brand-primary/40 transition-colors z-10 duration-300"></div>
                                            <img
                                                src={getThumbnail(sermon)}
                                                alt={sermon.title}
                                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700"
                                            />
                                            {/* Small Play Icon */}
                                            {sermon.youtube_url && (
                                                <div className="absolute bottom-4 left-4 z-20 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 group-hover:bg-amber-500 group-hover:border-amber-500 transition-colors">
                                                    <Play size={16} fill="currentColor" className="ml-1" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 flex flex-col flex-grow">
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                                                    sermon.service_category === "Weekly"
                                                        ? "bg-purple-50 text-purple-600"
                                                        : "bg-amber-50 text-amber-600"
                                                }`}>
                                                    {getSermonBadge(sermon)}
                                                </span>
                                                {sermon.is_multi_day && sermon.day_identifier && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-gray-50 text-gray-500">
                                                        {sermon.day_identifier}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-xl font-serif font-black text-brand-primary mb-3 line-clamp-2 leading-tight group-hover:text-amber-600 transition-colors">
                                                {sermon.title}
                                            </h3>

                                            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500 font-medium">
                                                <span className="flex items-center gap-1.5"><User size={14} className="text-gray-400"/> {sermon.preacher}</span>
                                                <span>{new Date(sermon.service_date).toLocaleDateString('en-GB')}</span>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                                <PlayCircle size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-2xl font-bold text-brand-primary mb-2">No messages found</h3>
                                <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
                                <button
                                    onClick={() => { setSearchQuery(""); setFilterCategory("All"); }}
                                    className="mt-6 text-sm font-bold text-amber-600 hover:text-amber-700 underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </section>

                    {/* 5. AUDIO / PODCAST PROMO */}
                    <section className="max-w-7xl mx-auto px-6">
                        <div className="bg-brand-primary rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden shadow-2xl">
                            <Headphones size={200} className="absolute -right-10 -bottom-10 text-white/5 pointer-events-none" />

                            <div className="relative z-10 max-w-xl">
                                <h2 className="text-3xl md:text-4xl font-serif font-black text-white mb-4">Listen on the Go.</h2>
                                <p className="text-slate-300 leading-relaxed text-lg">
                                    Take the word with you anywhere. All our Sunday messages and Bible studies are uploaded weekly to major audio platforms.
                                </p>
                            </div>

                            <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                <a href="https://spotify.com" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 bg-white text-brand-primary px-8 py-4 rounded-xl font-bold hover:bg-amber-400 transition-colors shadow-lg">
                                    Spotify
                                </a>
                                <a href="https://apple.com/podcasts" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 bg-white/10 text-white border border-white/20 px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-colors backdrop-blur-sm">
                                    Apple Podcasts
                                </a>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}