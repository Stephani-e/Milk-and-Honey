"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import ConfirmModal from "@/components/Admin/ConfirmModal";
import AdminFilter from "@/components/Admin/AdminFilter";
import { useAuth } from "@/components/Admin/Admin Guard";
import {
    Plus, Megaphone, Trash2, RotateCcw, Archive,
    Edit3, Clock, ExternalLink, PauseCircle, PlayCircle, Filter, ChevronLeft, ChevronRight, ChevronUp
} from "lucide-react";

const PAGE_SIZE = 12;

export default function AdsDashboardPage() {
    const router = useRouter();
    const { role } = useAuth();
    const searchParams = useSearchParams();
    const [showBackToTop, setShowBackToTop] = useState(false);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };
    const initialTab = searchParams.get("tab");

    // 1. Tab View State
    const [view, setView] = useState<"active" | "inactive" | "archive" | "trash">(
        initialTab === "inactive" ? "inactive" :
            initialTab === "archive" ? "archive" :
                initialTab === "trash" ? "trash" : "active"
    );

    // 2. Data & Pagination State
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // 3. Filter & Search State
    const [searchTerm, setSearchTerm] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [filterType, setFilterType] = useState(""); // church_event | external_business
    const [filterPlacement, setFilterPlacement] = useState(""); // global_top | global_sidebar

    const [modalType, setModalType] = useState<"delete" | "archive" | "restore" | null>(null);
    const [selectedAd, setSelectedAd] = useState<any | null>(null);

    // Watch for Search Input with Debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search !== searchTerm) {
                setSearch(searchTerm);
                setCurrentPage(1); // Reset to page 1 on a new search
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, search]);

    // Sync Tab to URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        params.set("tab", view);
        router.replace(`${window.location.pathname}?${params.toString()}`);
    }, [view, router]);

    useEffect(() => {
        const handleScroll = () => {
            // Show the button once the user scrolls down 400 pixels
            setShowBackToTop(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);

        // Clean up the event listener when the component unmounts
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Fetch Data whenever relevant dependencies change
    useEffect(() => {
        fetchAds();
    }, [currentPage, search, sortBy, view, filterType, filterPlacement]);

    async function fetchAds() {
        setLoading(true);
        const from = (currentPage - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase.from("advertisements").select("*", { count: 'exact' });

        // Apply Tab Filters
        if (view === "trash") {
            query = query.not("deleted_at", "is", null);
        } else {
            query = query.is("deleted_at", null);
            if (view === "archive") query = query.eq("status", "archived");
            else if (view === "inactive") query = query.eq("status", "inactive");
            else query = query.eq("status", "active");
        }

        // Apply Search Filter
        if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

        // Apply New Dropdown Filters
        if (filterType) query = query.eq("ad_type", filterType);
        if (filterPlacement) query = query.eq("placement", filterPlacement);

        // Apply Sorting
        if (sortBy === "alphabetical") query = query.order("title", { ascending: true });
        else query = query.order("created_at", { ascending: sortBy === "oldest" });

        const { data, count, error } = await query.range(from, to);

        if (error) toast.error("Error loading ads: " + error.message);
        else {
            setAds(data || []);
            setTotalCount(count || 0);
        }
        setLoading(false);
    }

    // Handle Tab Changes safely (resets pagination)
    const handleTabChange = (newView: "active" | "inactive" | "archive" | "trash") => {
        setView(newView);
        setCurrentPage(1);
    };

    // Calculate total pages for the current tab/filters
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const getDaysLeft = (targetDate: string, isTrash: boolean = false) => {
        const date = new Date(targetDate);
        if (isTrash) date.setDate(date.getDate() + 30);
        const today = new Date();
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const toggleAdStatus = async (ad: any) => {
        const newStatus = ad.status === 'active' ? 'inactive' : 'active';
        const { error } = await supabase.from("advertisements").update({ status: newStatus }).eq("id", ad.id);

        if (error) toast.error("Failed to update status");
        else {
            toast.success(`Campaign ${newStatus === 'active' ? 'resumed' : 'paused'}`);
            fetchAds();
        }
    };

    const handleConfirmAction = async () => {
        if (!selectedAd) return;

        if (modalType === "delete") {
            if (view === "trash") {
                await supabase.from("advertisements").delete().eq("id", selectedAd.id);
                toast.error("Ad campaign permanently purged.");
            } else {
                await supabase.from("advertisements").update({ deleted_at: new Date(), status: 'inactive' }).eq("id", selectedAd.id);
                toast.success("Moved to Trash.");
                handleTabChange("trash");
            }
        } else if (modalType === "archive") {
            const newStatus = selectedAd.status === 'archived' ? 'inactive' : 'archived';
            await supabase.from("advertisements").update({ status: newStatus }).eq("id", selectedAd.id);
            toast.success(newStatus === 'archived' ? "Campaign Archived" : "Restored to Inactive");
            handleTabChange(newStatus === 'archived' ? "archive" : "inactive");
        } else if (modalType === "restore") {
            await supabase.from("advertisements").update({ deleted_at: null, status: 'inactive' }).eq("id", selectedAd.id);
            toast.success("Campaign restored from trash (Paused).");
            handleTabChange("inactive");
        }

        fetchAds();
        setModalType(null);
    };

    return (
        <div className="min-h-screen bg-brand-surface p-6 md:p-12 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 md:mb-8">
                    <Link href="/admin" className="text-xs md:text-sm text-brand-secondary font-bold hover:underline">
                        <span className="text-lg leading-none">←</span> Back to Admin Dashboard
                    </Link>
                </div>

                {/* TABS HEADER */}
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
                    <div className="w-full md:w-auto overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-max md:w-fit min-w-full md:min-w-0">
                            <button onClick={() => handleTabChange("active")} className={`whitespace-nowrap px-6 py-2 rounded-lg text-xs font-bold transition-all ${view === "active" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-emerald-600"}`}>
                                Active Ads
                            </button>
                            <button onClick={() => handleTabChange("inactive")} className={`whitespace-nowrap px-6 py-2 rounded-lg text-xs font-bold transition-all ${view === "inactive" ? "bg-white text-amber-600 shadow-sm" : "text-gray-500 hover:text-amber-600"}`}>
                                Paused
                            </button>
                            <button onClick={() => handleTabChange("archive")} className={`whitespace-nowrap px-6 py-2 rounded-lg text-xs font-bold transition-all ${view === "archive" ? "bg-white text-brand-primary shadow-sm" : "text-gray-500 hover:text-brand-primary"}`}>
                                Archive
                            </button>
                            {role !== 'viewer' && (
                                <button onClick={() => handleTabChange("trash")} className={`whitespace-nowrap px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${view === "trash" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-red-600"}`}>
                                    Trash <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[8px]">30 Days</span>
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="text-[11px] md:text-sm text-gray-500 italic md:text-right leading-relaxed max-w-[250px] md:max-w-none">
                        {view === "active" && "Currently running on the public website."}
                        {view === "inactive" && "Paused campaigns. Not visible to the public."}
                        {view === "archive" && "Finished campaigns preserved for records."}
                        {view === "trash" && "Permanently deleted after 30 days."}
                    </p>
                </div>

                <div className="flex flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary flex items-center gap-3">
                        <Megaphone className="text-brand-secondary" /> Ad Campaigns
                    </h1>
                    {role !== 'viewer' && view !== 'trash' && (
                        <button onClick={() => router.push("/admin/ads/new")} className="bg-brand-primary text-white px-4 py-3 md:px-6 md:py-2 rounded-xl text-xs md:text-base font-bold shadow-lg shadow-brand-primary/20 active:scale-95 transition-transform whitespace-nowrap flex items-center gap-2">
                            <Plus size={16} /> New Campaign
                        </button>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row items-start gap-4 mb-8">

                    <div className="w-full lg:flex-1 [&>div]:!mb-0">
                        <AdminFilter
                            searchValue={searchTerm}
                            onSearchChange={setSearchTerm}
                            sortValue={sortBy}
                            onSortChange={(val) => { setSortBy(val); setCurrentPage(1); }}
                            sortOptions={[{ label: "Newest First", value: "latest" }, { label: "Oldest First", value: "oldest" }, { label: "Title (A-Z)", value: "alphabetical" }]}
                        />
                    </div>

                    {/* Specific Dropdown Filters Box */}
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 bg-slate-50/50 p-3 md:p-4 rounded-2xl border border-brand-accent shadow-sm w-full lg:w-auto">

                        <div className="flex-1 sm:flex-none relative w-full sm:w-48">
                            <select
                                value={filterType}
                                onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                                className="w-full appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-3 md:py-2 text-sm font-bold text-brand-primary outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-sm cursor-pointer"
                            >
                                <option value="">All Ad Types</option>
                                <option value="church_event">Church Event</option>
                                <option value="external_business">External / Sponsor</option>
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-brand-secondary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                        </div>

                        {/* Filter Placement Dropdown */}
                        <div className="flex-1 sm:flex-none relative w-full sm:w-48">
                            <select
                                value={filterPlacement}
                                onChange={(e) => { setFilterPlacement(e.target.value); setCurrentPage(1); }}
                                className="w-full appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-3 md:py-2 text-sm font-bold text-brand-primary outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-sm cursor-pointer"
                            >
                                <option value="">All Placements</option>
                                <option value="global_top">Global Top Banner</option>
                                <option value="global_sidebar">Global Sidebar</option>
                            </select>
                            {/* Matching Custom Chevron */}
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-brand-secondary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                        </div>

                    </div>
                </div>

                {/* AD GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                    {ads.map((ad) => (
                        <div key={ad.id} className={`bg-white rounded-2xl border border-brand-accent overflow-hidden shadow-sm flex flex-col ${view === "archive" ? "opacity-80 grayscale hover:grayscale-0 transition-all" : ""}`}>
                            {/* Media Preview Thumbnail */}
                            <div className="aspect-video bg-slate-100 relative overflow-hidden flex-shrink-0 border-b border-brand-accent">
                                {ad.media_type === 'image' ? (
                                    <img src={ad.media_url} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" alt={ad.title} />
                                ) : (
                                    <video src={ad.media_url} className="object-cover w-full h-full bg-slate-900 group-hover:scale-105 transition-transform duration-500" muted playsInline onMouseOver={(e) => e.currentTarget.play()} onMouseOut={(e) => (e.currentTarget.pause(), e.currentTarget.currentTime = 0)} />
                                )}

                                {/* Placement Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className="bg-black/80 backdrop-blur text-white px-2 py-1 rounded text-[9px] font-bold uppercase shadow-sm tracking-widest">
                                        {ad.placement.replace('_', ' ')}
                                    </span>
                                </div>

                                {/* Ad Type Badge */}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase shadow-sm tracking-widest ${ad.ad_type === 'church_event' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}`}>
                                        {ad.ad_type.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 md:p-5 flex flex-col flex-grow">
                                <h3 className="font-serif font-bold text-brand-primary text-base md:text-lg mb-1 leading-tight line-clamp-1">{ad.title}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{ad.description || "No description provided."}</p>

                                {ad.target_link && (
                                    <a href={ad.target_link} target="_blank" className="flex items-center gap-1 text-[10px] font-bold text-brand-secondary hover:text-brand-primary uppercase tracking-widest mb-4 truncate w-fit">
                                        <ExternalLink size={12} /> {ad.button_text}
                                    </a>
                                )}

                                {/* Footer Actions */}
                                <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center">
                                    {/* Left Side Info */}
                                    {view === "trash" ? (
                                        <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded text-[8px] font-bold border border-amber-100">
                                            <Clock size={10} /> <span>{getDaysLeft(ad.deleted_at, true)}D LEFT</span>
                                        </div>
                                    ) : ad.expires_at ? (
                                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold border ${getDaysLeft(ad.expires_at) < 3 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                            <Clock size={10} /> <span>Expires: {getDaysLeft(ad.expires_at)}d</span>
                                        </div>
                                    ) : (
                                        <span className="text-[9px] text-gray-400 font-bold uppercase">No Expiry</span>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 items-center">
                                        {view === "trash" && role !== 'viewer' && (
                                            <>
                                                <button onClick={() => { setSelectedAd(ad); setModalType("restore"); }} title="Restore" className="text-emerald-600 group flex flex-col items-center gap-1">
                                                    <RotateCcw size={14} />
                                                    <span className="text-[7px] font-bold uppercase text-emerald-600">Restore</span>
                                                </button>
                                                {role === 'super-admin' && (
                                                    <button onClick={() => { setSelectedAd(ad); setModalType("delete"); }} title="Purge" className="text-red-400 hover:text-red-600 flex flex-col items-center gap-1">
                                                        <Trash2 size={14} />
                                                        <span className="text-[7px] font-bold uppercase text-red-600">Purge</span>
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        {view === "archive" && role !== 'viewer' && (
                                            <>
                                                <button onClick={() => { setSelectedAd(ad); setModalType("archive"); }} title="Restore" className="text-emerald-600 flex flex-col items-center gap-1">
                                                    <RotateCcw size={14}/>
                                                    <span className="text-[7px] font-bold uppercase text-emerald-600">Restore</span>
                                                </button>
                                                <button onClick={() => { setSelectedAd(ad); setModalType("delete"); }} title="Trash" className="text-red-400 flex flex-col items-center gap-1">
                                                    <Trash2 size={14}/>
                                                    <span className="text-[7px] font-bold uppercase text-red-400">Trash</span>
                                                </button>
                                            </>
                                        )}

                                        {(view === "active" || view === "inactive") && role !== 'viewer' && (
                                            <>
                                                <button onClick={() => toggleAdStatus(ad)} title={view === 'active' ? 'Pause' : 'Resume'} className={`${view === 'active' ? 'text-amber-500' : 'text-emerald-500'} flex flex-col items-center gap-1 hover:scale-110 transition-transform`}>
                                                    {view === 'active' ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                                                    <span className="text-[7px] font-bold uppercase">{view === 'active' ? 'Pause' : 'Resume'}</span>
                                                </button>
                                                <button onClick={() => { setSelectedAd(ad); setModalType("archive"); }} title="Archive" className="text-slate-400 hover:text-slate-600 flex flex-col items-center gap-1">
                                                    <Archive size={14} />
                                                    <span className="text-[7px] font-bold uppercase text-slate-500">Arch</span>
                                                </button>
                                                <Link href={`/admin/ads/edit/${ad.id}`} title="Edit" className="text-brand-primary flex flex-col items-center gap-1 hover:scale-110 transition-transform">
                                                    <Edit3 size={14} />
                                                    <span className="text-[7px] font-bold uppercase text-brand-primary">Edit</span>
                                                </Link>
                                                <button onClick={() => { setSelectedAd(ad); setModalType("delete"); }} title="Trash" className="text-red-300 hover:text-red-600 flex flex-col items-center gap-1">
                                                    <Trash2 size={14} />
                                                    <span className="text-[7px] font-bold uppercase text-red-400">Trash</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {ads.length === 0 && !loading && (
                    <div className="mt-8 p-12 md:p-20 text-center text-brand-primary font-bold italic bg-white rounded-3xl border border-dashed border-brand-accent shadow-sm">
                        No ad campaigns found in {view} for the selected filters.
                    </div>
                )}

                {/* --- PAGINATION CONTROLS --- */}
                <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-brand-accent pt-8">
                    <div className="text-xs font-bold text-brand-secondary uppercase tracking-widest">
                        Showing <span className="text-brand-primary">{ads.length}</span> of {totalCount} Advertisements Entries
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1 || loading}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="flex items-center gap-1 bg-white border border-gray-200 text-brand-primary px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <ChevronLeft size={12} /> Prev
                        </button>

                        <div className="flex items-center gap-1">
                            <span className="bg-brand-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-brand-primary/20">{currentPage}</span>
                            <span className="text-gray-400 px-2 font-bold text-sm">/</span>
                            <span className="text-brand-primary font-bold text-sm">{Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}</span>
                        </div>

                        <button
                            disabled={currentPage >= Math.ceil(totalCount / PAGE_SIZE) || loading}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="flex items-center gap-1 bg-white border border-gray-200 text-brand-primary px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            Next <ChevronRight size={12} />
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={modalType === "delete" || modalType === "archive" || modalType === "restore"}
                title={modalType === "delete" ? (view === "trash" ? "Permanently Delete Ad?" : "Move to Trash?") : modalType === "restore" ? "Restore Ad?" : (selectedAd?.status === 'archived' ? "Restore from Archive?" : "Archive Campaign?")}
                message={modalType === "delete" ? (view === "trash" ? "This action is permanent." : "This will move the ad to the trash. It will stop showing immediately.") : modalType === "restore" ? "This ad will be restored to your Paused campaigns." : (selectedAd?.status === 'archived' ? "This will move the ad back to your inactive campaigns." : "This will stop the ad and move it to your records.")}
                variant={modalType === "delete" ? "danger" : "primary"}
                onClose={() => setModalType(null)}
                onConfirm={handleConfirmAction}
            />

            {/* Back To Top Button */}
            <div
                className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 flex flex-col items-center gap-2 z-50 transition-all duration-300 ${
                    showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
                }`}
            >
                <button
                    onClick={scrollToTop}
                    className="p-2 md:p-2 bg-brand-primary text-white rounded-full shadow-xl shadow-brand-primary/30 hover:scale-110 active:scale-95 transition-all"
                    aria-label="Back to top"
                >
                    <ChevronUp size={20} />
                </button>

                {/* Hidden on mobile to save space, visible on desktop */}
                <span className="hidden md:block text-[9px] font-black uppercase tracking-widest text-brand-primary bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm border border-brand-accent">
                    Back to Top
                </span>
            </div>
        </div>
    );
}