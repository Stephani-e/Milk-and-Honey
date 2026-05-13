"use client";
import React, {useEffect, useState} from "react";
import {useParams, useSearchParams} from "next/navigation";
import Link from "next/link";
import {supabase} from "@/lib/supabase";
import {ArrowLeft, BookOpen, Calendar, Eye, Headphones, PlayCircle, Quote, User, Video} from "lucide-react";
import "react-quill-new/dist/quill.snow.css";
import SkeletonLoader from "@/components/UI/SkeletonLoader";

export default function SermonDetailPage() {
    const {id} = useParams();
    const searchParams = useSearchParams();
    const isPreview = searchParams.get('preview') === 'true';
    const [sermon, setSermon] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Sermon Data
    useEffect(() => {
        async function fetchSermon() {
            setLoading(true);

            try {
                let query = supabase
                    .from("sermons")
                    .select("*")
                    .eq("id", id)

                if (!isPreview) {
                    query = query.eq("status", "published").eq("is_archived", false);
                }

                const {data, error} = await query.single();

                if (error) {
                    console.error("Supabase Error fetching sermons:", error.message);
                }

                setSermon(data);
            } catch (error) {
                console.error("Error fetching sermon:", error);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchSermon().catch(console.error);
        }
    }, [id, isPreview]);

    // 2. Load Faithlife Reftagger (Single Version)
    useEffect(() => {
        if (!sermon) return;

        // @ts-ignore
        window.refTagger = {
            settings: {
                bibleVersion: "NKJV", // Hardcoded to a single version
                roundCorners: true,
                tagChapters: true,
                customStyle: {
                    heading: {backgroundColor: "#0f172a", color: "#ffffff"},
                    body: {color: "#334155"}
                }
            }
        };

        const existingScript = document.getElementById("reftagger-script");

        if (!existingScript) {
            const script = document.createElement("script");
            script.id = "reftagger-script";
            script.type = "text/javascript";
            script.src = "https://api.reftagger.com/v2/RefTagger.js";
            script.async = true;
            document.body.appendChild(script);
        } else {
            // @ts-ignore
            if (window.refTagger && typeof window.refTagger.tag === 'function') {
                // @ts-ignore
                window.refTagger.tag();
            }
        }
    }, [sermon]);

    const getYouTubeId = (url: string) => {
        if (!url) return null;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|live\/|watch\?v=|watch\?.+&v=))([^"&?\/\s]{11})/i);
        return match ? match[1] : null;
    };

    const youtubeId = getYouTubeId(sermon?.youtube_url);

    const getThumbnail = (s: any) => {
        if (s?.banner_url) return s.banner_url;
        if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
        return "https://hegyctrfwn.ufs.sh/f/iMcVGeeTb1N4go9KLrcAQBW5E03lrCpOqKzJIRZUnG9sLDHa";
    };

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

    const hasSidebarContent = youtubeId || sermon?.clip_url || sermon?.link_spotify || sermon?.link_apple || sermon?.link_ytmusic || sermon?.link_ig || sermon?.link_facebook || sermon?.link_twitter;

    if (loading) {
        return (
            <SkeletonLoader variant="sermon-list-id"/>
        );
    }

    if (!sermon) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-3xl font-serif font-black text-brand-primary mb-4">Message Not Found</h1>
                <p className="text-gray-500 mb-8">The sermon you are looking for does not exist or has been removed.</p>
                <Link href="/sermons"
                      className="bg-brand-primary text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition-colors">
                    Return to Library
                </Link>
            </div>
        );
    }


    return (
        <div className="bg-slate-50 min-h-screen pb-24 relative">

            {/* TOP NAVIGATION */}
            <div className="w-full max-w-6xl mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-4 flex items-center justify-between">
                <Link href="/sermons"
                      className="inline-flex items-center gap-2 text-brand-primary hover:text-amber-600 transition-colors text-xs font-bold uppercase tracking-widest bg-white py-2 px-4 rounded-full shadow-sm border border-gray-100">
                    <ArrowLeft size={14}/> Back to Sermons Library
                </Link>

                {isPreview && (
                    <div
                        className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full border border-blue-200 shadow-sm animate-pulse">
                        <Eye size={14}/>
                        <span className="text-[10px] font-black uppercase tracking-widest">Preview Mode (Draft)</span>
                    </div>
                )}
            </div>

            {/* 1. HERO HEADER */}
            <div className="w-full px-4 md:px-6 mb-8 md:mb-12">
                <div
                    className="max-w-6xl mx-auto relative h-[35vh] md:h-[45vh] lg:h-[50vh] bg-slate-900 rounded-[2rem] md:rounded-[3rem] flex items-end justify-start pb-8 md:pb-12 px-6 md:px-12 overflow-hidden shadow-2xl">
                    <div className="absolute inset-0">
                        <img
                            src={getThumbnail(sermon)}
                            alt={sermon.title}
                            className="w-full h-full object-cover opacity-30 blur-[2px] scale-105"
                        />
                        <div
                            className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                    </div>

                    <div className="relative z-10 w-full flex flex-col items-start max-w-4xl">
                        <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                            <span
                                className="bg-amber-500 text-white text-[10px] md:text-xs px-3 md:px-4 py-1.5 rounded-full font-black uppercase tracking-widest shadow-md">
                                {getSermonBadge(sermon)}
                            </span>
                            {sermon.service_category === "Weekly" && sermon.weekly_type === "Sunday" && sermon.service_number && (
                                <span
                                    className="bg-white/20 backdrop-blur-md text-white border border-white/20 text-[10px] md:text-xs px-3 md:px-4 py-1.5 rounded-full font-black uppercase tracking-widest">
                                    {sermon.service_number}
                                </span>
                            )}
                            {sermon.is_multi_day && sermon.day_identifier && (
                                <span
                                    className="bg-white/20 backdrop-blur-md text-white border border-white/20 text-[10px] md:text-xs px-3 md:px-4 py-1.5 rounded-full font-black uppercase tracking-widest">
                                    {sermon.day_identifier}
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-black text-white leading-tight mb-4 md:mb-6 drop-shadow-lg">
                            {sermon.title}
                        </h1>

                        <div
                            className="flex flex-wrap items-center gap-3 md:gap-8 text-slate-200 text-xs md:text-sm lg:text-base font-medium">
                            <span
                                className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10"><User
                                size={16} className="text-amber-400"/> {sermon.preacher}</span>
                            <span
                                className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10"><Calendar
                                size={16}
                                className="text-amber-400"/> {new Date(sermon.service_date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. MAIN CONTENT AREA */}
            <div className="max-w-6xl mx-auto px-4 md:px-6">

                <div className={`grid grid-cols-1 ${hasSidebarContent ? 'lg:grid-cols-3 gap-8 md:gap-12' : ''}`}>

                    {/* LEFT COLUMN: Bible Text & Sermon Notes */}
                    <div className={hasSidebarContent ? 'lg:col-span-2' : 'max-w-4xl mx-auto w-full'}>

                        {/* Bible Text Blockquote */}
                        {sermon.bible_text && (
                            <div
                                className="mb-8 md:mb-10 bg-white p-6 md:p-10 rounded-3xl md:rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                                <Quote size={100}
                                       className="absolute -top-6 -left-6 text-brand-primary/[0.03] rotate-180"/>

                                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-amber-600 mb-3 md:mb-4 flex items-center gap-2 relative z-10">
                                    <BookOpen size={14}/> Bible Text
                                </h3>

                                <p className="text-lg md:text-2xl font-serif font-bold text-brand-primary leading-relaxed relative z-10 break-words">
                                    {sermon.bible_text}
                                </p>
                            </div>
                        )}

                        {/* Sermon Notes Container */}
                        <div
                            className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[2rem] border border-gray-100 shadow-sm">
                            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400 mb-6 md:mb-2 border-b border-gray-100 pb-4">Message
                                Notes</h3>
                            {sermon.content ? (
                                <div
                                    className="text-gray-800 font-serif leading-[1.8] md:leading-loose whitespace-pre-wrap word-break break-words
                                    [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg
                                    [&_b]:font-bold [&_strong]:font-bold
                                    [&_i]:italic [&_em]:italic
                                    [&_u]:underline
                                    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
                                    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
                                    [&_p]:mb-0 [&_p]:min-h-[1.8em] md:[&_p]:min-h-[2em]
                                    [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl
                                    [&_h2]:font-bold"
                                    dangerouslySetInnerHTML={{__html: sermon.content.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ')}}
                                />
                            ) : (
                                <p className="text-gray-400 italic text-center py-8 bg-gray-50 rounded-2xl">No written
                                    notes were provided for this message.</p>
                            )}
                        </div>

                        {sermon.prayer_points && (
                            <div
                                className="mt-12 bg-blue-50/50 p-6 md:p-10 rounded-[2rem] border border-blue-100 shadow-sm relative overflow-hidden">
                                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-blue-500 mb-6 border-b border-blue-100 pb-4">
                                    Prayer Points
                                </h3>
                                <div className="text-blue-900 font-medium leading-loose whitespace-pre-wrap">
                                    {sermon.prayer_points}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Sticky Sidebar with Media & Links */}
                    {hasSidebarContent && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6 md:space-y-8">

                                {/* 1. Video Player */}
                                {youtubeId && (
                                    <div className="bg-white p-4 md:p-5 rounded-3xl border border-gray-100 shadow-sm">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-3 md:mb-4 flex items-center gap-2">
                                            <Video size={14} className="text-amber-500"/> Watch Full Service & Message
                                        </h4>
                                        <div
                                            className="w-full aspect-video bg-black rounded-2xl overflow-hidden relative group">
                                            <iframe
                                                src={`https://www.youtube.com/embed/${youtubeId}?rel=0&controls=0&modestbranding=1&iv_load_policy=3&disablekb=1`}
                                                title="YouTube video player"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="w-full h-full relative z-10"
                                            ></iframe>
                                        </div>
                                    </div>
                                )}

                                {/* 2. Listen Links */}
                                {(sermon.link_spotify || sermon.link_apple || sermon.link_ytmusic) && (
                                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 md:mb-5 border-b border-gray-100 pb-3">Listen
                                            Audio</h4>
                                        <div className="flex flex-col gap-3">
                                            {sermon.link_spotify && (
                                                <a href={sermon.link_spotify} target="_blank" rel="noreferrer"
                                                   className="flex items-center justify-center gap-3 bg-[#1DB954]/10 text-[#1DB954] hover:bg-[#1DB954] hover:text-white px-4 py-3.5 rounded-xl font-bold transition-all text-sm group">
                                                    <Headphones size={18}
                                                                className="group-hover:scale-110 transition-transform"/> Spotify
                                                </a>
                                            )}
                                            {sermon.link_apple && (
                                                <a href={sermon.link_apple} target="_blank" rel="noreferrer"
                                                   className="flex items-center justify-center gap-3 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white px-4 py-3.5 rounded-xl font-bold transition-all text-sm group">
                                                    <Headphones size={18}
                                                                className="group-hover:scale-110 transition-transform"/> Apple
                                                    Podcasts
                                                </a>
                                            )}
                                            {sermon.link_ytmusic && (
                                                <a href={sermon.link_ytmusic} target="_blank" rel="noreferrer"
                                                   className="flex items-center justify-center gap-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-3.5 rounded-xl font-bold transition-all text-sm group">
                                                    <PlayCircle size={18}
                                                                className="group-hover:scale-110 transition-transform"/> YouTube
                                                    Music
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 3. Social Snippet Links */}
                                {(sermon.link_ig || sermon.link_twitter || sermon.link_facebook) && (
                                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 md:mb-5 border-b border-gray-100 pb-3">View
                                            Snippets</h4>
                                        <div className="flex flex-wrap gap-2 md:gap-3">
                                            {sermon.link_ig && (
                                                <a href={sermon.link_ig} target="_blank" rel="noreferrer"
                                                   className="flex-1 min-w-[100px] flex items-center justify-center bg-pink-50 text-pink-600 hover:bg-pink-600 hover:text-white py-3 rounded-xl font-bold transition-colors text-xs">
                                                    Instagram
                                                </a>
                                            )}
                                            {sermon.link_facebook && (
                                                <a href={sermon.link_facebook} target="_blank" rel="noreferrer"
                                                   className="flex-1 min-w-[100px] flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white py-3 rounded-xl font-bold transition-colors text-xs">
                                                    Facebook
                                                </a>
                                            )}
                                            {sermon.link_twitter && (
                                                <a href={sermon.link_twitter} target="_blank" rel="noreferrer"
                                                   className="flex-1 min-w-[100px] flex items-center justify-center bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white py-3 rounded-xl font-bold transition-colors text-xs">
                                                    Twitter
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 4. Short Clip Video (Separated from YouTube) */}
                                {sermon.clip_url && (
                                    <div className="bg-white p-4 md:p-5 rounded-3xl border border-gray-100 shadow-sm">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-3 md:mb-4 flex items-center gap-2">
                                            <Video size={14} className="text-amber-500"/> Watch Clip
                                        </h4>
                                        <div
                                            className="w-full aspect-video bg-black rounded-2xl overflow-hidden relative">
                                            <video src={sermon.clip_url} controls className="w-full h-full"/>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}