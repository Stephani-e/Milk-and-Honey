"use client";
import React, { useState, useEffect} from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";
import ConfirmModal from "@/components/Admin/ConfirmModal";
import {Film, LinkIcon} from "lucide-react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function NewSermonPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [initialFetchDone, setInitialFetchDone] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [mediaAction, setMediaAction] = useState<{
        type: 'banner' | 'clip' | 'youtube';
        action: 'delete' | 'change';
    } | null>(null);

    const [category, setCategory] = useState<"Weekly" | "Monthly" | "Special" | "">("");
    const [weeklyType, setWeeklyType] = useState<"Sunday" | "Tuesday" | "Thursday" | "">("");
    const [isThanksgiving, setIsThanksgiving] = useState(false);
    const [isMultiDay, setIsMultiDay] = useState(false);

    const [savedCoHosts, setSavedCoHosts] = useState<string[]>([]);
    const [savedSpecialNames, setSavedSpecialNames] = useState<string[]>([]);
    const [savedMonthlyNames, setSavedMonthlyNames] = useState<string[]>([]);

    const [bannerUploaded, setBannerUploaded] = useState(false);
    const [clipUploaded, setClipUploaded] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        preacher: "",
        bible_text: "",
        content: "",
        service_date: new Date().toISOString().split('T')[0],
        host: "",
        co_host: "",
        service_number: "",
        special_service_name: "",
        day_identifier: "",
        youtube_url: "",
        banner_url: "",
        clip_url: "",
        link_ig: "",
        link_twitter: "",
        link_facebook: "",
        link_spotify: "",
        link_ytmusic: "",
        link_apple: ""
    });

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }, { 'size': ['small', false, 'medium', 'large', 'huge'] },],
            ['bold', 'italic', 'underline', 'strike',],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{'list': 'ordered'}, {'list': 'bullet'}, {'list': 'unordered'}],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['blockquote', 'code-block', 'link'],
            ['clean']
        ],
    };

    useEffect(() => {
        const savedDraft = localStorage.getItem("sermon_draft");
        if (savedDraft) {
            const draft = JSON.parse(savedDraft);
            setFormData(draft.formData);
            setCategory(draft.service_category);
            setWeeklyType(draft.weeklyType);
            setIsThanksgiving(draft.isThanksgiving || false);
            setIsMultiDay(draft.isMultiDay || false);
            if (draft.formData.banner_url) setBannerUploaded(true);
            if (draft.formData.clip_url) setClipUploaded(true);
        }
        setInitialFetchDone(true);
    }, []);

    useEffect(() => {
        if (initialFetchDone) {
            const draft = { formData, category, weeklyType, isThanksgiving, isMultiDay };
            localStorage.setItem("sermon_draft", JSON.stringify(draft));
        }
    }, [formData, category, weeklyType, isThanksgiving, isMultiDay, initialFetchDone]);

    const triggerMediaAction = (type: 'banner' | 'clip' , action: 'delete' | 'change') => {
        setMediaAction({ type, action });
        setShowDeleteModal(true);
    };

    const handleConfirmMediaAction = () => {
        if (!mediaAction) return;

        const { type } = mediaAction;

        if (type === 'banner') {
            setFormData({ ...formData, banner_url: "" });
            setBannerUploaded(false);
            toast.success("Banner removed");
        } else if (type === 'clip') {
            setFormData({ ...formData, clip_url: "" });
            setClipUploaded(false);
            toast.success("Video clip removed");
        }

        setShowDeleteModal(false);
        setMediaAction(null);
    };

    useEffect(() => {
        async function getSuggestions() {
            const { data } = await supabase.from("sermons").select("service_category, co_host, special_service_name");
            if (data) {
                // Use Set to get unique values only (no duplicates)
                const hosts = Array.from(new Set(data.map(i => i.co_host).filter(Boolean)));

                const specialNames = Array.from(new Set(data.filter(i => i.service_category === "Special").map(i => i.special_service_name).filter(Boolean)));
                const monthlyNames = Array.from(new Set(data.filter(i => i.service_category === "Monthly").map(i => i.special_service_name).filter(Boolean)));

                setSavedCoHosts(hosts);
                setSavedSpecialNames(specialNames);
                setSavedMonthlyNames(monthlyNames);
            }
        }
        getSuggestions();
    }, []);

    const handleSubmit = async (targetStatus: 'draft' | 'published') => {
        setLoading(true);

        const submission: any = {
            ...formData,
            status: targetStatus,
            service_category: category,
            weekly_type: category === "Weekly" ? weeklyType : "",
            is_thanksgiving: category === "Weekly" && weeklyType === "Sunday" ? isThanksgiving : false,
            is_multi_day: category === "Special" ? isMultiDay : false,
        };

        // Clean up data based on the selected category to prevent ghost data
        if (category === "Weekly") {
            submission.special_service_name = "";
            submission.day_identifier = "";
            if (weeklyType !== "Sunday") {
                submission.host = "";
                submission.service_number = "";
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
            if (!isMultiDay) {
                submission.day_identifier = "";
            }
            if (!formData.co_host) {
                submission.co_host = "";
            }
        }

        const { error } = await supabase.from("sermons").insert([submission]);

        if (error) {
            toast.error(`Database Error: ${error.message}`);
            setLoading(false);
        } else {
            toast.success(
                targetStatus === 'published'
                    ? "Sermon Published Successfully!"
                    : 'Drafts Saved to Drafts Page'
            );
            localStorage.removeItem("sermon_draft"); // Clear cache on success

            const targetPath = targetStatus === 'published' ? "/admin/sermons" : "/admin/sermons?tab=draft";
            router.push(targetPath);
            router.refresh();
        }
    };


    return (
        <div className="min-h-screen bg-brand-surface p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <Link href="/admin/sermons" className="text-sm font-bold text-brand-secondary mb-6 block">← Back to Sermon Dashboard</Link>
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold">Draft Auto-Saved</span>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-brand-accent">
                    <h1 className="text-3xl font-serif font-bold text-brand-primary mb-8">
                        New Sermon Entry
                    </h1>

                    <form className="space-y-10">

                        {/* Category Selection */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Step 1: Service Category</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {["Weekly", "Monthly", "Special"].map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => setCategory(item as any)}
                                        className={`p-6 rounded-2xl border-2 font-bold transition-all ${category === item ? "border-brand-primary bg-brand-primary/5 text-green-950" : "border-gray-100 text-brand-primary"}`}
                                    >
                                        {item === "Weekly" ? "Weekly / Fixed" : item === "Monthly" ? "Monthly Event" : "Special Service"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* WEEKLY BRANCH */}
                        {category === "Weekly" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Step 1.1: Select Weekly Type</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {["Sunday", "Tuesday", "Thursday"].map((day) => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => setWeeklyType(day as any)}
                                            className={`p-3 rounded-xl border ${weeklyType === day ? "bg-brand-primary text-white" : "bg-gray-50 text-gray-600"}`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>

                                {weeklyType === "Sunday" && (
                                    <div className="bg-slate-50 p-6 rounded-2xl space-y-6">
                                        <label className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Step 1.2: Select Which Sunday Service and Fill the Information</label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 accent-brand-primary"
                                                checked={isThanksgiving}
                                                onChange={(e) => setIsThanksgiving(e.target.checked)}
                                            />
                                            <span className="font-bold text-brand-primary">Thanksgiving Service (First Sunday)</span>
                                        </label>

                                        {!isThanksgiving && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-brand-primary">
                                                <select
                                                    className="p-3 rounded-lg border"
                                                    value={formData.host}
                                                    onChange={(e) => setFormData({...formData, host: e.target.value})}
                                                >
                                                    <option>General/Last Sunday</option>
                                                    <option>Men</option>
                                                    <option>Women</option>
                                                    <option>Youth</option>
                                                </select>
                                                <select
                                                    className="p-3 rounded-lg border"
                                                    value={formData.service_number}
                                                    onChange={(e) => setFormData({...formData, service_number: e.target.value})}
                                                >
                                                    <option>First Service</option>
                                                    <option>Second Service</option>
                                                </select>
                                                <input
                                                    list="cohosts"
                                                    placeholder="Add Co-Host (Optional)"
                                                    className="p-3 rounded-lg border text-brand-primary"
                                                    value={formData.co_host}
                                                    onChange={(e) => setFormData({...formData, co_host: e.target.value})}
                                                />
                                                <datalist id="cohosts">
                                                    {savedCoHosts.map(h => <option key={h} value={h} />)}
                                                </datalist>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Monthly Branch */}
                        {category === "Monthly" && (
                            <div className="animate-in fade-in bg-slate-50 p-6 rounded-2xl border border-gray-100">
                                <label className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Step 2: Fill Service Information</label>
                                <input
                                    list="monthlyNames"
                                    placeholder="e.g. Holy Communion, Holy Ghost Service"
                                    className="w-full p-4 border rounded-xl text-lg font-serif text-brand-primary"
                                    value={formData.special_service_name || ""}
                                    onChange={(e) => setFormData({...formData, special_service_name: e.target.value})}
                                />
                                <datalist id="monthlyNames">
                                    {/* Default RCCG Suggestions + Saved ones from DB */}
                                    <option value="Holy Ghost Service" />
                                    <option value="Holy Communion" />
                                    <option value="Anointing Service" />
                                    <option value="Wind of Change" />
                                    {savedMonthlyNames.map(n => <option key={n} value={n} />)}
                                </datalist>
                            </div>
                        )}

                        {/* SPECIAL BRANCH */}
                        {category === "Special" && (
                            <div className="space-y-6 animate-in fade-in">
                                <label className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Step 2: Fill Service Information</label>
                                <input
                                    list="specialNames"
                                    placeholder="Service Name (e.g. Wind of Change)"
                                    className="w-full p-4 border rounded-xl text-lg font-serif text-brand-primary"
                                    value={formData.special_service_name}
                                    onChange={(e) => setFormData({...formData, special_service_name: e.target.value})}
                                />
                                <datalist id="specialNames">
                                    {savedSpecialNames.map(n => <option key={n} value={n} />)}
                                </datalist>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsMultiDay(false)}
                                        className={`flex-1 p-3 rounded-lg border ${!isMultiDay ? "bg-brand-primary text-white" : "text-brand-primary"}`}
                                    >
                                        One-Day
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsMultiDay(true)}
                                        className={`flex-1 p-3 rounded-lg border ${isMultiDay ? "bg-brand-primary text-white" : "text-brand-primary"}`}
                                    >
                                        Multi-Day
                                    </button>
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

                        {/* UNIFIED FIELDS (Title, Preacher, Date, Media) */}
                        {(weeklyType || category === "Monthly" || category === "Special") && (
                            <div className="pt-10 border-t border-gray-100 space-y-6">
                                <label className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Step 2: Fill Service Information</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input
                                        required
                                        placeholder="Sermon Title"
                                        className="p-3 border rounded-lg text-brand-primary"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    />
                                    <input
                                        required
                                        placeholder="Preacher Name"
                                        className="p-3 border rounded-lg text-brand-primary"
                                        value={formData.preacher}
                                        onChange={(e) => setFormData({...formData, preacher: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input
                                        placeholder="Bible Text"
                                        className="p-3 border rounded-lg text-brand-primary"
                                        value={formData.bible_text}
                                        onChange={(e) => setFormData({...formData, bible_text: e.target.value})}
                                    />
                                    <input
                                        type="date"
                                        className="p-3 border rounded-lg text-brand-primary"
                                        value={formData.service_date}
                                        onChange={(e) => setFormData({...formData, service_date: e.target.value})}
                                    />
                                </div>

                                {(weeklyType || category === "Monthly" || category === "Special") && (
                                    <>
                                        <div className='flex flex-col gap-2 mt-2'>
                                            <label className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4">Step 3: Fill Service Media</label>
                                            <div className="bg-brand-surface p-6 rounded-2xl border border-brand-accent space-y-4">
                                                <p className="text-[10px] font-bold text-brand-secondary uppercase">Media Attachments (Recommended)</p>
                                                <input
                                                    placeholder="YouTube URL (Optional)"
                                                    className="w-full p-3 border rounded-lg bg-white text-brand-primary"
                                                    value={formData.youtube_url}
                                                    onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
                                                />

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                                    {/* Banner Upload */}
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-bold uppercase text-blue-950">Sermon Banner</label>
                                                        {bannerUploaded && formData.banner_url ? (
                                                            <div className="bg-white border border-brand-accent p-3 rounded-2xl shadow-sm flex flex-col gap-3 animate-in fade-in">
                                                                <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden relative">
                                                                    <img src={formData.banner_url} alt="Sermon Banner" className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className='flex justify-between items-center px-1'>
                                                                    <span className="text-[9px] font-bold text-green-600 uppercase">Image Uploaded Successfully</span>
                                                                    <div className="flex gap-3">
                                                                        <button type="button" onClick={() => triggerMediaAction('banner', 'change')} className="text-[10px] underline font-bold text-blue-600">Change</button>
                                                                        <button type="button" onClick={() => triggerMediaAction('banner', 'delete')} className="text-[10px] underline font-bold text-red-500">Remove</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <UploadButton
                                                                endpoint="imageUploader"
                                                                appearance={{
                                                                    // Added w-full to ensure the button fills its responsive container
                                                                    button: "w-full bg-brand-primary text-white text-[6px] md:text-[10px] p-4 rounded-xl after:bg-brand-secondary",
                                                                    allowedContent: "text-brand-secondary text-[10px] font-bold uppercase",
                                                                }}
                                                                content={{
                                                                    button({ ready }) {
                                                                        if (ready) return "Select Banner Image";
                                                                        return "Loading...";
                                                                    },
                                                                }}
                                                                onClientUploadComplete={(res) => {
                                                                    setFormData({ ...formData, banner_url: res[0].url });
                                                                    setBannerUploaded(true);
                                                                    toast.success("Banner image uploaded successfully");
                                                                }}
                                                                onUploadError={(error) => {
                                                                    toast.error(`Upload Failed: ${error.message}`)
                                                                }}
                                                            />
                                                        )
                                                        }
                                                    </div>

                                                    {/* Video Clip Upload */}
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-bold uppercase text-blue-950">Video Clip</label>

                                                        {clipUploaded && formData.clip_url ? (
                                                            <div className="bg-white border border-brand-accent p-3 rounded-2xl shadow-sm flex flex-col gap-3 animate-in fade-in">
                                                                <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative group/video cursor-pointer">
                                                                    <video
                                                                        src={formData.clip_url}
                                                                        className="w-full h-full object-cover"
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
                                                                    />
                                                                    <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity pointer-events-none">
                                                                        <div className="bg-black/50 text-white p-2 rounded-full backdrop-blur-sm"><Film size={16} /></div>
                                                                    </div>
                                                                </div>
                                                                <div className='flex justify-between items-center px-1'>
                                                                    <span className="text-[9px] font-bold text-green-600 uppercase">Video Uploaded Successfully</span>
                                                                    <div className="flex gap-3">
                                                                        <button type="button" onClick={() => triggerMediaAction('clip', 'change')} className="text-[10px] underline font-bold text-blue-600">Change</button>
                                                                        <button type="button" onClick={() => triggerMediaAction('clip', 'delete')} className="text-[10px] underline font-bold text-red-500">Remove</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <UploadButton
                                                                endpoint="videoUploader"
                                                                appearance={{
                                                                    button: "w-full bg-brand-primary text-white text-[6px] md:text-[10px] p-4 rounded-xl after:bg-brand-secondary",
                                                                    allowedContent: "text-brand-secondary text-[10px] font-bold uppercase",
                                                                }}
                                                                onClientUploadComplete={(res) => {
                                                                    setFormData({ ...formData, clip_url: res[0].url });
                                                                    setClipUploaded(true);
                                                                    toast.success("Video clip uploaded successfully");
                                                                }}
                                                                onUploadError={(error) => {
                                                                    toast.error(`Upload Failed: ${error.message}`)
                                                                }}
                                                            />
                                                        )
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* NEW: Cross-Platform Links */}
                                        <div className='flex flex-col gap-2 mt-2'>
                                            <label className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Step 4: Fill Service Links</label>
                                            <div className="bg-brand-surface p-6 rounded-2xl border border-brand-accent space-y-4">
                                                <p className="text-[10px] font-bold text-brand-secondary uppercase flex items-center gap-2">
                                                    <LinkIcon size={14}/> External Platform Links (Optional)
                                                </p>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-3.5 text-xs font-bold text-gray-400 w-16">IG URL:</span>
                                                        <input type="url" placeholder="https://instagram.com/..." className="w-full p-3 pl-20 border rounded-lg bg-white text-brand-primary text-sm" value={formData.link_ig || ""} onChange={(e) => setFormData({...formData, link_ig: e.target.value})} />
                                                    </div>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-3.5 text-xs font-bold text-gray-400 w-16">X URL:</span>
                                                        <input type="url" placeholder="https://x.com/..." className="w-full p-3 pl-20 border rounded-lg bg-white text-brand-primary text-sm" value={formData.link_twitter || ""} onChange={(e) => setFormData({...formData, link_twitter: e.target.value})} />
                                                    </div>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-3.5 text-xs font-bold text-gray-400 w-16">FB URL:</span>
                                                        <input type="url" placeholder="https://facebook.com/..." className="w-full p-3 pl-20 border rounded-lg bg-white text-brand-primary text-sm" value={formData.link_facebook || ""} onChange={(e) => setFormData({...formData, link_facebook: e.target.value})} />
                                                    </div>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-3.5 text-xs font-bold text-gray-400 w-20">Spotify:</span>
                                                        <input type="url" placeholder="https://open.spotify.com/..." className="w-full p-3 pl-24 border rounded-lg bg-white text-brand-primary text-sm" value={formData.link_spotify || ""} onChange={(e) => setFormData({...formData, link_spotify: e.target.value})} />
                                                    </div>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-3.5 text-xs font-bold text-gray-400 w-20">Apple:</span>
                                                        <input type="url" placeholder="https://podcasts.apple.com/..." className="w-full p-3 pl-24 border rounded-lg bg-white text-brand-primary text-sm" value={formData.link_apple || ""} onChange={(e) => setFormData({...formData, link_apple: e.target.value})} />
                                                    </div>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-3.5 text-xs font-bold text-gray-400 w-20">YT Music:</span>
                                                        <input type="url" placeholder="https://music.youtube.com/..." className="w-full p-3 pl-24 border rounded-lg bg-white text-brand-primary text-sm" value={formData.link_ytmusic || ""} onChange={(e) => setFormData({...formData, link_ytmusic: e.target.value})} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className='flex flex-col w-full'>
                                    <label className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Step 5: Sermon Note</label>
                                    <div className="bg-white rounded-lg border border-gray-300 w-full flex flex-col overflow-hidden shadow-sm">
                                        <ReactQuill
                                            theme="snow"
                                            placeholder="Write your sermon notes here... You can use bold, italics, colors, and headers!"
                                            value={formData.content}
                                            onChange={(content) => setFormData({...formData, content})}
                                            modules={quillModules}
                                            className="flex flex-col text-black h-64 sm:h-72 md:h-96 lg:h-[500px] mb-12 md:mb-16 [&_.ql-toolbar]:flex [&_.ql-toolbar]:flex-wrap [&_.ql-toolbar]:justify-center md:[&_.ql-toolbar]:justify-start [&_.ql-container]:flex-1 [&_.ql-container]:overflow-y-auto [&_.ql-editor]:min-h-full"
                                        />
                                    </div>
                                </div>

                                <div className='flex flex-col pt-6'>
                                    <label className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Step 6: Publish Sermon or Save As Draft</label>
                                    <div className="flex flex-col md:flex-row gap-4 pt-1">
                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={() => handleSubmit('draft')}
                                            className="flex-1 bg-white border-2 border-brand-primary text-brand-primary py-5 rounded-2xl font-bold hover:bg-brand-primary/5 transition-all"
                                        >
                                            {loading ? "Saving..." : "Save as Draft"}
                                        </button>

                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={() => handleSubmit('published')}
                                            className="flex-[2] bg-brand-primary text-white py-5 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all"
                                        >
                                            {loading ? "Publishing..." : "Publish Sermon Live"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            <ConfirmModal
                isOpen={showDeleteModal}
                title={mediaAction?.action === 'delete' ? "Remove Media?" : "Replace Media?"}
                message={
                    mediaAction?.action === 'delete'
                        ? `Are you sure you want to permanently delete this ${mediaAction?.type}?`
                        : `This will remove the current ${mediaAction?.type} so you can upload a new one. Do you want to proceed?`
                }
                variant={mediaAction?.action === 'delete' ? "danger" : "primary"}
                confirmText={mediaAction?.action === 'delete' ? "Yes, Remove" : "Yes, Replace"}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmMediaAction}
            />
        </div>
    );
}