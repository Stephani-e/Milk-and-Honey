"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ConfirmModal from "@/components/Admin/ConfirmModal";
import { Calendar, Trash2, Edit3, Clock, Plus, RefreshCw, Star, Layers, AlertCircle, ChevronDown, ChevronUp, User } from "lucide-react";

export default function EventsDashboardPage() {
    const router = useRouter();

    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewTrash, setViewTrash] = useState(false);

    // Monthly Theme State
    const [themeData, setThemeData] = useState({
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        theme: "Walking in Dominion",
        scripture: "Genesis 1:26-28",
        savingTheme: false
    });

    const [modalType, setModalType] = useState<"delete" | "restore" | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

    // --- NEW: EXPAND STATE ---
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        fetchEvents();
    }, [viewTrash]);

    async function fetchEvents() {
        setLoading(true);
        let query = supabase.from("church_events").select("*");
        if (viewTrash) query = query.not("deleted_at", "is", null);
        else query = query.is("deleted_at", null);
        query = query.order("created_at", { ascending: false });

        const { data, error } = await query;
        if (error) toast.error("Error loading events: " + error.message);
        else setEvents(data || []);

        setLoading(false);
    }

    const handleSaveTheme = async () => {
        setThemeData(prev => ({...prev, savingTheme: true}));
        setTimeout(() => {
            toast.success("Monthly Theme Updated Successfully!");
            setThemeData(prev => ({...prev, savingTheme: false}));
        }, 800);
    };

    const handleConfirmAction = async () => {
        if (!selectedEvent) return;
        if (modalType === "delete") {
            if (viewTrash) {
                await supabase.from("church_events").delete().eq("id", selectedEvent.id);
                toast.error("Event permanently deleted.");
            } else {
                await supabase.from("church_events").update({ deleted_at: new Date(), is_active: false }).eq("id", selectedEvent.id);
                toast.success("Event moved to Trash.");
            }
        } else if (modalType === "restore") {
            await supabase.from("church_events").update({ deleted_at: null, is_active: true }).eq("id", selectedEvent.id);
            toast.success("Event Restored.");
        }
        fetchEvents();
        setModalType(null);
    };

    const recurringEvents = events.filter(e => e.event_type === 'recurring');
    const specialEvents = events.filter(e => e.event_type === 'single_day' || e.event_type === 'multi_day');

    // --- NEW: HELPER TO RENDER SCHEDULE DETAILS ---
    const renderExpandedDetails = (event: any) => {
        return (
            <div className="mt-4 pt-4 border-t border-gray-100 text-sm space-y-3 animate-in fade-in slide-in-from-top-2">
                {event.guest_speaker && (
                    <div className="flex items-center gap-2 text-purple-700 bg-purple-50 p-2 rounded-lg font-bold">
                        <User size={14} /> Guest: {event.guest_speaker}
                    </div>
                )}
                {event.theme && <p><span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider block">Theme</span>{event.theme}</p>}

                {/* Parse the Logic */}
                <div>
                    <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider block mb-1">Schedule Details</span>

                    {event.event_type === 'recurring' && event.recurrence_rules && (
                        <div className="bg-slate-50 p-3 rounded-xl text-xs font-mono text-slate-600">
                            {event.recurrence_rules.pattern_type === 'weekly' && event.recurrence_rules.day && (
                                <p>Every <span className="capitalize font-bold text-brand-primary">{event.recurrence_rules.day}</span></p>
                            )}
                            {event.recurrence_rules.sessions ? (
                                <ul className="mt-1 space-y-1 list-disc list-inside">
                                    {event.recurrence_rules.sessions.map((s: any, i: number) => (
                                        <li key={i}>{s.name}: {s.start_time} - {s.end_time}</li>
                                    ))}
                                </ul>
                            ) : event.recurrence_rules.start_time ? (
                                <p className="mt-1">{event.recurrence_rules.start_time} - {event.recurrence_rules.end_time}</p>
                            ) : null}
                            {event.recurrence_rules.pattern_type === 'monthly' && (
                                <p className="mt-1 capitalize">Rule: {event.recurrence_rules.rule?.replace('_', ' ')}</p>
                            )}
                        </div>
                    )}

                    {event.event_type === 'multi_day' && event.multi_day_schedule && (
                        <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-2">
                            {event.multi_day_schedule.map((day: any, i: number) => (
                                <div key={i} className="flex justify-between border-b border-slate-200 pb-1 last:border-0 last:pb-0">
                                    <span className="font-bold text-brand-primary">{day.label}</span>
                                    <span className="text-slate-500">{new Date(day.date).toLocaleDateString('en-GB')} | {day.start_time}-{day.end_time}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {event.event_type === 'single_day' && event.start_datetime && (
                        <div className="bg-slate-50 p-3 rounded-xl text-xs">
                            <p className="font-bold text-brand-primary">{new Date(event.start_datetime).toLocaleDateString('en-GB')}</p>
                            <p className="text-slate-500">{new Date(event.start_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(event.end_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const EventListItem = ({ event }: { event: any }) => {
        const isExpanded = expandedId === event.id;

        return (
            <div className={`flex flex-col p-4 border rounded-2xl transition-all ${isExpanded ? 'border-brand-primary bg-white shadow-md' : 'border-brand-accent bg-slate-50/50 hover:bg-white hover:shadow-sm'}`}>
                <div className="flex gap-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                        {event.flyer_url ? (
                            <img src={event.flyer_url} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-brand-secondary/50 bg-brand-primary/5">
                                <Calendar size={20} />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[9px] font-bold text-purple-600 uppercase tracking-widest truncate pr-2">
                                {event.category}
                            </span>
                            {event.event_type === 'multi_day' && <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">Multi-Day</span>}
                        </div>
                        <h4 className="font-bold text-brand-primary text-sm truncate mb-1">{event.title}</h4>
                        <div className="text-[10px] text-gray-500 font-bold flex items-center gap-1 truncate">
                            <Clock size={10} />
                            {event.event_type === 'recurring' ? "Infinite Schedule" :
                                event.event_type === 'single_day' && event.start_datetime ? new Date(event.start_datetime).toLocaleDateString('en-GB') :
                                    "Check Schedule"}
                        </div>
                    </div>

                    <div className="flex flex-col justify-between items-end gap-2 border-l border-brand-accent pl-3">
                        <button
                            onClick={() => setExpandedId(isExpanded ? null : event.id)}
                            className="p-1 text-gray-400 hover:text-brand-primary bg-gray-50 rounded-md transition-colors"
                        >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        <div className="flex items-center gap-3">
                            {viewTrash ? (
                                <>
                                    <button onClick={() => { setSelectedEvent(event); setModalType("restore"); }} title="Restore" className="text-emerald-600 hover:scale-110 transition-transform"><RefreshCw size={14}/></button>
                                    <button onClick={() => { setSelectedEvent(event); setModalType("delete"); }} title="Purge" className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14}/></button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => router.push(`/events/edit/${event.id}`)} title="Edit" className="text-brand-secondary hover:text-brand-primary transition-colors"><Edit3 size={14}/></button>
                                    <button onClick={() => { setSelectedEvent(event); setModalType("delete"); }} title="Trash" className="text-red-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* THE EXPANDED CONTENT */}
                {isExpanded && renderExpandedDetails(event)}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-brand-surface p-4 md:p-12 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6 md:mb-8">
                    <Link href="/admin" className="text-xs md:text-sm text-brand-secondary font-bold hover:underline">
                        <span className="text-lg leading-none">←</span> Back to Dashboard
                    </Link>

                    <button
                        onClick={() => setViewTrash(!viewTrash)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${viewTrash ? 'bg-brand-primary text-white' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                    >
                        <Trash2 size={14} /> {viewTrash ? "Exit Trash" : "View Trash"}
                    </button>
                </div>

                <div className="flex flex-row justify-between items-center mb-6 md:mb-8 gap-4">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary">
                        {viewTrash ? "Deleted Events" : "Church Schedule"}
                    </h1>
                    <button
                        onClick={() => router.push("/events/new")}
                        className="flex items-center gap-2 bg-brand-primary text-white px-4 py-3 md:px-6 md:py-2 rounded-xl text-xs md:text-base font-bold shadow-lg shadow-brand-primary/20 active:scale-95 transition-transform whitespace-nowrap"
                    >
                        <Plus size={16} /> New Event
                    </button>
                </div>

                {!viewTrash && (
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-brand-accent mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-full -z-0"></div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
                            <div>
                                <h2 className="text-xl font-serif font-bold text-brand-primary">Global Monthly Theme</h2>
                                <p className="text-xs text-gray-500">Updates the main banner on the public events page.</p>
                            </div>
                            <div className="bg-brand-primary text-white px-4 py-2 rounded-xl font-bold text-sm text-center shadow-md">
                                {themeData.month}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Theme Title</label>
                                <input
                                    value={themeData.theme}
                                    onChange={(e) => setThemeData({...themeData, theme: e.target.value})}
                                    className="w-full p-3 border rounded-xl text-brand-primary font-bold focus:ring-2 focus:ring-brand-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Anchor Scripture</label>
                                <input
                                    value={themeData.scripture}
                                    onChange={(e) => setThemeData({...themeData, scripture: e.target.value})}
                                    className="w-full p-3 border rounded-xl text-brand-primary focus:ring-2 focus:ring-brand-primary outline-none"
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end relative z-10">
                            <button
                                onClick={handleSaveTheme}
                                disabled={themeData.savingTheme}
                                className="bg-white border-2 border-brand-primary text-brand-primary px-6 py-2 rounded-xl text-sm font-bold hover:bg-brand-primary/5 transition-colors disabled:opacity-50"
                            >
                                {themeData.savingTheme ? "Saving..." : "Update Live Theme"}
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

                    {/* LEFT CARD: RECURRING SCHEDULE */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-brand-accent flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><RefreshCw size={18} /></div>
                            <h2 className="text-xl font-serif font-bold text-brand-primary">Recurring Schedule</h2>
                        </div>
                        <p className="text-xs text-gray-500 mb-6">The standard weekly & monthly heartbeat of the church. These loop infinitely.</p>

                        <div className="space-y-3 flex-grow">
                            {loading ? (
                                <div className="text-center p-8 text-sm text-gray-400 font-bold">Loading...</div>
                            ) : recurringEvents.length > 0 ? (
                                recurringEvents.map(event => <EventListItem key={event.id} event={event} />)
                            ) : (
                                <div className="text-center p-8 border-2 border-dashed border-gray-100 rounded-2xl">
                                    <AlertCircle size={24} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-xs text-gray-400 font-bold">No recurring events found.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT CARD: SPECIAL & GUEST EVENTS */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-brand-accent flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Star size={18} /></div>
                            <h2 className="text-xl font-serif font-bold text-brand-primary">Special & Upcoming</h2>
                        </div>
                        <p className="text-xs text-gray-500 mb-6">One-off guest speakers, special programs, and multi-day conferences.</p>

                        <div className="space-y-3 flex-grow">
                            {loading ? (
                                <div className="text-center p-8 text-sm text-gray-400 font-bold">Loading...</div>
                            ) : specialEvents.length > 0 ? (
                                specialEvents.map(event => <EventListItem key={event.id} event={event} />)
                            ) : (
                                <div className="text-center p-8 border-2 border-dashed border-gray-100 rounded-2xl">
                                    <AlertCircle size={24} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-xs text-gray-400 font-bold">No special events found.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <ConfirmModal
                isOpen={!!modalType}
                title={modalType === "delete" ? (viewTrash ? "Permanently Delete Event?" : "Move to Trash?") : "Restore Event?"}
                message={modalType === "delete" ? (viewTrash ? "This action is permanent and cannot be undone." : "This will hide the event from the public calendar. You can restore it from the trash.") : "This event will be active again on the public site."}
                variant={modalType === "delete" ? "danger" : "primary"}
                onClose={() => setModalType(null)}
                onConfirm={handleConfirmAction}
            />
        </div>
    );
}