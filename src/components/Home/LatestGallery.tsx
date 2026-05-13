"use client";
import React, {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";
import Link from "next/link";

export default function LatestGallery() {
    const [images, setImages] = useState<string[]>([]);
    const [galleryId, setGalleryId] = useState<string>("");

    useEffect(() => {
        async function fetchLatestGallery() {
            const {data} = await supabase
                .from("media_gallery")
                .select("id, media_urls")
                .eq("status", "published")
                .eq("is_archived", false)
                .is("deleted_at", null)
                .order("service_date", {ascending: false})
                .limit(1);

            if (data && data.length > 0) {
                setGalleryId(data[0].id);
                // Parse the media array securely
                const parsedMedia = typeof data[0].media_urls === 'string'
                    ? JSON.parse(data[0].media_urls)
                    : data[0].media_urls || [];

                // Extract only images for the collage (up to 6)
                const extractedImages = parsedMedia
                    .filter((m: any) => m.type === 'image')
                    .map((m: any) => m.url)
                    .slice(0, 6);

                setImages(extractedImages);
            }
        }

        fetchLatestGallery().catch(console.error);
    }, []);

    // Fallback images in case the gallery doesn't have enough photos yet
    const displayImages = [
        images[0] || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=800&auto=format&fit=crop",
        images[1] || "https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?q=80&w=800&auto=format&fit=crop",
        images[2] || "https://images.unsplash.com/photo-1478147424044-f252df6e8557?q=80&w=800&auto=format&fit=crop",
        images[3] || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
        images[4] || "https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=800&auto=format&fit=crop",
        images[5] || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=800&auto=format&fit=crop"
    ];

    return (
        <Link href={galleryId ? `/gallery/${galleryId}` : `/gallery`}
              className="grid grid-cols-2 md:grid-cols-3 gap-4 group cursor-pointer">
            {/* Column 1 */}
            <div className="flex flex-col gap-4 translate-y-8">
                <div className="bg-slate-200 rounded-3xl h-48 w-full shadow-sm overflow-hidden">
                    <img src={displayImages[0]} alt="Gallery"
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                </div>
                <div className="bg-slate-200 rounded-3xl h-64 w-full shadow-sm overflow-hidden">
                    <img src={displayImages[1]} alt="Gallery"
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                </div>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-4">
                <div className="bg-slate-200 rounded-3xl h-64 w-full shadow-sm overflow-hidden relative">
                    <img src={displayImages[2]} alt="Gallery"
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                    <div
                        className="absolute inset-0 bg-brand-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span
                            className="text-white font-bold text-xs uppercase tracking-widest border border-white px-4 py-2 rounded-full backdrop-blur-sm">Open Album</span>
                    </div>
                </div>
                <div className="bg-slate-200 rounded-3xl h-48 w-full shadow-sm overflow-hidden">
                    <img src={displayImages[3]} alt="Gallery"
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                </div>
            </div>

            {/* Column 3 (Hidden on mobile) */}
            <div className="hidden md:flex flex-col gap-4 translate-y-12">
                <div className="bg-slate-200 rounded-3xl h-40 w-full shadow-sm overflow-hidden">
                    <img src={displayImages[4]} alt="Gallery"
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                </div>
                <div className="bg-slate-200 rounded-3xl h-72 w-full shadow-sm overflow-hidden">
                    <img src={displayImages[5]} alt="Gallery"
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                </div>
            </div>
        </Link>
    );
}