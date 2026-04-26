"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";
import { X, Type, Film } from "lucide-react";

interface MediaItem {
    url: string;
    key: string;
    type: "image" | "video";
    caption: string;
}

export default function NewGalleryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [initialFetchDone, setInitialFetchDone] = useState(false);

    // Branching Logic State
    const [category, setCategory] = useState<"Weekly" | "Special" | "">("");
    const [weeklyType, setWeeklyType] = useState<"Sunday" | "Tuesday" | "Thursday" | "">("");
    const [isThanksgiving, setIsThanksgiving] = useState(false);
    const [isMultiDay, setIsMultiDay] = useState(false);

    // Suggestions
    const [savedCoHosts, setSavedCoHosts] = useState<string[]>([]);
    const [savedSpecialNames, setSavedSpecialNames] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        service_date: new Date().toISOString().split('T')[0],
        host: "General/Last Sunday",
        service_number: "First Service",
        co_host: "",
        special_service_name: "",
        day_identifier: "",
    });

    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

    // 1. AUTO-SAVE: Load Draft on Mount
    useEffect(() => {
        const savedDraft = localStorage.getItem("gallery_draft");
        if (savedDraft) {
            const draft = JSON.parse(savedDraft);
            setFormData(draft.formData);
            setCategory(draft.category);
            setWeeklyType(draft.weeklyType);
            setIsThanksgiving(draft.isThanksgiving || false);
            setIsMultiDay(draft.isMultiDay || false);
            setMediaItems(draft.mediaItems || []);
        }
        setInitialFetchDone(true);
    }, []);

    // 2. AUTO-SAVE: Save Draft on Change
    useEffect(() => {
        if (initialFetchDone) {
            const draft = { formData, category, weeklyType, isThanksgiving, isMultiDay, mediaItems };
            localStorage.setItem("gallery_draft", JSON.stringify(draft));
        }
    }, [formData, category, weeklyType, isThanksgiving, isMultiDay, mediaItems, initialFetchDone]);

    // Load suggestions on mount
    useEffect(() => {
        async function getSuggestions() {
            const { data } = await supabase.from("media_gallery").select("co_host, special_service_name");
            if (data) {
                setSavedCoHosts(Array.from(new Set(data.map(i => i.co_host).filter(Boolean))));
                setSavedSpecialNames(Array.from(new Set(data.map(i => i.special_service_name).filter(Boolean))));
            }
        }
        getSuggestions();
    }, []);

    const updateCaption = (index: number, text: string) => {
        const updated = [...mediaItems];
        updated[index].caption = text;
        setMediaItems(updated);
    };

    const removeItem = (index: number) => {
        setMediaItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (targetStatus: 'draft' | 'published') => {
        if (mediaItems.length === 0) return toast.error("Please upload at least one image or video");
        setLoading(true);

        const submission = {
            ...formData,
            status: targetStatus,
            service_category: category,
            weekly_type: category === "Weekly" ? weeklyType : "",
            is_thanksgiving: category === "Weekly" && weeklyType === "Sunday" ? isThanksgiving : false,
            is_multi_day: category === "Special" ? isMultiDay : false,
            media_urls: mediaItems,
            is_archived: false
        };

        // Clean up data based on branches
        if (category === "Weekly") {
            submission.special_service_name = "";
            submission.day_identifier = "";
            if (weeklyType !== "Sunday") {
                submission.host = "";
                submission.service_number = "";
            }
        } else {
            submission.weekly_type = "";
            submission.host = "";
            submission.service_number = "";
            if (!isMultiDay) submission.day_identifier = "";
        }

        const { error } = await supabase.from("media_gallery").insert([submission]);

        if (error) {
            toast.error(error.message);
            setLoading(false);
        } else {
            toast.success(targetStatus === 'published' ? "Gallery Published!" : "Draft Saved");
            localStorage.removeItem("gallery_draft"); // Clear cache on success

            const targetPath = targetStatus === 'published' ? "/gallery" : "/gallery?tab=draft";
            router.push(targetPath);
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen bg-brand-surface p-4 md:p-12 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <Link href="/gallery" className="text-sm font-bold text-brand-secondary block hover:underline">← Back to Gallery List</Link>
                    {/* Visual indicator that Auto-Save is working */}
                    {mediaItems.length > 0 && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold">Draft Auto-Saved</span>}
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-brand-accent">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary mb-8">New Gallery Entry</h1>

                    <div className="space-y-8 md:space-y-10">
                        {/* Step 1: Category */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold uppercase tracking-widest text-purple-400">Step 1: Service Category</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {["Weekly", "Special"].map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => setCategory(item as any)}
                                        className={`p-4 md:p-6 rounded-2xl border-2 font-bold transition-all ${category === item ? "border-brand-primary bg-brand-primary/5 text-green-950" : "border-gray-100 text-brand-primary"}`}
                                    >
                                        {item === "Weekly" ? "Weekly / Fixed" : "Special Service"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Weekly Branch */}
                        {category === "Weekly" && (
                            <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-top-2">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {["Sunday", "Tuesday", "Thursday"].map((day) => (
                                        <button
                                            key={day}
                                            onClick={() => setWeeklyType(day as any)}
                                            className={`p-3 rounded-xl border font-bold ${weeklyType === day ? "bg-brand-primary text-white" : "bg-gray-50 text-gray-600"}`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>

                                {weeklyType === "Sunday" && (
                                    <div className="bg-slate-50 p-4 md:p-6 rounded-2xl space-y-4 md:space-y-6">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 accent-brand-primary shrink-0"
                                                checked={isThanksgiving}
                                                onChange={(e) => setIsThanksgiving(e.target.checked)}
                                            />
                                            <span className="font-bold text-sm md:text-base text-brand-primary">Thanksgiving Service (First Sunday)</span>
                                        </label>

                                        {!isThanksgiving && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-brand-primary">
                                                <select className="p-3 rounded-lg border bg-white text-sm" value={formData.host} onChange={(e) => setFormData({...formData, host: e.target.value})}>
                                                    <option>General/Last Sunday</option>
                                                    <option>Men</option>
                                                    <option>Women</option>
                                                    <option>Youth</option>
                                                </select>
                                                <select className="p-3 rounded-lg border bg-white text-sm" value={formData.service_number} onChange={(e) => setFormData({...formData, service_number: e.target.value})}>
                                                    <option>First Service</option>
                                                    <option>Second Service</option>
                                                </select>
                                                <input
                                                    list="cohosts"
                                                    placeholder="Department/Group"
                                                    className="p-3 rounded-lg border text-brand-primary text-sm"
                                                    value={formData.co_host}
                                                    onChange={(e) => setFormData({...formData, co_host: e.target.value})}
                                                />
                                                <datalist id="cohosts">{savedCoHosts.map(h => <option key={h} value={h} />)}</datalist>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Special Branch */}
                        {category === "Special" && (
                            <div className="space-y-4 md:space-y-6 animate-in fade-in">
                                <input
                                    list="specialNames"
                                    placeholder="Service Name (e.g. Wind of Change)"
                                    className="w-full p-4 border rounded-xl text-base md:text-lg font-serif text-brand-primary"
                                    value={formData.special_service_name}
                                    onChange={(e) => setFormData({...formData, special_service_name: e.target.value})}
                                />
                                <datalist id="specialNames">{savedSpecialNames.map(n => <option key={n} value={n} />)}</datalist>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button onClick={() => setIsMultiDay(false)} className={`flex-1 p-3 rounded-lg border font-bold ${!isMultiDay ? "bg-brand-primary text-white" : "text-brand-primary"}`}>One-Day</button>
                                    <button onClick={() => setIsMultiDay(true)} className={`flex-1 p-3 rounded-lg border font-bold ${isMultiDay ? "bg-brand-primary text-white" : "text-brand-primary"}`}>Multi-Day</button>
                                </div>

                                {isMultiDay && (
                                    <input
                                        placeholder="Day Identifier (e.g. Day 3)"
                                        className="w-full p-3 border rounded-lg text-brand-primary"
                                        value={formData.day_identifier}
                                        onChange={(e) => setFormData({...formData, day_identifier: e.target.value})}
                                    />
                                )}
                            </div>
                        )}

                        {/* Step 2: Upload Media */}
                        {(weeklyType || category === "Special") && (
                            <div className="p-6 md:p-10 border-2 border-dashed border-brand-accent rounded-3xl bg-slate-50/50 text-center animate-in fade-in">
                                <h3 className="font-bold text-brand-primary mb-2">Upload Files</h3>
                                <p className="text-[10px] text-gray-500 mb-6 uppercase tracking-widest font-black">Photos and Highlights</p>
                                <UploadButton
                                    endpoint="mediaGalleryUploader"
                                    appearance={{
                                        button: "bg-brand-primary w-full md:w-auto px-10 py-4 rounded-2xl text-[7px] md:text-[15px] font-bold after:bg-brand-secondary"
                                    }}
                                    content={{
                                        button({ ready }) {
                                            if (ready) return "Select Media";
                                            return "Loading...";
                                        },
                                    }}
                                    onClientUploadComplete={(res) => {
                                        const newItems: MediaItem[] = res.map(file => {
                                            // Look at the original file name to determine if it's a video
                                            const fileName = (file.name || "").toLowerCase();
                                            const isVideo = fileName.endsWith('.mp4') ||
                                                fileName.endsWith('.mov') ||
                                                fileName.endsWith('.webm') ||
                                                file.url.includes('.mp4');

                                            return {
                                                url: file.url,
                                                key: file.key,
                                                type: isVideo ? "video" : "image",
                                                caption: ""
                                            };
                                        });
                                        setMediaItems(prev => [...prev, ...newItems]);
                                        toast.success("Files uploaded!");
                                    }}
                                    onUploadError={(error) => {
                                        console.error("Upload error:", error);
                                        toast.error("Upload failed. Please try again.");
                                    }}
                                />
                            </div>
                        )}

                        {/* Media Management Grid */}
                        {mediaItems.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4">
                                {mediaItems.map((item, index) => (
                                    <div key={item.key} className="flex gap-3 md:gap-4 p-3 md:p-4 bg-white border border-brand-accent rounded-2xl group shadow-sm flex-col sm:flex-row items-start sm:items-center">
                                        <div className="w-full sm:w-24 h-32 sm:h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 relative">
                                            {item.type === 'image'
                                                ?
                                                <img
                                                    src={item.url}
                                                    className="w-full h-full object-cover"
                                                    alt={item.caption}
                                                />
                                                :
                                                <div className="w-full h-full relative group/video">
                                                    <video
                                                        className="w-full h-full object-cover bg-slate-900"
                                                        muted
                                                        playsInline
                                                        preload="metadata"
                                                        onMouseOver={(e) => {
                                                            const playPromise = e.currentTarget.play();
                                                            if (playPromise !== undefined) {
                                                                playPromise.catch(error => console.log("Auto-play prevented:", error));
                                                            }
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.pause();
                                                            e.currentTarget.currentTime = 0;
                                                        }}
                                                    >
                                                        <source src={item.url} type="video/mp4" />
                                                        <source src={item.url} type="video/quicktime" />
                                                    </video>

                                                    <div className="absolute bottom-1 right-1 bg-black/60 text-white p-1 rounded backdrop-blur-sm pointer-events-none">
                                                        <Film size={10} />
                                                    </div>
                                                </div>
                                            }
                                            {/* Larger hit area for mobile close button */}
                                            <button
                                                onClick={() => removeItem(index)}
                                                className="absolute top-2 right-2 sm:top-1 sm:right-1 p-2 sm:p-1 bg-red-500 text-white rounded-full sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} className="sm:w-[10px] sm:h-[10px]" />
                                            </button>
                                        </div>
                                        <div className="flex-1 w-full">
                                            <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">Caption</label>
                                            <textarea
                                                value={item.caption}
                                                onChange={(e) => updateCaption(index, e.target.value)}
                                                className="w-full text-brand-primary p-2 text-xs border rounded-lg h-20 sm:h-16 resize-none focus:ring-1 focus:ring-brand-primary outline-none"
                                                placeholder="Add context..."
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Final Details & Submit */}
                        {(weeklyType || category === "Special") && (
                            <div className="space-y-6 pt-8 border-t border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <input
                                        placeholder="Gallery Title (e.g. Easter 2026)"
                                        className="p-3 border rounded-lg text-brand-primary font-bold w-full"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    />
                                    <input
                                        type="date"
                                        className="p-3 border rounded-lg text-brand-primary w-full"
                                        value={formData.service_date}
                                        onChange={(e) => setFormData({...formData, service_date: e.target.value})}
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button onClick={() => handleSubmit('draft')} className="w-full sm:flex-1 py-4 border-2 border-brand-primary text-brand-primary rounded-2xl font-bold">Save Draft</button>
                                    <button onClick={() => handleSubmit('published')} className="w-full sm:flex-[2] py-4 bg-brand-primary text-white rounded-2xl font-bold">Publish Gallery</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}