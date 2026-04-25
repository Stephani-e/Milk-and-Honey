"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Star, Layers, Calendar, Lock, Plus, Trash2, ImageIcon } from "lucide-react";

export default function EditEventPage() {
    const router = useRouter();
    const { id } = useParams();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Locked Branching State
    const [eventType, setEventType] = useState<"recurring" | "single_day" | "multi_day" | null>(null);

    // Common Form State
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
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
    const [recurringSessions, setRecurringSessions] = useState<any[]>([]); // For Sunday First/Second Service

    // Single Day Specific State
    const [singleDate, setSingleDate] = useState("");

    // Multi-Day Specific State (Dynamic Array)
    const [multiDays, setMultiDays] = useState<any[]>([]);

    useEffect(() => {
        async function loadEvent() {
            const { data, error } = await supabase.from("church_events").select("*").eq("id", id).single();

            if (error || !data) {
                toast.error("Failed to load event data.");
                router.push("/events");
                return;
            }

            setEventType(data.event_type);
            setTitle(data.title || "");
            setCategory(data.category || "");
            setDescription(data.description || "");
            setLocation(data.location || "Main Auditorium");
            setFlyerUrl(data.flyer_url || "");
            setTheme(data.theme || "");
            setTopic(data.topic || "");
            setGuestSpeaker(data.guest_speaker || "");

            // Parse specific logic based on type
            if (data.event_type === "recurring" && data.recurrence_rules) {
                const rules = data.recurrence_rules;
                setRecurringPattern(rules.pattern_type || "weekly");
                if (rules.pattern_type === "weekly") setRecurringDay(rules.day || "sunday");
                else setRecurringDay(rules.rule || "");

                setStartTime(rules.start_time || "18:00");
                setEndTime(rules.end_time || "20:00");

                // If it has multiple sessions (like Sunday), load them!
                if (rules.sessions) {
                    setRecurringSessions(rules.sessions);
                }
            } else if (data.event_type === "single_day") {
                if (data.start_datetime) {
                    const startDate = new Date(data.start_datetime);
                    setSingleDate(startDate.toISOString().split('T')[0]);
                    setStartTime(startDate.toTimeString().slice(0, 5));
                }
                if (data.end_datetime) {
                    setEndTime(new Date(data.end_datetime).toTimeString().slice(0, 5));
                }
            } else if (data.event_type === "multi_day" && data.multi_day_schedule) {
                setMultiDays(data.multi_day_schedule);
            }

            setFetching(false);
        }
        if (id) loadEvent();
    }, [id, router]);

    const handleAddMultiDay = () => {
        setMultiDays([...multiDays, { date: "", start_time: "18:00", end_time: "21:00", label: `Day ${multiDays.length + 1}` }]);
    };

    const handleRemoveMultiDay = (index: number) => {
        setMultiDays(multiDays.filter((_, i) => i !== index));
    };

    const updateSessionFlyer = (index: number, url: string) => {
        const newSessions = [...recurringSessions];
        newSessions[index].flyer_url = url;
        setRecurringSessions(newSessions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload: any = {
            title, description, location,
            flyer_url: flyerUrl, theme, topic, guest_speaker: guestSpeaker
        };

        // We DO NOT update event_type or category to keep the structure safe!

        if (eventType === "recurring") {
            const rules: any = { pattern_type: recurringPattern };
            if (recurringPattern === "weekly") rules.day = recurringDay;
            else rules.rule = recurringDay;

            if (recurringSessions.length > 0) {
                rules.sessions = recurringSessions;
                // Preserve original factions logic if it was a Sunday!
                if (recurringDay === 'sunday') {
                    rules.factions = {
                        first_sunday: "Thanksgiving Service",
                        second_sunday: "Excellent Men",
                        third_sunday: "The Lord's Garnet",
                        fourth_sunday: "Good Women",
                        fifth_sunday: "Joint Anointing Service"
                    };
                }
            } else {
                rules.start_time = startTime;
                rules.end_time = endTime;
            }
            payload.recurrence_rules = rules;

        } else if (eventType === "single_day") {
            payload.start_datetime = new Date(`${singleDate}T${startTime}`).toISOString();
            payload.end_datetime = new Date(`${singleDate}T${endTime}`).toISOString();
        } else if (eventType === "multi_day") {
            payload.multi_day_schedule = multiDays;
        }

        const { error } = await supabase.from("church_events").update(payload).eq("id", id);

        if (error) {
            toast.error("Error updating event: " + error.message);
            setLoading(false);
        } else {
            toast.success("Event updated successfully!");
            router.push("/events");
            router.refresh();
        }
    };

    if (fetching) return <div className="p-20 text-center font-bold text-brand-primary min-h-screen bg-brand-surface">Loading Event Data...</div>;

    return (
        <div className="min-h-screen bg-brand-surface p-4 md:p-12 font-sans">
            <div className="max-w-4xl mx-auto">
                <Link href="/events" className="text-sm font-bold text-brand-secondary mb-6 flex items-center gap-2 hover:underline w-fit">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>

                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-brand-accent">
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                        {eventType === 'recurring' && <RefreshCw className="text-blue-600" size={24} />}
                        {eventType === 'single_day' && <Star className="text-amber-600" size={24} />}
                        {eventType === 'multi_day' && <Layers className="text-purple-600" size={24} />}
                        <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary">
                            Edit {eventType === 'recurring' ? 'Recurring' : eventType === 'single_day' ? 'Special' : 'Multi-Day'} Event
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">

                        {/* 1. CORE DETAILS (LOCKED CATEGORY) */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest">1. Core Details</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Event Title *</label>
                                    <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl text-brand-primary font-bold focus:ring-2 focus:ring-brand-primary outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2 flex justify-between">
                                        Category <span className="flex items-center gap-1 text-gray-400"><Lock size={10}/> Locked</span>
                                    </label>
                                    <div className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 font-bold cursor-not-allowed">
                                        {category}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. FLYERS & MEDIA (DYNAMIC BASED ON SESSIONS) */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest">2. Event Flyer(s)</h3>

                            {/* If it has multiple sessions (like Sunday First/Second Service) */}
                            {recurringSessions.length > 0 ? (
                                <div className="space-y-6">
                                    <p className="text-sm text-gray-500">This event has multiple sessions. You can upload a specific flyer for each one!</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {recurringSessions.map((session, index) => (
                                            <div key={index} className="p-4 border border-brand-accent rounded-2xl bg-slate-50">
                                                <h4 className="font-bold text-brand-primary mb-4 text-sm">{session.name} ({session.start_time})</h4>
                                                <div className="flex flex-col gap-4 items-center">
                                                    <div className="w-full aspect-video bg-white border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                                                        {session.flyer_url ? (
                                                            <img src={session.flyer_url} alt={session.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="text-gray-300 flex flex-col items-center"><ImageIcon size={24} className="mb-1"/><span className="text-[9px] font-bold uppercase">No Image</span></div>
                                                        )}
                                                    </div>
                                                    <div className="w-full">
                                                        {!session.flyer_url ? (
                                                            <UploadButton
                                                                endpoint="imageUploader"
                                                                appearance={{ button: "bg-brand-primary text-white text-[10px] px-4 py-2 rounded-lg w-full" }}
                                                                onClientUploadComplete={(res) => {
                                                                    updateSessionFlyer(index, res[0].url);
                                                                    toast.success(`${session.name} flyer uploaded!`);
                                                                }}
                                                                onUploadError={(error) => { toast.error(`Upload Failed: ${error.message}`); }}
                                                            />
                                                        ) : (
                                                            <button type="button" onClick={() => updateSessionFlyer(index, "")} className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-colors">
                                                                Remove Flyer
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* Standard Single Flyer Upload */
                                <div className="flex flex-col sm:flex-row gap-6 items-start">
                                    <div className="w-full sm:w-48 aspect-square bg-slate-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
                                        {flyerUrl ? (
                                            <img src={flyerUrl} alt="Flyer" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-gray-300 flex flex-col items-center"><ImageIcon size={32} className="mb-2"/><span className="text-[10px] font-bold uppercase">No Image</span></div>
                                        )}
                                    </div>
                                    <div className="flex-1 w-full space-y-4">
                                        <p className="text-sm text-gray-500">Upload the official graphic for this event.</p>
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
                            )}
                        </div>

                        {/* 3. TIME & LOGIC (LOCKED RULES, EDITABLE TIMES) */}
                        <div className="space-y-6 p-6 md:p-8 bg-slate-50 border border-gray-100 rounded-3xl">
                            <h3 className="text-xs font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2"><Calendar size={16}/> 3. Scheduling Rules</h3>

                            {eventType === 'recurring' && recurringSessions.length === 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="opacity-75"><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2 flex items-center justify-between">Pattern <Lock size={10}/></label><input disabled value={recurringPattern} className="w-full p-4 border rounded-xl bg-gray-100 text-gray-500 capitalize cursor-not-allowed" /></div>
                                    <div className="opacity-75"><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2 flex items-center justify-between">Rule <Lock size={10}/></label><input disabled value={recurringDay.replace('_', ' ')} className="w-full p-4 border rounded-xl bg-gray-100 text-gray-500 capitalize cursor-not-allowed" /></div>
                                    <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Start Time</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-4 border rounded-xl bg-white focus:ring-2 focus:ring-brand-primary outline-none" /></div>
                                    <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">End Time</label><input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full p-4 border rounded-xl bg-white focus:ring-2 focus:ring-brand-primary outline-none" /></div>
                                </div>
                            )}

                            {eventType === 'recurring' && recurringSessions.length > 0 && (
                                <div className="p-4 border border-brand-primary/20 bg-brand-primary/5 rounded-xl text-sm text-brand-primary font-bold">
                                    Notice: Times for multi-session events are locked to preserve schedule integrity. Please contact support to alter session core times.
                                </div>
                            )}

                            {eventType === 'single_day' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Specific Date</label><input type="date" required value={singleDate} onChange={e => setSingleDate(e.target.value)} className="w-full p-4 border rounded-xl bg-white" /></div>
                                    <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Start Time</label><input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-4 border rounded-xl bg-white" /></div>
                                    <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">End Time</label><input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full p-4 border rounded-xl bg-white" /></div>
                                </div>
                            )}

                            {eventType === 'multi_day' && (
                                <div className="space-y-4">
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
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest">4. Special Overrides (Optional)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Guest Speaker(s)</label><input value={guestSpeaker} onChange={e => setGuestSpeaker(e.target.value)} placeholder="e.g. Pastor E.A. Adeboye" className="w-full p-4 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-brand-primary outline-none" /></div>
                                <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Specific Theme</label><input value={theme} onChange={e => setTheme(e.target.value)} placeholder="e.g. Let There Be Light" className="w-full p-4 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-brand-primary outline-none" /></div>
                                <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Specific Topic</label><input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Faith to Move Mountains" className="w-full p-4 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-brand-primary outline-none" /></div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-100 flex justify-end">
                            <button type="submit" disabled={loading} className="w-full sm:w-auto px-10 py-5 bg-brand-primary text-white rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-colors disabled:opacity-50">
                                {loading ? "Saving Changes..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}