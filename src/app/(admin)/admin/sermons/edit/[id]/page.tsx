"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";
import ConfirmModal from "@/components/Admin/ConfirmModal";
import {Film, LinkIcon, Lock} from "lucide-react"; // Import the Lock icon
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function EditSermonPage() {
    const router = useRouter();
    const { id } = useParams();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [mediaAction, setMediaAction] = useState<{
        type: 'banner' | 'clip' | 'youtube';
        action: 'delete' | 'change';
    } | null>(null);

    const [category, setCategory] = useState<"Weekly" | "Monthly" | "Special" | "">("");
    const [weeklyType, setWeeklyType] = useState<"Sunday" | "Tuesday" | "Thursday" | "">("");
    const [isThanksgiving, setIsThanksgiving] = useState(false);
    const [isMultiDay, setIsMultiDay] = useState(false);

    const [bannerUploaded, setBannerUploaded] = useState(false);
    const [clipUploaded, setClipUploaded] = useState(false);

    const [savedCoHosts, setSavedCoHosts] = useState<string[]>([]);
    const [savedSpecialNames, setSavedSpecialNames] = useState<string[]>([]);
    const [savedMonthlyNames, setSavedMonthlyNames] = useState<string[]>([]);

    useEffect(() => {
        async function getSuggestions() {
            const { data } = await supabase.from("sermons").select("service_category, co_host, special_service_name");
            if (data) {
                const hosts = Array.from(new Set(data.map(i => i.co_host).filter(Boolean)));

                const specialNames = Array.from(new Set(data.filter(i => i.service_category === "Special").map(i => i.special_service_name).filter(Boolean)));
                const monthlyNames = Array.from(new Set(data.filter(i => i.service_category === "Monthly").map(i => i.special_service_name).filter(Boolean)));

                setSavedCoHosts(hosts);
                setSavedSpecialNames(specialNames);
                setSavedMonthlyNames(monthlyNames);            }
        }
        getSuggestions();
    }, []);

    useEffect(() => {
        async function getSuggestions() {
            const { data } = await supabase.from("sermons").select("service_category, co_host, special_service_name");
            if (data) {
                const hosts = Array.from(new Set(data.map(i => i.co_host).filter(Boolean)));

                const specialNames = Array.from(new Set(data.filter(i => i.service_category === "Special").map(i => i.special_service_name).filter(Boolean)));
                const monthlyNames = Array.from(new Set(data.filter(i => i.service_category === "Monthly").map(i => i.special_service_name).filter(Boolean)));

                setSavedCoHosts(hosts);
                setSavedSpecialNames(specialNames);
                setSavedMonthlyNames(monthlyNames);            }
        }
        getSuggestions();
    }, []);

    const [formData, setFormData] = useState({
        title: "",
        preacher: "",
        bible_text: "",
        content: "",
        service_date: "",
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
        async function loadSermon() {
            const { data, error } = await supabase
                .from("sermons").select("*").eq("id", id).single();

            if (data && !error) {
                setFormData(data);
                setCategory(data.service_category);
                setWeeklyType(data.weekly_type);
                setIsThanksgiving(data.is_thanksgiving);
                setIsMultiDay(data.is_multi_day);
                if (data.banner_url) setBannerUploaded(true);
                if (data.clip_url) setClipUploaded(true);
            }
            setFetching(false);
        }
        loadSermon();
    }, [id]);

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

    const handleSubmit = async (targetStatus: "draft" | "published") => {
        setLoading(true);

        const { id: _, created_at, ...cleanFormData } = formData as any;

        const submission = {
            ...formData,
            status: targetStatus,
            service_category: category,
            weekly_type: category === "Weekly" ? weeklyType : "",
            is_thanksgiving: category === "Weekly" && weeklyType === "Sunday" ? isThanksgiving : false,
            is_multi_day: category === "Special" ? isMultiDay : false,
        };

        const { error } = await supabase.from("sermons").update(submission).eq("id", id);

        if (error) {
            toast.error(error.message);
            setLoading(false);
        } else {
            toast.success(
                targetStatus === 'published'
                    ? "Sermon is now live!"
                    : "Unpublished: Sermon moved to Drafts"
            );

            const targetPath = targetStatus === 'published' ? "/admin/sermons" : "/admin/sermons?tab=draft";
            router.push(targetPath);
            router.refresh();
        }
    };

    const todayObj = new Date();
    const localMaxDate = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

    if (fetching) return <div className="p-20 text-center font-bold text-brand-primary">Loading...</div>;

    return (
        <div className="min-h-screen bg-brand-surface p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <Link href="/admin/sermons" className="text-sm font-bold text-brand-secondary mb-6 block">← Back to Sermons Dashboard</Link>
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-brand-accent">
                    <h1 className="text-3xl font-serif font-bold text-brand-primary mb-8">Edit Sermon</h1>

                    <form className="space-y-10">

                        {/* LOCKED Step 1: Category */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-purple-400">Step 1: Service Category</label>
                                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1"><Lock size={10}/> Locked</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-75 text-center">
                                {["Weekly", "Monthly", "Special"].map((item) => (
                                    <div
                                        key={item}
                                        className={`p-6 rounded-2xl border-2 font-bold cursor-not-allowed ${category === item ? "border-brand-primary bg-brand-primary/5 text-brand-primary" : "border-gray-100 bg-gray-50 text-gray-300"}`}
                                    >
                                        {item === "Weekly" ? "Weekly / Fixed" : item === "Monthly" ? "Monthly" : "Special Service"}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weekly Branch - LOCKED Tabs, Editable Content */}
                        {category === "Weekly" && (
                            <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-purple-400">Step 1.1: Edit/Change Day of the Week</label>
                                    <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1"><Lock size={10}/> Locked</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-75 text-center">
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
                                    <div className="bg-slate-50 p-6 rounded-2xl space-y-6">
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-purple-400">Step 1.2: Edit/Change Sunday Service Information</label>
                                            <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1"><Lock size={10}/> Locked</span>
                                        </div>
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
                                                    className="p-3 rounded-lg border bg-white"
                                                    value={formData.host}
                                                    onChange={(e) => setFormData({...formData, host: e.target.value})}
                                                >
                                                    <option>General/Last Sunday</option>
                                                    <option>Men</option>
                                                    <option>Women</option>
                                                    <option>Youth</option>
                                                </select>
                                                <select
                                                    className="p-3 rounded-lg border bg-white"
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

                        {/* Special Branch - Locked Tabs, Editable Content */}
                        {category === "Special" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                                <label className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-1">Step 2: Edit/Change Service Info</label>
                                <div className="space-y-4">
                                    <input
                                        list="specialNames"
                                        placeholder="Service Name (e.g. Wind of Change)"
                                        className="w-full p-4 border rounded-xl text-lg font-serif text-brand-primary"
                                        value={formData.special_service_name}
                                        onChange={(e) => setFormData({...formData, special_service_name: e.target.value})}
                                    />
                                    <datalist id="specialNames">{savedSpecialNames.map(n => <option key={n} value={n} />)}</datalist>
                                </div>

                                <div className="space-y-4">
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
                            </div>
                        )}

                        {/* MEDIA & REMAINING FIELDS */}
                        {(weeklyType || category === "Monthly" || category === "Special") && (
                            <div className="pt-10 border-t border-gray-100 space-y-6">
                                <label className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-1">Step 2: Edit/Change Service Info</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input
                                        required
                                        placeholder="Title"
                                        className="p-3 border rounded-lg text-brand-primary"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    />
                                    <input
                                        required
                                        placeholder="Preacher"
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
                                        max={localMaxDate}
                                        className="p-3 border rounded-lg text-brand-primary"
                                        value={formData.service_date}
                                        onChange={(e) => {
                                            if (e.target.value > localMaxDate) {
                                                toast.error("You cannot select a future date for a recorded service!");
                                                setFormData({...formData, service_date: localMaxDate});
                                            } else {
                                                setFormData({...formData, service_date: e.target.value});
                                            }
                                        }}
                                    />
                                </div>

                                <div className='flex flex-col gap-2 mt-2'>
                                    <label className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Step 3: Edit/Change Sermon Media</label>
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
                                                <label className="text-[10px] font-bold uppercase text-blue-950 block">Sermon Banner</label>
                                                {bannerUploaded && formData.banner_url ? (
                                                    <div className="bg-white border border-brand-accent p-3 rounded-2xl shadow-sm flex flex-col gap-3 animate-in fade-in">
                                                        <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden relative">
                                                            <img src={formData.banner_url} alt="Sermon Banner" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className='flex justify-between items-center px-1'>
                                                            <span className="text-[9px] font-bold text-green-600 uppercase">Uploaded</span>
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
                                                            allowedContent: "text-brand-secondary text-[6px] md:text-[10px] font-bold uppercase",
                                                        }}
                                                        content={{
                                                            button({ ready }) {
                                                                if (ready) return "Select Banner Image";
                                                                return "Image UpLoading";
                                                            },
                                                        }}
                                                        onClientUploadComplete={(res) => {
                                                            setFormData({ ...formData, banner_url: res[0].url });
                                                            setBannerUploaded(true);
                                                        }}
                                                        onUploadError={(error) => {
                                                            toast.error(`Upload Failed: ${error.message}`)
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            {/* Video Clip Upload */}
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold uppercase text-blue-950 block">Video Clip</label>

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
                                                            <span className="text-[9px] font-bold text-green-600 uppercase">Attached</span>
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
                                                            allowedContent: "text-brand-secondary text-[6px] md:text-[10px] font-bold uppercase",
                                                        }}
                                                        content={{
                                                            button({ ready }) {
                                                                if (ready) return "Select Video Clip";
                                                                return "Loading...";
                                                            },
                                                        }}
                                                        onClientUploadComplete={(res) => {
                                                            setFormData({ ...formData, clip_url: res[0].url });
                                                            setClipUploaded(true);
                                                        }}
                                                        onUploadError={(error) => {
                                                            toast.error(`Upload Failed: ${error.message}`)
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* NEW: Cross-Platform Links */}
                                <div className='flex flex-col gap-2 mt-2'>
                                    <label className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Step 4: Edit/Change Service Links</label>
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

                                <div className='flex flex-col w-full'>
                                    <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">
                                        Step 5: Edit/Change Sermon Note
                                    </label>

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
                                            {loading ? "Saving..." : "Revert to Draft"}
                                        </button>

                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={() => handleSubmit('published')}
                                            className="flex-[2] bg-brand-primary text-white py-5 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all"
                                        >
                                            {loading ? "Updating..." : "Save Changes"}
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