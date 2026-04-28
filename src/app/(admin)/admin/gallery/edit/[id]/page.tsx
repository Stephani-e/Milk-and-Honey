"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";
import { X, Type, Film, Lock } from "lucide-react";

interface MediaItem {
    url: string;
    key: string;
    type: "image" | "video";
    caption: string;
}

export default function EditGalleryPage() {
    const router = useRouter();
    const { id } = useParams();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

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
        service_date: "",
        host: "",
        service_number: "",
        co_host: "",
        special_service_name: "",
        day_identifier: "",
    });

    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

    // Load Existing Gallery Data
    useEffect(() => {
        async function loadGallery() {
            const { data, error } = await supabase
                .from("media_gallery")
                .select("*")
                .eq("id", id)
                .single();

            if (data && !error) {
                setFormData({
                    title: data.title || "",
                    service_date: data.service_date || "",
                    host: data.host || "General/Last Sunday",
                    service_number: data.service_number || "First Service",
                    co_host: data.co_host || "",
                    special_service_name: data.special_service_name || "",
                    day_identifier: data.day_identifier || "",
                });
                setCategory(data.service_category);
                setWeeklyType(data.weekly_type);
                setIsThanksgiving(data.is_thanksgiving || false);
                setIsMultiDay(data.is_multi_day || false);

                // Load the existing media array, parsing if necessary
                if (data.media_urls) {
                    setMediaItems(typeof data.media_urls === 'string' ? JSON.parse(data.media_urls) : data.media_urls);
                }
            } else {
                toast.error("Failed to load gallery data");
            }
            setFetching(false);
        }
        if (id) loadGallery();
    }, [id]);

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
        if (mediaItems.length === 0) return toast.error("Please ensure at least one media item is attached.");
        if (!formData.title) return toast.error("Please provide a title");

        setLoading(true);

        const submission = {
            ...formData,
            status: targetStatus,
            service_category: category,
            weekly_type: category === "Weekly" ? weeklyType : "",
            is_thanksgiving: category === "Weekly" && weeklyType === "Sunday" ? isThanksgiving : false,
            is_multi_day: category === "Special" ? isMultiDay : false,
            media_urls: mediaItems, // Save the updated array
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

        const { error } = await supabase.from("media_gallery").update(submission).eq("id", id);

        if (error) {
            toast.error(error.message);
            setLoading(false);
        } else {
            toast.success(targetStatus === 'published' ? "Gallery Changes Published!" : "Changes Saved to Draft");
            const targetPath = targetStatus === 'published' ? "/gallery" : "/gallery?tab=draft";
            router.push(targetPath);
            router.refresh();
        }
    };

    if (fetching) return <div className="p-20 text-center font-bold text-brand-primary min-h-screen bg-brand-surface">Loading Gallery Data...</div>;

    return (
        <div className="min-h-screen bg-brand-surface p-4 md:p-12 font-sans">
            <div className="max-w-5xl mx-auto">
                <Link href="/gallery" className="text-sm font-bold text-brand-secondary mb-6 block hover:underline">← Back to Gallery List</Link>

                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-brand-accent">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary mb-8">Edit Gallery Entry</h1>

                    <div className="space-y-8 md:space-y-10">

                        {/* LOCKED Step 1: Category */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-purple-400">Step 1: Service Category</label>
                                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1"><Lock size={10}/> Locked</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-75">
                                {["Weekly", "Special"].map((item) => (
                                    <div
                                        key={item}
                                        className={`p-4 md:p-6 rounded-2xl border-2 font-bold cursor-not-allowed ${category === item ? "border-brand-primary bg-brand-primary/5 text-brand-primary" : "border-gray-100 bg-gray-50 text-gray-300"}`}
                                    >
                                        {item === "Weekly" ? "Weekly / Fixed" : "Special Service"}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weekly Branch - LOCKED Tabs, Editable Content */}
                        {category === "Weekly" && (
                            <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-top-2">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-75">
                                    {["Sunday", "Tuesday", "Thursday"].map((day) => (
                                        <div
                                            key={day}
                                            className={`p-3 rounded-xl border text-center font-bold cursor-not-allowed ${weeklyType === day ? "bg-brand-primary text-white" : "bg-gray-50 text-gray-300 border-gray-100"}`}
                                        >
                                            {day}
                                        </div>
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

                        {/* Special Branch - Locked Tabs, Editable Content */}
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

                                <div className="flex flex-col sm:flex-row gap-4 opacity-75">
                                    <div className={`flex-1 p-3 rounded-lg border text-center font-bold cursor-not-allowed ${!isMultiDay ? "bg-brand-primary text-white" : "bg-gray-50 text-gray-300 border-gray-100"}`}>One-Day</div>
                                    <div className={`flex-1 p-3 rounded-lg border text-center font-bold cursor-not-allowed ${isMultiDay ? "bg-brand-primary text-white" : "bg-gray-50 text-gray-300 border-gray-100"}`}>Multi-Day</div>
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

                        {/* Add MORE Media Section */}
                        <div className="p-6 md:p-10 border-2 border-dashed border-brand-accent rounded-3xl bg-slate-50/50 text-center">
                            <h3 className="font-bold text-brand-primary mb-2">Add More Files</h3>
                            <p className="text-[10px] text-gray-500 mb-6 uppercase tracking-widest font-black">Append new photos/videos to this gallery</p>
                            <UploadButton
                                endpoint="mediaGalleryUploader"
                                appearance={{ button: "bg-brand-primary w-full md:w-auto px-10 py-4 rounded-2xl text-xs font-bold after:bg-brand-secondary" }}
                                content={{
                                    button({ ready }) {
                                        if (ready) return "Select Media";
                                        return "Loading...";
                                    },
                                }}
                                onClientUploadComplete={(res) => {
                                    const newItems: MediaItem[] = res.map(file => {
                                        const fileName = (file.name || "").toLowerCase();
                                        const isVideo = fileName.endsWith('.mp4') || fileName.endsWith('.mov') || fileName.endsWith('.webm') || file.url.includes('.mp4');

                                        return {
                                            url: file.url,
                                            key: file.key,
                                            type: isVideo ? "video" : "image",
                                            caption: ""
                                        };
                                    });
                                    setMediaItems(prev => [...prev, ...newItems]);
                                    toast.success("Additional files attached!");
                                }}
                                onUploadError={(error) => {
                                    console.error("Upload error:", error);
                                    toast.error("Failed to upload media. Please try again.");
                                }}
                            />
                        </div>

                        {/* Media Management Grid (Edit/Delete Existing) */}
                        {mediaItems.length > 0 && (
                            <div className="space-y-4 animate-in slide-in-from-bottom-4">
                                <div className="flex justify-between items-end">
                                    <h3 className="text-xs font-black text-purple-600 uppercase tracking-widest">Manage Items & Captions</h3>
                                    <span className="text-xs font-bold text-gray-400">{mediaItems.length} Items</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {mediaItems.map((item, index) => (
                                        <div key={item.key} className="flex gap-3 md:gap-4 p-3 md:p-4 bg-white border border-brand-accent rounded-2xl group shadow-sm flex-col sm:flex-row items-start sm:items-center">
                                            <div className="w-full sm:w-24 h-32 sm:h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 relative">
                                                {item.type === 'image'
                                                    ?
                                                    <img src={item.url} className="w-full h-full object-cover" alt={item.caption} />
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
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="absolute top-2 right-2 sm:top-1 sm:right-1 p-2 sm:p-1 bg-red-500 text-white rounded-full sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
                                                >
                                                    <X size={12} className="sm:w-[10px] sm:h-[10px]" />
                                                </button>
                                            </div>
                                            <div className="flex-1 w-full">
                                                <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">Caption</label>
                                                <textarea
                                                    value={item.caption}
                                                    onChange={(e) => updateCaption(index, e.target.value)}
                                                    className="w-full p-2 text-xs border rounded-lg h-20 sm:h-16 resize-none focus:ring-1 focus:ring-brand-primary outline-none"
                                                    placeholder="Add context..."
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Final Details & Submit */}
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
                                <button
                                    type="button"
                                    onClick={() => handleSubmit('draft')}
                                    disabled={loading}
                                    className="w-full sm:flex-1 py-4 border-2 border-brand-primary text-brand-primary rounded-2xl font-bold disabled:opacity-50 hover:bg-brand-primary/5 transition-all"
                                >
                                    Revert to Draft
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSubmit('published')}
                                    disabled={loading}
                                    className="w-full sm:flex-[2] py-4 bg-brand-primary text-white rounded-2xl font-bold disabled:opacity-50 shadow-lg hover:bg-slate-800 transition-all"
                                >
                                    {loading ? "Updating..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}