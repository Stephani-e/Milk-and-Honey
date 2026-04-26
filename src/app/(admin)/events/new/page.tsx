"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Star, Layers, Calendar, Clock, Plus, Trash2, ImageIcon } from "lucide-react";

export default function NewEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Step 1: The Branching State
    const [eventType, setEventType] = useState<"recurring" | "single_day" | "multi_day" | null>(null);

    // Common Form State
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Weekly Service");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("Main Auditorium");
    const [flyerUrl, setFlyerUrl] = useState("");

    // Optional Meta
    const [theme, setTheme] = useState("");
    const [topic, setTopic] = useState("");
    const [guestSpeaker, setGuestSpeaker] = useState("");

    // Recurring Specific State
    const [recurringPattern, setRecurringPattern] = useState("weekly");
    const [recurringDay, setRecurringDay] = useState("sunday");
    const [startTime, setStartTime] = useState("18:00");
    const [endTime, setEndTime] = useState("20:00");

    // Single Day Specific State
    const [singleDate, setSingleDate] = useState("");

    // Multi-Day Specific State (Dynamic Array)
    const [multiDays, setMultiDays] = useState([
        { date: "", start_time: "18:00", end_time: "21:00", label: "Day 1" }
    ]);

    // --- NEW: DYNAMIC CATEGORY LOGIC ---
    useEffect(() => {
        if (eventType === "recurring") {
            setCategory("Weekly Service");
        } else if (eventType === "multi_day") {
            setCategory("Multi-Day Conference");
        } else if (eventType === "single_day") {
            setCategory("Other Event");
        }
    }, [eventType]);

    const getAvailableCategories = () => {
        if (eventType === "recurring") return ["Weekly Service", "Monthly Service", "Special Prayer Session"];
        if (eventType === "multi_day") return ["Multi-Day Conference", "Special Prayer Session", "Other Event"];
        return ["Other Event", "Special Prayer Session"]; // single_day
    };
    // -----------------------------------

    const handleAddMultiDay = () => {
        setMultiDays([...multiDays, { date: "", start_time: "18:00", end_time: "21:00", label: `Day ${multiDays.length + 1}` }]);
    };

    const handleRemoveMultiDay = (index: number) => {
        setMultiDays(multiDays.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload: any = {
            title, event_type: eventType, category, description, location,
            flyer_url: flyerUrl, theme, topic, guest_speaker: guestSpeaker
        };

        if (eventType === "recurring") {
            payload.recurrence_rules = { pattern_type: recurringPattern, day: recurringDay, start_time: startTime, end_time: endTime };
        } else if (eventType === "single_day") {
            payload.start_datetime = new Date(`${singleDate}T${startTime}`).toISOString();
            payload.end_datetime = new Date(`${singleDate}T${endTime}`).toISOString();
        } else if (eventType === "multi_day") {
            payload.multi_day_schedule = multiDays;
        }

        const { error } = await supabase.from("church_events").insert(payload);

        if (error) {
            toast.error("Error creating event: " + error.message);
            setLoading(false);
        } else {
            toast.success("Event created successfully!");
            router.push("/events");
            router.refresh();
        }
    };

    if (!eventType) {
        return (
            <div className="min-h-screen bg-brand-surface p-6 md:p-12 font-sans flex flex-col items-center justify-center">
                <div className="max-w-4xl w-full">
                    <Link href="/events" className="text-sm font-bold text-brand-secondary mb-8 block hover:underline">← Back to Dashboard</Link>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary text-center mb-4">What kind of event are you creating?</h1>
                    <p className="text-center text-gray-500 mb-12">Select the scheduling logic for this program.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <button onClick={() => setEventType("recurring")} className="bg-white p-8 rounded-3xl border-2 border-transparent hover:border-blue-500 shadow-sm hover:shadow-xl transition-all group text-left flex flex-col items-start">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><RefreshCw size={28} /></div>
                            <h3 className="font-bold text-brand-primary text-xl mb-2">Infinite Recurring</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">A standard weekly or monthly service that loops forever.</p>
                        </button>
                        <button onClick={() => setEventType("single_day")} className="bg-white p-8 rounded-3xl border-2 border-transparent hover:border-amber-500 shadow-sm hover:shadow-xl transition-all group text-left flex flex-col items-start">
                            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Star size={28} /></div>
                            <h3 className="font-bold text-brand-primary text-xl mb-2">Single-Day Special</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">A one-off event on a specific date.</p>
                        </button>
                        <button onClick={() => setEventType("multi_day")} className="bg-white p-8 rounded-3xl border-2 border-transparent hover:border-purple-500 shadow-sm hover:shadow-xl transition-all group text-left flex flex-col items-start">
                            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Layers size={28} /></div>
                            <h3 className="font-bold text-brand-primary text-xl mb-2">Multi-Day Conference</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">Programs spanning several days with distinct daily times.</p>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-surface p-4 md:p-12 font-sans">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => setEventType(null)} className="text-sm font-bold text-brand-secondary mb-6 flex items-center gap-2 hover:underline">
                    <ArrowLeft size={16} /> Change Event Type
                </button>

                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-brand-accent">
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                        {eventType === 'recurring' && <RefreshCw className="text-blue-600" size={24} />}
                        {eventType === 'single_day' && <Star className="text-amber-600" size={24} />}
                        {eventType === 'multi_day' && <Layers className="text-purple-600" size={24} />}
                        <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary">Create {eventType === 'recurring' ? 'Recurring' : eventType === 'single_day' ? 'Special' : 'Multi-Day'} Event</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">

                        {/* 1. CORE DETAILS */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest">1. Core Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Event Title *</label>
                                    <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Digging Deep" className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl text-brand-primary font-bold focus:ring-2 focus:ring-brand-primary outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Category *</label>
                                    {/* --- NEW: DYNAMIC SELECT MAPPING --- */}
                                    <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl text-brand-primary font-bold focus:ring-2 focus:ring-brand-primary outline-none">
                                        {getAvailableCategories().map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 2. FLYER & MEDIA */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest">2. Event Flyer</h3>
                            <div className="flex flex-col sm:flex-row gap-6 items-start">
                                <div className="w-full sm:w-48 aspect-square bg-slate-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
                                    {flyerUrl ? (
                                        <img src={flyerUrl} alt="Flyer" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-gray-300 flex flex-col items-center"><ImageIcon size={32} className="mb-2"/><span className="text-[10px] font-bold uppercase">No Image</span></div>
                                    )}
                                </div>
                                <div className="flex-1 w-full space-y-4">
                                    <p className="text-sm text-gray-500">Upload the official graphic for this event. It will be displayed on the public calendar.</p>
                                    {!flyerUrl ? (
                                        <UploadButton
                                            endpoint="imageUploader"
                                            appearance={{ button: "bg-brand-primary text-white text-xs px-6 py-4 rounded-xl after:bg-brand-secondary w-full sm:w-auto" }}
                                            onClientUploadComplete={(res) => { setFlyerUrl(res[0].url); toast.success("Flyer uploaded!"); }}
                                            onUploadError={(error) => { toast.error(`Upload Failed: ${error.message}`); }}
                                        />
                                    ) : (
                                        <button type="button" onClick={() => setFlyerUrl("")} className="bg-red-50 text-red-600 px-6 py-3 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">Remove Flyer</button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 3. TIME & LOGIC */}
                        <div className="space-y-6 p-6 md:p-8 bg-slate-50 border border-gray-100 rounded-3xl">
                            <h3 className="text-xs font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2"><Calendar size={16}/> 3. Scheduling Rules</h3>

                            {/* IF RECURRING */}
                            {eventType === 'recurring' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Pattern</label>
                                        <select value={recurringPattern} onChange={e => setRecurringPattern(e.target.value)} className="w-full p-4 border rounded-xl bg-white">
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">{recurringPattern === 'weekly' ? 'Day of Week' : 'Monthly Rule'}</label>
                                        {recurringPattern === 'weekly' ? (
                                            <select value={recurringDay} onChange={e => setRecurringDay(e.target.value)} className="w-full p-4 border rounded-xl bg-white">
                                                <option value="sunday">Sunday</option><option value="monday">Monday</option><option value="tuesday">Tuesday</option><option value="wednesday">Wednesday</option><option value="thursday">Thursday</option><option value="friday">Friday</option><option value="saturday">Saturday</option>
                                            </select>
                                        ) : (
                                            <input placeholder="e.g. first_thursday" value={recurringDay} onChange={e => setRecurringDay(e.target.value)} className="w-full p-4 border rounded-xl bg-white" />
                                        )}
                                    </div>
                                    <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Start Time</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-4 border rounded-xl bg-white" /></div>
                                    <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">End Time</label><input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full p-4 border rounded-xl bg-white" /></div>
                                </div>
                            )}

                            {/* IF SINGLE DAY */}
                            {eventType === 'single_day' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
                                    <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Specific Date</label><input type="date" required value={singleDate} onChange={e => setSingleDate(e.target.value)} className="w-full p-4 border rounded-xl bg-white" /></div>
                                    <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Start Time</label><input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-4 border rounded-xl bg-white" /></div>
                                    <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">End Time</label><input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full p-4 border rounded-xl bg-white" /></div>
                                </div>
                            )}

                            {/* IF MULTI DAY */}
                            {eventType === 'multi_day' && (
                                <div className="space-y-4 animate-in fade-in">
                                    {multiDays.map((day, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row gap-4 items-end bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group">
                                            <div className="flex-1 w-full"><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Label</label><input value={day.label} onChange={e => {const newDays = [...multiDays]; newDays[index].label = e.target.value; setMultiDays(newDays);}} className="w-full p-3 border rounded-lg" /></div>
                                            <div className="flex-1 w-full"><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Date</label><input type="date" required value={day.date} onChange={e => {const newDays = [...multiDays]; newDays[index].date = e.target.value; setMultiDays(newDays);}} className="w-full p-3 border rounded-lg" /></div>
                                            <div className="flex-1 w-full"><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Start</label><input type="time" required value={day.start_time} onChange={e => {const newDays = [...multiDays]; newDays[index].start_time = e.target.value; setMultiDays(newDays);}} className="w-full p-3 border rounded-lg" /></div>
                                            <div className="flex-1 w-full"><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">End</label><input type="time" required value={day.end_time} onChange={e => {const newDays = [...multiDays]; newDays[index].end_time = e.target.value; setMultiDays(newDays);}} className="w-full p-3 border rounded-lg" /></div>

                                            {multiDays.length > 1 && (
                                                <button type="button" onClick={() => handleRemoveMultiDay(index)} className="p-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={18}/></button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={handleAddMultiDay} className="w-full py-4 border-2 border-dashed border-purple-200 text-purple-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors">
                                        <Plus size={18} /> Add Another Day
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 4. OPTIONAL OVERRIDES */}
                        {(eventType === 'single_day' || eventType === 'multi_day') && (
                            <div className="space-y-6 animate-in fade-in">
                                <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest">4. Special Overrides (Optional)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Guest Speaker(s)</label><input value={guestSpeaker} onChange={e => setGuestSpeaker(e.target.value)} placeholder="e.g. Pastor E.A. Adeboye" className="w-full p-4 border rounded-xl" /></div>
                                    <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Specific Theme</label><input value={theme} onChange={e => setTheme(e.target.value)} placeholder="e.g. Let There Be Light" className="w-full p-4 border rounded-xl" /></div>
                                    <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Specific Topic</label><input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Faith to Move Mountains" className="w-full p-4 border rounded-xl" /></div>
                                </div>
                            </div>
                        )}

                        <div className="pt-8 border-t border-gray-100 flex justify-end">
                            <button type="submit" disabled={loading} className="w-full sm:w-auto px-10 py-5 bg-brand-primary text-white rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-colors disabled:opacity-50">
                                {loading ? "Saving Event..." : "Publish to Calendar"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}