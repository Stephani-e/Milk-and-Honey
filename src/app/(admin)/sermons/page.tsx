"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {useRouter} from "next/navigation";

export default function SermonsPage() {
    const router = useRouter();
    const [sermons, setSermons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const goToNewForm = () => router.push("/sermons/new");

    useEffect(() => {
        fetchSermons();
    }, []);

    async function fetchSermons() {
        const { data, error } = await supabase
            .from("sermons")
            .select("*")
            .order("service_date", { ascending: false }); // Ordered by actual service date

        if (!error) setSermons(data || []);
        setLoading(false);
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this sermon?")) return;

        const { error } = await supabase.from("sermons").delete().eq("id", id);
        if (error) alert("Error deleting sermon");
        else fetchSermons(); // Refresh the list
    };

    return (
        <div className="min-h-screen bg-brand-surface p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <Link href="/admin" className="text-sm text-brand-secondary font-bold hover:underline">
                        ← Back to Dashboard
                    </Link>
                </div>

                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-brand-primary">Sermon Manager</h1>
                        <p className="text-brand-text mt-2 font-sans">View and manage church service uploads.</p>
                    </div>
                    <button
                        onClick={goToNewForm}
                        className="bg-brand-primary text-white py-3 px-8 rounded-lg font-bold shadow-lg hover:bg-slate-800 transition-all"
                    >
                        + Add New Sermon
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-brand-accent overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="p-12 text-center text-gray-400 font-sans italic">Loading library...</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-brand-accent">
                            <tr>
                                <th className="p-4 text-xs uppercase tracking-widest text-brand-primary font-bold">Service Details</th>
                                <th className="p-4 text-xs uppercase tracking-widest text-brand-primary font-bold">Preacher</th>
                                <th className="p-4 text-xs uppercase tracking-widest text-brand-primary font-bold">Type</th>
                                <th className="p-4 text-xs uppercase tracking-widest text-brand-primary font-bold text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {sermons.map((sermon) => (
                                <tr key={sermon.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-serif font-bold text-brand-primary">{sermon.title}</div>
                                        <div className="text-[10px] text-gray-400 uppercase font-bold">{sermon.bible_text}</div>
                                        <div className="text-[10px] text-gray-500">{new Date(sermon.service_date).toLocaleDateString()}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 font-sans">{sermon.preacher}</td>
                                    <td className="p-4">
                                        {sermon.is_streamed ? (
                                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded">LIVE STREAM</span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">RECORDING</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(sermon.id)}
                                            className="text-red-400 hover:text-red-600 text-xs font-bold uppercase"
                                        >
                                            Delete
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