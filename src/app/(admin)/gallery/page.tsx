"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminFilter from "@/components/Admin/AdminFilter";
import { toast } from "sonner";
import ConfirmModal from "@/components/Admin/ConfirmModal";
import { Trash2, RotateCcw, Archive, FileText, Clock, Inbox, Image as ImageIcon, Film } from "lucide-react";

const PAGE_SIZE = 10;

export default function GalleryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get("tab");

    const [view, setView] = useState<"active" | "trash" | "archive" | "draft">(
        initialTab === "draft" ? "draft" :
            initialTab === "archive" ? "archive" :
                initialTab === "trash" ? "trash" : "active"
    );

    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("latest");

    const [modalType, setModalType] = useState<"delete" | "archive" | "restore" | null>(null);
    const [selectedEntry, setSelectedEntry] = useState<any | null>(null);

    useEffect(() => {
        fetchGalleryEntries();
    }, [currentPage, search, sortBy, view]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => setSearch(searchTerm), 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        params.set("tab", view);
        router.replace(`${window.location.pathname}?${params.toString()}`);
    }, [view]);

    async function fetchGalleryEntries() {
        setLoading(true);
        const from = (currentPage - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        // Base Query
        let query = supabase
            .from("media_gallery")
            .select("*", { count: 'exact' });

        // Filter by View
        if (view === "trash") query = query.not("deleted_at", "is", null);
        else {
            query = query.is("deleted_at", null);
            if (view === "archive") query = query.eq("is_archived", true);
            else if (view === "draft") query = query.eq("is_archived", false).eq("status", "draft");
            else query = query.eq("is_archived", false).eq("status", "published");
        }

        // Search Logic
        if (search) query = query.or(`title.ilike.%${search}%,special_service_name.ilike.%${search}%`);

        // Sort Logic
        const isAsc = sortBy === "oldest";
        if (sortBy === "alphabetical") query = query.order("title", { ascending: true });
        else query = query.order("service_date", { ascending: isAsc });

        const { data, count, error } = await query.range(from, to);

        if (error) toast.error("Error: " + error.message);
        else {
            setEntries(data || []);
            setTotalCount(count || 0);
        }
        setLoading(false);
    }

    const handleConfirmAction = async () => {
        if (!selectedEntry) return;

        if (modalType === "delete") {
            if (view === "trash") {
                await supabase.from("media_gallery").delete().eq("id", selectedEntry.id);
                toast.error("Entry permanently purged.");
            } else {
                await supabase.from("media_gallery").update({ deleted_at: new Date() }).eq("id", selectedEntry.id);
                toast.success("Moved to Trash.");
            }
        } else if (modalType === "archive") {
            const newStatus = !selectedEntry.is_archived;
            await supabase.from("media_gallery").update({ is_archived: newStatus }).eq("id", selectedEntry.id);
            toast.success(newStatus ? "Archived (Hidden from site)" : "Restored to Gallery");
        }

        fetchGalleryEntries();
        setModalType(null);
    };

    return (
        <div className="min-h-screen bg-brand-surface p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 md:mb-8">
                    <Link
                        href="/admin"
                        className="text-xs md:text-sm text-brand-secondary font-bold hover:underline"
                    >
                        <span className="text-lg leading-none">←</span> Back to Dashboard
                    </Link>
                </div>

                {/* Tabs & Description */}
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
                    <div className="w-full md:w-auto overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-max md:w-fit min-w-full md:min-w-0">
                            <button
                                onClick={() => setView("active")}
                                className={`whitespace-nowrap px-6 py-2 rounded-lg text-xs font-bold transition-all ${view === "active" ? "bg-white text-brand-primary shadow-sm" : "text-gray-500 hover:text-brand-primary"}`}
                            >
                                All Galleries
                            </button>
                            <button
                                onClick={() => setView("archive")}
                                className={`whitespace-nowrap px-6 py-2 rounded-lg text-xs font-bold transition-all ${view === "archive" ? "bg-white text-brand-primary shadow-sm" : "text-gray-500 hover:text-brand-primary"}`}
                            >
                                Archive
                            </button>
                            <button
                                onClick={() => setView("draft")}
                                className={`whitespace-nowrap px-6 py-2 rounded-lg text-xs font-bold transition-all ${view === "draft" ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-blue-700"}`}
                            >
                                Drafts
                            </button>
                            <button
                                onClick={() => setView("trash")}
                                className={`whitespace-nowrap px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${view === "trash" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-red-600"}`}
                            >
                                Trash <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[8px]">30 Days</span>
                            </button>
                        </div>
                    </div>

                    <p className="text-[11px] md:text-sm text-gray-500 italic md:text-right leading-relaxed max-w-[250px] md:max-w-none">
                        {view === "active" && "Manage your public media records."}
                        {view === "archive" && "Archived media are hidden from the public site."}
                        {view === "trash" && "Permanently deleted after 30 days."}
                        {view === 'draft' && "Unfinished media are saved here."}
                    </p>
                </div>

                {/* H1 and New Button (Now forced to be on the same row even on mobile) */}
                <div className="flex flex-row justify-between items-center mb-8 md:mb-10 gap-4">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary">
                        Media Gallery
                    </h1>

                    {(view === 'active' || view === 'draft') && (
                        <button
                            onClick={() => router.push("/gallery/new")}
                            className="w-auto bg-brand-primary text-white px-4 py-3 md:px-6 md:py-2 rounded-xl md:rounded-lg text-xs md:text-base font-bold shadow-lg shadow-brand-primary/20 active:scale-95 transition-transform whitespace-nowrap"
                        >
                            + New Gallery
                        </button>
                    )}
                </div>

                <AdminFilter
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    sortValue={sortBy}
                    onSortChange={setSortBy}
                    sortOptions={[
                        { label: "Latest First", value: "latest" },
                        { label: "Oldest First", value: "oldest" },
                        { label: "Title (A-Z)", value: "alphabetical" },
                    ]}
                />

                {/* Grid View for Media */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {entries.map((entry) => (
                        <div key={entry.id} className="bg-white rounded-3xl border border-brand-accent overflow-hidden shadow-sm group">
                            {/* Thumbnail Preview */}
                            <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                {entry.media_urls?.[0] ? (
                                    entry.media_urls[0].type === 'image' ? (
                                        <img
                                            src={entry.media_urls[0].url}
                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                            alt={entry.title}
                                        />
                                    ) : (
                                        <video
                                            src={entry.media_urls[0].url}
                                            className="object-cover w-full h-full bg-slate-900 group-hover:scale-105 transition-transform duration-500"
                                            muted
                                            playsInline
                                            onMouseOver={(e) => e.currentTarget.play()}
                                            onMouseOut={(e) => (e.currentTarget.pause(), e.currentTarget.currentTime = 0)}
                                        />
                                    )
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-300"><ImageIcon size={48} /></div>
                                )}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-black text-brand-primary uppercase shadow-sm">
                                        {entry.media_urls?.length || 0} Items
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[9px] font-bold text-purple-600 uppercase tracking-tighter">
                                        {entry.service_category === "Weekly" ? entry.weekly_type : entry.special_service_name}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-bold">{new Date(entry.service_date).toLocaleDateString('en-GB')}</span>
                                </div>

                                <h3 className="font-serif font-bold text-brand-primary text-xl mb-4 leading-tight">{entry.title}</h3>

                                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                    <div className="flex gap-2">
                                        {/* Dynamic Icons to show what media types are inside */}
                                        {entry.media_urls?.some((m: any) => m.type === 'image') && <ImageIcon size={14} className="text-gray-400" />}
                                        {entry.media_urls?.some((m: any) => m.type === 'video') && <Film size={14} className="text-gray-400" />}
                                        <Film size={14} className="text-gray-400" />
                                    </div>

                                    <div className="flex gap-4 items-center">
                                        {view === "trash" ? (
                                            <>
                                                <button onClick={() => { setSelectedEntry(entry); setModalType("archive"); }} title="Restore" className="flex items-center gap-1 group">
                                                    <RotateCcw size={18} className="text-emerald-600 transition-transform group-hover:rotate-[-45deg]" />
                                                </button>
                                                <button onClick={() => { setSelectedEntry(entry); setModalType("delete"); }} title="Purge" className="flex items-center gap-1 group">
                                                    <Trash2 size={18} className="text-red-400 group-hover:text-red-600" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <Link href={`/gallery/edit/${entry.id}`} title="Edit">
                                                    <FileText size={18} className="text-brand-primary hover:scale-110 transition-transform" />
                                                </Link>
                                                <button onClick={() => { setSelectedEntry(entry); setModalType("archive"); }} title={view === "archive" ? "Restore" : "Archive"}>
                                                    <Archive size={18} className={`${view === "archive" ? "text-green-600" : "text-slate-400 hover:text-brand-primary transition-colors"}`} />
                                                </button>
                                                <button onClick={() => { setSelectedEntry(entry); setModalType("delete"); }} title="Trash">
                                                    <Trash2 size={18} className="text-red-200 hover:text-red-600 transition-colors" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {entries.length === 0 && !loading && (
                    <div className="mt-8 p-12 md:p-20 text-center text-brand-primary font-bold italic bg-white rounded-3xl border border-dashed border-brand-accent shadow-sm">
                        No media entries found in {view}.
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={!!modalType}
                title={
                    modalType === "delete"
                        ? (view === "trash" ? "Permanently Delete?" : "Move to Trash?")
                        : (selectedEntry?.is_archived ? "Restore Gallery?" : "Archive Gallery?")
                }
                message={
                    modalType === "delete"
                        ? (view === "trash"
                            ? "This action is truly permanent. This gallery and its data will be gone forever."
                            : "This will move the gallery to the trash. You can still restore it for the next 30 days.")
                        : (selectedEntry?.is_archived
                            ? "This will make the gallery visible to the public again."
                            : "This will hide the gallery from the public site, but you can restore it anytime.")
                }
                variant={modalType === "delete" ? "danger" : "primary"}
                onClose={() => setModalType(null)}
                onConfirm={handleConfirmAction}
            />
        </div>
    );
}