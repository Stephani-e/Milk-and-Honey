"use client";
import React, {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";
import {Copy, Mail, Trash2} from "lucide-react";
import {toast} from "sonner";
import AdminSkeletonLoader from "@/components/Admin/SkeletonLoader";
import Link from "next/link";

export default function SubscribersAdminPage() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    async function fetchSubscribers() {
        setLoading(true);
        const {data, error} = await supabase
            .from("newsletter_subscribers")
            .select("*")
            .order("created_at", {ascending: false});

        if (error) toast.error("Failed to load subscribers.");
        else setSubscribers(data || []);
        setLoading(false);
    }

    const copyAllEmails = () => {
        const emailList = subscribers.map(sub => sub.email).join(", ");
        navigator.clipboard.writeText(emailList);
        toast.success(`Copied ${subscribers.length} emails to clipboard!`);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this subscriber?")) return;
        const {error} = await supabase.from("newsletter_subscribers").delete().eq("id", id);
        if (error) toast.error("Failed to remove subscriber.");
        else {
            toast.success("Subscriber removed.");
            setSubscribers(prev => prev.filter(s => s.id !== id));
        }
    };

    if (loading) return <div className="p-6 md:p-12 min-h-screen bg-brand-surface"><AdminSkeletonLoader
        variant="table-body-only"/></div>;

    return (
        <div className="min-h-screen bg-brand-surface p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href="/admin" className="text-sm font-bold text-brand-secondary hover:underline">
                        ← Back to Dashboard
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-brand-primary">Mailing List</h1>
                        <p className="text-gray-500 text-sm mt-1">Total Subscribers: <span
                            className="font-bold text-brand-primary">{subscribers.length}</span></p>
                    </div>

                    <button
                        onClick={copyAllEmails}
                        disabled={subscribers.length === 0}
                        className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        <Copy size={16}/> Copy All Emails
                    </button>
                </div>

                <div className="bg-white rounded-3xl border border-brand-accent overflow-hidden shadow-sm">
                    {subscribers.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 font-bold italic">No subscribers yet.</div>
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
                                            onClick={() => handleDelete(sub.id)}
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
            </div>
        </div>
    );
}