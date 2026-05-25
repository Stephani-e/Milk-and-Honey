"use client";
import React, {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";
import {ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ExternalLink, Megaphone} from "lucide-react";

export default function GlobalTopAd() {
    const [ads, setAds] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    // The Default "House Ad" shown when no ads are running
    const defaultAd = {
        id: "default-house-ad",
        title: "Advertise Your Business Here",
        description: "Reach our entire congregation and global audience. We offer premium digital ad placements for community businesses and partners. Click below to view our advertising guidelines and submit your ad for approval.",
        target_link: "/contact?subject=advertising", // Routes them right to your contact form!
        button_text: "Inquire About Advertising",
        media_url: null,
        isHouseAd: true
    };

    useEffect(() => {
        async function fetchTopAds() {
            const {data} = await supabase
                .from('advertisements')
                .select('*')
                .eq('status', 'active')
                .eq('placement', 'global_top')
                .is('deleted_at', null)
                .order('created_at', {ascending: false});

            if (data && data.length > 0) {
                const validAds = data.filter(ad => !ad.expires_at || new Date(ad.expires_at) > new Date());

                // If we found valid ads, use them. Otherwise, fall back to the house ad.
                if (validAds.length > 0) {
                    setAds(validAds);
                } else {
                    setAds([defaultAd]);
                }
            } else {
                // If Supabase returns absolutely nothing, show the house ad.
                setAds([defaultAd]);
            }
        }

        fetchTopAds().catch(console.error);
    }, []);

    // AUTO-ROTATE EVERY 55 SECONDS (Pauses if dropdown is open or only 1 ad!)
    useEffect(() => {
        if (ads.length <= 1 || isExpanded) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % ads.length);
        }, 55000);

        return () => clearInterval(timer);
    }, [ads.length, isExpanded]);

    const nextAd = () => setCurrentIndex((prev) => (prev + 1) % ads.length);
    const prevAd = () => setCurrentIndex((prev) => (prev === 0 ? ads.length - 1 : prev - 1));

    // We no longer return null here, because we ALWAYS have at least the default ad!
    if (ads.length === 0) return null;

    const currentAd = ads[currentIndex];

    return (
        <div className="relative z-[60] w-full bg-brand-primary text-white border-b border-white/10 shadow-md">

            {/* 1. TOP BAR: TICKER & TOGGLE */}
            <div className="flex items-center justify-between px-4 h-10 md:h-12 max-w-7xl mx-auto gap-4">

                {/* Auto-Scrolling Ticker */}
                <div className="flex-1 overflow-hidden relative flex items-center h-full">
                    <div key={currentAd.id}
                         className="animate-marquee whitespace-nowrap flex gap-20 text-[10px] md:text-xs font-bold tracking-widest uppercase opacity-90">
                        {/* Custom emoji for house ad vs regular ad */}
                        <span>{currentAd.isHouseAd ? "📣" : "🚨"} {currentAd.title}</span>
                        <span>{currentAd.isHouseAd ? "📣" : "🚨"} {currentAd.title}</span>
                        <span>{currentAd.isHouseAd ? "📣" : "🚨"} {currentAd.title}</span>
                        <span>{currentAd.isHouseAd ? "📣" : "🚨"} {currentAd.title}</span>
                        <span>{currentAd.isHouseAd ? "📣" : "🚨"} {currentAd.title}</span>
                    </div>
                </div>

                {/* Dropdown Toggle */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold tracking-widest uppercase hover:bg-white hover:text-brand-primary transition-colors whitespace-nowrap shrink-0 bg-white/10 px-3 py-1.5 rounded-full border border-white/20"
                >
                    {isExpanded ? "Close Info" : "Click for More Info"}
                    {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                </button>
            </div>

            {/* 2. ABSOLUTE DROPDOWN PANEL */}
            <div
                className={`absolute top-full left-0 w-full bg-slate-900 border-b border-white/10 shadow-2xl transition-all duration-500 origin-top overflow-hidden ${
                    isExpanded ? 'max-h-[800px] opacity-100 py-6 md:py-10' : 'max-h-0 opacity-0 py-0'
                }`}
            >
                <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row gap-6 md:gap-10 items-center relative">

                    {/* Media Display (Falls back to an icon if no media_url exists) */}
                    {currentAd.media_url ? (
                        <div
                            className="w-full md:w-2/5 aspect-video bg-slate-800 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 shadow-xl relative">
                            {currentAd.media_type === 'video' ? (
                                <video
                                    key={currentAd.id}
                                    src={currentAd.media_url}
                                    poster={currentAd.fallback_image_url || undefined}
                                    autoPlay muted loop playsInline
                                    className="absolute inset-0 w-full h-full object-cover animate-in fade-in"
                                />
                            ) : (
                                <img
                                    key={currentAd.id}
                                    src={currentAd.media_url}
                                    alt={currentAd.title}
                                    className="absolute inset-0 w-full h-full object-cover animate-in fade-in"
                                />
                            )}
                        </div>
                    ) : (
                        <div
                            className="w-full md:w-1/3 aspect-video bg-white/5 rounded-2xl flex flex-col items-center justify-center border border-white/10 shadow-inner">
                            <Megaphone size={48} className="text-amber-400/50 mb-2"/>
                            <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Space Available</span>
                        </div>
                    )}

                    {/* Text & CTA Details */}
                    <div className="flex-1 text-center md:text-left space-y-4 w-full">
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                            <span
                                className="text-amber-400 font-black uppercase tracking-widest text-[10px] bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 block">
                                {currentAd.isHouseAd ? "Advertising Partner" : "Featured Update"}
                            </span>

                            {/* MINI NAVIGATION CONTROLS */}
                            {ads.length > 1 && (
                                <div className="flex items-center gap-2 bg-white/5 rounded-full px-2 py-1">
                                    <button onClick={prevAd} className="p-1 hover:text-amber-400 transition-colors">
                                        <ChevronLeft size={14}/></button>
                                    <span
                                        className="text-[10px] font-bold text-gray-400">{currentIndex + 1} of {ads.length}</span>
                                    <button onClick={nextAd} className="p-1 hover:text-amber-400 transition-colors">
                                        <ChevronRight size={14}/></button>
                                </div>
                            )}
                        </div>

                        <h3 className="text-2xl md:text-4xl font-serif font-black text-white leading-tight">
                            {currentAd.title}
                        </h3>

                        {currentAd.description && (
                            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto md:mx-0">
                                {currentAd.description}
                            </p>
                        )}

                        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                            {currentAd.target_link && (
                                <a
                                    href={currentAd.target_link}
                                    className="inline-flex items-center justify-center gap-2 bg-amber-500 text-white px-8 py-3.5 rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-colors hover:scale-105"
                                >
                                    {currentAd.button_text || "Learn More"} <ExternalLink size={16}/>
                                </a>
                            )}
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="inline-flex items-center justify-center bg-white/5 text-white px-8 py-3.5 rounded-xl text-xs md:text-sm font-bold hover:bg-white/10 transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MARQUEE STYLES */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes marquee {
                    0% { transform: translateX(100vw); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    display: inline-flex;
                    animation: marquee 20s linear infinite;
                    will-change: transform;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `
            }}/>
        </div>
    );
}