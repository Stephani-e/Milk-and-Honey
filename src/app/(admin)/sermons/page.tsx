"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminFilter from "@/components/Admin/AdminFilter";
import {toast} from "sonner";
import ConfirmModal from "@/components/Admin/ConfirmModal";
import LoadingState from "@/components/Admin/LoadingPage";
import {Trash2, RotateCcw, Archive, FileText, Clock, Inbox} from "lucide-react";

const PAGE_SIZE = 10;

export default function SermonsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get("tab");
    const [view, setView] = useState<"active" | "trash" | "archive" | "draft">(initialTab === "active" ? "active" : "draft");

    const [sermons, setSermons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const [search, setSearch] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("latest");

    const [modalType, setModalType] = useState<"delete" | "archive" | "restore" | null>(null);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [selectedSermon, setSelectedSermon] = useState<any | null>(null);

    useEffect(() => {
        fetchSermons();
    }, [currentPage]);

    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
            fetchSermons();
        }
    }, [search, sortBy, view]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearch(searchTerm); // This triggers the database fetch
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        // Updates the URL browser history without a full page reload
        const params = new URLSearchParams(window.location.search);
        params.set("tab", view);
        router.replace(`${window.location.pathname}?${params.toString()}`);
    }, [view]);

    async function fetchSermons() {
        setLoading(true);

        // Build the base query for Count
        let countQuery = supabase
            .from("sermons")
            .select("*", { count: 'exact', head: true });

        //Filter by view
        if (view === "trash") {
            countQuery = countQuery.not("deleted_at", "is", null);
        } else if (view === "archive") {
            countQuery = countQuery.is("deleted_at", null).eq("is_archived", true);
        } else if (view === "draft") {
            countQuery = countQuery.is("deleted_at", null).eq("is_archived", false).eq("status", "draft");
        } else {
            countQuery = countQuery.is("deleted_at", null).eq("is_archived", false).eq("status", "published");
        }

        if (search) countQuery = countQuery.or(`title.ilike.%${search}%,preacher.ilike.%${search}%`);
        const { count } = await countQuery;
        setTotalCount(count || 0);

        // Build the data query
        const from = (currentPage - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let dataQuery = supabase
            .from("sermons")
            .select("*")
            .range(from, to);

        if (view === "trash") {
            dataQuery = dataQuery.not("deleted_at", "is", null);
        } else if (view === "archive") {
            dataQuery = dataQuery.is("deleted_at", null).eq("is_archived", true);
        } else if (view === "draft") {
            dataQuery = dataQuery.is("deleted_at", null).eq("is_archived", false).eq("status", "draft");
        } else {
            dataQuery = dataQuery.is("deleted_at", null).eq("is_archived", false).eq("status", "published");
        }

        // Apply Search
        if (search) {
            dataQuery = dataQuery.or(`title.ilike.%${search}%,preacher.ilike.%${search}%`);
        }

        // Apply Sorting
        if (sortBy === "latest") dataQuery = dataQuery.order("service_date", { ascending: false });
        else if (sortBy === "oldest") dataQuery = dataQuery.order("service_date", { ascending: true });
        else if (sortBy === "alphabetical") dataQuery = dataQuery.order("title", { ascending: true });

        const { data, error } = await dataQuery;

        if (error) {
            toast.error("Error fetching sermons: " + error.message);
        } else {
            setSermons(data || []);
        }

        setLoading(false);
        setIsInitialLoad(false);
    }

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    //Calculate Days Remaining
    const getDaysLeft = (deletedAt: string) => {
        const deleteDate = new Date(deletedAt);
        const expiryDate = new Date(deleteDate);
        expiryDate.setDate(deleteDate.getDate() + 30);

        const today = new Date();
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 0 ? diffDays : 0;
    };

    //Restore Action
    const handleRestore = async (id: string) => {
        const { error } = await supabase
            .from("sermons")
            .update({ deleted_at: null })
            .eq("id", id);

        if (error) toast.error("Restore failed");
        else {
            toast.success("Sermon restored to library");
            fetchSermons();
        }
    };

    //Trigger Delete
    const triggerDelete = (sermon: any) => {
        setSelectedSermon(sermon);
        setModalType("delete");
    };

    //Trigger Restore
    const triggerRestore = (sermon: any) => {
        setSelectedSermon(sermon);
        setModalType("restore");
    };

    //Trigger Archive
    const triggerArchive = (sermon: any) => {
        setSelectedSermon(sermon);
        setModalType("archive");
    }

    const handleQuickPublish = async (sermon: any) => {
        const { error } = await supabase
            .from("sermons")
            .update({ status: 'published' })
            .eq("id", sermon.id);

        if (error) {
            toast.error("Failed to publish: " + error.message);
        } else {
            toast.success("Sermon is now live!");
            fetchSermons();
        }
    };

    const handleRestoreFromArchive = async (destination: 'active' | 'draft') => {
        const payload = destination === 'active'
            ? { is_archived: false, status: 'published', deleted_at: null }
            : { is_archived: false, status: 'draft', deleted_at: null };

        const { error } = await supabase
            .from("sermons")
            .update(payload)
            .eq("id", selectedSermon.id);

        if (error) {
            toast.error("Restore failed: " + error.message);
        }else {
            toast.success(`Moved to ${destination === 'active' ? 'Library' : 'Drafts'}`);
            setView(destination);
            fetchSermons();
        }
        setModalType(null);
    };

    //Confirm Action
    const handleConfirmAction = async () => {
        if (!selectedSermon) return;

        if (modalType === "delete") {
            if (view === 'trash') {
                const { error } = await supabase
                    .from("sermons")
                    .delete()
                    .eq("id", selectedSermon.id);

                if (!error) toast.error("Sermon Permanently Deleted.");
            } else {
                const { error } = await supabase
                    .from('sermons')
                    .update({ deleted_at: new Date() })
                    .eq("id", selectedSermon.id);
                if (!error) {
                    toast.success("Sermon moved to Trash. It will be kept for 30 days.");
                    setView("trash");
                }
            }
            fetchSermons();
        }
        else if (modalType === "archive") {
            const newArchiveStatus = !selectedSermon.is_archived;
            const { error } = await supabase
                .from("sermons")
                .update({ is_archived: newArchiveStatus})
                .eq("id", selectedSermon.id);

            if (error) toast.error("Update failed");
            else {
                toast.success(newArchiveStatus ? "Sermon Archived" : "Sermon Restored");
                setView(newArchiveStatus ? "archive" : "active")
            }
        }

        fetchSermons();
        setModalType(null);
    };

    // Dynamic Empty State Helper
    const getEmptyStateMessage = () => {
        if (search) return "No sermons found matching your search.";
        if (view === "trash") return "Trash is currently empty.";
        if (view === "archive") return "Your archive is currently empty.";
        return "No active sermons found. Click '+ New Entry' to create one.";
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

                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
                    <div className="w-full md:w-auto overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-max md:w-fit min-w-full md:min-w-0">
                            <button
                                onClick={() => setView("active")}
                                className={`whitespace-nowrap px-6 py-2 rounded-lg text-xs font-bold transition-all ${view === "active" ? "bg-white text-brand-primary shadow-sm" : "text-gray-500 hover:text-brand-primary"}`}
                            >
                                All Sermons
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
                        {view === "active" && "Manage your public sermon records."}
                        {view === "archive" && "Archived sermons are hidden from the public site."}
                        {view === "trash" && "Permanently deleted after 30 days."}
                        {view === 'draft' && "Unfinished Sermons are saved here."}
                    </p>
               </div>

                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 md:mb-10 gap-4">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary">
                        Sermon Library
                    </h1>

                    {view === 'active' && (
                        <button
                            onClick={() => router.push("/sermons/new")}
                            className="w-auto md:w-auto bg-brand-primary text-white px-6 py-4 md:py-2 rounded-xl md:rounded-lg font-bold shadow-lg shadow-brand-primary/20 active:scale-95 transition-transform">
                            + New Entry
                        </button>
                    )}

                    {view === 'draft' && (
                        <button
                            onClick={() => router.push("/sermons/new")}
                            className="w-auto md:w-auto bg-brand-primary text-white px-6 py-4 md:py-2 rounded-xl md:rounded-lg font-bold shadow-lg shadow-brand-primary/20 active:scale-95 transition-transform">
                            + New Entry
                        </button>
                    )}
                </div>

                <AdminFilter
                    searchValue={searchTerm}
                    onSearchChange={(val) => setSearchTerm(val)}
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
                            {view === "trash" && <th className="p-5 w-[15%]">Time Left</th>}
                            <th className={`p-5 text-right ${view === 'trash' ? 'w-[15%]' : 'w-[30%]'}`}>Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {sermons.map((s) => (
                            <tr key={s.id} className={`transition-opacity ${s.is_archived && view !=="trash" ? "opacity-100 grayscale" : ""}`}>
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

                                {view === "trash" && (
                                    <td className="p-5">
                                        <div className="flex items-center gap-2 text-amber-600 font-bold">
                                            <Clock size={14} />
                                            <span className="text-xs">{getDaysLeft(s.deleted_at)} days</span>
                                        </div>
                                    </td>
                                )}

                                <td className=" p-5 text-right">
                                    <ActionButtons
                                        sermon={s}
                                        onArchive={triggerArchive}
                                        onDelete={triggerDelete}
                                        onRestore={triggerRestore}
                                        onQuickPublish={handleQuickPublish}
                                        view={view}
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {sermons.length === 0 && !loading && (
                        <div className="p-20 text-center text-brand-primary font-bold italic">
                            {getEmptyStateMessage()}
                        </div>
                    )}
                </div>

                {/* --- MOBILE CARD VIEW --- */}
                <div className="md:hidden space-y-4">
                    {sermons.map((s) => (
                        <div key={s.id} className={`bg-white p-5 rounded-2xl border border-brand-accent shadow-sm ${s.is_archived && view !=="trash" ? "opacity-60 grayscale" : ""}`}>
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
                                <ActionButtons
                                    sermon={s}
                                    onArchive={triggerArchive}
                                    onDelete={triggerDelete}
                                    onRestore={triggerRestore}
                                    onQuickPublish={handleQuickPublish}
                                    view={view}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- PAGINATION CONTROLS --- */}
                <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-brand-accent pt-8">
                    <div className="text-xs font-bold text-brand-secondary uppercase tracking-widest">
                        Showing <span className="text-brand-primary">{sermons.length}</span> of {totalCount} Sermons
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1 || loading}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-3 rounded-xl border border-brand-accent bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </button>

                        <div className="flex items-center gap-1">
                            {/* Simple Page Indicator */}
                            <span className="bg-brand-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-brand-primary/20">
                                {currentPage}
                            </span>
                            <span className="text-gray-400 px-2 font-bold text-sm">/</span>
                            <span className="text-brand-primary font-bold text-sm">
                                {Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}
                            </span>
                        </div>

                        <button
                            disabled={currentPage >= Math.ceil(totalCount / PAGE_SIZE) || loading}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="p-3 rounded-xl border border-brand-accent bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={modalType === "delete" || modalType === "archive"}
                title={
                   modalType === "delete"
                       ? (view === "trash" ? "Permanently Delete?" : "Move to Trash?" )
                       : (selectedSermon?.is_archived ? "Restore Sermon?" : "Archive Sermon?")
                }
                message={
                    modalType === "delete"
                        ? (view === "trash"
                            ? "This action is truly permanent. This sermon and its data will be gone forever."
                            : "This will move the sermon to the trash. You can still restore it for the next 30 days.")
                        : (selectedSermon?.is_archived
                            ? "This will make the sermon visible to the public again."
                            : "This will hide the sermon from the public library, but you can restore it anytime.")
                }
                variant={modalType === "delete" ? "danger" : "primary"}
                confirmText={
                    modalType === "delete"
                        ? (view === "trash" ? "Delete Forever" : "Move to Trash")
                        : (selectedSermon?.is_archived ? "Restore to Library" : "Confirm Archive")
                }
                onClose={() => setModalType(null)}
                onConfirm={handleConfirmAction}
            />

            {modalType === "restore" && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-brand-accent">
                        <h2 className="text-2xl font-serif font-bold text-brand-primary mb-2">Restore Sermon</h2>
                        <p className="text-gray-500 text-sm mb-8">Where would you like to restore <span className="font-bold text-brand-primary">"{selectedSermon?.title}"</span>?</p>

                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => handleRestoreFromArchive('active')}
                                className="flex items-center justify-between p-4 rounded-2xl border-2 border-brand-accent hover:border-brand-primary hover:bg-brand-surface transition-all group"
                            >
                                <div className="text-left">
                                    <div className="font-bold text-brand-primary">All Sermons</div>
                                    <div className="text-[10px] text-gray-400 uppercase font-bold">Make public immediately</div>
                                </div>
                                <Inbox className="text-brand-primary group-hover:scale-110 transition-transform" />
                            </button>

                            <button
                                onClick={() => handleRestoreFromArchive('draft')}
                                className="flex items-center justify-between p-4 rounded-2xl border-2 border-brand-accent hover:border-brand-primary hover:bg-brand-surface transition-all group"
                            >
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

            {/* Back To Top Button */}
            <div
                className={`fixed bottom-6 right-6 flex flex-col items-center gap-1.5 z-50 transition-all duration-300 ${
                    showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
                }`}
            >
                <button
                    onClick={scrollToTop}
                    className="p-3 bg-brand-primary text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform"
                    aria-label="Back to top"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16" height="16"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m18 15-6-6-6 6"/>
                    </svg>
                </button>
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border border-brand-accent">
                        Back to Top
                </span>
            </div>

        </div>
    );
}


// Sub-components to keep the main return clean
function MediaIcon({ type }: { type: 'youtube' | 'banner' | 'video' }) {
    if (type === 'youtube') return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
    if (type === 'banner') return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
    return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>;
}

function ActionButtons({
                           sermon,
                           onArchive,
                           onDelete,
                           onRestore,
                           onQuickPublish,
                           view
}: {
    sermon: any,
    onArchive: any,
    onDelete: any,
    onRestore: any,
    onQuickPublish: (sermon: any) => void ,
    view: 'active' | 'trash' | 'archive' | 'draft'
}) {

    //Trash Item
    if (view === "trash") {
        return (
            <div className="flex items-center gap-6 justify-end">
                <button onClick={() => onRestore(sermon)} className="flex flex-col items-center gap-1 group">
                    <RotateCcw size={18} className="text-emerald-600 transition-transform group-hover:rotate-[-45deg]" />
                    <span className="text-[8px] font-bold uppercase text-emerald-600">Restore</span>
                </button>
                <button onClick={() => onDelete(sermon)} className="flex flex-col items-center gap-1 group">
                    <Trash2 size={18} className="text-red-400 group-hover:text-red-600" />
                    <span className="text-[8px] font-bold uppercase text-red-400">Purge</span>
                </button>
            </div>
        );
    }

    //Archive Item
    if (view === "archive") {
        return (
            <div className="flex items-center gap-4 justify-end">
                <button onClick={() => onRestore(sermon)} className="text-emerald-600 flex flex-col items-center gap-1"><RotateCcw size={18}/><span className="text-[8px] font-bold uppercase">Restore</span></button>
                <button onClick={() => onDelete(sermon)} className="text-red-400 flex flex-col items-center gap-1"><Trash2 size={18}/><span className="text-[8px] font-bold uppercase">Trash</span></button>
            </div>
        );
    }

    //Draft Item
    if (view === "draft") {
        return (
            <div className="flex items-center gap-6 justify-end">
                <button
                    onClick={() => onQuickPublish(sermon)}
                    className="flex flex-col items-center gap-1 group bg-brand-primary/5 p-2 rounded-xl border border-brand-primary/10 hover:bg-brand-primary/10 transition-colors"
                >
                    <Inbox size={18} className="text-brand-primary" />
                    <span className="text-[8px] font-bold uppercase text-brand-primary">Publish</span>
                </button>
                <Link href={`/sermons/edit/${sermon.id}`} className="flex flex-col items-center gap-1">
                    <FileText size={18} className="text-slate-400 group-hover:text-brand-primary" />
                    <span className="text-[8px] font-bold uppercase text-slate-400">Edit</span>
                </Link>
                <button onClick={() => onDelete(sermon)} className="flex flex-col items-center gap-1">
                    <Trash2 size={18} className="text-red-200 hover:text-red-600" />
                    <span className="text-[8px] font-bold uppercase text-red-300">Trash</span>
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4 justify-end">
            <button onClick={() => onArchive(sermon)} className="flex flex-col items-center gap-1 group">
                <Archive size={18} className={`${sermon.is_archived ? "text-green-600" : "text-slate-400 group-hover:slate-600"}`} />
                <span className={`text-[8px] font-bold uppercase ${sermon.is_archived ? "text-green-600" : "text-gray-400"}`}>{sermon.is_archived ? "Restore" : "Arch"}</span>
            </button>
            <Link href={`/sermons/edit/${sermon.id}`} className="flex flex-col items-center gap-1 min-h-[40px] py-1">
                <FileText size={18} className="text-brand-primary" />
                <span className="text-[8px] font-bold uppercase text-brand-primary">Edit</span>
            </Link>
            <button onClick={() => onDelete(sermon)} className="flex flex-col items-center gap-1">
                <Trash2 size={18} className="text-red-200 group-hover:text-red-600" />
                <span className="text-[8px] font-bold uppercase text-red-300">Del</span>
            </button>
        </div>
    );
}