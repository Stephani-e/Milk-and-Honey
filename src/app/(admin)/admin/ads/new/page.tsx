"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";
import { ArrowLeft, Megaphone, Target, Image as ImageIcon, CalendarClock, Link as LinkIcon, Film } from "lucide-react";
import { useAuth } from "@/components/Admin/Admin Guard";

const DRAFT_STORAGE_KEY = "milk_and_honey_ad_draft";

export default function NewAdPage() {
    const router = useRouter();
    const { role } = useAuth();

    const [loading, setLoading] = useState(false);
    const [submitType, setSubmitType] = useState<'active' | 'inactive'>('active');

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
    const [fallbackImageUrl, setFallbackImageUrl] = useState("");

    // 4. Placement & Expiry
    const [placement, setPlacement] = useState("homepage");
    const [expiryDate, setExpiryDate] = useState("");
    const [expiryTime, setExpiryTime] = useState("23:59");

    useEffect(() => {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                if (parsed.title) setTitle(parsed.title);
                if (parsed.description) setDescription(parsed.description);
                if (parsed.adType) setAdType(parsed.adType);
                if (parsed.targetLink) setTargetLink(parsed.targetLink);
                if (parsed.buttonText) setButtonText(parsed.buttonText);
                if (parsed.mediaType) setMediaType(parsed.mediaType);
                if (parsed.mediaUrl) setMediaUrl(parsed.mediaUrl);
                if (parsed.fallbackImageUrl) setFallbackImageUrl(parsed.fallbackImageUrl);
                if (parsed.placement) setPlacement(parsed.placement);
                if (parsed.expiryDate) setExpiryDate(parsed.expiryDate);
                if (parsed.expiryTime) setExpiryTime(parsed.expiryTime);
                toast.info("Draft restored!");
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        }
    }, []);

    useEffect(() => {
        const draft = {
            title, description, adType, targetLink, buttonText,
            mediaType, mediaUrl, fallbackImageUrl, placement, expiryDate, expiryTime
        };
        if (title.trim().length > 0 || mediaUrl) {
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        }
    }, [title, description, adType, targetLink, buttonText, mediaType, mediaUrl, fallbackImageUrl, placement, expiryDate, expiryTime]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!mediaUrl) {
            toast.error("Please upload the main creative for this ad.");
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
            fallback_image_url: mediaType === 'video' ? fallbackImageUrl : null,
            target_link: targetLink,
            button_text: buttonText,
            placement,
            status: submitType,
            expires_at: finalExpiry
        };

        const { error } = await supabase.from("advertisements").insert(payload);

        if (error) {
            toast.error("Error creating campaign: " + error.message);
            setLoading(false);
        } else {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            toast.success(submitType === 'active' ? "Campaign is now LIVE!" : "Campaign saved to Paused.");
            router.push("/ads");
            router.refresh();
        }
    };

    if (role === 'viewer') return null;

    return (
        <div className="min-h-screen bg-brand-surface p-4 md:p-12 font-sans">
            <div className="max-w-4xl mx-auto">
                <Link href="/ads" className="text-sm font-bold text-brand-secondary mb-6 flex items-center gap-2 hover:underline w-fit">
                    <ArrowLeft size={16} /> Back to Campaigns
                </Link>

                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-brand-accent">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <Megaphone className="text-pink-600" size={24} />
                            <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary">
                                Create New Campaign
                            </h1>
                        </div>
                        {(title || mediaUrl) && (
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                Draft Saved
                            </span>
                        )}
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
                                    <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Youth Convention 2026" className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl text-brand-primary font-bold focus:ring-2 focus:ring-pink-500 outline-none" />
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
                                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="A brief hook to make people want to click..." rows={2} className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl text-brand-primary focus:ring-2 focus:ring-pink-500 outline-none" />
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
                                <button type="button" onClick={() => { setMediaType('image'); setMediaUrl(""); setFallbackImageUrl(""); }} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mediaType === 'image' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Image Ad</button>
                                <button type="button" onClick={() => { setMediaType('video'); setMediaUrl(""); }} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mediaType === 'video' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Video Ad</button>
                            </div>

                            {/* CHANGED: Vertical stack instead of 2-column grid */}
                            <div className="flex flex-col gap-6">
                                {/* MAIN CREATIVE */}
                                <div className="flex flex-col sm:flex-row gap-6 items-start">
                                    <div className="w-full sm:w-64 aspect-video bg-slate-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {mediaUrl ? (
                                            mediaType === 'image' ? (
                                                <img src={mediaUrl} alt="Ad Creative" className="w-full h-full object-cover" />
                                            ) : (
                                                <video src={`${mediaUrl}#t=0.1`} className="w-full h-full object-cover" controls preload="metadata" />
                                            )
                                        ) : (
                                            <div className="text-gray-300 flex flex-col items-center">
                                                {mediaType === 'image' ? <ImageIcon size={32} className="mb-2"/> : <Film size={32} className="mb-2"/>}
                                                <span className="text-[10px] font-bold uppercase">{mediaType}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 w-full space-y-4">
                                        <p className="text-sm text-gray-500">Upload the main {mediaType} for this campaign.</p>
                                        {!mediaUrl ? (
                                            <UploadButton
                                                endpoint={mediaType === 'image' ? "imageUploader" : "videoUploader"}
                                                appearance={{ button: "bg-pink-600 text-white text-xs px-6 py-4 rounded-xl after:bg-pink-700 w-full sm:w-auto" }}
                                                onClientUploadComplete={(res) => { setMediaUrl(res[0].url); toast.success("Creative uploaded!"); }}
                                                onUploadError={(error) => { toast.error(`Upload Failed: ${error.message}`); }}
                                            />
                                        ) : (
                                            <button type="button" onClick={() => setMediaUrl("")} className="bg-red-50 text-red-600 px-6 py-3 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors w-full sm:w-auto">Remove {mediaType === 'image' ? 'Image' : 'Video'}</button>
                                        )}
                                    </div>
                                </div>

                                {/* OPTIONAL FALLBACK IMAGE */}
                                {mediaType === 'video' && (
                                    <div className="flex flex-col sm:flex-row gap-6 items-start p-6 border border-pink-100 bg-pink-50/50 rounded-3xl animate-in fade-in">
                                        <div className="w-full sm:w-64 aspect-video bg-white border border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {fallbackImageUrl ? (
                                                <img src={fallbackImageUrl} alt="Fallback" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-gray-300 flex flex-col items-center"><ImageIcon size={24} className="mb-2"/><span className="text-[10px] font-bold uppercase text-center leading-tight">Auto<br/>Thumbnail</span></div>
                                            )}
                                        </div>
                                        <div className="flex-1 w-full space-y-4">
                                            <p className="text-sm text-gray-700 font-bold">Fallback Poster (Optional)</p>
                                            <p className="text-xs text-gray-500 leading-relaxed">If left blank, the browser will automatically use the first frame of the video.</p>
                                            {!fallbackImageUrl ? (
                                                <UploadButton
                                                    endpoint="imageUploader"
                                                    appearance={{ button: "bg-slate-800 text-white text-xs px-6 py-3 rounded-xl w-full sm:w-auto" }}
                                                    onClientUploadComplete={(res) => { setFallbackImageUrl(res[0].url); toast.success("Fallback image uploaded!"); }}
                                                    onUploadError={(error) => { toast.error(`Upload Failed: ${error.message}`); }}
                                                />
                                            ) : (
                                                <button type="button" onClick={() => setFallbackImageUrl("")} className="bg-red-50 text-red-600 px-6 py-3 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors w-full sm:w-auto">Remove Poster</button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 4. PLACEMENT & EXPIRY */}
                        <div className="space-y-6 p-6 md:p-8 bg-slate-50 border border-gray-100 rounded-3xl">
                            <h3 className="text-xs font-bold text-pink-600 uppercase tracking-widest flex items-center gap-2">
                                <CalendarClock size={16}/> 4. Delivery Rules
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Site Placement *</label>
                                    <select required value={placement} onChange={e => setPlacement(e.target.value)} className="w-full p-4 border rounded-xl bg-white focus:ring-2 focus:ring-pink-500 outline-none font-bold text-brand-primary">
                                        <option value="homepage">Homepage Banner</option>
                                        <option value="sidebar">Global Sidebar</option>
                                        <option value="global">Everywhere (Global)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Auto-Expire Date (Optional)</label>
                                    <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full p-4 border rounded-xl bg-white focus:ring-2 focus:ring-pink-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Auto-Expire Time</label>
                                    <input type="time" disabled={!expiryDate} value={expiryTime} onChange={e => setExpiryTime(e.target.value)} className={`w-full p-4 border rounded-xl outline-none ${!expiryDate ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'bg-white focus:ring-2 focus:ring-pink-500'}`} />
                                </div>
                            </div>
                        </div>

                        {/* SUBMIT BUTTONS */}
                        <div className="pt-8 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                onClick={() => setSubmitType('inactive')}
                                className="w-full sm:w-auto px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Save to Paused
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                onClick={() => setSubmitType('active')}
                                className="w-full sm:w-auto px-10 py-4 bg-pink-600 text-white rounded-2xl font-bold shadow-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? "Publishing..." : "Publish Live Campaign"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}