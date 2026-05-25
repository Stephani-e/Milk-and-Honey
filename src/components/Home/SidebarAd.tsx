"use client";
import React, {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";
import {ChevronLeft, ChevronRight, ExternalLink, Megaphone} from "lucide-react";
import SkeletonLoader from "@/components/UI/SkeletonLoader";

export default function SidebarAd() {
    const [ads, setAds] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    // The Default "House Ad" for the Sidebar
    const defaultAd = {
        id: "default-sidebar-ad",
        title: "Promote Your Business",
        description: "Secure this premium sidebar placement to reach our congregation and website visitors. Click below to contact our media team.",
        target_link: "/contact?subject=advertising",
        button_text: "Inquire About Ads",
        media_url: null, // This will trigger the sleek gradient background
        isHouseAd: true
    };

    useEffect(() => {
        async function fetchSidebarAds() {
            setLoading(true);
            const {data} = await supabase
                .from('advertisements')
                .select('*')
                .eq('status', 'active')
                .eq('placement', 'global_sidebar')
                .is('deleted_at', null)
                .order('created_at', {ascending: false});

            if (data && data.length > 0) {
                // Double-check they haven't expired
                const validAds = data.filter(ad => !ad.expires_at || new Date(ad.expires_at) > new Date());

                if (validAds.length > 0) {
                    setAds(validAds);
                } else {
                    setAds([defaultAd]);
                }
            } else {
                // Fall back to house ad if database is empty
                setAds([defaultAd]);
            }

            setLoading(false);
        }

        fetchSidebarAds().catch(console.error);
    }, []);

    // AUTO-ADVANCE EVERY 1 MINUTE
    useEffect(() => {
        if (ads.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % ads.length);
        }, 60000); // 60,000ms = 1 minute

        return () => clearInterval(timer);
    }, [ads.length]);

    const currentAd = ads[currentIndex];
    const nextAd = () => setCurrentIndex((prev) => (prev + 1) % ads.length);
    const prevAd = () => setCurrentIndex((prev) => (prev === 0 ? ads.length - 1 : prev - 1));

    if (loading) {
        return <SkeletonLoader variant="sidebar-ad"/>;
    }

    // We removed the empty "Stay Tuned" state, because it will ALWAYS have at least the house ad!
    if (ads.length === 0) return null;

    return (
        <div
            className="bg-white border border-gray-100 rounded-3xl h-[300px] lg:h-[400px] w-full flex flex-col justify-end text-left shadow-md overflow-hidden relative group">

            {/* MEDIA BACKGROUND */}
            {currentAd.media_url ? (
                currentAd.media_type === 'video' ? (
                    <video
                        key={currentAd.id}
                        src={currentAd.media_url}
                        poster={currentAd.fallback_image_url || undefined}
                        autoPlay muted loop playsInline
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <img
                        key={currentAd.id}
                        src={currentAd.media_url}
                        alt={currentAd.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 animate-in fade-in"
                    />
                )
            ) : (
                // If there's no media (like our House Ad), we show a beautiful gradient with an icon
                <div
                    className="absolute inset-0 bg-gradient-to-br from-brand-primary to-slate-800 flex items-center justify-center">
                    {currentAd.isHouseAd && (
                        <Megaphone size={120} className="text-white/5 absolute top-10 right-[-20px] -rotate-12"/>
                    )}
                </div>
            )}

            <div
                className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent pointer-events-none"/>

            {/* AD CONTENT */}
            <div className="relative z-10 p-6 flex flex-col h-full justify-end w-full">
                <span
                    className={`${currentAd.isHouseAd ? 'text-white bg-white/20 border-white/30' : 'text-amber-400 bg-white/10 border-white/20'} font-black uppercase tracking-widest text-[10px] mb-3 px-3 py-1 backdrop-blur-md rounded-full border w-fit shadow-sm`}>
                    {currentAd.isHouseAd
                        ? "Space Available"
                        : (ads.length > 1 ? `Featured (${currentIndex + 1}/${ads.length})` : "Featured")}
                </span>

                <h3 className="text-white font-serif font-bold text-2xl mb-2 leading-tight animate-in slide-in-from-bottom-2">
                    {currentAd.title}
                </h3>

                {currentAd.description && (
                    <p className="text-gray-300 text-sm mb-6 line-clamp-3 animate-in slide-in-from-bottom-4">
                        {currentAd.description}
                    </p>
                )}

                {currentAd.target_link && (
                    <a href={currentAd.target_link} target="_blank" rel="noopener noreferrer"
                       className="bg-amber-500 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-lg hover:bg-amber-600 transition-colors w-full flex items-center justify-center gap-2 animate-in slide-in-from-bottom-6">
                        {currentAd.button_text || "Learn More"} <ExternalLink size={14}/>
                    </a>
                )}
            </div>

            {/* NAVIGATION CONTROLS (Only show if > 1 ad) */}
            {ads.length > 1 && (
                <div
                    className="absolute top-1/2 -translate-y-1/2 left-0 right-0 px-4 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button onClick={prevAd}
                            className="p-2 bg-black/40 hover:bg-amber-500 text-white rounded-full backdrop-blur-md transition-colors shadow-lg">
                        <ChevronLeft size={15}/>
                    </button>
                    <button onClick={nextAd}
                            className="p-2 bg-black/40 hover:bg-amber-500 text-white rounded-full backdrop-blur-md transition-colors shadow-lg">
                        <ChevronRight size={15}/>
                    </button>
                </div>
            )}

            {/* DOT INDICATORS */}
            {ads.length > 1 && (
                <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 z-20">
                    {ads.map((_, idx) => (
                        <div key={idx}
                             className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/50'}`}/>
                    ))}
                </div>
            )}
        </div>
    );
}