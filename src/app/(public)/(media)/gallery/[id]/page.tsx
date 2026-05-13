"use client";
import React, {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import Link from "next/link";
import {supabase} from "@/lib/supabase";
import {
    ArrowLeft,
    Calendar,
    Camera,
    ChevronDown,
    ChevronUp,
    Film,
    Headphones,
    LinkIcon,
    Loader2,
    PlayCircle,
    Video,
    X
} from "lucide-react";

export default function GalleryDetailPage() {
    const {id} = useParams();
    const [gallery, setGallery] = useState<any>(null);
    const [mediaItems, setMediaItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedMedia, setSelectedMedia] = useState<any | null>(null);

    const [mediaFilter, setMediaFilter] = useState<"All" | "Photos" | "Videos">("All");

    // Toggle state for a Links/YouTube section
    const [showLinks, setShowLinks] = useState(false);

    useEffect(() => {
        async function fetchGallery() {
            setLoading(true);
            try {
                const {data, error} = await supabase
                    .from("media_gallery")
                    .select("*")
                    .eq("id", id)
                    .is("deleted_at", null)
                    .single();

                if (error) {
                    console.error("Error fetching gallery:", error.message);
                }

                if (data) {
                    setGallery(data);
                    const parsedMedia = typeof data.media_urls === 'string'
                        ? JSON.parse(data.media_urls)
                        : data.media_urls || [];
                    setMediaItems(parsedMedia);
                }
            } catch (error) {
                console.error("Error fetching gallery:", error);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchGallery().catch(console.error);
        }

    }, [id]);
    
    useEffect(() => {
        document.body.style.overflow = selectedMedia ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [selectedMedia]);


    const Facebook = ({size = 20, className = ""}) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg>
    );

    const Instagram = ({size = 20, className = ""}) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
    );

    const Twitter = ({size = 20, className = ""}) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path
                d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
        </svg>
    );

    const getBadge = (g: any) => {
        if (g.service_category === "Weekly") {
            if (g.weekly_type === "Sunday") return g.is_thanksgiving ? "Thanksgiving" : "Sunday Service";
            if (g.weekly_type === "Tuesday") return "Digging Deep";
            if (g.weekly_type === "Thursday") return "Faith Clinic";
            return g.weekly_type;
        }
        if (g.service_category === "Monthly") return g.special_service_name || "Monthly Service";
        return `Special Event`;
    };

    const getYouTubeId = (url: string) => {
        if (!url) return null;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|live\/|watch\?v=|watch\?.+&v=))([^"&?\/\s]{11})/i);
        return match ? match[1] : null;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-brand-primary">
                <Loader2 size={48} className="animate-spin mb-4"/>
                <p className="font-bold tracking-widest uppercase text-xs">Loading Album...</p>
            </div>
        );
    }

    if (!gallery) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-6">
                <Camera size={64} className="text-gray-300 mb-6"/>
                <h1 className="text-3xl font-serif font-black text-brand-primary mb-4">Album Not Found</h1>
                <p className="text-gray-500 mb-8">This gallery may have been removed or does not exist.</p>
                <Link href="/gallery"
                      className="bg-brand-primary text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition-colors">
                    Back to All Albums
                </Link>
            </div>
        );
    }

    const coverImage = mediaItems.find(m => m.type === 'image')?.url || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop";
    const youtubeId = getYouTubeId(gallery?.youtube_url);
    const hasExternalLinks = gallery.link_ig || gallery.link_facebook || gallery.link_twitter || gallery.link_spotify || gallery.link_apple || gallery.link_ytmusic;

    const filteredMediaItems = mediaItems.filter(item => {
        if (mediaFilter === "Photos") return item.type === "image";
        if (mediaFilter === "Videos") return item.type === "video";
        return true;
    });

    return (
        <div className="bg-slate-50 min-h-screen pb-24 relative">

            <div className="w-full max-w-6xl mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-4">
                <Link href="/gallery"
                      className="inline-flex items-center gap-2 text-brand-primary hover:text-amber-600 transition-colors text-xs font-bold uppercase tracking-widest bg-white py-2 px-4 rounded-full shadow-sm border border-gray-100">
                    <ArrowLeft size={14}/> Back to Gallery
                </Link>
            </div>

            <div className="w-full px-4 md:px-6 mb-8 md:mb-12">
                <div
                    className="max-w-6xl mx-auto relative h-[35vh] md:h-[45vh] lg:h-[50vh] bg-slate-900 rounded-[2rem] md:rounded-[3rem] flex flex-col justify-end pb-8 md:pb-12 px-6 md:px-12 overflow-hidden shadow-2xl">
                    <div className="absolute inset-0">
                        <img src={coverImage} alt={gallery.title}
                             className="w-full h-full object-cover opacity-40 blur-[4px] scale-105"/>
                        <div
                            className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                    </div>

                    <div className="relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex flex-col items-start max-w-4xl">
                            <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                                <span
                                    className={`text-[10px] md:text-xs px-3 md:px-4 py-1.5 rounded-full font-black uppercase tracking-widest shadow-md ${gallery.service_category === "Weekly" ? "bg-purple-500 text-white" : gallery.service_category === "Monthly" ? "bg-blue-500 text-white" : "bg-amber-500 text-white"}`}>
                                    {getBadge(gallery)}
                                </span>
                                {gallery.is_multi_day && gallery.day_identifier && (
                                    <span
                                        className="bg-white/20 backdrop-blur-md text-white border border-white/20 text-[10px] md:text-xs px-3 md:px-4 py-1.5 rounded-full font-black uppercase tracking-widest">
                                        {gallery.day_identifier}
                                    </span>
                                )}
                                <span
                                    className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 text-white text-[10px] md:text-xs font-bold">
                                    <Calendar size={14}
                                              className="text-amber-400"/> {new Date(gallery.service_date).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-black text-white leading-tight drop-shadow-lg">{gallery.title}</h1>
                        </div>

                        <div
                            className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-white/20 flex items-center justify-center gap-4 shrink-0">
                            <button onClick={() => setMediaFilter("Photos")}
                                    className="text-center text-white hover:text-amber-400 transition-colors cursor-pointer group">
                                <span
                                    className="block text-2xl font-black leading-none group-hover:scale-110 transition-transform">{mediaItems.filter(m => m.type === 'image').length}</span>
                                <span
                                    className="text-[9px] uppercase tracking-widest font-bold text-slate-300">Photos</span>
                            </button>
                            <div className="w-[1px] h-8 bg-white/20"></div>
                            <button onClick={() => setMediaFilter("Videos")}
                                    className="text-center text-white hover:text-amber-400 transition-colors cursor-pointer group">
                                <span
                                    className="block text-2xl font-black leading-none group-hover:scale-110 transition-transform">{mediaItems.filter(m => m.type === 'video').length}</span>
                                <span
                                    className="text-[9px] uppercase tracking-widest font-bold text-slate-300">Videos</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* FIX 2: DROPDOWN FOR YOUTUBE & LINKS */}
            {(youtubeId || hasExternalLinks) && (
                <div className="max-w-6xl mx-auto px-4 md:px-6 mb-10 md:mb-12">

                    {/* The Clickable Accordion Header */}
                    <button
                        onClick={() => setShowLinks(!showLinks)}
                        className="w-full bg-white border border-gray-200 rounded-2xl p-4 md:p-5 flex justify-between items-center text-brand-primary font-bold shadow-sm hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <LinkIcon size={18} className="text-amber-500"/>
                            <span className="text-sm md:text-base">View Related Audio, Video & Social Links</span>
                        </div>
                        {showLinks ? <ChevronUp size={20} className="text-gray-400"/> :
                            <ChevronDown size={20} className="text-gray-400"/>}
                    </button>

                    {/* The Hidden Content */}
                    {showLinks && (
                        <div
                            className="mt-4 flex flex-col-reverse lg:flex-row gap-6 md:gap-8 animate-in fade-in slide-in-from-top-2">

                            {/* External Links */}
                            {hasExternalLinks && (
                                <div
                                    className={youtubeId ? 'w-full lg:w-1/3 flex flex-col gap-6' : 'w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-6'}>

                                    {(gallery.link_spotify || gallery.link_apple || gallery.link_ytmusic) && (
                                        <div
                                            className="bg-white p-6 rounded-3xl md:rounded-[2rem] border border-gray-100 shadow-sm flex-1">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-3">Listen
                                                to Audio</h4>
                                            <div className="flex flex-col gap-3">
                                                {gallery.link_spotify && (
                                                    <a href={gallery.link_spotify} target="_blank" rel="noreferrer"
                                                       className="flex items-center justify-center gap-3 bg-[#1DB954]/10 text-[#1DB954] hover:bg-[#1DB954] hover:text-white px-4 py-3 rounded-xl font-bold transition-all text-sm group">
                                                        <Headphones size={18}
                                                                    className="group-hover:scale-110 transition-transform"/> Spotify
                                                    </a>
                                                )}
                                                {gallery.link_apple && (
                                                    <a href={gallery.link_apple} target="_blank" rel="noreferrer"
                                                       className="flex items-center justify-center gap-3 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white px-4 py-3 rounded-xl font-bold transition-all text-sm group">
                                                        <Headphones size={18}
                                                                    className="group-hover:scale-110 transition-transform"/> Apple
                                                        Podcasts
                                                    </a>
                                                )}
                                                {gallery.link_ytmusic && (
                                                    <a href={gallery.link_ytmusic} target="_blank" rel="noreferrer"
                                                       className="flex items-center justify-center gap-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-3 rounded-xl font-bold transition-all text-sm group">
                                                        <PlayCircle size={18}
                                                                    className="group-hover:scale-110 transition-transform"/> YouTube
                                                        Music
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {(gallery.link_ig || gallery.link_twitter || gallery.link_facebook) && (
                                        <div
                                            className="bg-white p-6 rounded-3xl md:rounded-[2rem] border border-gray-100 shadow-sm flex-1">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-3">View
                                                Social Posts</h4>
                                            <div className="flex flex-wrap gap-2 md:gap-3">
                                                {gallery.link_ig && (
                                                    <a href={gallery.link_ig} target="_blank" rel="noreferrer"
                                                       className="flex-1 min-w-[100px] flex items-center justify-center bg-pink-50 text-pink-600 hover:bg-pink-600 hover:text-white py-3 rounded-xl font-bold transition-colors text-xs">
                                                        <Instagram size={16} className="mr-1.5"/> Instagram
                                                    </a>
                                                )}
                                                {gallery.link_facebook && (
                                                    <a href={gallery.link_facebook} target="_blank" rel="noreferrer"
                                                       className="flex-1 min-w-[100px] flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white py-3 rounded-xl font-bold transition-colors text-xs">
                                                        <Facebook size={16} className="mr-1.5"/> Facebook
                                                    </a>
                                                )}
                                                {gallery.link_twitter && (
                                                    <a href={gallery.link_twitter} target="_blank" rel="noreferrer"
                                                       className="flex-1 min-w-[100px] flex items-center justify-center bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white py-3 rounded-xl font-bold transition-colors text-xs">
                                                        <Twitter size={16} className="mr-1.5"/> Twitter
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* YouTube Player */}
                            {youtubeId && (
                                <div className={hasExternalLinks ? 'w-full lg:w-2/3' : 'w-full max-w-4xl mx-auto'}>
                                    <div
                                        className="bg-white p-4 md:p-6 rounded-3xl md:rounded-[2rem] border border-gray-100 shadow-sm h-full flex flex-col">
                                        <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-brand-primary mb-4 flex items-center gap-2">
                                            <Video size={14} className="text-amber-500"/> Watch Full Event / Service
                                        </h4>
                                        <div
                                            className="w-full h-full min-h-[250px] bg-black rounded-2xl overflow-hidden relative group flex-1">
                                            <iframe
                                                src={`https://www.youtube.com/embed/${youtubeId}?rel=0&controls=0&modestbranding=1&iv_load_policy=3&disablekb=1`}
                                                title="YouTube video player"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="absolute inset-0 w-full h-full z-10"
                                            ></iframe>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 md:px-6">
                {mediaItems.length > 0 && (
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-8">
                        <h3 className="text-xl md:text-2xl font-serif font-black text-brand-primary">Event Media</h3>
                        <div className="flex bg-white rounded-full p-1 border border-gray-200 shadow-sm">
                            {(["All", "Photos", "Videos"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setMediaFilter(tab)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        mediaFilter === tab
                                            ? "bg-brand-primary text-white shadow-md"
                                            : "text-gray-500 hover:text-brand-primary hover:bg-gray-50"
                                    }`}
                                >
                                    {tab === "Photos" && <Camera size={12}/>}
                                    {tab === "Videos" && <Film size={12}/>}
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {filteredMediaItems.length > 0 ? (
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6">
                        {filteredMediaItems.map((item, idx) => (
                            <div key={idx}
                                 className="break-inside-avoid relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white border border-gray-100">
                                {item.type === 'image' ? (
                                    <div className="cursor-pointer relative w-full h-full"
                                         onClick={() => setSelectedMedia(item)}>
                                        <img src={item.url} alt={item.caption || "Gallery Image"}
                                             className="w-full h-auto object-cover block group-hover:scale-105 transition-transform duration-700"
                                             loading="lazy"/>
                                        <div
                                            className="absolute inset-0 bg-brand-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                                            <Camera size={32}
                                                    className="text-white scale-50 group-hover:scale-100 transition-transform duration-300"/>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative w-full h-full bg-slate-900 group/video">
                                        <video src={item.url} controls preload="metadata"
                                               className="w-full h-auto block"/>
                                    </div>
                                )}
                                {item.caption && <div className="p-4 bg-white border-t border-gray-100"><p
                                    className="text-sm text-gray-700 font-medium">{item.caption}</p></div>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                        <Camera size={48} className="mx-auto text-gray-300 mb-4"/>
                        <h3 className="text-xl font-bold text-brand-primary mb-2">No media found</h3>
                        <p className="text-gray-500">There are no {mediaFilter.toLowerCase()} in this album.</p>
                        <button onClick={() => setMediaFilter("All")}
                                className="mt-4 text-amber-600 font-bold hover:underline">View All Media
                        </button>
                    </div>
                )}
            </div>

            {selectedMedia && selectedMedia.type === 'image' && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200"
                    onClick={() => setSelectedMedia(null)}>
                    <button
                        className="absolute top-6 right-6 md:top-8 md:right-8 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMedia(null);
                        }}><X size={32}/></button>
                    <div className="relative max-w-5xl max-h-[90vh] w-full px-4 flex flex-col items-center"
                         onClick={(e) => e.stopPropagation()}>
                        <img src={selectedMedia.url} alt={selectedMedia.caption || "Full screen image"}
                             className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"/>
                        {selectedMedia.caption && <div
                            className="mt-6 text-center text-white/90 text-sm md:text-base font-medium max-w-2xl px-4">{selectedMedia.caption}</div>}
                    </div>
                </div>
            )}

        </div>
    );
}