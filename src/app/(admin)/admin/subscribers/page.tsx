"use client";
import React, {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";
import {ChevronLeft, ChevronRight, Copy, Mail, Search, Trash2, X} from "lucide-react";
import {toast} from "sonner";
import AdminSkeletonLoader from "@/components/Admin/SkeletonLoader";
import Link from "next/link";

const PAGE_SIZE = 10;

export default function SubscribersAdminPage() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination & Search State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch data whenever the page or search term changes
    useEffect(() => {
        fetchSubscribers().catch((err) => console.error("Failed to fetch subscribers:", err))
    }, [currentPage, searchTerm]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Always reset to page 1 when typing a new search!
    };

    async function fetchSubscribers() {
        setLoading(true);

        // 1. Start building the query and ask for the EXACT total count
        let query = supabase
            .from("newsletter_subscribers")
            .select("*", {count: 'exact'})
            .order("created_at", {ascending: false});

        // 2. If the admin typed a search term, filter the emails
        if (searchTerm) {
            query = query.ilike('email', `%${searchTerm}%`);
        }

        // 3. Apply the pagination math
        const from = (currentPage - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const {data, count, error} = await query.range(from, to);

        if (error) {
            toast.error("Failed to load subscribers.");
        } else {
            setSubscribers(data || []);
            setTotalCount(count || 0);
        }

        setLoading(false);
    }

    const copyAllEmails = async () => {
        const loadingToast = toast.loading("Fetching emails to copy...");

        // We do a fresh fetch without `.range()` so we copy ALL emails, not just this page
        let query = supabase.from("newsletter_subscribers").select("email");
        if (searchTerm) {
            query = query.ilike('email', `%${searchTerm}%`);
        }

        const {data, error} = await query;

        if (error || !data) {
            toast.dismiss(loadingToast);
            return toast.error("Failed to fetch emails for copying.");
        }

        const emailList = data.map(sub => sub.email).join(", ");

        try {
            await navigator.clipboard.writeText(emailList);
            toast.dismiss(loadingToast);
            toast.success(`Copied ${data.length} emails to clipboard!`);
        } catch (err) {
            console.error("Clipboard error:", err);
            toast.dismiss(loadingToast);
            toast.error("Failed to copy emails to clipboard. Please grant browser permissions.");
        }
    };

    const handleDelete = async (id: string, email: string) => {
        if (!confirm("Remove this subscriber from all lists?")) return;

        // 1. Delete it from your local Supabase database first
        const {error} = await supabase.from("newsletter_subscribers").delete().eq("id", id);

        if (error) {
            toast.error("Failed to remove subscriber locally.");
            return;
        }

        // 2. Tell our secure API to delete them from MailerLite too
        try {
            await fetch('/api/email/delete-subscriber', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email})
            });
        } catch (err) {
            console.error("Failed to sync deletion with MailerLite", err);
        }

        toast.success("Subscriber permanently removed.");

        // 3. Refetch to adjust pagination correctly
        fetchSubscribers().catch((err) => console.error("Failed to fetch subscribers:", err));
    };

    return (
        <div className="min-h-screen bg-brand-surface p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <Link href="/admin" className="text-sm font-bold text-brand-secondary hover:underline">
                        ← Back to Dashboard
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-brand-primary">Mailing List</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Total Subscribers: <span className="font-bold text-brand-primary">{totalCount}</span>
                        </p>
                    </div>

                    <button
                        onClick={copyAllEmails}
                        disabled={totalCount === 0}
                        className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        <Copy size={16}/> Copy {searchTerm ? "Filtered" : "All"} Emails
                    </button>
                </div>

                {/* --- SEARCH BAR --- */}
                <div
                    className="flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-brand-accent shadow-sm mb-6 transition-all focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/10">
                    <Search size={20} className="text-gray-400"/>
                    <input
                        type="text"
                        placeholder="Search for a specific email address..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full bg-transparent outline-none text-sm text-brand-primary font-medium placeholder-gray-400"
                    />
                    {searchTerm && (
                        <button onClick={() => handleSearchChange({target: {value: ''}} as any)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={16} className="text-gray-400 hover:text-brand-primary"/>
                        </button>
                    )}
                </div>

                {/* --- TABLE AREA --- */}
                <div
                    className="bg-white rounded-3xl border border-brand-accent overflow-hidden shadow-sm min-h-[300px]">
                    {loading ? (
                        <AdminSkeletonLoader variant="table-body-only"/>
                    ) : subscribers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Mail size={48} className="text-gray-200 mb-4"/>
                            <p className="text-gray-400 font-bold">
                                {searchTerm ? "No subscribers match your search." : "No subscribers yet."}
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead
                                className="bg-slate-50 border-b border-brand-accent text-[10px] uppercase font-black text-brand-primary">
                            <tr>
                                <th className="p-5">Email Address</th>
                                <th className="p-5">Subscribed Date</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {subscribers.map((sub) => (
                                <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-5 font-medium text-brand-primary flex items-center gap-2">
                                        <Mail size={14} className="text-brand-secondary"/> {sub.email}
                                    </td>
                                    <td className="p-5 text-sm text-gray-500">
                                        {new Date(sub.created_at).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="p-5 text-right">
                                        <button
                                            onClick={() => handleDelete(sub.id, sub.email)}
                                            className="text-red-400 hover:text-red-600 transition-colors p-2"
                                            title="Remove Subscriber"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* --- PAGINATION CONTROLS --- */}
                {!loading && totalCount > 0 && (
                    <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Showing <span
                            className="text-brand-primary">{(currentPage - 1) * PAGE_SIZE + 1}</span> of {totalCount}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="flex items-center gap-1 bg-white border border-gray-200 text-brand-primary px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                <ChevronLeft size={12}/> Prev
                            </button>

                            <div className="flex items-center gap-1 mx-2">
                                <span
                                    className="bg-brand-primary text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-md shadow-brand-primary/20">{currentPage}</span>
                                <span className="text-gray-300 font-black text-sm">/</span>
                                <span
                                    className="text-gray-500 font-bold text-sm">{Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}</span>
                            </div>

                            <button
                                disabled={currentPage >= Math.ceil(totalCount / PAGE_SIZE)}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="flex items-center gap-1 bg-white border border-gray-200 text-brand-primary px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                Next <ChevronRight size={12}/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}