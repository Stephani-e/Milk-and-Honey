"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin, Loader2, PlayCircle, Calendar, Users } from "lucide-react";

// 1. Strict TypeScript definition to fix the "possibly undefined" errors
type ServiceStatus = {
    state: 'LIVE' | 'ENDED' | 'UPCOMING';
    message?: string;
    countdown?: string;
    daysUntil: number;
    targetDate: Date;
    specificTheme: string | null;
    displayStartTime: string;
    displayEndTime: string;
};

export default function LiveWeeklyPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        async function fetchEvents() {
            setLoading(true);
            const { data } = await supabase
                .from("church_events")
                .select("*")
                .eq("event_type", "recurring")
                .is("deleted_at", null)
                .eq("is_active", true);

            if (data) {
                const weekly = data.filter(e => e.recurrence_rules?.pattern_type === 'weekly');
                setEvents(weekly);
            }
            setLoading(false);
        }
        fetchEvents();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- 🧮 HELPER: GET DYNAMIC TIMES & THEMES FROM SUPABASE 🧮 ---
    const getOccurrenceDetails = (event: any, dayName: string, nthOccurrence: number) => {
        let startTime = event.recurrence_rules?.start_time || "00:00";
        let endTime = event.recurrence_rules?.end_time || "23:59";
        let theme = null;

        // If it's Sunday Service, check the factions/thanksgiving DB logic
        if (dayName === 'sunday' && event.title?.toLowerCase() === 'sunday service') {
            const factionsMap = ["", "first_sunday", "second_sunday", "third_sunday", "fourth_sunday", "fifth_sunday"];
            const factionKey = factionsMap[nthOccurrence];

            // 1st Sunday (Thanksgiving) uses its own unique time!
            if (nthOccurrence === 1 && event.recurrence_rules?.thanksgiving_session) {
                startTime = event.recurrence_rules.thanksgiving_session.start_time;
                endTime = event.recurrence_rules.thanksgiving_session.end_time;
                theme = event.recurrence_rules.thanksgiving_session.name;
            } else {
                // 2nd-5th Sundays use the standard multi-sessions time
                if (event.recurrence_rules?.standard_sessions?.length > 0) {
                    startTime = event.recurrence_rules.standard_sessions[0].start_time;
                    endTime = event.recurrence_rules.standard_sessions[event.recurrence_rules.standard_sessions.length - 1].end_time;
                }
                // Pull the dynamically saved faction from Supabase
                if (event.recurrence_rules?.factions) {
                    theme = event.recurrence_rules.factions[factionKey];
                }
            }
        } else {
            // For Wednesday/Tuesday (Digging Deep, Hours of Mercy, etc.)
            if (event.recurrence_rules?.standard_sessions?.length > 0) {
                startTime = event.recurrence_rules.standard_sessions[0].start_time;
                endTime = event.recurrence_rules.standard_sessions[event.recurrence_rules.standard_sessions.length - 1].end_time;
            } else if (event.recurrence_rules?.sessions?.length > 0) {
                startTime = event.recurrence_rules.sessions[0].start_time;
                endTime = event.recurrence_rules.sessions[event.recurrence_rules.sessions.length - 1].end_time;
            }
        }

        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);

        return { startH, startM, endH, endM, theme, startTime, endTime };
    };

    // --- 🧮 THE REAL-TIME COUNTDOWN ENGINE 🧮 ---
    const getServiceStatus = (event: any): ServiceStatus | null => {
        if (!event.recurrence_rules) return null;

        const dayName = event.recurrence_rules.day.toLowerCase();
        const daysMap: any = { "sunday": 0, "monday": 1, "tuesday": 2, "wednesday": 3, "thursday": 4, "friday": 5, "saturday": 6 };
        const targetDay = daysMap[dayName];

        if (targetDay === undefined) return null;

        let targetDate = new Date(now);
        let daysUntil = (targetDay + 7 - now.getDay()) % 7;

        targetDate.setDate(now.getDate() + daysUntil);
        let nthOccurrence = Math.ceil(targetDate.getDate() / 7);

        // Fetch dynamic times for THIS specific occurrence
        let details = getOccurrenceDetails(event, dayName, nthOccurrence);

        targetDate.setHours(details.startH, details.startM, 0, 0);
        let realEndDate = new Date(targetDate);
        realEndDate.setHours(details.endH, details.endM, 0, 0);

        // If today is the day, check if it already ended
        if (daysUntil === 0) {
            let graceLimit = new Date(realEndDate);
            graceLimit.setHours(graceLimit.getHours() + 1); // 1-hour grace period

            if (now > graceLimit) {
                // Service ended. Look to NEXT week.
                daysUntil = 7;
                targetDate.setDate(targetDate.getDate() + 7);
                nthOccurrence = Math.ceil(targetDate.getDate() / 7);

                // RECALCULATE times for next week! (e.g. Next week might be Thanksgiving)
                details = getOccurrenceDetails(event, dayName, nthOccurrence);

                targetDate.setHours(details.startH, details.startM, 0, 0);
                realEndDate = new Date(targetDate);
                realEndDate.setHours(details.endH, details.endM, 0, 0);
            }
        }

        const diffMs = targetDate.getTime() - now.getTime();

        // STATUS LOGIC
        if (now >= targetDate && now <= realEndDate) {
            return {
                state: 'LIVE', message: '🔴 Service is Live Now!', targetDate, daysUntil,
                specificTheme: details.theme, displayStartTime: details.startTime, displayEndTime: details.endTime
            };
        }

        if (diffMs < 0 && now > realEndDate) {
            return {
                state: 'ENDED', message: 'Service Just Ended', targetDate, daysUntil,
                specificTheme: details.theme, displayStartTime: details.startTime, displayEndTime: details.endTime
            };
        }

        const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const h = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diffMs / 1000 / 60) % 60);
        const s = Math.floor((diffMs / 1000) % 60);

        let countdown = "";
        if (d > 0) countdown = `${d} day${d > 1 ? 's' : ''} to go`;
        else if (h > 0) countdown = `Starts in ${h}h ${m}m`;
        else countdown = `Starting in ${m}m ${s}s!`;

        return {
            state: 'UPCOMING', countdown, daysUntil, targetDate,
            specificTheme: details.theme, displayStartTime: details.startTime, displayEndTime: details.endTime
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-brand-primary">
                <Loader2 size={48} className="animate-spin mb-4" />
                <p className="font-bold tracking-widest uppercase text-xs">Loading Live Engine...</p>
            </div>
        );
    }

    // Safely sort events (TypeScript approved!)
    const sortedEvents = [...events].sort((a, b) => {
        const statA = getServiceStatus(a);
        const statB = getServiceStatus(b);
        if (!statA && !statB) return 0;
        if (!statA) return 1;
        if (!statB) return -1;

        if (statA.state === 'LIVE' && statB.state !== 'LIVE') return -1;
        if (statB.state === 'LIVE' && statA.state !== 'LIVE') return 1;

        return statA.targetDate.getTime() - statB.targetDate.getTime();
    });

    return (
        <div className="bg-slate-50 min-h-screen pb-24">
            <div className="w-full max-w-5xl mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-4">
                <Link href="/events" className="inline-flex items-center gap-2 text-brand-primary hover:text-amber-600 transition-colors text-xs font-bold uppercase tracking-widest bg-white py-2 px-4 rounded-full shadow-sm border border-gray-100">
                    <ArrowLeft size={14} /> Back to Full Calendar
                </Link>
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-6">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-serif font-black text-brand-primary mb-3">Live Service Tracker</h1>
                    <p className="text-gray-500 font-medium">Real-time countdown to our next weekly gatherings.</p>
                </div>

                <div className="flex flex-col gap-6">
                    {sortedEvents.map((event) => {
                        const status = getServiceStatus(event);
                        if (!status) return null;

                        const isLive = status.state === 'LIVE';
                        const isClose = status.state === 'UPCOMING' && status.daysUntil === 0;

                        return (
                            <div key={event.id} className={`relative overflow-hidden rounded-[2rem] border-2 transition-all duration-500 shadow-sm ${
                                isLive ? "bg-red-50 border-red-500 shadow-red-500/20 scale-[1.02]" :
                                    isClose ? "bg-amber-50 border-amber-400 shadow-amber-500/10" :
                                        "bg-white border-gray-100 hover:border-brand-primary/30"
                            }`}>

                                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-10">

                                    <div className="flex flex-col items-center justify-center w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-200/50 pb-6 md:pb-0 md:pr-10 text-center">
                                        {isLive ? (
                                            <div className="animate-pulse">
                                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner"><PlayCircle size={32} /></div>
                                                <h3 className="text-xl font-black text-red-600 uppercase tracking-widest">Live Now</h3>
                                                <p className="text-xs font-bold text-red-400 mt-1">Join us in person!</p>
                                            </div>
                                        ) : status.state === 'ENDED' ? (
                                            <div>
                                                <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3"><Clock size={32} /></div>
                                                <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest">Ended</h3>
                                                <p className="text-xs font-bold text-gray-400 mt-1">Check back for next week.</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner ${isClose ? 'bg-amber-200 text-amber-700' : 'bg-slate-100 text-brand-primary'}`}><Clock size={32} /></div>
                                                <h3 className={`text-xl md:text-2xl font-black ${isClose ? 'text-amber-600' : 'text-brand-primary'}`}>{status.countdown}</h3>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">{status.targetDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-grow flex flex-col justify-center text-center md:text-left">
                                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 bg-purple-100 px-3 py-1 rounded-full">Every {event.recurrence_rules?.day}</span>
                                            {status.specificTheme && (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white bg-brand-primary px-3 py-1 rounded-full shadow-sm animate-in fade-in">⭐ {status.specificTheme}</span>
                                            )}
                                        </div>

                                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-2">{event.title}</h2>
                                        <p className="text-sm text-gray-500 mb-6 max-w-lg mx-auto md:mx-0">{event.description || "Join us for our weekly gathering."}</p>

                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-auto">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm"><MapPin size={14} className="text-amber-500" /> {event.location}</div>

                                            {event.title.toLowerCase().includes('house fellowship') ? (
                                                <Link href="/departments" className="flex items-center gap-2 text-xs font-bold text-brand-primary underline underline-offset-4 hover:text-amber-600">Find Nearest Center</Link>
                                            ) : (
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                                                    <Calendar size={14} className="text-amber-500" />
                                                    {/* Uses the safe, dynamically pulled time! */}
                                                    {status.displayStartTime} - {status.displayEndTime}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}