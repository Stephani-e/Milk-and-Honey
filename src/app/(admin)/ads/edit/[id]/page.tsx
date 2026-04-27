"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";
import { ArrowLeft, Megaphone, Target, Image as ImageIcon, CalendarClock, Link as LinkIcon } from "lucide-react";
import { useAuth } from "@/components/Admin/Admin Guard";

export default function EditAdPage() {
    const router = useRouter();
    const { id } = useParams();
    const { role } = useAuth();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // 1. Core Details
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [adType, setAdType] = useState("church_event");

    // 2. Action & Link
    const [targetLink, setTargetLink] = useState("");
    const [buttonText, setButtonText] = useState("Learn More");

    // 3. Media
    const [mediaType, setMediaType] = useState<"image" | "video">("image");
    const [mediaUrl, setMediaUrl] = useState("");
    const [fallbackImageUrl, setFallbackImageUrl] = useState(""); // NEW: Fallback State

    // 4. Placement, Expiry, & Status
    const [placement, setPlacement] = useState("homepage");
    const [expiryDate, setExpiryDate] = useState("");
    const [expiryTime, setExpiryTime] = useState("23:59");
    const [status, setStatus] = useState("active");

    useEffect(() => {
        async function loadAdData() {
            const { data, error } = await supabase
                .from("advertisements")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !data) {
                toast.error("Failed to load campaign data.");
                router.push("/ads");
                return;
            }

            setTitle(data.title || "");
            setDescription(data.description || "");
            setAdType(data.ad_type || "church_event");
            setTargetLink(data.target_link || "");
            setButtonText(data.button_text || "Learn More");
            setMediaType(data.media_type || "image");
            setMediaUrl(data.media_url || "");
            setPlacement(data.placement || "homepage");
            setStatus(data.status || "active");
            setFallbackImageUrl(data.fallback_image_url || "")

            // Parse the ISO string back into separate Date and Time inputs
            if (data.expires_at) {
                const dateObj = new Date(data.expires_at);
                setExpiryDate(dateObj.toISOString().split('T')[0]);
                setExpiryTime(dateObj.toTimeString().slice(0, 5));
            }

            setFetching(false);
        }

        if (id) loadAdData();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!mediaUrl) {
            toast.error("Please upload an image or video for this ad.");
            return;
        }

        setLoading(true);

        let finalExpiry = null;
        if (expiryDate) {
            finalExpiry = new Date(`${expiryDate}T${expiryTime}`).toISOString();
        }

        const payload = {
            title,
            description,
            ad_type: adType,
            media_type: mediaType,
            media_url: mediaUrl,
            target_link: targetLink,
            button_text: buttonText,
            placement,
            status: status, // Updating the existing status
            expires_at: finalExpiry,
            fallback_image_url: mediaType === 'video' ? fallbackImageUrl : null,
        };

        const { error } = await supabase
            .from("advertisements")
            .update(payload)
            .eq("id", id);

        if (error) {
            toast.error("Error updating campaign: " + error.message);
            setLoading(false);
        } else {
            toast.success("Campaign updated successfully!");
            router.push("/ads");
            router.refresh();
        }
    };

    if (role === 'viewer') return null;

    if (fetching) {
        return <div className="p-20 text-center font-bold text-brand-primary min-h-screen bg-brand-surface">Loading Campaign Data...</div>;
    }

    return (
        <div className="min-h-screen bg-brand-surface p-4 md:p-12 font-sans">
            <div className="max-w-4xl mx-auto">
                <Link href="/ads" className="text-sm font-bold text-brand-secondary mb-6 flex items-center gap-2 hover:underline w-fit">
                    <ArrowLeft size={16} /> Back to Campaigns
                </Link>

                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-brand-accent">
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                        <Megaphone className="text-pink-600" size={24} />
                        <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary">
                            Edit Campaign
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">

                        {/* 1. CORE DETAILS */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-pink-600 uppercase tracking-widest flex items-center gap-2">
                                <Target size={16}/> 1. Campaign Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Campaign Title *</label>
                                    <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl text-brand-primary font-bold focus:ring-2 focus:ring-pink-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Advertisement Type *</label>
                                    <select required value={adType} onChange={e => setAdType(e.target.value)} className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl text-brand-primary font-bold focus:ring-2 focus:ring-pink-500 outline-none">
                                        <option value="church_event">Internal Church Event</option>
                                        {role === 'super-admin' && (
                                            <option value="external_business">External Business / Sponsor</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Short Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl text-brand-primary focus:ring-2 focus:ring-pink-500 outline-none" />
                            </div>
                        </div>

                        {/* 2. CALL TO ACTION */}
                        <div className="space-y-6 p-6 bg-pink-50/50 border border-pink-100 rounded-3xl">
                            <h3 className="text-xs font-bold text-pink-600 uppercase tracking-widest flex items-center gap-2">
                                <LinkIcon size={16}/> 2. Call to Action (Optional)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Target URL</label>
                                    <input type="url" value={targetLink} onChange={e => setTargetLink(e.target.value)} placeholder="https://..." className="w-full p-4 bg-white border border-gray-200 rounded-xl text-brand-primary focus:ring-2 focus:ring-pink-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Button Text</label>
                                    <input value={buttonText} onChange={e => setButtonText(e.target.value)} placeholder="e.g. Register Now" className="w-full p-4 bg-white border border-gray-200 rounded-xl text-brand-primary font-bold focus:ring-2 focus:ring-pink-500 outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* 3. MEDIA UPLOAD */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-pink-600 uppercase tracking-widest flex items-center gap-2">
                                <ImageIcon size={16}/> 3. Campaign Creative
                            </h3>

                            <div className="flex gap-4 mb-4">
                                <button type="button" onClick={() => { setMediaType('image'); setMediaUrl(""); }} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mediaType === 'image' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Image Ad</button>
                                <button type="button" onClick={() => { setMediaType('video'); setMediaUrl(""); }} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mediaType === 'video' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Video Ad</button>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 items-start">
                                <div className="w-full sm:w-64 aspect-video bg-slate-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
                                    {mediaUrl ? (
                                        mediaType === 'image' ? (
                                            <img src={mediaUrl} alt="Ad Creative" className="w-full h-full object-cover" />
                                        ) : (
                                            <video src={mediaUrl} className="w-full h-full object-cover" autoPlay muted loop />
                                        )
                                    ) : (
                                        <div className="text-gray-300 flex flex-col items-center">
                                            <ImageIcon size={32} className="mb-2"/>
                                            <span className="text-[10px] font-bold uppercase">No Media</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 w-full space-y-4">
                                    <p className="text-sm text-gray-500">Upload the graphic or short video for this campaign.</p>
                                    {!mediaUrl ? (
                                        <UploadButton
                                            endpoint={mediaType === 'image' ? "imageUploader" : "videoUploader"}
                                            appearance={{ button: "bg-pink-600 text-white text-xs px-6 py-4 rounded-xl after:bg-pink-700 w-full sm:w-auto" }}
                                            onClientUploadComplete={(res) => { setMediaUrl(res[0].url); toast.success("Creative uploaded!"); }}
                                            onUploadError={(error) => { toast.error(`Upload Failed: ${error.message}`); }}
                                        />
                                    ) : (
                                        <button type="button" onClick={() => setMediaUrl("")} className="bg-red-50 text-red-600 px-6 py-3 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">Remove Creative</button>
                                    )}
                                </div>
                            </div>

                            {/* OPTIONAL FALLBACK IMAGE (Only shows if Video is selected) */}
                            {mediaType === 'video' && (
                                <div className="flex flex-col sm:flex-row gap-4 p-4 border border-pink-100 bg-pink-50/30 rounded-2xl animate-in fade-in">
                                    <div className="w-full sm:w-32 aspect-video bg-white border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {fallbackImageUrl ? (
                                            <img src={fallbackImageUrl} alt="Fallback" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-gray-300 flex flex-col items-center"><ImageIcon size={20} className="mb-1"/><span className="text-[8px] font-bold uppercase text-center leading-tight">Auto<br/>Thumbnail</span></div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <p className="text-xs text-gray-600 font-bold">Fallback Poster (Optional)</p>
                                        <p className="text-[10px] text-gray-500 leading-relaxed">If left blank, the browser will automatically use the first frame of the video.</p>
                                        {!fallbackImageUrl ? (
                                            <UploadButton
                                                endpoint="imageUploader"
                                                appearance={{ button: "bg-slate-800 text-white text-[10px] px-4 py-2 rounded-lg w-full sm:w-auto" }}
                                                onClientUploadComplete={(res) => { setFallbackImageUrl(res[0].url); toast.success("Fallback image uploaded!"); }}
                                                onUploadError={(error) => { toast.error(`Upload Failed: ${error.message}`); }}
                                            />
                                        ) : (
                                            <button type="button" onClick={() => setFallbackImageUrl("")} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-colors w-full sm:w-auto">Remove Poster</button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. PLACEMENT, EXPIRY & STATUS */}
                        <div className="space-y-6 p-6 md:p-8 bg-slate-50 border border-gray-100 rounded-3xl">
                            <h3 className="text-xs font-bold text-pink-600 uppercase tracking-widest flex items-center gap-2">
                                <CalendarClock size={16}/> 4. Delivery Rules
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Campaign Status</label>
                                    <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-4 border rounded-xl bg-white focus:ring-2 focus:ring-pink-500 outline-none font-bold text-brand-primary">
                                        <option value="active">🟢 Active (Live)</option>
                                        <option value="inactive">🟠 Paused</option>
                                        <option value="archived">⚫ Archived</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Site Placement</label>
                                    <select required value={placement} onChange={e => setPlacement(e.target.value)} className="w-full p-4 border rounded-xl bg-white focus:ring-2 focus:ring-pink-500 outline-none font-bold text-brand-primary">
                                        <option value="homepage">Homepage Banner</option>
                                        <option value="sidebar">Global Sidebar</option>
                                        <option value="global">Everywhere (Global)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Auto-Expire Date</label>
                                    <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full p-4 border rounded-xl bg-white focus:ring-2 focus:ring-pink-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Auto-Expire Time</label>
                                    <input type="time" disabled={!expiryDate} value={expiryTime} onChange={e => setExpiryTime(e.target.value)} className={`w-full p-4 border rounded-xl outline-none ${!expiryDate ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'bg-white focus:ring-2 focus:ring-pink-500'}`} />
                                </div>
                            </div>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <div className="pt-8 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto px-10 py-5 bg-brand-primary text-white rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                                {loading ? "Saving Changes..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}