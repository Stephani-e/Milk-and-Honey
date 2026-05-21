"use client";
import React, {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";
import {useAuth} from "@/components/Admin/Admin Guard";
import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";
import AdminFilter from "@/components/Admin/AdminFilter";
import AdminSkeletonLoader from "@/components/Admin/SkeletonLoader";
import {toast} from "sonner";
import ConfirmModal from "@/components/Admin/ConfirmModal";
import {
    Archive,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    Inbox,
    RotateCcw,
    Send,
    Trash2
} from "lucide-react";

const PAGE_SIZE = 10;

export default function NewslettersPage() {
    const router = useRouter();
    const {role} = useAuth();

    const searchParams = useSearchParams();
    const initialTab = searchParams.get("tab");
    const [view, setView] = useState<"active" | "trash" | "archive" | "draft">(initialTab === "draft" ? "draft" : "active");

    const [newsletters, setNewsletters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const [search, setSearch] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("latest");

    const [modalType, setModalType] = useState<"delete" | "archive" | "restore" | null>(null);
    const [selectedNewsletter, setSelectedNewsletter] = useState<any | null>(null);

    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [publishMode, setPublishMode] = useState<"now" | "schedule">("now");
    const [scheduleDate, setScheduleDate] = useState("");
    const [isPublishing, setIsPublishing] = useState(false);

    useEffect(() => {
        fetchNewsletters().catch(error => console.error("Error fetching newsletters:", error));
    }, [currentPage]);

    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
            fetchNewsletters().catch(error => console.error("Error fetching newsletters:", error));
        }
    }, [search, sortBy, view]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearch(searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        params.set("tab", view);
        router.replace(`${window.location.pathname}?${params.toString()}`);
    }, [view]);

    useEffect(() => {
        setCurrentPage(1);
    }, [view, search, sortBy]);

    async function fetchNewsletters() {
        setLoading(true);

        // Build the base query for Count
        let countQuery = supabase
            .from("newsletters")
            .select("*", {count: 'exact', head: true});

        // Filter by view
        if (view === "trash") {
            countQuery = countQuery.not("deleted_at", "is", null);
        } else if (view === "archive") {
            countQuery = countQuery.is("deleted_at", null).eq("is_archived", true);
        } else if (view === "draft") {
            countQuery = countQuery.is("deleted_at", null).eq("is_archived", false).eq("is_published", false);
        } else {
            countQuery = countQuery.is("deleted_at", null).eq("is_archived", false).eq("is_published", true);
        }

        if (search) countQuery = countQuery.or(`title.ilike.%${search}%,author_name.ilike.%${search}%`);
        const {count} = await countQuery;
        setTotalCount(count || 0);

        // Build the data query
        const from = (currentPage - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let dataQuery = supabase
            .from("newsletters")
            .select("*");

        if (view === "trash") {
            dataQuery = dataQuery.not("deleted_at", "is", null);
        } else if (view === "archive") {
            dataQuery = dataQuery.is("deleted_at", null).eq("is_archived", true);
        } else if (view === "draft") {
            dataQuery = dataQuery.is("deleted_at", null).eq("is_archived", false).eq("is_published", false);
        } else {
            dataQuery = dataQuery.is("deleted_at", null).eq("is_archived", false).eq("is_published", true);
        }

        // Apply Search
        if (search) {
            dataQuery = dataQuery.or(`title.ilike.%${search}%,author_name.ilike.%${search}%`);
        }

        // Apply Sorting
        if (sortBy === "latest") {
            dataQuery = dataQuery.order("created_at", {ascending: false})
        } else if (sortBy === "oldest") {
            dataQuery = dataQuery.order("created_at", {ascending: true})
        } else if (sortBy === "alphabetical") {
            dataQuery = dataQuery.order("title", {ascending: true})
        }

        dataQuery = dataQuery.range(from, to);

        const {data, error} = await dataQuery;

        if (error) {
            toast.error("Error fetching newsletters: " + error.message);
        } else {
            setNewsletters(data || []);
        }

        setLoading(false);
        setIsInitialLoad(false);
    }

    // Dynamic Status Calculator
    const getStatus = (n: any) => {
        if (!n.is_published) return {label: "Draft", color: "bg-gray-100 text-gray-600", icon: FileText};
        const publishDate = new Date(n.published_at);
        if (publishDate > new Date()) return {label: "Scheduled", color: "bg-blue-50 text-blue-600", icon: Clock};
        return {label: "Live", color: "bg-green-50 text-green-600", icon: CheckCircle2};
    };

    const getDaysLeft = (deletedAt: string) => {
        const deleteDate = new Date(deletedAt);
        const expiryDate = new Date(deleteDate);
        expiryDate.setDate(deleteDate.getDate() + 30);
        const today = new Date();
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const triggerDelete = (n: any) => {
        setSelectedNewsletter(n);
        setModalType("delete");
    };
    const triggerRestore = (n: any) => {
        setSelectedNewsletter(n);
        setModalType("restore");
    };
    const triggerArchive = (n: any) => {
        setSelectedNewsletter(n);
        setModalType("archive");
    };

    const triggerPublishModal = (n: any) => {
        setSelectedNewsletter(n);
        setPublishMode("now");
        setScheduleDate("");
        setIsPublishModalOpen(true);
    };

    const executePublish = async () => {
        if (!selectedNewsletter) return;

        if (publishMode === "schedule" && !scheduleDate) {
            return toast.error("Please select a date and time.");
        }

        setIsPublishing(true);
        const published_at = publishMode === "now" ? new Date().toISOString() : new Date(scheduleDate).toISOString();

        // 1. Update the database first
        const {error} = await supabase
            .from("newsletters")
            .update({
                is_published: true,
                published_at,
                push_notification_sent: publishMode === "now"
            })
            .eq("id", selectedNewsletter.id);

        if (error) {
            toast.error("Failed to publish: " + error.message);
        } else {

            // 2. TRIGGER NOTIFICATION BLAST (Only for Immediate Publishing)
            if (publishMode === "now") {
                try {
                    const pushRes = await fetch("/api/push/send", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({
                            title: `New Update: ${selectedNewsletter.title}`,
                            body: selectedNewsletter.excerpt || "Tap to read the latest from Milk & Honey.",
                            url: `${window.location.origin}/newsletters/${selectedNewsletter.slug}`
                        })
                    });

                    const pushData = await pushRes.json();

                    if (pushData.success && pushData.count > 0) {
                        toast.success(`Live! Push notification sent to ${pushData.count} subscribers 🚀`);
                    } else {
                        toast.success("Newsletter is live! (No subscribers to notify yet)");
                    }
                } catch (err) {
                    console.error("Push blast failed:", err);
                    toast.success("Live! (But push notification failed to send)");
                }
            } else {
                toast.success("Newsletter Scheduled!");
            }

            // 3. Refresh the UI
            await fetchNewsletters();
        }

        setIsPublishing(false);
        setIsPublishModalOpen(false);
        setSelectedNewsletter(null);
    };

    const handleRestoreFromArchive = async (destination: 'active' | 'draft') => {
        const payload = destination === 'active'
            ? {is_archived: false, is_published: true, deleted_at: null}
            : {is_archived: false, is_published: false, deleted_at: null};

        const {error} =
            await supabase
                .from("newsletters")
                .update(payload)
                .eq("id", selectedNewsletter.id);

        if (error) {
            toast.error("Restore failed: " + error.message);
        } else {
            // TRIGGER NOTIFICATION BLAST (Only if restoring directly to LIVE/Published)
            if (destination === 'active') {
                try {
                    const pushRes = await fetch("/api/push/send", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({
                            title: `New Update: ${selectedNewsletter.title}`,
                            body: selectedNewsletter.excerpt || "Tap to read the latest from Milk & Honey.",
                            url: `${window.location.origin}/newsletters/${selectedNewsletter.slug}`
                        })
                    });

                    const pushData = await pushRes.json();

                    if (pushData.success && pushData.count > 0) {
                        toast.success(`Restored & Live! Push notification sent to ${pushData.count} subscribers 🚀`);
                    } else {
                        toast.success("Restored & Live! (No subscribers to notify yet)");
                    }
                } catch (err) {
                    console.error("Push blast failed:", err);
                    toast.success("Restored & Live! (But push notification failed to send)");
                }
            } else {
                // If they just restored it to Drafts, no notification is sent.
                toast.success("Moved to Drafts safely.");
            }

            setView(destination);
            await fetchNewsletters();
        }
        setModalType(null);
    };

    const handleConfirmAction = async () => {
        if (!selectedNewsletter) return;

        if (modalType === "delete") {
            if (view === 'trash') {
                const {error} = await supabase.from("newsletters").delete().eq("id", selectedNewsletter.id);
                if (!error) toast.error("Newsletter Permanently Deleted.");
            } else {
                const {error} = await supabase.from('newsletters').update({deleted_at: new Date()}).eq("id", selectedNewsletter.id);
                if (!error) {
                    toast.success("Moved to Trash. It will be kept for 30 days.");
                    setView("trash");
                }
            }
            await fetchNewsletters();
        } else if (modalType === "archive") {
            const newArchiveStatus = !selectedNewsletter.is_archived;
            const {error} = await supabase.from("newsletters").update({is_archived: newArchiveStatus}).eq("id", selectedNewsletter.id);
            if (error) toast.error("Update failed");
            else {
                toast.success(newArchiveStatus ? "Archived" : "Restored");
                setView(newArchiveStatus ? "archive" : "active");
            }
        }

        await fetchNewsletters();
        setModalType(null);
    };

    const getEmptyStateMessage = () => {
        if (search) return "No newsletters found matching your search.";
        if (view === "trash") return "Trash is currently empty.";
        if (view === "archive") return "Your archive is currently empty.";
        return "No newsletters found. Click '+ New Entry' to create one.";
    };

    if (isInitialLoad) {
        return (
            <div className="min-h-screen bg-brand-surface p-6 md:p-12">
                <AdminSkeletonLoader variant="newsletter-library"/>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-surface p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 md:mb-8">
                    <Link href="/admin" className="text-xs md:text-sm text-brand-secondary font-bold hover:underline">
                        <span className="text-lg leading-none">←</span> Back to Admin Dashboard
                    </Link>
                </div>

                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
                    <div className="w-full md:w-auto overflow-x-auto no-scrollbar">
                        <div
                            className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-max md:w-fit min-w-full md:min-w-0">
                            <button
                                onClick={() => setView("active")}
                                className={`whitespace-nowrap px-6 py-2 rounded-lg text-xs font-bold transition-all ${view === "active" ? "bg-white text-brand-primary shadow-sm" : "text-gray-500 hover:text-brand-primary"}`}
                            >
                                Published
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
                                Trash <span
                                className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[8px]">30 Days</span>
                            </button>
                        </div>
                    </div>

                    <p className="text-[11px] md:text-sm text-gray-500 italic md:text-right leading-relaxed max-w-[250px] md:max-w-none">
                        {view === "active" && "Manage your Live and Scheduled Newsletters."}
                        {view === "archive" && "Archived updates are hidden from the public feed."}
                        {view === "trash" && "Permanently Deleted After 30 Days."}
                        {view === 'draft' && "Unfinished updates are saved here."}
                    </p>
                </div>

                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 md:mb-10 gap-4">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary">
                        Newsletter Desk
                    </h1>

                    {(view === 'active' || view === 'draft') && role !== 'viewer' && (
                        <button
                            onClick={() => router.push("/admin/newsletters/new")}
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
                        {label: "Latest First", value: "latest"},
                        {label: "Oldest First", value: "oldest"},
                        {label: "Title (A-Z)", value: "alphabetical"},
                    ]}
                />

                {/* DESKTOP TABLE */}
                <div
                    className="hidden md:block bg-white rounded-3xl border border-brand-accent overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead
                            className="bg-slate-50 border-b border-brand-accent text-[10px] uppercase font-black text-brand-primary">
                        <tr className="justify-around items-center">
                            <th className="p-5">Details & Excerpt</th>
                            <th className="p-5">Author & Schedule</th>
                            {view === "trash" && <th className="p-5 w-[15%]">Time Left</th>}
                            <th className={`p-5 text-right ${view === 'trash' ? 'w-[15%]' : 'w-[30%]'}`}>Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="p-0">
                                    <AdminSkeletonLoader variant="table-body-only" rows={PAGE_SIZE}/>
                                </td>
                            </tr>
                        ) : (
                            newsletters.map((n) => {
                                const status = getStatus(n);
                                const StatusIcon = status.icon;

                                return (
                                    <tr key={n.id}
                                        className={`transition-opacity ${n.is_archived && view !== "trash" ? "opacity-100 grayscale" : ""}`}>
                                        <td className="p-5">
                                            <div className="flex gap-2 mb-2">
                                                <div
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${status.color}`}>
                                                    <StatusIcon size={10} strokeWidth={3}/> {status.label}
                                                </div>
                                            </div>
                                            <div
                                                className="font-serif font-bold text-lg text-brand-primary leading-tight">{n.title}</div>
                                            <div
                                                className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tight">
                                                /{n.slug}
                                            </div>
                                            <div
                                                className="text-xs text-gray-500 mt-2 line-clamp-1">{n.excerpt || "No excerpt provided."}</div>
                                        </td>

                                        <td className="p-5">
                                            <div className="text-sm font-medium text-gray-700">{n.author_name}</div>
                                            <div className="flex gap-4 mt-3">
                                                <div className="text-xs text-gray-400 font-medium flex flex-col gap-1">
                                                    <span>Created: {new Date(n.created_at).toLocaleDateString('en-GB')}</span>
                                                    {n.published_at && (
                                                        <span
                                                            className={`${status.label === 'Scheduled' ? 'text-blue-500 font-bold' : ''}`}>
                                                        Publishes: {new Date(n.published_at).toLocaleDateString('en-GB')}
                                                    </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {view === "trash" && (
                                            <td className="p-5">
                                                <div className="flex items-center gap-2 text-amber-600 font-bold">
                                                    <Clock size={14}/>
                                                    <span className="text-xs">{getDaysLeft(n.deleted_at)} days</span>
                                                </div>
                                            </td>
                                        )}

                                        <td className="p-5 text-right">
                                            <ActionButtons
                                                newsletter={n}
                                                onArchive={triggerArchive}
                                                onDelete={triggerDelete}
                                                onRestore={triggerRestore}
                                                onQuickPublish={triggerPublishModal}
                                                view={view}
                                                role={role}
                                            />
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                        </tbody>
                    </table>
                    {newsletters.length === 0 && !loading && (
                        <div className="p-20 text-center text-brand-primary font-bold italic">
                            {getEmptyStateMessage()}
                        </div>
                    )}
                </div>

                {/* --- MOBILE CARD VIEW --- */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <AdminSkeletonLoader variant="list-item" count={3}/>
                    ) : (
                        newsletters.map((n) => {
                            const status = getStatus(n);
                            const StatusIcon = status.icon;

                            return (
                                <div key={n.id}
                                     className={`bg-white p-5 rounded-2xl border border-brand-accent shadow-sm ${n.is_archived && view !== "trash" ? "opacity-60 grayscale" : ""}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div
                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest ${status.color}`}>
                                            <StatusIcon size={10} strokeWidth={3}/> {status.label}
                                        </div>
                                        <div
                                            className="text-[10px] text-gray-400 font-bold">{new Date(n.created_at).toLocaleDateString('en-GB')}</div>
                                    </div>

                                    <h3 className="font-serif font-bold text-brand-primary text-lg mb-1 leading-tight">{n.title}</h3>
                                    <p className="text-sm text-gray-600 mb-1">{n.author_name}</p>

                                    <div
                                        className="flex flex-wrap gap-4 justify-between items-center pt-4 border-t border-gray-50 mt-4">
                                        {view === "trash" && (
                                            <div
                                                className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-md font-bold text-[8px] border border-amber-100">
                                                <Clock size={10}/>
                                                <span>{getDaysLeft(n.deleted_at)}D LEFT</span>
                                            </div>
                                        )}

                                        <ActionButtons
                                            newsletter={n}
                                            onArchive={triggerArchive}
                                            onDelete={triggerDelete}
                                            onRestore={triggerRestore}
                                            onQuickPublish={triggerPublishModal}
                                            view={view}
                                            role={role}
                                        />
                                    </div>
                                </div>
                            )
                        })
                    )}

                    {newsletters.length === 0 && !loading && (
                        <div
                            className='p-12 text-center text-brand-primary font-bold italic bg-white rounded-2xl border border-brand-accent shadow-sm'>
                            {getEmptyStateMessage()}
                        </div>
                    )}
                </div>

                {/* --- PAGINATION CONTROLS --- */}
                <div
                    className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-brand-accent pt-8">
                    <div className="text-xs font-bold text-brand-secondary uppercase tracking-widest">
                        Showing <span className="text-brand-primary">{newsletters.length}</span> of {totalCount} Updates
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1 || loading}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="flex items-center gap-1 bg-white border border-gray-200 text-brand-primary px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <ChevronLeft size={12}/> Prev
                        </button>

                        <div className="flex items-center gap-1">
                            <span
                                className="bg-brand-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-brand-primary/20">{currentPage}</span>
                            <span className="text-gray-400 px-2 font-bold text-sm">/</span>
                            <span
                                className="text-brand-primary font-bold text-sm">{Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}</span>
                        </div>

                        <button
                            disabled={currentPage >= Math.ceil(totalCount / PAGE_SIZE) || loading}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="flex items-center gap-1 bg-white border border-gray-200 text-brand-primary px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            Next <ChevronRight size={12}/>
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={modalType === "delete" || modalType === "archive"}
                title={
                    modalType === "delete"
                        ? (view === "trash" ? "Permanently Delete?" : "Move to Trash?")
                        : (selectedNewsletter?.is_archived ? "Restore Update?" : "Archive Update?")
                }
                message={
                    modalType === "delete"
                        ? (view === "trash"
                            ? "This action is truly permanent. This newsletter will be gone forever."
                            : "This will move the newsletter to the trash. You can still restore it for the next 30 days.")
                        : (selectedNewsletter?.is_archived
                            ? "This will make the newsletter visible to the public again."
                            : "This will hide the newsletter from the public feed, but you can restore it anytime.")
                }
                variant={modalType === "delete" ? "danger" : "primary"}
                confirmText={
                    modalType === "delete"
                        ? (view === "trash" ? "Delete Forever" : "Move to Trash")
                        : (selectedNewsletter?.is_archived ? "Restore to Feed" : "Confirm Archive")
                }
                onClose={() => setModalType(null)}
                onConfirm={handleConfirmAction}
            />

            {modalType === "restore" && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-brand-accent">
                        <h2 className="text-2xl font-serif font-bold text-brand-primary mb-2">Restore Newsletter</h2>
                        <p className="text-gray-500 text-sm mb-8">Where would you like to restore <span
                            className="font-bold text-brand-primary">"{selectedNewsletter?.title}"</span>?</p>

                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => handleRestoreFromArchive('active')}
                                className="flex items-center justify-between p-4 rounded-2xl border-2 border-brand-accent hover:border-brand-primary hover:bg-brand-surface transition-all group"
                            >
                                <div className="text-left">
                                    <div className="font-bold text-brand-primary">Published</div>
                                    <div className="text-[10px] text-gray-400 uppercase font-bold">Make public
                                        immediately
                                    </div>
                                </div>
                                <Inbox className="text-brand-primary group-hover:scale-110 transition-transform"/>
                            </button>

                            <button
                                onClick={() => handleRestoreFromArchive('draft')}
                                className="flex items-center justify-between p-4 rounded-2xl border-2 border-brand-accent hover:border-brand-primary hover:bg-brand-surface transition-all group"
                            >
                                <div className="text-left">
                                    <div className="font-bold text-brand-primary">Drafts</div>
                                    <div className="text-[10px] text-gray-400 uppercase font-bold">Keep hidden for
                                        editing
                                    </div>
                                </div>
                                <FileText className="text-brand-primary group-hover:scale-110 transition-transform"/>
                            </button>
                        </div>

                        <button onClick={() => setModalType(null)}
                                className="w-full mt-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-brand-primary transition-colors">Cancel
                        </button>
                    </div>
                </div>
            )}

            {isPublishModalOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-brand-accent">
                        <div className="flex items-center gap-3 mb-2">
                            <Send className="text-indigo-600" size={24}/>
                            <h2 className="text-2xl font-serif font-bold text-brand-primary">Publish Newsletter</h2>
                        </div>
                        <p className="text-gray-500 text-sm mb-6">How would you like to publish <span
                            className="font-bold text-brand-primary">"{selectedNewsletter?.title}"</span>?</p>

                        <div className="space-y-3 mb-6">
                            <label
                                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${publishMode === "now" ? "border-green-500 bg-green-50/50" : "border-gray-100 hover:border-green-200"}`}>
                                <input
                                    type="radio"
                                    checked={publishMode === "now"}
                                    onChange={() => setPublishMode("now")}
                                    className="mt-1 accent-green-600"
                                />
                                <div>
                                    <div className="font-bold text-gray-900 text-sm">Publish Immediately</div>
                                    <div className="text-[10px] text-gray-500 mt-0.5">Make live instantly.</div>
                                </div>
                            </label>

                            <label
                                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${publishMode === "schedule" ? "border-blue-500 bg-blue-50/50" : "border-gray-100 hover:border-blue-200"}`}>
                                <input
                                    type="radio"
                                    checked={publishMode === "schedule"}
                                    onChange={() => setPublishMode("schedule")}
                                    className="mt-1 accent-blue-600"
                                />
                                <div>
                                    <div className="font-bold text-gray-900 text-sm">Schedule for Later</div>
                                    <div className="text-[10px] text-gray-500 mt-0.5">Set a future date to go live.
                                    </div>
                                </div>
                            </label>

                            {publishMode === "schedule" && (
                                <div
                                    className="mt-3 p-4 bg-slate-50 border border-gray-100 rounded-xl animate-in slide-in-from-top-2">
                                    <label
                                        className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                                        <Calendar size={12}/> Select Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={scheduleDate}
                                        onChange={(e) => setScheduleDate(e.target.value)}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-blue-500"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsPublishModalOpen(false)}
                                className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executePublish}
                                disabled={isPublishing}
                                className="flex-[2] py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-70"
                            >
                                {isPublishing ? "Processing..." : publishMode === "now" ? "Publish Now" : "Schedule Post"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ActionButtons({
                           newsletter,
                           onArchive,
                           onDelete,
                           onRestore,
                           onQuickPublish,
                           view,
                           role
                       }: {
    newsletter: any,
    onArchive: any,
    onDelete: any,
    onRestore: any,
    onQuickPublish: (n: any) => void,
    view: 'active' | 'trash' | 'archive' | 'draft',
    role: string
}) {

    const handleViewLive = (slug: string) => {
        if (view === "draft") {
            window.open(`/newsletters/${slug}?preview=true`, '_blank');
        } else {
            window.open(`/newsletters/${slug}`, '_blank');
        }
        toast.info("Opening public preview...");
    };

    if (view === "trash") {
        return (
            <div className="flex items-center gap-6 justify-end w-full">
                {role !== 'viewer' && (
                    <button onClick={() => onRestore(newsletter)} className="flex flex-col items-center gap-1 group">
                        <RotateCcw size={18}
                                   className="text-emerald-600 transition-transform group-hover:rotate-[-45deg]"/>
                        <span className="text-[8px] font-bold uppercase text-emerald-600">Restore</span>
                    </button>
                )}
                {role === 'super-admin' && (
                    <button onClick={() => onDelete(newsletter)} className="flex flex-col items-center gap-1 group">
                        <Trash2 size={18} className="text-red-400 group-hover:text-red-600"/>
                        <span className="text-[8px] font-bold uppercase text-red-400">Purge</span>
                    </button>
                )}
            </div>
        );
    }

    if (view === "archive") {
        return (
            <div className="flex items-center gap-4 justify-end w-full">
                {role !== 'viewer' && (
                    <>
                        <button onClick={() => onRestore(newsletter)}
                                className="text-emerald-600 flex flex-col items-center gap-1"><RotateCcw
                            size={18}/><span className="text-[8px] font-bold uppercase">Restore</span></button>
                        <button onClick={() => onDelete(newsletter)}
                                className="text-red-400 flex flex-col items-center gap-1"><Trash2 size={18}/><span
                            className="text-[8px] font-bold uppercase">Trash</span></button>
                    </>
                )}
            </div>
        );
    }

    if (view === "draft") {
        return (
            <div className="flex items-center gap-6 justify-end w-full">
                <button
                    onClick={() => handleViewLive(newsletter.slug)}
                    className="flex flex-col items-center gap-1 text-brand-secondary hover:text-brand-primary"
                    title="View Preview"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <span
                        className="text-[8px] font-bold uppercase text-brand-secondary group-hover:text-brand-primary">Pre-View</span>
                </button>
                {role !== 'viewer' && (
                    <>
                        <button onClick={() => onQuickPublish(newsletter)}
                                className="flex flex-col items-center gap-1 group hover:bg-brand-primary/10 transition-colors">
                            <Inbox size={18} className="text-brand-primary"/>
                            <span className="text-[8px] font-bold uppercase text-brand-primary">Publish</span>
                        </button>
                        <Link href={`/admin/newsletters/edit/${newsletter.id}`}
                              className="flex flex-col items-center gap-1">
                            <FileText size={18} className="text-slate-400 hover:text-brand-primary"/>
                            <span className="text-[8px] font-bold uppercase text-slate-400">Edit</span>
                        </Link>
                        <button onClick={() => onDelete(newsletter)} className="flex flex-col items-center gap-1">
                            <Trash2 size={18} className="text-red-200 hover:text-red-600"/>
                            <span className="text-[8px] font-bold uppercase text-red-300">Trash</span>
                        </button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4 justify-end w-full">
            <button
                onClick={() => handleViewLive(newsletter.slug)}
                className=" flex flex-col items-center gap-1 text-brand-secondary hover:text-brand-primary"
                title="View on Website"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
                <span
                    className="text-[8px] font-bold uppercase text-brand-secondary group-hover:text-brand-primary">View</span>
            </button>
            {role !== 'viewer' && (
                <>
                    <button onClick={() => onArchive(newsletter)} className="flex flex-col items-center gap-1 group">
                        <Archive size={18}
                                 className={`${newsletter.is_archived ? "text-green-600" : "text-slate-400 group-hover:text-slate-600"}`}/>
                        <span
                            className={`text-[8px] font-bold uppercase ${newsletter.is_archived ? "text-green-600" : "text-gray-400"}`}>{newsletter.is_archived ? "Restore" : "Arch"}</span>
                    </button>
                    <Link href={`/admin/newsletters/edit/${newsletter.id}`}
                          className="flex flex-col items-center gap-1 min-h-[40px] py-1">
                        <FileText size={18} className="text-brand-primary"/>
                        <span className="text-[8px] font-bold uppercase text-brand-primary">Edit</span>
                    </Link>
                    <button onClick={() => onDelete(newsletter)} className="flex flex-col items-center gap-1">
                        <Trash2 size={18} className="text-red-200 hover:text-red-600"/>
                        <span className="text-[8px] font-bold uppercase text-red-300">Del</span>
                    </button>
                </>
            )}
        </div>
    );
}