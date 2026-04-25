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

        let query = supabase.from("media_gallery").select("*", { count: 'exact' });

        if (view === "trash") query = query.not("deleted_at", "is", null);
        else {
            query = query.is("deleted_at", null);
            if (view === "archive") query = query.eq("is_archived", true);
            else if (view === "draft") query = query.eq("is_archived", false).eq("status", "draft");
            else query = query.eq("is_archived", false).eq("status", "published");
        }

        if (search) query = query.or(`title.ilike.%${search}%,special_service_name.ilike.%${search}%`);

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

    // Calculate Days Remaining (For Trash Tab)
    const getDaysLeft = (deletedAt: string) => {
        const deleteDate = new Date(deletedAt);
        const expiryDate = new Date(deleteDate);
        expiryDate.setDate(deleteDate.getDate() + 30);
        const today = new Date();
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    // Quick Publish from Drafts
    const handleQuickPublish = async (entry: any) => {
        const { error } = await supabase.from("media_gallery").update({ status: 'published' }).eq("id", entry.id);
        if (error) toast.error("Failed to publish: " + error.message);
        else {
            toast.success("Gallery is now live!");
            fetchGalleryEntries();
        }
    };

    // View Live Placeholder
    const handleViewLive = (id: string) => {
        toast.info("Opening public preview...");
        // window.open(`/gallery/${id}`, '_blank');
    };

    // The "Restore To Where?" Logic
    const handleRestoreFromTrashOrArchive = async (destination: 'active' | 'draft') => {
        const payload = destination === 'active'
            ? { is_archived: false, status: 'published', deleted_at: null }
            : { is_archived: false, status: 'draft', deleted_at: null };

        const { error } = await supabase.from("media_gallery").update(payload).eq("id", selectedEntry.id);

        if (error) toast.error("Restore failed: " + error.message);
        else {
            toast.success(`Moved to ${destination === 'active' ? 'Public Galleries' : 'Drafts'}`);
            setView(destination);
            fetchGalleryEntries();
        }
        setModalType(null);
    };

    const handleConfirmAction = async () => {
        if (!selectedEntry) return;

        if (modalType === "delete") {
            if (view === "trash") {
                await supabase.from("media_gallery").delete().eq("id", selectedEntry.id);
                toast.error("Entry permanently purged.");
            } else {
                await supabase.from("media_gallery").update({ deleted_at: new Date() }).eq("id", selectedEntry.id);
                toast.success("Moved to Trash.");
                setView("trash");
            }
        } else if (modalType === "archive") {
            const newStatus = !selectedEntry.is_archived;
            await supabase.from("media_gallery").update({ is_archived: newStatus }).eq("id", selectedEntry.id);
            toast.success(newStatus ? "Archived (Hidden from site)" : "Restored to Gallery");
            setView(newStatus ? "archive" : "active");
        }

        fetchGalleryEntries();
        if (modalType !== "restore") setModalType(null);
    };

    return (
        <div className="min-h-screen bg-brand-surface p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 md:mb-8">
                    <Link href="/admin" className="text-xs md:text-sm text-brand-secondary font-bold hover:underline">
                        <span className="text-lg leading-none">←</span> Back to Dashboard
                    </Link>
                </div>

                {/* Tabs & Description */}
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
                    <div className="w-full md:w-auto overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-max md:w-fit min-w-full md:min-w-0">
                            <button onClick={() => setView("active")} className={`whitespace-nowrap px-6 py-2 rounded-lg text-xs font-bold transition-all ${view === "active" ? "bg-white text-brand-primary shadow-sm" : "text-gray-500 hover:text-brand-primary"}`}>
                                All Galleries
                            </button>
                            <button onClick={() => setView("archive")} className={`whitespace-nowrap px-6 py-2 rounded-lg text-xs font-bold transition-all ${view === "archive" ? "bg-white text-brand-primary shadow-sm" : "text-gray-500 hover:text-brand-primary"}`}>
                                Archive
                            </button>
                            <button onClick={() => setView("draft")} className={`whitespace-nowrap px-6 py-2 rounded-lg text-xs font-bold transition-all ${view === "draft" ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-blue-700"}`}>
                                Drafts
                            </button>
                            <button onClick={() => setView("trash")} className={`whitespace-nowrap px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${view === "trash" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-red-600"}`}>
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

                {/* H1 and New Button */}
                <div className="flex flex-row justify-between items-center mb-8 md:mb-10 gap-4">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary">Media Gallery</h1>
                    {(view === 'active' || view === 'draft') && (
                        <button onClick={() => router.push("/gallery/new")} className="w-auto bg-brand-primary text-white px-4 py-3 md:px-6 md:py-2 rounded-xl md:rounded-lg text-xs md:text-base font-bold shadow-lg shadow-brand-primary/20 active:scale-95 transition-transform whitespace-nowrap">
                            + New Gallery
                        </button>
                    )}
                </div>

                <AdminFilter searchValue={searchTerm} onSearchChange={setSearchTerm} sortValue={sortBy} onSortChange={setSortBy} sortOptions={[{ label: "Latest First", value: "latest" }, { label: "Oldest First", value: "oldest" }, { label: "Title (A-Z)", value: "alphabetical" }]} />

                {/* Grid View for Media */}
                {/* TIGHTER GRID VIEW FOR MEDIA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 mt-8">
                    {entries.map((entry) => (
                        <div key={entry.id} className={`bg-white rounded-2xl border border-brand-accent overflow-hidden shadow-sm flex flex-col ${entry.is_archived && view !== "trash" ? "opacity-70 grayscale hover:grayscale-0 transition-all" : ""}`}>

                            {/* Thumbnail Preview - Reduced Height */}
                            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden flex-shrink-0">
                                {entry.media_urls?.[0] ? (
                                    entry.media_urls[0].type === 'image' ? (
                                        <img src={entry.media_urls[0].url} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" alt={entry.title} />
                                    ) : (
                                        <video src={entry.media_urls[0].url} className="object-cover w-full h-full bg-slate-900 group-hover:scale-105 transition-transform duration-500" muted playsInline onMouseOver={(e) => e.currentTarget.play()} onMouseOut={(e) => (e.currentTarget.pause(), e.currentTarget.currentTime = 0)} />
                                    )
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-300"><ImageIcon size={32} /></div>
                                )}

                                {/* Smaller Badge */}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className="bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[9px] font-black text-brand-primary uppercase shadow-sm">
                                        {entry.media_urls?.length || 0} Items
                                    </span>
                                </div>
                            </div>

                            {/* Card Body - Tighter Padding */}
                            <div className="p-4 md:p-5 flex flex-col flex-grow">

                                {/* Badges - More Compact */}
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {entry.service_category === "Weekly" ? (
                                        <span className="bg-purple-100 text-purple-700 text-[8px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">
                                            {entry.weekly_type}
                                        </span>
                                    ) : (
                                        <span className="bg-amber-100 text-amber-700 text-[8px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">
                                            Special: {entry.special_service_name}
                                        </span>
                                    )}
                                    {entry.is_multi_day && <span className="text-[8px] font-bold text-gray-400">({entry.day_identifier})</span>}
                                    {entry.service_category === "Weekly" && entry.weekly_type === "Sunday" && entry.service_number && (
                                        <span className="text-[8px] font-bold text-gray-400">• {entry.service_number}</span>
                                    )}
                                </div>

                                {/* Title & Date - Smaller Font */}
                                <h3 className="font-serif font-bold text-brand-primary text-base md:text-lg mb-1 leading-tight line-clamp-2">{entry.title}</h3>

                                <div className="text-[9px] text-brand-secondary font-bold mb-3 uppercase tracking-tight line-clamp-1">
                                    {new Date(entry.service_date).toLocaleDateString('en-GB')}
                                    {entry.host && entry.host !== "General" && entry.host !== "" && (
                                        <span className="ml-1 text-purple-600">
                                            | {entry.host} {entry.co_host && <span className="text-brand-secondary"> x ({entry.co_host})</span>}
                                        </span>
                                    )}
                                </div>

                                {/* Footer Actions - Reduced spacing */}
                                <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center">

                                    {view === "trash" ? (
                                        <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded text-[8px] font-bold border border-amber-100">
                                            <Clock size={10} /> <span>{getDaysLeft(entry.deleted_at)}D LEFT</span>
                                        </div>
                                    ) : (
                                        <div className="flex gap-1.5">
                                            {
                                                entry.media_urls?.some((m: any) => m.type === 'image') &&
                                                <div className='group flex flex-col items-center gap-1'>
                                                    <ImageIcon size={12} className="text-gray-400" />
                                                    <span className="text-[7px] font-bold uppercase text-gray-400">Picture</span>
                                                </div>
                                            }
                                            {
                                                entry.media_urls?.some((m: any) => m.type === 'video') &&
                                                <div className='group flex flex-col items-center gap-1'>
                                                    <Film size={12} className="text-gray-400" />
                                                    <span className="text-[7px] font-bold uppercase text-gray-400">Video</span>
                                                </div>
                                            }
                                        </div>
                                    )}

                                    <div className="flex gap-3 items-center">
                                        {view === "trash" && (
                                            <>
                                                <button
                                                    onClick={() => { setSelectedEntry(entry); setModalType("restore"); }}
                                                    title="Restore"
                                                    className="text-emerald-600 group flex flex-col items-center gap-1"
                                                >
                                                    <RotateCcw size={14} className="transition-transform group-hover:rotate-[-45deg]" />
                                                    <span className="text-[7px] font-bold uppercase text-emerald-300">Restore</span>
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedEntry(entry); setModalType("delete"); }}
                                                    title="Purge"
                                                    className="text-red-400 hover:text-red-600 flex flex-col items-center gap-1"
                                                >
                                                    <Trash2 size={14} />
                                                    <span className="text-[7px] font-bold uppercase text-red-300">Trash</span>
                                                </button>
                                            </>
                                        )}

                                        {view === "archive" && (
                                            <>
                                                <button
                                                    onClick={() => { setSelectedEntry(entry); setModalType("restore"); }}
                                                    title="Restore"
                                                    className="text-emerald-600 flex flex-col items-center gap-1"
                                                >
                                                    <RotateCcw size={14}/>
                                                    <span className="text-[7px] font-bold uppercase text-emerald-300">Restore</span>
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedEntry(entry); setModalType("delete"); }}
                                                    title="Trash"
                                                    className="text-red-400 flex flex-col items-center gap-1"
                                                >
                                                    <Trash2 size={14}/>
                                                    <span className="text-[7px] font-bold uppercase text-red-300">Trash</span>
                                                </button>
                                            </>
                                        )}

                                        {view === "draft" && (
                                            <>
                                                <button
                                                    onClick={() => handleViewLive(entry.id)}
                                                    title="Preview"
                                                    className="text-brand-secondary hover:text-brand-primary flex flex-col items-center gap-1"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                    <span className="text-[7px] font-bold uppercase text-brand-primary">Pre-View</span>
                                                </button>
                                                <button
                                                    onClick={() => handleQuickPublish(entry)}
                                                    title="Publish"
                                                    className="text-brand-primary flex flex-col items-center gap-1"
                                                >
                                                    <Inbox size={14} />
                                                    <span className="text-[7px] font-bold uppercase text-brand-primary">Publish</span>
                                                </button>
                                                <Link
                                                    href={`/gallery/edit/${entry.id}`}
                                                    title="Edit"
                                                    className="text-slate-400 hover:text-brand-primary flex flex-col items-center gap-1"
                                                >
                                                    <FileText size={14} />
                                                    <span className="text-[7px] font-bold uppercase text-slate-400">Edit</span>
                                                </Link>
                                                <button
                                                    onClick={() => { setSelectedEntry(entry); setModalType("delete"); }}
                                                    title="Trash"
                                                    className="text-red-300 hover:text-red-600 flex flex-col items-center gap-1"
                                                >
                                                    <Trash2 size={14} />
                                                    <span className="text-[7px] font-bold uppercase text-red-300">Trash</span>
                                                </button>
                                            </>
                                        )}

                                        {view === "active" && (
                                            <>
                                                <button
                                                    onClick={() => handleViewLive(entry.id)}
                                                    title="View Live"
                                                    className="text-brand-secondary hover:text-brand-primary flex flex-col items-center gap-1"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                    <span className="text-[7px] font-bold uppercase text-brand-primary">View</span>
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedEntry(entry); setModalType("archive"); }}
                                                    title="Archive"
                                                    className="text-slate-400 hover:text-slate-600 flex flex-col items-center gap-1"
                                                >
                                                    <Archive size={14} />
                                                    <span className="text-[7px] font-bold uppercase text-brand-primary">Archive</span>
                                                </button>
                                                <Link
                                                    href={`/gallery/edit/${entry.id}`}
                                                    title="Edit"
                                                    className="text-brand-primary hover:scale-110 transition-transform flex flex-col items-center gap-1"
                                                >
                                                    <FileText size={14} />
                                                    <span className="text-[7px] font-bold uppercase text-brand-primary">Edit</span>
                                                </Link>
                                                <button
                                                    onClick={() => { setSelectedEntry(entry); setModalType("delete"); }}
                                                    title="Trash"
                                                    className="text-red-300 hover:text-red-600 flex flex-col items-center gap-1"
                                                >
                                                    <Trash2 size={14} />
                                                    <span className="text-[7px] font-bold uppercase text-red-300">Trash</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {entries.length === 0 && !loading && (
                    <div className="mt-8 p-12 md:p-20 text-center text-brand-primary font-bold italic bg-white rounded-3xl border border-dashed border-brand-accent shadow-sm">
                        No media entries found in {view}.
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={modalType === "delete" || modalType === "archive"}
                title={modalType === "delete" ? (view === "trash" ? "Permanently Delete?" : "Move to Trash?") : (selectedEntry?.is_archived ? "Restore Gallery?" : "Archive Gallery?")}
                message={modalType === "delete" ? (view === "trash" ? "This action is truly permanent. This gallery and its data will be gone forever." : "This will move the gallery to the trash. You can still restore it for the next 30 days.") : (selectedEntry?.is_archived ? "This will make the gallery visible to the public again." : "This will hide the gallery from the public site, but you can restore it anytime.")}
                variant={modalType === "delete" ? "danger" : "primary"}
                onClose={() => setModalType(null)}
                onConfirm={handleConfirmAction}
            />

            {/* The "Restore To Where?" Modal Component */}
            {modalType === "restore" && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-brand-accent">
                        <h2 className="text-2xl font-serif font-bold text-brand-primary mb-2">Restore Gallery</h2>
                        <p className="text-gray-500 text-sm mb-8">Where would you like to restore <span className="font-bold text-brand-primary">"{selectedEntry?.title}"</span>?</p>

                        <div className="grid grid-cols-1 gap-4">
                            <button onClick={() => handleRestoreFromTrashOrArchive('active')} className="flex items-center justify-between p-4 rounded-2xl border-2 border-brand-accent hover:border-brand-primary hover:bg-brand-surface transition-all group">
                                <div className="text-left">
                                    <div className="font-bold text-brand-primary">All Galleries</div>
                                    <div className="text-[10px] text-gray-400 uppercase font-bold">Make public immediately</div>
                                </div>
                                <Inbox className="text-brand-primary group-hover:scale-110 transition-transform" />
                            </button>

                            <button onClick={() => handleRestoreFromTrashOrArchive('draft')} className="flex items-center justify-between p-4 rounded-2xl border-2 border-brand-accent hover:border-brand-primary hover:bg-brand-surface transition-all group">
                                <div className="text-left">
                                    <div className="font-bold text-brand-primary">Drafts</div>
                                    <div className="text-[10px] text-gray-400 uppercase font-bold">Keep hidden for editing</div>
                                </div>
                                <FileText className="text-brand-primary group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <button onClick={() => setModalType(null)} className="w-full mt-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-brand-primary transition-colors">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}