"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { UploadButton } from "@/utils/uploadthing";

export default function EditSermonPage() {
    const router = useRouter();
    const { id } = useParams();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [category, setCategory] = useState<"Weekly" | "Special" | "">("");
    const [weeklyType, setWeeklyType] = useState<"Sunday" | "Tuesday" | "Thursday" | "">("");
    const [isThanksgiving, setIsThanksgiving] = useState(false);
    const [isMultiDay, setIsMultiDay] = useState(false);

    // Tracks if we are showing the "Uploaded" badge or the "Upload" button
    const [bannerUploaded, setBannerUploaded] = useState(false);
    const [clipUploaded, setClipUploaded] = useState(false);

    const [formData, setFormData] = useState({
        title: "", preacher: "", bible_text: "", content: "",
        service_date: "", host: "", co_host: "",
        service_number: "", special_service_name: "", day_identifier: "",
        youtube_url: "", banner_url: "", clip_url: "",
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

    const handleMediaReset = (type: 'banner' | 'clip') => {
        const confirmChange = confirm("Warning: If you change this, it will override the file you uploaded previously. Continue?");
        if (confirmChange) {
            if (type === 'banner') setBannerUploaded(false);
            else setClipUploaded(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const submission = {
            ...formData,
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
            router.push("/sermons");
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
                    <form onSubmit={handleSubmit} className="space-y-10">

                        {/* CATEGORY & BRANCH LOGIC (Keep your existing JSX here) */}
                        {/* ... Category Buttons ... */}
                        {/* ... Weekly/Special Fields ... */}

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
                                                    <button type="button" onClick={() => handleMediaReset('banner')} className="text-[10px] underline">Change Image</button>
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
                                                    onUploadError={(error: Error) => alert(`Upload Failed: ${error.message}`)}
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
                                                            onClick={() => handleMediaReset('clip')}
                                                            className="text-[10px] underline">Change Video</button>
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
                                                    onUploadError={(error: Error) => alert(`Upload Failed: ${error.message}`)}
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

                                <button disabled={loading} className="w-full bg-brand-primary text-white py-5 rounded-2xl font-bold transition-all">
                                    {loading ? "Updating..." : "Save Changes"}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}