"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function NewSermonPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showNewServiceInput, setShowNewServiceInput] = useState(false);
    const [newServiceValue, setNewServiceValue] = useState("");

    // Initial Dropdown Options
    const [serviceTypes, setServiceTypes] = useState(["Sunday Service", "Digging Deep", "Faith Clinic", "Vigil", "Wind of Change"]);
    const [hostGroups, setHostGroups] = useState(["Thanksgiving", "Men's Fellowship", "Women's Ministry", "Youth Church", "General - Milk and Honey Parish", "General - Milk and Honey Province", "General - RCCG", "Anointing Service/Church"]);

    const [formData, setFormData] = useState({
        title: "",
        preacher: "",
        bible_text: "",
        content: "",
        service_type: "Sunday Service",
        host_group: "General",
        youtube_url: "", // Now Optional
        service_date: new Date().toISOString().split('T')[0]
    });

    const handleAddNewService = () => {
        if (newServiceValue.trim() !== "") {
            setServiceTypes([...serviceTypes, newServiceValue]);
            setFormData({...formData, service_type: newServiceValue});
            setNewServiceValue("");
            setShowNewServiceInput(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // We only insert if the title is there; youtube_url can be empty
        const { error } = await supabase.from("sermons").insert([formData]);

        if (error) {
            alert(error.message);
            setLoading(false);
        } else {
            router.push("/sermons");
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen bg-brand-surface p-6 md:p-12">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl border border-brand-accent shadow-sm">
                <h1 className="text-3xl font-serif font-bold text-brand-primary mb-6">Register New Sermon</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* SERVICE TYPE & HOST ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Service Type</label>
                            <div className="flex gap-2">
                                {!showNewServiceInput ? (
                                    <>
                                        <select
                                            className="flex-1 p-3 border rounded-lg outline-none"
                                            value={formData.service_type}
                                            onChange={(e) => setFormData({...formData, service_type: e.target.value})}
                                        >
                                            {serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setShowNewServiceInput(true)}
                                            className="px-3 bg-gray-100 rounded-lg hover:bg-brand-secondary hover:text-white transition-colors"
                                        >
                                            +
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex gap-2 w-full">
                                        <input
                                            type="text"
                                            placeholder="New Type..."
                                            className="flex-1 p-3 border rounded-lg outline-none border-brand-secondary"
                                            value={newServiceValue}
                                            onChange={(e) => setNewServiceValue(e.target.value)}
                                        />
                                        <button type="button" onClick={handleAddNewService} className="text-green-600 font-bold">Add</button>
                                        <button type="button" onClick={() => setShowNewServiceInput(false)} className="text-gray-400">x</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Host / Department</label>
                            <select
                                className="w-full p-3 border rounded-lg outline-none"
                                onChange={(e) => setFormData({...formData, host_group: e.target.value})}
                            >
                                {hostGroups.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* BASIC INFO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input
                            placeholder="Sermon Title"
                            className="p-3 border rounded-lg outline-none"
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                        <input
                            placeholder="Preacher Name"
                            className="p-3 border rounded-lg outline-none"
                            onChange={(e) => setFormData({...formData, preacher: e.target.value})}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input
                            placeholder="Bible Text"
                            className="p-3 border rounded-lg outline-none"
                            onChange={(e) => setFormData({...formData, bible_text: e.target.value})}
                        />
                        <input
                            type="date"
                            className="p-3 border rounded-lg outline-none"
                            value={formData.service_date}
                            onChange={(e) => setFormData({...formData, service_date: e.target.value})}
                        />
                    </div>

                    {/* OPTIONAL YOUTUBE */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">YouTube Link (Optional)</label>
                        <input
                            placeholder="https://youtube.com/..."
                            className="w-full p-3 border rounded-lg outline-none"
                            onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
                        />
                    </div>

                    <textarea
                        placeholder="Sermon Notes/Content..."
                        rows={6}
                        className="w-full p-3 border rounded-lg outline-none"
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                    />

                    <button
                        disabled={loading}
                        className="w-full bg-brand-primary text-white py-4 rounded-lg font-bold hover:bg-slate-800 transition-all"
                    >
                        {loading ? "Saving..." : "Save Sermon Entry"}
                    </button>
                </form>
            </div>
        </div>
    );
}