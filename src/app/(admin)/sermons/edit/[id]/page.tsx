"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { UploadButton } from "@/utils/uploadthing";
import {toast} from "sonner";
import ConfirmModal from "@/components/Admin/ConfirmModal";

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

    const [category, setCategory] = useState<"Weekly" | "Special" | "">("");
    const [weeklyType, setWeeklyType] = useState<"Sunday" | "Tuesday" | "Thursday" | "">("");
    const [isThanksgiving, setIsThanksgiving] = useState(false);
    const [isMultiDay, setIsMultiDay] = useState(false);

    const [bannerUploaded, setBannerUploaded] = useState(false);
    const [clipUploaded, setClipUploaded] = useState(false);

    const [savedCoHosts, setSavedCoHosts] = useState<string[]>([]);
    const [savedSpecialNames, setSavedSpecialNames] = useState<string[]>([]);

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
    });

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

    useEffect(() => {
        async function getSuggestions() {
            const { data } = await supabase.from("sermons").select("co_host, special_service_name");
            if (data) {
                const hosts = Array.from(new Set(data.map(i => i.co_host).filter(Boolean)));
                const names = Array.from(new Set(data.map(i => i.special_service_name).filter(Boolean)));
                setSavedCoHosts(hosts);
                setSavedSpecialNames(names);
            }
        }
        getSuggestions();
    }, []);

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
            alert(error.message);
            setLoading(false);
        } else {
            toast.success(
                targetStatus === 'published'
                    ? "Sermon is now live!"
                    : "Unpublished: Sermon moved to Drafts"
            );

            const targetPath = targetStatus === 'published' ? "/sermons" : "/sermons?tab=draft";
            router.push(targetPath);
            router.refresh();
        }
    };

    if (fetching) return <div className="p-20 text-center font-bold text-brand-primary">Loading...</div>;

    return (
        <div className="min-h-screen bg-brand-surface p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <Link href="/sermons" className="text-sm font-bold text-brand-secondary mb-6 block">← Back to List</Link>
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-brand-accent">
                    <h1 className="text-3xl font-serif font-bold text-brand-primary mb-8">Edit Sermon</h1>
                    <form className="space-y-10">

                        {/* MEDIA & REMAINING FIELDS */}
                        {(weeklyType || category === "Special") && (
                            <div className="pt-10 border-t border-gray-100 space-y-6">
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
                                        className="p-3 border rounded-lg text-brand-primary"
                                        value={formData.service_date}
                                        onChange={(e) => setFormData({...formData, service_date: e.target.value})}
                                    />
                                </div>

                                {weeklyType === "Sunday" && (
                                    <div className="bg-slate-50 p-6 rounded-2xl space-y-6">
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

                                {category === "Special" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                ) }


                                <div className="bg-brand-surface p-6 rounded-2xl border border-brand-accent space-y-4">
                                    <p className="text-[10px] font-bold text-brand-secondary uppercase">Media Attachments (Recommended)</p>
                                    <input
                                        placeholder="YouTube URL (Optional)"
                                        className="w-full p-3 border rounded-lg bg-white text-brand-primary"
                                        value={formData.youtube_url}
                                        onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
                                    />

                                    <div className="flex flex-col gap-8">
                                        {/* Banner Upload */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase text-blue-950">Sermon Banner</label>
                                            {bannerUploaded ? (
                                                /* This is your "Actual Banner" success state */
                                                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center justify-between animate-in fade-in">
                                                    <span className="text-xs font-bold font-sans">✓ Image Uploaded</span>
                                                    <div className='flex gap-4'>
                                                        <button type="button" onClick={() => triggerMediaAction('banner', 'change')} className="text-[10px] underline">Change Image</button>
                                                        <button type="button" onClick={() => triggerMediaAction('banner', 'delete')} className="text-[10px] font-bold underline text-red-600">Remove</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <UploadButton
                                                    endpoint="imageUploader"
                                                    appearance={{
                                                        button: "bg-brand-primary text-white p-4 rounded-xl after:bg-brand-secondary",
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

                                            {clipUploaded ? (
                                                <div
                                                    className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-xl flex items-center justify-between animate-in fade-in"
                                                >
                                                    <span className="text-xs font-bold font-sans">✓ Video Clip Attached</span>
                                                    <button type="button"
                                                            onClick={() => triggerMediaAction('clip', 'change')}
                                                            className="text-[10px] font-bold text-blue-600 hover:underline">Change Video
                                                    </button>
                                                    <button
                                                        onClick={() => triggerMediaAction('clip', 'delete')}
                                                        className="text-[10px] font-bold text-red-500 hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            ) : (
                                                <UploadButton
                                                    endpoint="videoUploader"
                                                    appearance={{
                                                        button: "bg-brand-primary text-white p-4 rounded-xl after:bg-brand-secondary",
                                                        allowedContent: "text-brand-secondary text-[10px] font-bold uppercase",
                                                    }}
                                                    onClientUploadComplete={(res) => {
                                                        setFormData({ ...formData, clip_url: res[0].url });
                                                        setClipUploaded(true);
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

                                <textarea
                                    placeholder="Sermon Notes..."
                                    rows={6}
                                    className="w-full p-3 border rounded-lg text-brand-primary"
                                    value={formData.content}
                                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                                />

                                <div className="flex flex-col md:flex-row gap-4 pt-6">
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
                                        {loading ? "Updating..." : "Save Changes"}
                                    </button>
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