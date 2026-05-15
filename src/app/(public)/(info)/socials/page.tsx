import React from "react";
import {ArrowRight, Headphones, Mic, PlayCircle, Radio, Smartphone} from "lucide-react";
import {supabase} from "@/lib/supabase";

// --- SVG Icons ---
const FacebookIcon = ({size = 20, className = ""}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
);

const InstagramIcon = ({size = 20, className = ""}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

const YouTubeIcon = ({size = 20, className = ""}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path
            d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
    </svg>
);

const TwitterIcon = ({size = 20, className = ""}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path
            d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
    </svg>
);

export default async function SocialsPage() {

    // --- Fetch Settings Securely ---
    const {data: settings} = await supabase
        .from('site_settings')
        .select('*')
        .single();

    return (
        <div className="bg-slate-50 min-h-screen pb-24">

            {/* 1. HERO SECTION */}
            <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 bg-brand-primary overflow-hidden">
                <div
                    className="absolute inset-0 bg-[url('https://unsplash.com/photos/a-group-of-different-social-media-logos-HBkpnDVc_Ic')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/90"/>

                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <div
                        className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <Smartphone size={32}/>
                    </div>
                    <span className="text-amber-400 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 block">
                        Stay Connected
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif font-black text-white leading-tight mb-6">
                        Our Digital Community.
                    </h1>
                    <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                        Church doesn't stop on Sunday. Follow us across our platforms for daily encouragement, live
                        streams, sermon clips, and community updates.
                    </p>
                </div>
            </section>

            {/* 2. THE MAIN PLATFORMS (Bento Grid) */}
            <section className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

                    {/* Instagram */}
                    <a href={settings?.instagram_url || "#"} target="_blank" rel="noreferrer"
                       className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                        <div
                            className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div
                                className="w-16 h-16 bg-pink-50 text-pink-600 group-hover:bg-white group-hover:text-pink-600 rounded-full flex items-center justify-center mb-6 transition-colors">
                                <InstagramIcon size={28}/>
                            </div>
                            <h3 className="text-xl font-bold text-brand-primary group-hover:text-white transition-colors mb-2">Instagram</h3>
                            <p className="text-sm text-gray-500 group-hover:text-white/80 transition-colors mb-6">Photos,
                                reels, and daily inspiration.</p>
                            <span
                                className="mt-auto text-xs font-black uppercase tracking-widest text-pink-500 group-hover:text-white flex items-center gap-1">
                                Follow Us <ArrowRight size={14}/>
                            </span>
                        </div>
                    </a>

                    {/* YouTube */}
                    <a href={settings?.youtube_url || "#"} target="_blank" rel="noreferrer"
                       className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                        <div
                            className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div
                                className="w-16 h-16 bg-red-50 text-red-600 group-hover:bg-white group-hover:text-red-600 rounded-full flex items-center justify-center mb-6 transition-colors">
                                <YouTubeIcon size={28}/>
                            </div>
                            <h3 className="text-xl font-bold text-brand-primary group-hover:text-white transition-colors mb-2">YouTube</h3>
                            <p className="text-sm text-gray-500 group-hover:text-white/80 transition-colors mb-6">Full
                                services, live streams, and series.</p>
                            <span
                                className="mt-auto text-xs font-black uppercase tracking-widest text-red-500 group-hover:text-white flex items-center gap-1">
                                Subscribe <ArrowRight size={14}/>
                            </span>
                        </div>
                    </a>

                    {/* Facebook */}
                    <a href={settings?.facebook_url || "#"} target="_blank" rel="noreferrer"
                       className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                        <div
                            className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div
                                className="w-16 h-16 bg-blue-50 text-blue-600 group-hover:bg-white group-hover:text-blue-600 rounded-full flex items-center justify-center mb-6 transition-colors">
                                <FacebookIcon size={28}/>
                            </div>
                            <h3 className="text-xl font-bold text-brand-primary group-hover:text-white transition-colors mb-2">Facebook</h3>
                            <p className="text-sm text-gray-500 group-hover:text-white/80 transition-colors mb-6">Community
                                groups, events, and livestreams.</p>
                            <span
                                className="mt-auto text-xs font-black uppercase tracking-widest text-blue-500 group-hover:text-white flex items-center gap-1">
                                Like Page <ArrowRight size={14}/>
                            </span>
                        </div>
                    </a>

                    {/* X (Twitter) */}
                    <a href={settings?.twitter_url || "#"} target="_blank" rel="noreferrer"
                       className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                        <div
                            className="absolute inset-0 bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div
                                className="w-16 h-16 bg-slate-100 text-slate-800 group-hover:bg-white group-hover:text-slate-900 rounded-full flex items-center justify-center mb-6 transition-colors">
                                <TwitterIcon size={28}/>
                            </div>
                            <h3 className="text-xl font-bold text-brand-primary group-hover:text-white transition-colors mb-2">X
                                (Twitter)</h3>
                            <p className="text-sm text-gray-500 group-hover:text-white/80 transition-colors mb-6">Quotes,
                                updates, and quick thoughts.</p>
                            <span
                                className="mt-auto text-xs font-black uppercase tracking-widest text-slate-800 group-hover:text-white flex items-center gap-1">
                                Follow Us <ArrowRight size={14}/>
                            </span>
                        </div>
                    </a>
                </div>
            </section>

            {/* 3. PODCAST & AUDIO SECTION */}
            <section className="max-w-6xl mx-auto px-6 mt-20">
                <div
                    className="bg-amber-50 rounded-[3rem] p-8 md:p-16 border border-amber-100 flex flex-col lg:flex-row items-center gap-12">

                    <div className="lg:w-1/2 text-center lg:text-left">
                        <div
                            className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest mb-6">
                            <Radio size={14} className="animate-pulse"/> Audio Ministry
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif font-black text-brand-primary mb-4">Listen on the
                            Go</h2>
                        <p className="text-gray-600 leading-relaxed mb-8">
                            Whether you want to catch us live during service or revisit a profound message during your
                            commute, our audio streams are always available.
                        </p>
                    </div>

                    <div className="lg:w-1/2 w-full grid grid-cols-2 gap-4">
                        {/* Live Broadcast Option */}
                        <a href={settings?.mixlr_url || "#"} target="_blank" rel="noreferrer"
                           className="bg-white p-6 rounded-2xl flex flex-col items-center text-center hover:shadow-lg border border-transparent hover:border-amber-500 transition-all group relative overflow-hidden">
                            <div
                                className="absolute top-3 right-3 flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest animate-pulse border border-red-100">
                                Live
                            </div>
                            <Mic size={32} className="text-amber-500 mb-3 group-hover:scale-110 transition-transform"/>
                            <span className="font-bold text-brand-primary text-sm mb-1">Mixlr</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Live Broadcast</span>
                        </a>

                        {/* On-Demand Options */}
                        <a href={settings?.spotify_url || "#"} target="_blank" rel="noreferrer"
                           className="bg-white p-6 rounded-2xl flex flex-col items-center text-center hover:shadow-lg border border-transparent hover:border-[#1DB954] transition-all group">
                            <Headphones size={32}
                                        className="text-[#1DB954] mb-3 group-hover:scale-110 transition-transform"/>
                            <span className="font-bold text-brand-primary text-sm mb-1">Spotify</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Audio Archive</span>
                        </a>
                        <a href={settings?.apple_podcasts_url || "#"} target="_blank" rel="noreferrer"
                           className="bg-white p-6 rounded-2xl flex flex-col items-center text-center hover:shadow-lg border border-transparent hover:border-purple-600 transition-all group">
                            <Headphones size={32}
                                        className="text-purple-600 mb-3 group-hover:scale-110 transition-transform"/>
                            <span className="font-bold text-brand-primary text-sm mb-1">Apple Podcasts</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Audio Archive</span>
                        </a>
                        <a href={settings?.youtube_music_url || "#"} target="_blank" rel="noreferrer"
                           className="bg-white p-6 rounded-2xl flex flex-col items-center text-center hover:shadow-lg border border-transparent hover:border-red-600 transition-all group">
                            <PlayCircle size={32}
                                        className="text-red-600 mb-3 group-hover:scale-110 transition-transform"/>
                            <span className="font-bold text-brand-primary text-sm mb-1">YT Music</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Audio Archive</span>
                        </a>
                    </div>

                </div>
            </section>

        </div>
    );
}