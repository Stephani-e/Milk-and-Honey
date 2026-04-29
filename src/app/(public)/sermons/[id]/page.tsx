"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft, Calendar, User, BookOpen,
    PlayCircle, Headphones, Share2, Loader2, Quote
} from "lucide-react";

export default function SermonDetailPage() {
    const { id } = useParams();
    const [sermon, setSermon] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSermon() {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("sermons")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) throw error;
                setSermon(data);
            } catch (error) {
                console.error("Error fetching sermon:", error);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchSermon();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-brand-primary">
                <Loader2 size={48} className="animate-spin mb-4" />
                <p className="font-bold tracking-widest uppercase text-xs">Loading Message...</p>
            </div>
        );
    }

    if (!sermon) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-3xl font-serif font-black text-brand-primary mb-4">Message Not Found</h1>
                <p className="text-gray-500 mb-8">The sermon you are looking for does not exist or has been removed.</p>
                <Link href="/sermons" className="bg-brand-primary text-white px-8 py-3 rounded-full font-bold">
                    Return to Library
                </Link>
            </div>
        );
    }

    // Helper: Extract YouTube Video ID for embedding
    const getYouTubeId = (url: string) => {
        if (!url) return null;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
        return match ? match[1] : null;
    };

    const youtubeId = getYouTubeId(sermon.youtube_url);

    // Helper: Get fallback thumbnail
    const getThumbnail = (s: any) => {
        if (s?.banner_url) return s.banner_url;
        if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
        return "https://hegyctrfwn.ufs.sh/f/iMcVGeeTb1N4go9KLrcAQBW5E03lrCpOqKzJIRZUnG9sLDHa";
    };

    // Helper: Category Badges
    const getSermonBadge = (s: any) => {
        if (s.service_category === "Weekly") {
            if (s.weekly_type === "Sunday") return s.is_thanksgiving ? "Thanksgiving" : "Sunday Service";
            if (s.weekly_type === "Tuesday") return "Digging Deep";
            if (s.weekly_type === "Thursday") return "Faith Clinic";
            return s.weekly_type;
        } else if (s.service_category === "Monthly") {
            return s.special_service_name || "Monthly Service";
        }
        return `Special Event`;
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-24">

            {/* 1. IMMERSIVE HERO HEADER */}
            <div className="relative h-[40vh] md:h-[50vh] w-full bg-slate-900 flex items-end justify-center pb-12 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={getThumbnail(sermon)}
                        alt={sermon.title}
                        className="w-full h-full object-cover opacity-40 blur-[2px] scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-start">
                    <Link href="/sermons" className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors text-sm font-bold uppercase tracking-widest">
                        <ArrowLeft size={16} /> Back to Library
                    </Link>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-amber-500 text-white text-[10px] md:text-xs px-3 py-1 rounded-full font-black uppercase tracking-widest">
                            {getSermonBadge(sermon)}
                        </span>
                        {sermon.service_category === "Weekly" && sermon.weekly_type === "Sunday" && sermon.service_number && (
                            <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 text-[10px] md:text-xs px-3 py-1 rounded-full font-black uppercase tracking-widest">
                                {sermon.service_number}
                            </span>
                        )}
                        {sermon.is_multi_day && sermon.day_identifier && (
                            <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 text-[10px] md:text-xs px-3 py-1 rounded-full font-black uppercase tracking-widest">
                                {sermon.day_identifier}
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-black text-white leading-tight mb-6">
                        {sermon.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm md:text-base font-medium">
                        <span className="flex items-center gap-2"><User size={18} className="text-amber-500" /> {sermon.preacher}</span>
                        <span className="flex items-center gap-2"><Calendar size={18} className="text-amber-500" /> {new Date(sermon.service_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* 2. MAIN CONTENT AREA */}
            <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-20">

                {/* Embedded Video Player (If Available) */}
                {youtubeId ? (
                    <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl mb-12 border-4 border-white">
                        <iframe
                            src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    </div>
                ) : sermon.clip_url ? (
                    <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl mb-12 border-4 border-white">
                        <video src={sermon.clip_url} controls className="w-full h-full" />
                    </div>
                ) : null}

                {/* Grid Layout for Notes & Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column: Notes & Text */}
                    <div className="lg:col-span-2">

                        {/* Bible Text Blockquote */}
                        {sermon.bible_text && (
                            <div className="mb-10 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                                <Quote size={64} className="absolute -top-4 -left-4 text-brand-primary/5" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-amber-600 mb-2 flex items-center gap-2">
                                    <BookOpen size={14} /> Anchor Scripture
                                </h3>
                                <p className="text-xl md:text-2xl font-serif font-bold text-brand-primary leading-relaxed relative z-10">
                                    "{sermon.bible_text}"
                                </p>
                            </div>
                        )}

                        {/* Sermon Notes */}
                        <div className="prose prose-lg prose-slate max-w-none">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 border-b border-gray-200 pb-2">Message Notes</h3>
                            {sermon.content ? (
                                <div className="whitespace-pre-wrap text-gray-700 leading-loose text-lg font-serif">
                                    {sermon.content}
                                </div>
                            ) : (
                                <p className="text-gray-400 italic">No notes were provided for this message.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Sticky Sidebar with Links */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">

                            {/* Listen Links */}
                            {(sermon.link_spotify || sermon.link_apple || sermon.link_ytmusic) && (
                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Listen on Audio Platforms</h4>
                                    <div className="flex flex-col gap-3">
                                        {sermon.link_spotify && (
                                            <a href={sermon.link_spotify} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-[#1DB954]/10 text-[#1DB954] hover:bg-[#1DB954] hover:text-white px-4 py-3 rounded-xl font-bold transition-colors">
                                                <Headphones size={20}/> Spotify
                                            </a>
                                        )}
                                        {sermon.link_apple && (
                                            <a href={sermon.link_apple} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-purple-100 text-purple-600 hover:bg-purple-600 hover:text-white px-4 py-3 rounded-xl font-bold transition-colors">
                                                <Headphones size={20}/> Apple Podcasts
                                            </a>
                                        )}
                                        {sermon.link_ytmusic && (
                                            <a href={sermon.link_ytmusic} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white px-4 py-3 rounded-xl font-bold transition-colors">
                                                <PlayCircle size={20}/> YouTube Music
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Social / Snippet Links */}
                            {(sermon.link_ig || sermon.link_twitter || sermon.link_facebook) && (
                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">View Snippets</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {sermon.link_ig && (
                                            <a href={sermon.link_ig} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-pink-50 text-pink-600 hover:bg-pink-600 hover:text-white py-3 rounded-xl font-bold transition-colors text-sm">
                                                Instagram
                                            </a>
                                        )}
                                        {sermon.link_facebook && (
                                            <a href={sermon.link_facebook} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white py-3 rounded-xl font-bold transition-colors text-sm">
                                                Facebook
                                            </a>
                                        )}
                                        {sermon.link_twitter && (
                                            <a href={sermon.link_twitter} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white py-3 rounded-xl font-bold transition-colors text-sm">
                                                X (Twitter)
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}