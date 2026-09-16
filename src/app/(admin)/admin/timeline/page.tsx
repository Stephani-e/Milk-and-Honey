"use client";

import React, {useCallback, useEffect, useState} from "react";
import Link from "next/link";
import {supabase} from "@/lib/supabase";
import {ChevronLeft, ChevronRight, Pencil, Trash2} from "lucide-react";
import AdminSkeletonLoader from "@/components/Admin/SkeletonLoader";

interface TimelineEvent {
    id: string;
    year: string;
    title: string;
    description: string;
    icon_name: string;
}

const PAGE_SIZE = 10;

export default function TimelineManager() {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        year: "",
        title: "",
        description: "",
        icon_name: "Sparkles",
    });

    const fetchEvents = useCallback(async (page: number) => {
        setLoading(true);
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const {data, count, error} = await supabase
            .from("timeline_events")
            .select("*", {count: "exact"})
            .order("year", {ascending: true})
            .range(from, to);

        if (error) {
            console.error("Error fetching timeline events:", error);
        } else {
            setEvents(data || []);
            setTotalCount(count || 0);
        }
        setLoading(false);
        setIsInitialLoad(false);
    }, []);

    useEffect(() => {
        (async () => {
            await fetchEvents(currentPage);
        })();
    }, [currentPage, fetchEvents]);

    const handleOpenModal = (event?: TimelineEvent) => {
        if (event) {
            setEditingId(event.id);
            setFormData({
                year: event.year,
                title: event.title,
                description: event.description,
                icon_name: event.icon_name || "Sparkles",
            });
        } else {
            setEditingId(null);
            setFormData({
                year: "",
                title: "",
                description: "",
                icon_name: "Sparkles",
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({
            year: "",
            title: "",
            description: "",
            icon_name: "Sparkles",
        });
        setEditingId(null);
    };

    const handleSave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);

        if (editingId) {
            const {error} = await supabase
                .from("timeline_events")
                .update(formData)
                .eq("id", editingId);

            if (error) console.error("Error updating:", error);
        } else {
            const {error} = await supabase
                .from("timeline_events")
                .insert([formData]);

            if (error) console.error("Error saving:", error);
        }

        await fetchEvents(currentPage);
        setIsSaving(false);
        handleCloseModal();
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this historical event?")) return;

        const {error} = await supabase
            .from("timeline_events")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting:", error);
        } else {
            // If deleting the last item on a page > 1, step back one page
            if (events.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            } else {
                await fetchEvents(currentPage);
            }
        }
    };

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    if (isInitialLoad) {
        return (
            <div className="min-h-screen bg-brand-surface p-6 md:p-12">
                <div className="max-w-6xl mx-auto">
                    <div className="h-10 w-64 bg-gray-200 animate-pulse rounded-lg mb-8"/>
                    {/* Fixed to variant="table" */}
                    <AdminSkeletonLoader variant="table" rows={5}/>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-brand-surface p-6 md:p-12">
            <div className="max-w-6xl mx-auto">

                <div className="mb-6 md:mb-8">
                    <Link
                        href="/admin"
                        className="text-sm font-bold text-amber-600 hover:text-amber-800 inline-flex items-center gap-2 mb-2">
                        <span className="text-lg leading-none">←</span> Back to Admin Dashboard
                    </Link>
                </div>

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-amber-900 tracking-tight">
                            Church History
                        </h1>
                        <p className="text-gray-500 mt-1">Manage the historical timeline shown on the frontend.</p>
                    </div>

                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-amber-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-900/20"
                    >
                        + Add Milestone
                    </button>
                </div>

                {/* CONTENT TABLE */}
                <div className="bg-white border border-brand-accent rounded-3xl overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="w-full p-4">
                            <AdminSkeletonLoader variant="table-body-only" rows={PAGE_SIZE}/>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No historical events found. Add your first milestone!
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="bg-amber-50/50 border-b border-brand-accent text-amber-900 text-sm">
                                    <th className="p-5 font-bold w-28">Year</th>
                                    <th className="p-5 font-bold w-1/4">Title</th>
                                    <th className="p-5 font-bold">Description</th>
                                    <th className="p-5 font-bold text-right w-28">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {events.map((event) => (
                                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-5 font-bold text-amber-700 align-top">{event.year}</td>
                                        <td className="p-5 font-serif font-bold text-gray-900 align-top">{event.title}</td>
                                        <td className="p-5 text-sm text-gray-500 align-top">{event.description}</td>
                                        <td className="p-5 align-top text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(event)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={18}/>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(event.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* PAGINATION CONTROLS */}
                    {!loading && events.length > 0 && (
                        <div
                            className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-brand-accent p-6 bg-gray-50/50">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Showing <span
                                className="text-amber-900">{events.length}</span> of {totalCount} Milestone Entries
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="flex items-center gap-1 bg-white border border-gray-200 text-amber-900 px-4 py-2 rounded-xl font-bold text-xs hover:bg-amber-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                >
                                    <ChevronLeft size={14}/> Prev
                                </button>

                                <div className="flex items-center gap-1 text-sm font-bold">
                                    <span
                                        className="bg-amber-900 text-white px-3 py-1.5 rounded-lg shadow-sm">{currentPage}</span>
                                    <span className="text-gray-400 px-1">/</span>
                                    <span className="text-amber-900">{totalPages}</span>
                                </div>

                                <button
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="flex items-center gap-1 bg-white border border-gray-200 text-amber-900 px-4 py-2 rounded-xl font-bold text-xs hover:bg-amber-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                >
                                    Next <ChevronRight size={14}/>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ADD/EDIT MODAL */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-gray-100">
                            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
                                {editingId ? "Edit Milestone" : "Add New Milestone"}
                            </h2>

                            <form onSubmit={handleSave} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Year / Date Label
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 1995 or August 2002"
                                        value={formData.year}
                                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                                        className="w-full p-3 text-amber-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Church Foundation"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        className="w-full p-3 text-amber-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Timeline Icon</label>
                                    <select
                                        required
                                        value={formData.icon_name}
                                        onChange={(e) => setFormData({...formData, icon_name: e.target.value})}
                                        className="w-full p-3 text-amber-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="Sparkles">Sparkles (Default / General Event)</option>
                                        <option value="Users">Users (People / Members)</option>
                                        <option value="MapPin">Map Pin (Location / Move)</option>
                                        <option value="Church">Church (Building / Property)</option>
                                        <option value="Award">Award (Achievement / Elevation)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Briefly describe the historical event..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full p-3 text-amber-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-6 py-2.5 text-sm font-bold text-white bg-amber-900 rounded-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? "Saving..." : "Save Milestone"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}