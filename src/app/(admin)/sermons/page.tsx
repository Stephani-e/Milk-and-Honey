"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminFilter from "@/components/AdminFilter";

export default function SermonsPage() {
    const router = useRouter();
    const [sermons, setSermons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("latest");

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

    // Toggle Archive Status
    const toggleArchive = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from("sermons")
            .update({ is_archived: !currentStatus })
            .eq("id", id);

        if (error) alert("Update failed");
        else fetchSermons();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Permanently delete this sermon?")) return;

        const { error } = await supabase.from("sermons").delete().eq("id", id);

        if (error) {
            alert("Delete failed: " + error.message);
        } else {
            fetchSermons();
        }
    };

    return (
        <div className="min-h-screen bg-brand-surface p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <Link href="/admin" className="text-sm text-brand-secondary font-bold hover:underline">
                        ← Back to Dashboard
                    </Link>
                </div>
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-serif font-bold text-brand-primary">Sermon Library</h1>
                    <button onClick={() => router.push("/sermons/new")} className="bg-brand-primary text-white px-6 py-2 rounded-lg font-bold">
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

                <div className="bg-white rounded-3xl border border-brand-accent overflow-hidden shadow-sm">
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
                                            onClick={() => toggleArchive(s.id, s.is_archived)}
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

                                        <button onClick={() => handleDelete(s.id)} className="flex flex-col items-center gap-1">
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
            </div>
        </div>
    );
}