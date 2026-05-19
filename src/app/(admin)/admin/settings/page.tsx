"use client";
import React, {useEffect, useState} from "react";
import {Globe, Loader2, Lock, MapPin, Phone, Plus, Radio, Save, Share2, Trash2} from "lucide-react";
import {supabase} from "@/lib/supabase";
import {toast} from "sonner";
import Link from "next/link";
import AdminSkeletonLoader from "@/components/Admin/SkeletonLoader";

interface ExtraSocial {
    name: string;
    url: string;
}

export default function GlobalSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        // General
        church_name: "",
        parish_name: "",
        denomination: "",
        // Address
        address_street: "",
        address_city: "",
        address_country: "",
        google_maps_link: "",
        // Contact
        phone_primary: "",
        phone_link: "",
        email_public: "",
        whatsapp_number: "",
        email_tech_support: "",
        // Socials (Main)
        instagram_url: "",
        facebook_url: "",
        youtube_url: "",
        twitter_url: "",
        // Socials (Dynamic)
        extra_social_links: [] as ExtraSocial[],
        // Audio
        mixlr_url: "",
        spotify_url: "",
        apple_podcasts_url: "",
        youtube_music_url: ""
    });

    useEffect(() => {
        const fetchSettings = async () => {
            const {data, error} = await supabase
                .from("site_settings")
                .select("*")
                .single();

            if (error) {
                toast.error("Failed to load settings");
            } else if (data) {
                setFormData({
                    ...data,
                    // Ensure it always loads as an array, even if null in DB
                    extra_social_links: data.extra_social_links || []
                });
            }
            setLoading(false);
        };

        fetchSettings().catch(error => console.error("Error fetching settings:", error));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    // --- Dynamic Extra Social Links Logic ---
    const handleAddSocial = () => {
        setFormData(prev => ({
            ...prev,
            extra_social_links: [...prev.extra_social_links, {name: "", url: ""}]
        }));
    };

    const handleExtraSocialChange = (index: number, field: "name" | "url", value: string) => {
        const updated = [...formData.extra_social_links];
        updated[index][field] = value;
        setFormData(prev => ({...prev, extra_social_links: updated}));
    };

    const handleRemoveSocial = (index: number) => {
        const updated = [...formData.extra_social_links];
        updated.splice(index, 1);
        setFormData(prev => ({...prev, extra_social_links: updated}));
    };

    // ----------------------------------------
    const handleSave = async () => {
        setSaving(true);
        const {error} = await supabase
            .from("site_settings")
            .update(formData)
            .eq("id", 1);

        if (error) {
            toast.error("Failed to save changes");
        } else {
            toast.success("Settings updated successfully!");
        }
        setSaving(false);
    };

    if (loading) {
        return <AdminSkeletonLoader variant="settings-form"/>;
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-24">

            <div className="mb-6 md:mb-8">
                <Link
                    href="/admin"
                    className="text-xs md:text-sm text-brand-secondary font-bold hover:underline">
                    <span className="text-lg leading-none">←</span> Back to Admin Dashboard
                </Link>
            </div>

            {/* 1. PAGE HEADER */}
            <div
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">

                <div>
                    <h1 className="text-2xl md:text-3xl font-serif font-black text-brand-primary">Global
                        Settings</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage the public links, emails, and physical location
                        of
                        the church.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 bg-brand-primary text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>}
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 2. GENERAL INFO CARD */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 h-fit space-y-5">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <Globe className="text-brand-secondary" size={22}/>
                        <h2 className="text-xl font-bold text-brand-primary">Identity</h2>
                    </div>
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase ml-1">Church Name</label>
                        <input name="church_name" value={formData.church_name} onChange={handleChange}
                               className="w-full p-3 mt-1 bg-gray-50 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"/>
                    </div>
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase ml-1">Parish Details</label>
                        <input name="parish_name" value={formData.parish_name} onChange={handleChange}
                               className="w-full p-3 mt-1 bg-gray-50 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"/>
                    </div>
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase ml-1">Denomination</label>
                        <input name="denomination" value={formData.denomination} onChange={handleChange}
                               className="w-full p-3 mt-1 bg-gray-50 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"/>
                    </div>
                </div>

                {/* 3. LOCATION CARD */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 h-fit space-y-5">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <MapPin className="text-brand-secondary" size={22}/>
                        <h2 className="text-xl font-bold text-brand-primary">Address</h2>
                    </div>
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase ml-1">Street Address</label>
                        <input name="address_street" value={formData.address_street} onChange={handleChange}
                               className="w-full p-3 mt-1 bg-gray-50 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase ml-1">City</label>
                            <input name="address_city" value={formData.address_city} onChange={handleChange}
                                   className="w-full p-3 mt-1 text-black bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"/>
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase ml-1">Country</label>
                            <input name="address_country" value={formData.address_country} onChange={handleChange}
                                   className="w-full p-3 mt-1 text-black bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"/>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase ml-1">Google Maps Link</label>
                        <input name="google_maps_link" value={formData.google_maps_link} onChange={handleChange}
                               placeholder="https://maps.google.com/..."
                               className="w-full p-3 mt-1 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-blue-900"/>
                    </div>
                </div>

                {/* 4. CONTACT CARD */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 h-fit space-y-5">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <Phone className="text-brand-secondary" size={22}/>
                        <h2 className="text-xl font-bold text-brand-primary">Contact Info</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase ml-1">Display Phone</label>
                            <input name="phone_primary" value={formData.phone_primary} onChange={handleChange}
                                   placeholder="+234 (0) 123..."
                                   className="w-full p-3 mt-1 bg-gray-50 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"/>
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase ml-1">Dial Link (No
                                Spaces)</label>
                            <input name="phone_link" value={formData.phone_link} onChange={handleChange}
                                   placeholder="+2341234567890"
                                   className="w-full p-3 mt-1 bg-gray-50 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase ml-1">Public Email</label>
                            <input name="email_public" value={formData.email_public} onChange={handleChange}
                                   className="w-full p-3 mt-1 bg-gray-50 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"/>
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase ml-1">WhatsApp (No + or
                                Spaces)</label>
                            <input name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange}
                                   placeholder="2340000000000"
                                   className="w-full p-3 mt-1 bg-green-50 text-black border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none"/>
                        </div>
                    </div>

                    {/* Developer Lock Section */}
                    <div
                        className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-1.5 text-xs font-black text-slate-500 uppercase">
                                <Lock size={12}/> Tech Support Route
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">System errors are forwarded to the Dev
                                Team.</p>
                        </div>
                        <div
                            className="px-4 py-2 bg-slate-200 text-slate-600 font-medium text-sm rounded-lg w-full sm:w-auto text-center cursor-not-allowed">
                            {formData.email_tech_support || "Dev Email Locked"}
                        </div>
                    </div>
                </div>

                {/* 5. AUDIO & PODCASTS CARD */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 h-fit space-y-5">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <Radio className="text-brand-secondary" size={22}/>
                        <h2 className="text-xl font-bold text-brand-primary">Audio Ministries</h2>
                    </div>
                    <div>
                        <label className="text-xs font-black text-amber-600 uppercase ml-1">Mixlr Link (Live
                            Radio)</label>
                        <input name="mixlr_url" value={formData.mixlr_url} onChange={handleChange}
                               className="w-full p-3 mt-1 bg-amber-50/50 text-amber-400 border border-amber-100 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none"/>
                    </div>
                    <div>
                        <label className="text-xs font-black text-[#1DB954] uppercase ml-1">Spotify Podcast</label>
                        <input name="spotify_url" value={formData.spotify_url} onChange={handleChange}
                               className="w-full p-3 mt-1 bg-[#1DB954]/5 text-[#1DB954] border border-[#1DB954]/20 rounded-xl focus:ring-2 focus:ring-[#1DB954]/20 outline-none"/>
                    </div>
                    <div>
                        <label className="text-xs font-black text-purple-600 uppercase ml-1">Apple Podcasts</label>
                        <input name="apple_podcasts_url" value={formData.apple_podcasts_url} onChange={handleChange}
                               className="w-full p-3 mt-1 bg-purple-50 text-purple-400 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500/20 outline-none"/>
                    </div>
                    <div>
                        <label className="text-xs font-black text-red-600 uppercase ml-1">YouTube Music</label>
                        <input name="youtube_music_url" value={formData.youtube_music_url} onChange={handleChange}
                               className="w-full p-3 mt-1 bg-red-50 text-red-400 border border-red-100 rounded-xl focus:ring-2 focus:ring-red-500/20 outline-none"/>
                    </div>
                </div>

                {/* 6. SOCIAL MEDIA CARD (Full Width) */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 lg:col-span-2">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4 mb-6">
                        <Share2 className="text-brand-secondary" size={22}/>
                        <h2 className="text-xl font-bold text-brand-primary">Social Networks</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase ml-1">Instagram URL</label>
                            <input name="instagram_url" value={formData.instagram_url} onChange={handleChange}
                                   className="w-full p-3 mt-1 text-pink-400 bg-pink-50/50 border border-pink-100 rounded-xl focus:ring-2 focus:ring-pink-400/20 outline-none"/>
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase ml-1">Facebook URL</label>
                            <input name="facebook_url" value={formData.facebook_url} onChange={handleChange}
                                   className="w-full p-3 mt-1 bg-blue-50/50 text-blue-400 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-400/20 outline-none"/>
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase ml-1">YouTube
                                Channel</label>
                            <input name="youtube_url" value={formData.youtube_url} onChange={handleChange}
                                   className="w-full p-3 mt-1 bg-red-50/50 text-red-400 border border-red-100 rounded-xl focus:ring-2 focus:ring-red-400/20 outline-none"/>
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase ml-1">X (Twitter)
                                URL</label>
                            <input name="twitter_url" value={formData.twitter_url} onChange={handleChange}
                                   className="w-full p-3 mt-1 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400/20 outline-none"/>
                        </div>
                    </div>

                    {/* Dynamic Extra Links */}
                    <div className="border-t border-gray-100 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-brand-primary uppercase tracking-widest">Additional
                                Links</h3>
                            <button
                                onClick={handleAddSocial}
                                className="flex items-center gap-1.5 text-xs font-bold text-brand-secondary hover:text-brand-primary bg-brand-surface px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Plus size={14} strokeWidth={3}/> Add Link
                            </button>
                        </div>

                        {formData.extra_social_links.length === 0 ? (
                            <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center">No
                                extra
                                links added yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {formData.extra_social_links.map((social, idx) => (
                                    <div key={idx}
                                         className="flex flex-col sm:flex-row gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200 animate-in slide-in-from-top-2">
                                        <div className="sm:w-1/3">
                                            <input
                                                placeholder="Platform (e.g. TikTok)"
                                                value={social.name}
                                                onChange={(e) => handleExtraSocialChange(idx, "name", e.target.value)}
                                                className="w-full p-2.5 text-black bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-secondary"
                                            />
                                        </div>
                                        <div className="flex-1 flex gap-2">
                                            <input
                                                placeholder="https://..."
                                                value={social.url}
                                                onChange={(e) => handleExtraSocialChange(idx, "url", e.target.value)}
                                                className="w-full p-2.5 text-black bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-secondary"
                                            />
                                            <button
                                                onClick={() => handleRemoveSocial(idx)}
                                                className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors flex-shrink-0"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>


        </div>
    );
}