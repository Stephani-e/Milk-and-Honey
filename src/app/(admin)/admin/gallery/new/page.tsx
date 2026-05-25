"use client";
import React, {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {UploadButton} from "@/utils/uploadthing";
import {toast} from "sonner";
import {Film, LinkIcon, X} from "lucide-react";
import AdminSkeletonLoader from "@/components/Admin/SkeletonLoader";

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
    const [category, setCategory] = useState<"Weekly" | "Monthly" | "Special" | "">("");
    const [weeklyType, setWeeklyType] = useState<"Sunday" | "Tuesday" | "Thursday" | "">("");
    const [isThanksgiving, setIsThanksgiving] = useState(false);
    const [isMultiDay, setIsMultiDay] = useState(false);

    // Suggestions
    const [savedCoHosts, setSavedCoHosts] = useState<string[]>([]);
    const [savedSpecialNames, setSavedSpecialNames] = useState<string[]>([]);
    const [savedMonthlyNames, setSavedMonthlyNames] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        service_date: new Date().toISOString().split('T')[0],
        host: "General/Last Sunday",
        service_number: "First Service",
        co_host: "",
        special_service_name: "",
        day_identifier: "",
        youtube_url: "",
        link_ig: "",
        link_twitter: "",
        link_facebook: "",
        link_spotify: "",
        link_ytmusic: "",
        link_apple: ""
    });

    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

    // NEW: Media Uploading Spinner State
    const [isUploadingMedia, setIsUploadingMedia] = useState(false);

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

    useEffect(() => {
        if (initialFetchDone) {
            const draft = {formData, category, weeklyType, isThanksgiving, isMultiDay, mediaItems};
            localStorage.setItem("gallery_draft", JSON.stringify(draft));
        }
    }, [formData, category, weeklyType, isThanksgiving, isMultiDay, mediaItems, initialFetchDone]);

    useEffect(() => {
        async function getSuggestions() {
            const {data} = await supabase.from("media_gallery").select("service_category, co_host, special_service_name");
            if (data) {
                setSavedCoHosts(Array.from(new Set(data.map(i => i.co_host).filter(Boolean))));
                setSavedSpecialNames(Array.from(new Set(data.filter(i => i.service_category === "Special").map(i => i.special_service_name).filter(Boolean))));
                setSavedMonthlyNames(Array.from(new Set(data.filter(i => i.service_category === "Monthly").map(i => i.special_service_name).filter(Boolean))));
            }
        }

        getSuggestions().catch(console.error);
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
        if (mediaItems.length === 0 && !formData.youtube_url) return toast.error("Please upload media or provide a YouTube link.");
        setLoading(true);

        const submission: any = {
            ...formData,
            status: targetStatus,
            service_category: category,
            weekly_type: category === "Weekly" ? weeklyType : "",
            is_thanksgiving: category === "Weekly" && weeklyType === "Sunday" ? isThanksgiving : false,
            is_multi_day: category === "Special" ? isMultiDay : false,
            media_urls: mediaItems,
            is_archived: false
        };

        // Bulletproof Ghost Data Cleanup
        if (category === "Weekly") {
            submission.special_service_name = "";
            submission.day_identifier = "";
            if (weeklyType !== "Sunday") {
                submission.host = "";
                submission.service_number = "";
                submission.co_host = "";
            }
            if (weeklyType === "Sunday" && formData.host === "General/Last Sunday") {
                submission.co_host = "";
            }
        } else if (category === "Monthly") {
            submission.weekly_type = "";
            submission.host = "";
            submission.service_number = "";
            submission.day_identifier = "";
            submission.co_host = "";
        } else if (category === "Special") {
            submission.weekly_type = "";
            submission.host = "";
            submission.service_number = "";
            if (!isMultiDay) submission.day_identifier = "";
            if (!formData.co_host) submission.co_host = "";
        }

        const {error} = await supabase.from("media_gallery").insert([submission]);

        if (error) {
            toast.error(error.message);
            setLoading(false);
        } else {
            toast.success(targetStatus === 'published' ? "Gallery Published!" : "Draft Saved");
            localStorage.removeItem("gallery_draft");
            router.push(targetStatus === 'published' ? "/admin/gallery" : "/admin/gallery?tab=draft");
            router.refresh();
        }
    };

    const todayObj = new Date();
    const localMaxDate = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

    if (!initialFetchDone) {
        return (
            <div className="min-h-screen bg-brand-surface p-6 md:p-12">
                <AdminSkeletonLoader variant="gallery-form"/>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-surface p-4 md:p-12 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <Link href="/admin/gallery"
                          className="text-sm font-bold text-brand-secondary block hover:underline">← Back to Gallery
                        Dashboard</Link>
                    {mediaItems.length > 0 &&
                        <span
                            className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold uppercase tracking-widest">Draft Auto-Saved</span>}
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-brand-accent">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary mb-8">New Gallery
                        Entry</h1>

                    <div className="space-y-8 md:space-y-10">
                        {/* Step 1: Category */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Step 1:
                                Service Category</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {["Weekly", "Monthly", "Special"].map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => setCategory(item as any)}
                                        className={`p-4 md:p-6 rounded-2xl border-2 font-bold transition-all ${category === item ? "border-brand-primary bg-brand-primary/5 text-green-950" : "border-gray-100 text-brand-primary"}`}
                                    >
                                        {item === "Weekly" ? "Weekly / Fixed" : item === "Monthly" ? "Monthly Event" : "Special Service"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Weekly Branch */}
                        {category === "Weekly" && (
                            <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-top-2">
                                <label
                                    className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Step
                                    1.1: Select Weekly Type</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {["Sunday", "Tuesday", "Thursday"].map((day) => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => setWeeklyType(day as any)}
                                            className={`p-3 rounded-xl border font-bold ${weeklyType === day ? "bg-brand-primary text-white" : "bg-gray-50 text-gray-600"}`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>

                                {weeklyType === "Sunday" && (
                                    <div className="bg-slate-50 p-4 md:p-6 rounded-2xl space-y-4 md:space-y-6">
                                        <label
                                            className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Step
                                            1.2: Fill Sunday Information</label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" className="w-5 h-5 accent-brand-primary shrink-0"
                                                   checked={isThanksgiving}
                                                   onChange={(e) => setIsThanksgiving(e.target.checked)}/>
                                            <span className="font-bold text-sm md:text-base text-brand-primary">Thanksgiving Service (First Sunday)</span>
                                        </label>
                                        {!isThanksgiving && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-brand-primary">
                                                <select className="p-3 rounded-lg border bg-white text-sm"
                                                        value={formData.host} onChange={(e) => setFormData({
                                                    ...formData,
                                                    host: e.target.value
                                                })}>
                                                    <option>General/Last Sunday</option>
                                                    <option>Men</option>
                                                    <option>Women</option>
                                                    <option>Youth</option>
                                                </select>
                                                <select className="p-3 rounded-lg border bg-white text-sm"
                                                        value={formData.service_number} onChange={(e) => setFormData({
                                                    ...formData,
                                                    service_number: e.target.value
                                                })}>
                                                    <option>First Service</option>
                                                    <option>Second Service</option>
                                                </select>
                                                <input list="cohosts" placeholder="Department/Group"
                                                       autoComplete="off"
                                                       className="p-3 rounded-lg border text-brand-primary text-sm"
                                                       value={formData.co_host} onChange={(e) => setFormData({
                                                    ...formData,
                                                    co_host: e.target.value
                                                })}/>
                                                <datalist id="cohosts">{savedCoHosts.map(h => <option key={h}
                                                                                                      value={h}/>)}</datalist>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Monthly Branch */}
                        {category === "Monthly" && (
                            <div
                                className="animate-in fade-in bg-slate-50 p-4 md:p-6 rounded-2xl border border-gray-100">
                                <label
                                    className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Step
                                    2: Fill Service Information</label>
                                <input list="monthlyNames" placeholder="e.g. Holy Communion, Holy Ghost Service"
                                       className="w-full p-4 border rounded-xl text-base md:text-lg font-serif text-brand-primary"
                                       value={formData.special_service_name || ""} onChange={(e) => setFormData({
                                    ...formData,
                                    special_service_name: e.target.value
                                })}/>
                                <datalist id="monthlyNames">
                                    <option value="Holy Ghost Service"/>
                                    <option value="Holy Communion"/>
                                    <option value="Anointing Service"/>
                                    <option value="Wind of Change"/>
                                    {savedMonthlyNames.map(n => <option key={n} value={n}/>)}
                                </datalist>
                            </div>
                        )}

                        {/* Special Branch */}
                        {category === "Special" && (
                            <div className="space-y-4 md:space-y-6 animate-in fade-in">
                                <label
                                    className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Step
                                    2: Fill Service Information</label>
                                <input list="specialNames" placeholder="Service Name (e.g. Wind of Change)"
                                       className="w-full p-4 border rounded-xl text-base md:text-lg font-serif text-brand-primary"
                                       value={formData.special_service_name} onChange={(e) => setFormData({
                                    ...formData,
                                    special_service_name: e.target.value
                                })}/>
                                <datalist id="specialNames">{savedSpecialNames.map(n => <option key={n}
                                                                                                value={n}/>)}</datalist>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button type="button" onClick={() => setIsMultiDay(false)}
                                            className={`flex-1 p-3 rounded-lg border font-bold ${!isMultiDay ? "bg-brand-primary text-white" : "text-brand-primary"}`}>One-Day
                                    </button>
                                    <button type="button" onClick={() => setIsMultiDay(true)}
                                            className={`flex-1 p-3 rounded-lg border font-bold ${isMultiDay ? "bg-brand-primary text-white" : "text-brand-primary"}`}>Multi-Day
                                    </button>
                                </div>
                                {isMultiDay && (
                                    <input placeholder="Day Identifier (e.g. Day 3)"
                                           className="w-full p-3 border rounded-lg text-brand-primary"
                                           value={formData.day_identifier} onChange={(e) => setFormData({
                                        ...formData,
                                        day_identifier: e.target.value
                                    })}/>
                                )}
                            </div>
                        )}

                        {/* Platform Links Section */}
                        {(category !== "") && (
                            <div className='flex flex-col gap-2 mt-2 pt-6 border-t border-gray-100'>
                                <label
                                    className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Step
                                    3: External Platform Links (Optional)</label>
                                <div
                                    className="bg-brand-surface p-4 md:p-6 rounded-2xl border border-brand-accent space-y-4">
                                    <p className="text-[10px] font-bold text-brand-secondary uppercase flex items-center gap-2">
                                        <LinkIcon size={14}/> Add Related Links
                                    </p>

                                    <input
                                        placeholder="Full YouTube Video URL (If applicable)"
                                        className="w-full p-3 border rounded-lg bg-white text-brand-primary text-sm mb-2"
                                        value={formData.youtube_url || ""}
                                        onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <span
                                                className="absolute left-3 top-3.5 text-xs font-bold text-gray-400 w-16">IG URL:</span>
                                            <input type="url" placeholder="https://instagram.com/..."
                                                   className="w-full p-3 pl-20 border rounded-lg bg-white text-brand-primary text-sm"
                                                   value={formData.link_ig || ""} onChange={(e) => setFormData({
                                                ...formData,
                                                link_ig: e.target.value
                                            })}/>
                                        </div>
                                        <div className="relative">
                                            <span
                                                className="absolute left-3 top-3.5 text-xs font-bold text-gray-400 w-16">X URL:</span>
                                            <input type="url" placeholder="https://x.com/..."
                                                   className="w-full p-3 pl-20 border rounded-lg bg-white text-brand-primary text-sm"
                                                   value={formData.link_twitter || ""} onChange={(e) => setFormData({
                                                ...formData,
                                                link_twitter: e.target.value
                                            })}/>
                                        </div>
                                        <div className="relative">
                                            <span
                                                className="absolute left-3 top-3.5 text-xs font-bold text-gray-400 w-16">FB URL:</span>
                                            <input type="url" placeholder="https://facebook.com/..."
                                                   className="w-full p-3 pl-20 border rounded-lg bg-white text-brand-primary text-sm"
                                                   value={formData.link_facebook || ""} onChange={(e) => setFormData({
                                                ...formData,
                                                link_facebook: e.target.value
                                            })}/>
                                        </div>
                                        <div className="relative">
                                            <span
                                                className="absolute left-3 top-3.5 text-xs font-bold text-gray-400 w-20">Spotify:</span>
                                            <input type="url" placeholder="https://open.spotify.com/..."
                                                   className="w-full p-3 pl-24 border rounded-lg bg-white text-brand-primary text-sm"
                                                   value={formData.link_spotify || ""} onChange={(e) => setFormData({
                                                ...formData,
                                                link_spotify: e.target.value
                                            })}/>
                                        </div>
                                        <div className="relative">
                                            <span
                                                className="absolute left-3 top-3.5 text-xs font-bold text-gray-400 w-20">Apple:</span>
                                            <input type="url" placeholder="https://podcasts.apple.com/..."
                                                   className="w-full p-3 pl-24 border rounded-lg bg-white text-brand-primary text-sm"
                                                   value={formData.link_apple || ""} onChange={(e) => setFormData({
                                                ...formData,
                                                link_apple: e.target.value
                                            })}/>
                                        </div>
                                        <div className="relative">
                                            <span
                                                className="absolute left-3 top-3.5 text-xs font-bold text-gray-400 w-20">YT Music:</span>
                                            <input type="url" placeholder="https://music.youtube.com/..."
                                                   className="w-full p-3 pl-24 border rounded-lg bg-white text-brand-primary text-sm"
                                                   value={formData.link_ytmusic || ""} onChange={(e) => setFormData({
                                                ...formData,
                                                link_ytmusic: e.target.value
                                            })}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Upload Media with Integrated Spinner */}
                        {(weeklyType || category === "Monthly" || category === "Special") && (
                            <div className='flex flex-col gap-2'>
                                <label
                                    className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">
                                    Step 4: Upload All Media (Pictures & Videos)
                                </label>

                                {isUploadingMedia ? (
                                    // THE UPLOADING STATE
                                    <div
                                        className="p-6 md:p-10 border-2 border-dashed border-brand-accent rounded-3xl bg-slate-50/50 flex flex-col items-center justify-center gap-4 animate-in fade-in h-[200px]">
                                        <svg className="animate-spin h-10 w-10 text-brand-primary"
                                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <div className="text-center">
                                            <span
                                                className="text-sm font-bold text-brand-primary uppercase tracking-widest animate-pulse block">
                                                Processing Media...
                                            </span>
                                            <span className="text-[10px] text-gray-400 mt-1 font-bold">Please keep this window open</span>
                                        </div>
                                    </div>
                                ) : (
                                    // THE UPLOAD BUTTON STATE
                                    <div
                                        className="p-6 md:p-10 border-2 border-dashed border-brand-accent rounded-3xl bg-slate-50/50 text-center animate-in fade-in">
                                        <h3 className="font-bold text-brand-primary mb-2">Upload Files</h3>
                                        <p className="text-[10px] text-gray-500 mb-6 uppercase tracking-widest font-black">Photos
                                            and Highlights</p>
                                        <UploadButton
                                            endpoint="mediaGalleryUploader"
                                            appearance={{
                                                button: "bg-brand-primary w-full md:w-auto px-10 py-4 rounded-2xl text-[7px] md:text-[15px] font-bold after:bg-brand-secondary h-[50px]",
                                            }}
                                            content={{
                                                button({ready, isUploading}) {
                                                    if (isUploading) return "Processing...";
                                                    return ready ? "Select Media" : "Loading...";
                                                }
                                            }}
                                            onUploadBegin={() => {
                                                setIsUploadingMedia(true);
                                            }}
                                            onClientUploadComplete={(res) => {
                                                const newItems: MediaItem[] = res.map(file => {
                                                    const fileName = (file.name || "").toLowerCase();
                                                    const isVideo = fileName.endsWith('.mp4') || fileName.endsWith('.mov') || fileName.endsWith('.webm') || file.ufsUrl.includes('.mp4');
                                                    return {
                                                        url: file.ufsUrl,
                                                        key: file.key,
                                                        type: isVideo ? "video" : "image",
                                                        caption: ""
                                                    };
                                                });
                                                setMediaItems(prev => [...prev, ...newItems]);
                                                setIsUploadingMedia(false);
                                                toast.success(`${res.length} files uploaded successfully!`);
                                            }}
                                            onUploadError={(error) => {
                                                setIsUploadingMedia(false);
                                                toast.error(`Upload failed. Please try again.: ${error.message || "Unknown error"}`);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Media Management Grid */}
                        {mediaItems.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4">
                                <label
                                    className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-purple-400 mb-2 col-span-full">Step
                                    5: Preview the Media. Captions can be added to each. Media can be deleted
                                    individually.</label>
                                {mediaItems.map((item, index) => (
                                    <div key={item.key}
                                         className="flex gap-3 md:gap-4 p-3 md:p-4 bg-white border border-brand-accent rounded-2xl group shadow-sm flex-col sm:flex-row items-start sm:items-center">
                                        <div
                                            className="w-full sm:w-24 h-32 sm:h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 relative">
                                            {item.type === 'image' ? (
                                                <img src={item.url} className="w-full h-full object-cover"
                                                     alt={item.caption}/>
                                            ) : (
                                                <div className="w-full h-full relative group/video">
                                                    <video className="w-full h-full object-cover bg-slate-900" muted
                                                           playsInline preload="metadata"
                                                           onMouseOver={(e) => e.currentTarget.play().catch(() => {
                                                           })} onMouseOut={(e) => {
                                                        e.currentTarget.pause();
                                                        e.currentTarget.currentTime = 0;
                                                    }}>
                                                        <source src={item.url} type="video/mp4"/>
                                                    </video>
                                                    <div
                                                        className="absolute bottom-1 right-1 bg-black/60 text-white p-1 rounded backdrop-blur-sm pointer-events-none">
                                                        <Film size={10}/></div>
                                                </div>
                                            )}
                                            <button type="button" onClick={() => removeItem(index)}
                                                    className="absolute top-2 right-2 sm:top-1 sm:right-1 p-2 sm:p-1 bg-red-500 text-white rounded-full sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-sm">
                                                <X size={12} className="sm:w-[10px] sm:h-[10px]"/></button>
                                        </div>
                                        <div className="flex-1 w-full">
                                            <label
                                                className="text-[9px] font-black text-gray-400 uppercase block mb-1">Caption</label>
                                            <textarea value={item.caption}
                                                      onChange={(e) => updateCaption(index, e.target.value)}
                                                      className="w-full text-brand-primary p-2 text-xs border rounded-lg h-20 sm:h-16 resize-none focus:ring-1 focus:ring-brand-primary outline-none"
                                                      placeholder="Add context..."/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Final Details & Submit */}
                        {(weeklyType || category === "Monthly" || category === "Special") && (
                            <div className="space-y-6 pt-8 border-t border-gray-100">
                                <div>
                                    <label
                                        className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-purple-400">Step
                                        6: Edit Final Info (Title and Date)</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <input placeholder="Gallery Title (e.g. Easter 2026)"
                                               className="p-3 border rounded-lg text-brand-primary font-bold w-full"
                                               value={formData.title}
                                               onChange={(e) => setFormData({...formData, title: e.target.value})}/>
                                        <input type="date" className="p-3 border rounded-lg text-brand-primary w-full"
                                               max={localMaxDate} value={formData.service_date} onChange={(e) => {
                                            if (e.target.value > localMaxDate) {
                                                toast.error("Cannot select a future date!");
                                                setFormData({...formData, service_date: localMaxDate});
                                            } else {
                                                setFormData({...formData, service_date: e.target.value});
                                            }
                                        }}/>
                                    </div>
                                </div>

                                <div className='flex flex-col gap-2'>
                                    <label
                                        className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-purple-400">Step
                                        7: Publish Gallery or Save As Draft</label>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={() => handleSubmit('draft')}
                                            className="w-full sm:flex-1 py-4 border-2 border-brand-primary text-brand-primary rounded-2xl font-bold hover:bg-brand-primary/5 transition-all disabled:opacity-50">
                                            {loading ? "Saving..." : "Save Draft"}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={() => handleSubmit('published')}
                                            className="w-full sm:flex-[2] py-4 bg-brand-primary text-white rounded-2xl font-bold shadow-lg hover:bg-brand-primary/90 transition-all disabled:opacity-50">
                                            {loading ? "Publishing..." : "Publish Gallery"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}