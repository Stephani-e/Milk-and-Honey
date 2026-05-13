"use client";
import React, {useEffect, useState} from "react";
import Link from "next/link";
import {ArrowRight, Film, PlayCircle, User} from "lucide-react";
import {supabase} from "@/lib/supabase";
import SkeletonLoader from "@/components/UI/SkeletonLoader";

export default function LatestSermon() {
    const [loading, setLoading] = useState(true);
    const [latestSermon, setLatestSermon] = useState<any>(null);

    useEffect(() => {
        async function fetchLatestSermon() {
            setLoading(true);
            const {data} = await supabase
                .from("sermons")
                .select("id, title, preacher, banner_url, youtube_url, clip_url")
                .eq("status", "published")
                .eq("is_archived", false)
                .is("deleted_at", null)
                .order("service_date", {ascending: false})
                .limit(1);

            if (data && data.length > 0) {
                setLatestSermon(data[0]);
            }

            setLoading(false);
        }

        fetchLatestSermon().catch(console.error);
    }, []);

    const getThumbnail = (sermon: any) => {
        if (!sermon) return "";
        if (sermon.banner_url) return sermon.banner_url;
        if (sermon.youtube_url) {
            const videoIdMatch = sermon.youtube_url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=))([^"&?\/\s]{11})/i);
            if (videoIdMatch && videoIdMatch[1]) return `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
        }
        return "https://hegyctrfwn.ufs.sh/f/iMcVGeeTb1N4go9KLrcAQBW5E03lrCpOqKzJIRZUnG9sLDHa";
    };

    if (loading) {
        return (
            <div className="w-full h-full min-h-[250px]">
                <SkeletonLoader variant="sermon-card"/>
            </div>
        );
    }

    if (!latestSermon) {
        return (
            <div
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[250px]">
                <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
                    <PlayCircle size={20}/>
                </div>
                <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Latest Sermon</span>
                    <h3 className="font-serif font-bold text-gray-400 text-xl mb-2">Check back soon</h3>
                    <p className="text-xs text-gray-400">No sermons have been uploaded yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[250px] overflow-hidden group">
            <div className="absolute inset-0 z-0">
                <img src={getThumbnail(latestSermon)} alt={latestSermon.title}
                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                <div
                    className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40"></div>
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                {latestSermon.clip_url ? (
                    <div className="mb-4 rounded-xl overflow-hidden shadow-2xl border border-white/20 bg-black">
                        <video src={latestSermon.clip_url} controls className="w-full h-32 md:h-40 object-cover"
                               poster={getThumbnail(latestSermon)}/>
                    </div>
                ) : (
                    <div
                        className="w-10 h-10 bg-amber-500/20 backdrop-blur-md text-amber-400 rounded-full flex items-center justify-center mb-4 border border-amber-500/30">
                        <PlayCircle size={20}/>
                    </div>
                )}

                <div>
                    <span
                        className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1 mb-2 drop-shadow-md">
                        {latestSermon.clip_url ? <Film size={12}/> : null} Latest Message
                    </span>
                    <h3 className="font-serif font-bold text-white text-xl mb-3 line-clamp-2 drop-shadow-md">
                        {latestSermon.title}
                    </h3>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/10">
                        <p className="text-xs text-gray-300 flex items-center gap-1.5 font-medium drop-shadow-md truncate pr-2">
                            <User size={12} className="shrink-0"/> {latestSermon.preacher}
                        </p>
                        <Link href={`/sermons/${latestSermon.id}`}
                              className="text-[10px] font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-black/30 px-4 py-2 rounded-full backdrop-blur-md transition-colors border border-white/10 shrink-0">
                            Full Sermon <ArrowRight size={12}/>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}