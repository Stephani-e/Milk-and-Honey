"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminFilter from "@/components/Admin/AdminFilter";
import {toast} from "sonner";
import ConfirmModal from "@/components/Admin/ConfirmModal";

export default function SermonsPage() {
    const router = useRouter();
    const [sermons, setSermons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("latest");

    const [modalType, setModalType] = useState<"delete" | "archive" | null>(null);
    const [selectedSermon, setSelectedSermon] = useState<any | null>(null);

    useEffect(() => {
        fetchSermons();
    }, []);

    async function fetchSermons() {
        const { data, error } = await supabase
            .from("sermons")
            .select("*")
            .order("service_date", { ascending: false });

        if (!error) setSermons(data || []);
        setLoading(false);
    }

    const filteredSermons = sermons
        .filter((s) => {
            const searchStr = `${s.title} ${s.preacher} ${s.special_service_name}`.toLowerCase();
            return searchStr.includes(search.toLowerCase());
        })
        .sort((a, b) => {
            if (sortBy === "latest") return new Date(b.service_date).getTime() - new Date(a.service_date).getTime();
            if (sortBy === "oldest") return new Date(a.service_date).getTime() - new Date(b.service_date).getTime();
            if (sortBy === "alphabetical") return a.title.localeCompare(b.title);
            return 0;
        });

    const triggerDelete = (sermon: any) => {
        setSelectedSermon(sermon);
        setModalType("delete");
    };

    const triggerArchive = (sermon: any) => {
        setSelectedSermon(sermon);
        setModalType("archive");
    }

    const handleConfirmAction = async () => {
        if (!selectedSermon) return;

        if (modalType === "delete") {
            const { error } = await supabase.from("sermons").delete().eq("id", selectedSermon.id);
            if (error) toast.error("Delete failed: " + error.message);
            else {
                toast.success("Sermon removed from library");
                fetchSermons();
            }
        }

        else if (modalType === "archive") {
            const { error } = await supabase
                .from("sermons")
                .update({ is_archived: !selectedSermon.is_archived })
                .eq("id", selectedSermon.id);

            if (error) toast.error("Update failed");
            else {
                toast.success(selectedSermon.is_archived ? "Sermon Restored" : "Sermon Archived");
                fetchSermons();
            }
        }

        setModalType(null);
    };

    return (
        <div className="min-h-screen bg-brand-surface p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 md:mb-8">
                    <Link
                        href="/admin"
                        className="text-xs md:text-sm text-brand-secondary font-bold hover:underline">
                        <span className="text-lg leading-none">←</span> Back to Dashboard
                    </Link>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 md:mb-10 gap-4">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary">
                        Sermon Library
                    </h1>
                    <button
                        onClick={() => router.push("/sermons/new")}
                        className="w-auto md:w-auto bg-brand-primary text-white px-6 py-4 md:py-2 rounded-xl md:rounded-lg font-bold shadow-lg shadow-brand-primary/20 active:scale-95 transition-transform">
                        + New Entry
                    </button>
                </div>

                <AdminFilter
                    searchValue={search}
                    onSearchChange={setSearch}
                    sortValue={sortBy}
                    onSortChange={setSortBy}
                    sortOptions={[
                        { label: "Latest First", value: "latest" },
                        { label: "Oldest First", value: "oldest" },
                        { label: "Title (A-Z)", value: "alphabetical" },
                    ]}
                />

                {/* DESKTOP TABLE: Hidden on small screens */}
                <div
                    className="hidden md:block bg-white rounded-3xl border border-brand-accent overflow-hidden shadow-sm"
                >
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-brand-accent text-[10px] uppercase font-black text-brand-primary">
                        <tr className="justify-around items-center">
                            <th className="p-5">Service Info</th>
                            <th className="p-5">Preacher & Media</th>
                            <th className="p-5 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {filteredSermons.map((s) => (
                            <tr key={s.id} className={`transition-opacity ${s.is_archived ? "opacity-40 grayscale" : ""}`}>
                                <td className="p-5">
                                    {/* Row 1: The Logic Badges */}
                                    <div className="flex gap-2 mb-2">
                                        {s.service_category === "Weekly" ? (
                                            <span className="bg-purple-100 text-purple-700 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">
                                                    {s.weekly_type}
                                            </span>
                                        ) : (
                                            <span className="bg-amber-100 text-amber-700 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">
                                                    Special: {s.special_service_name}
                                                </span>
                                        )}

                                        {/* Sub-labels (Day 3, 2nd Service, etc) */}
                                        {s.is_multi_day && <span className="text-[9px] font-bold text-gray-400">({s.day_identifier})</span>}
                                        {s.service_category === "Weekly" && s.weekly_type === "Sunday" && s.service_number && (
                                            <span className="text-[9px] font-bold text-gray-400">• {s.service_number}</span>
                                        )}
                                    </div>

                                    {/* Row 2: Title & Date */}
                                    <div className="font-serif font-bold text-lg text-brand-primary leading-tight">{s.title}</div>
                                    <div className="text-[10px] text-brand-secondary font-bold mt-1 uppercase tracking-tight">
                                        {new Date(s.service_date).toLocaleDateString('en-GB')}
                                        {/* Logic: Only show Host if it exists and isn't "General" */}
                                        {s.host && s.host !== "General" && s.host !== "" && (
                                            <span className="ml-1 text-purple-600">
                                                | {s.host}
                                                {s.co_host && (
                                                    <span className="text-brand-secondary">
                                                        {" "}x ({s.co_host})
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </td>

                                <td className="p-5">
                                    <div className="text-sm font-medium text-gray-700">{s.preacher}</div>
                                    <div className="flex gap-4 mt-3">
                                        {/* Icon Logic: Only render if URL exists */}
                                        {s.youtube_url && (
                                            <a href={s.youtube_url} target="_blank" title="Watch on YouTube" className="text-red-600 hover:scale-110 transition-transform">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                                <span className="text-[10px] font-black underline italic">YouTube Link</span>
                                            </a>
                                        )}
                                        {s.banner_url && (
                                            <a href={s.banner_url} target="_blank" title="View Banner" className="text-emerald-600 hover:scale-110 transition-transform">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                                <span className="text-[10px] font-black underline italic">Banner</span>
                                            </a>
                                        )}
                                        {s.clip_url && (
                                            <a href={s.clip_url} target="_blank" title="Download Clip" className="text-blue-600 hover:scale-110 transition-transform">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
                                                <span className="text-[10px] font-black underline italic">Video Clip</span>
                                            </a>
                                        )}
                                    </div>
                                </td>

                                <td className=" p-5 text-right">
                                    <div className="flex justify-end items-center gap-4">
                                        <button
                                            onClick={() => triggerArchive(s)}
                                            className="flex flex-col items-center gap-1 group"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${s.is_archived ? "text-green-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                                                <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
                                            </svg>
                                            <span className={`text-[9px] font-bold uppercase ${s.is_archived ? "text-green-600" : "text-gray-400"}`}>
                                                {s.is_archived ? "Restore" : "Archive"}
                                            </span>
                                        </button>

                                        <Link href={`/sermons/edit/${s.id}`} className="flex flex-col items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary group-hover:text-brand-secondary">
                                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                            </svg>
                                            <span className="text-[9px] font-bold uppercase text-brand-primary">Edit</span>
                                        </Link>

                                        <button
                                            onClick={() => triggerDelete(s)}
                                            className="flex flex-col items-center gap-1"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-200 group-hover:text-red-600">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                            <span className="text-[9px] font-bold uppercase text-red-300">Del</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {filteredSermons.length === 0 && (
                        <div className="p-20 text-center text-brand-primary font-bold italic">No sermons found matching your search.</div>
                    )}
                </div>

                {/* --- MOBILE CARD VIEW --- */}
                {/* --- MOBILE CARD VIEW --- */}
                <div className="md:hidden space-y-4">
                    {filteredSermons.map((s) => (
                        <div key={s.id} className={`bg-white p-5 rounded-2xl border border-brand-accent shadow-sm ${s.is_archived ? "opacity-60 grayscale" : ""}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex flex-wrap gap-2">
                    <span className={`text-[8px] px-2 py-1 rounded-md font-bold uppercase ${s.service_category === "Weekly" ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"}`}>
                        {s.service_category === "Weekly" ? s.weekly_type : s.special_service_name}
                    </span>
                                    {/* Important sub-labels added back for mobile */}
                                    {s.is_multi_day && <span className="text-[8px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">({s.day_identifier})</span>}
                                </div>
                                <div className="text-[10px] text-gray-400 font-bold">{new Date(s.service_date).toLocaleDateString('en-GB')}</div>
                            </div>

                            <h3 className="font-serif font-bold text-brand-primary text-lg mb-1 leading-tight">{s.title}</h3>

                            {/* Added Host logic back for mobile */}
                            <p className="text-sm text-gray-600 mb-1">{s.preacher}</p>
                            {s.host && s.host !== "General" && (
                                <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mb-4">Host: {s.host}</p>
                            )}

                            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                <div className="flex gap-4">
                                    {s.youtube_url && <a href={s.youtube_url} target="_blank" className="text-red-600"><MediaIcon type="youtube" /></a>}
                                    {s.banner_url && <a href={s.banner_url} target="_blank" className="text-emerald-600"><MediaIcon type="banner" /></a>}
                                    {s.clip_url && <a href={s.clip_url} target="_blank" className="text-blue-600"><MediaIcon type="video" /></a>}
                                </div>
                                {/* The action buttons component handled the link, let's make sure it's crisp */}
                                <ActionButtons sermon={s} onArchive={triggerArchive} onDelete={triggerDelete} />
                            </div>
                        </div>
                    ))}
                </div>
                {filteredSermons.length === 0 && !loading && (
                   <div className="p-20 text-center text-brand-primary font-bold italic">No sermons found matching your search.</div>
                )}

            </div>

            <ConfirmModal
                isOpen={modalType !== null}
                title={modalType === "delete" ? "Delete Sermon?" : (selectedSermon?.is_archived ? "Restore Sermon?" : "Archive Sermon?")}
                message={
                    modalType === "delete"
                        ? "This action is permanent and cannot be undone. All associated media links will be removed."
                        : (selectedSermon?.is_archived
                            ? "This will make the sermon visible to the public again."
                            : "This will hide the sermon from the public library, but you can restore it anytime.")
                }
                variant={modalType === "delete" ? "danger" : "primary"}
                confirmText={
                    modalType === "delete"
                        ? "Delete Permanently"
                        : (selectedSermon?.is_archived ? "Restore Now" : "Archive Sermon")
                }
                onClose={() => setModalType(null)}
                onConfirm={handleConfirmAction}
            />
        </div>


    );
}

// --- SUB-COMPONENTS FOR CLEANER CODE ---

// Sub-components to keep the main return clean
function MediaIcon({ type }: { type: 'youtube' | 'banner' | 'video' }) {
    if (type === 'youtube') return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
    if (type === 'banner') return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
    return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>;
}

function ActionButtons({ sermon, onArchive, onDelete }: { sermon: any, onArchive: any, onDelete: any }) {
    return (
        <div className="flex items-center gap-4">
            <button onClick={() => onArchive(sermon)} className="flex flex-col items-center gap-1 group">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={sermon.is_archived ? "text-green-600" : "text-slate-400 group-hover:text-slate-600"}><path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" /></svg>
                <span className={`text-[8px] font-bold uppercase ${sermon.is_archived ? "text-green-600" : "text-gray-400"}`}>{sermon.is_archived ? "Restore" : "Arch"}</span>
            </button>
            <Link href={`/sermons/edit/${sermon.id}`} className="flex flex-col items-center gap-1 min-h-[40px] py-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                <span className="text-[8px] font-bold uppercase text-brand-primary">Edit</span>
            </Link>
            <button onClick={() => onDelete(sermon)} className="flex flex-col items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-200 group-hover:text-red-600"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                <span className="text-[8px] font-bold uppercase text-red-300">Del</span>
            </button>
        </div>
    );
}