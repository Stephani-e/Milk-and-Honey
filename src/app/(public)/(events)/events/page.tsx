"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
    Calendar as CalendarIcon, Clock, MapPin, ArrowRight,
    ChevronLeft, ChevronRight, Star, Loader2, Users
} from "lucide-react";

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [monthlyTheme, setMonthlyTheme] = useState<any>(null); // NEW: Theme State
    const [loading, setLoading] = useState(true);

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            // Fetch Events
            const { data: eventData } = await supabase
                .from("church_events")
                .select("*")
                .is("deleted_at", null)
                .eq("is_active", true);

            if (eventData) setEvents(eventData);

            // NEW: Fetch Global Theme
            const { data: themeData } = await supabase
                .from("monthly_themes")
                .select("*")
                .eq("id", 1)
                .single();

            if (themeData) setMonthlyTheme(themeData);

            setLoading(false);
        }
        fetchData();
    }, []);

    // --- 🧮 THE DATE MATH ENGINE  ---
    const getFirstFriday = (year: number, month: number) => {
        let d = new Date(year, month, 1);
        while (d.getDay() !== 5) d.setDate(d.getDate() + 1);
        return d;
    };

    const getThursdayBeforeFirstFriday = (year: number, month: number) => {
        let firstFriday = getFirstFriday(year, month);
        let thursday = new Date(firstFriday);
        thursday.setDate(thursday.getDate() - 1);
        return thursday;
    };

    const getNthDayOfMonth = (year: number, month: number, dayOfWeek: number, n: number) => {
        let d = new Date(year, month, 1);
        let count = 0;
        while (d.getMonth() === month) {
            if (d.getDay() === dayOfWeek) {
                count++;
                if (count === n) return new Date(d);
            }
            d.setDate(d.getDate() + 1);
        }
        return null;
    };

    const getLastFriday = (year: number, month: number) => {
        let d = new Date(year, month + 1, 0);
        while (d.getDay() !== 5) d.setDate(d.getDate() - 1);
        return d;
    };

    const calculateMonthlyDate = (rule: string, year: number, month: number): Date | null => {
        switch (rule) {
            case 'first_sunday': return getNthDayOfMonth(year, month, 0, 1);
            case 'second_sunday': return getNthDayOfMonth(year, month, 0, 2);
            case 'third_sunday': return getNthDayOfMonth(year, month, 0, 3);
            case 'last_sunday': return getNthDayOfMonth(year, month, 0, 4);

            case 'first_thursday': return getNthDayOfMonth(year, month, 4, 1);
            case 'first_friday': return getNthDayOfMonth(year, month, 5, 1);

            case 'first_day': return new Date(year, month, 1);
            case 'second_saturday': return getNthDayOfMonth(year, month, 6, 2);

            case 'last_friday': return getLastFriday(year, month);
            case 'thursday_before_first_friday': return getThursdayBeforeFirstFriday(year, month);

            default:
                return null;
        }
    };

    // --- DATA PROCESSING ---
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const weeklyEvents = events.filter(e => e.event_type === 'recurring' && e.recurrence_rules?.pattern_type === 'weekly');

    const dayOrder: any = {
        "sunday": 1, "monday": 2, "tuesday": 3, "wednesday": 4,
        "thursday": 5, "friday": 6, "saturday": 7
    };
    weeklyEvents.sort((a, b) => {
        const dayA = a.recurrence_rules?.day?.toLowerCase();
        const dayB = b.recurrence_rules?.day?.toLowerCase();
        return (dayOrder[dayA] || 99) - (dayOrder[dayB] || 99);
    });

    let plottedEvents: any[] = [];

    events.forEach(event => {
        if (event.event_type === 'recurring' && event.recurrence_rules?.pattern_type === 'monthly') {
            const calculatedDate = calculateMonthlyDate(event.recurrence_rules.rule, year, month);
            if (calculatedDate) {
                plottedEvents.push({ ...event, displayDate: calculatedDate, isCalculated: true });
            }
        }

        if (event.event_type === 'single_day' && event.start_datetime) {
            const eventDate = new Date(event.start_datetime);
            if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
                plottedEvents.push({ ...event, displayDate: eventDate });
            }
        }

        if (event.event_type === 'multi_day' && event.multi_day_schedule && event.multi_day_schedule.length > 0) {
            const firstDayDate = new Date(event.multi_day_schedule[0].date);
            if (firstDayDate.getFullYear() === year && firstDayDate.getMonth() === month) {
                plottedEvents.push({ ...event, displayDate: firstDayDate });
            }
        }
    });

    plottedEvents.sort((a, b) => a.displayDate.getTime() - b.displayDate.getTime());

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-brand-primary">
                <Loader2 size={48} className="animate-spin mb-4" />
                <p className="font-bold tracking-widest uppercase text-xs">Loading Schedule...</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-24">

            {/* HERO SECTION WITH DYNAMIC THEME */}
            <div className="bg-slate-900 text-white pt-24 pb-20 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop')] bg-cover bg-center opacity-20 blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900" />

                <div className="max-w-6xl mx-auto relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <span className="text-amber-400 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 block">
                        {monthlyTheme?.theme_title ? `Theme for ${monthlyTheme.month_year}` : "Church Calendar"}
                    </span>

                    <h1 className="text-4xl md:text-6xl font-serif font-black mb-4">
                        {monthlyTheme?.theme_title || "Join Us In Fellowship"}
                    </h1>

                    {monthlyTheme?.scripture && (
                        <p className="text-amber-400 max-w-2xl mx-auto text-lg md:text-xl font-serif font-bold italic mb-6">
                            "{monthlyTheme.scripture}"
                        </p>
                    )}

                    <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                        Whether it is our weekly services or special monthly gatherings, there is always a place for you. Mark your calendars and come expectantly.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-10 relative z-20">

                {/* PART 1: THE WEEKLY RHYTHM */}
                <div className="mt-20 mb-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 px-2">
                        <div className="flex items-center gap-3">
                            <Users className="text-brand-primary" size={24} />
                            <h2 className="text-2xl md:text-3xl font-serif font-black text-brand-primary">Our Weekly Rhythm</h2>
                        </div>
                        <Link href="/events/weekly" className="flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-md hover:bg-amber-600 transition-all hover:scale-105 active:scale-95">
                            <Clock size={16} /> View Live Countdowns
                        </Link>
                    </div>

                    <div className="bg-white rounded-3xl p-2 md:p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-2 md:gap-4 overflow-x-auto no-scrollbar">
                        {weeklyEvents.map((event) => (
                            <div key={event.id} className="flex-1 min-w-[250px] p-4 bg-slate-50 rounded-2xl border border-gray-100 hover:border-amber-200 transition-colors">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 mb-1 block">
                                    Every {event.recurrence_rules?.day}
                                </span>
                                <h3 className="font-bold text-brand-primary text-lg mb-2 truncate">{event.title}</h3>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                    <MapPin size={12} className="text-amber-500"/> <span className="truncate">{event.location}</span>
                                </div>
                            </div>
                        ))}

                        <Link href="/events/weekly" className="flex-1 min-w-[200px] p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/20 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-brand-primary hover:text-white transition-colors">
                            <ArrowRight size={24} className="text-brand-primary group-hover:text-white mb-2 transition-colors" />
                            <span className="font-bold text-sm text-brand-primary group-hover:text-white transition-colors">See Live Schedule & Upcoming Topics</span>
                        </Link>
                    </div>
                </div>

                {/* PART 2: THE DYNAMIC MONTHLY CALENDAR */}
                <div>
                    <div className="bg-white rounded-t-3xl border border-gray-200 p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm z-10 relative">
                        <div className="flex items-center gap-3">
                            <CalendarIcon className="text-brand-primary" size={24} />
                            <h2 className="text-2xl md:text-3xl font-serif font-black text-brand-primary">
                                Special & Monthly
                            </h2>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2 md:gap-4 bg-slate-50 p-1.5 md:p-2 rounded-2xl border border-gray-200 w-full sm:w-auto">
                            <button onClick={prevMonth} className="p-2 md:p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-brand-primary hover:text-white transition-all"><ChevronLeft size={20}/></button>
                            <span className="w-32 md:w-40 text-center font-black text-brand-primary uppercase tracking-widest text-xs md:text-sm">
                                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={nextMonth} className="p-2 md:p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-brand-primary hover:text-white transition-all"><ChevronRight size={20}/></button>
                        </div>
                    </div>

                    <div className="bg-white rounded-b-3xl border-x border-b border-gray-200 p-4 md:p-8 shadow-sm min-h-[400px]">
                        {plottedEvents.length > 0 ? (
                            <div className="space-y-4 md:space-y-6">
                                {plottedEvents.map((event, idx) => (
                                    <div key={idx} className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 rounded-3xl border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all group bg-white">

                                        <div className="w-full md:w-32 flex-shrink-0 flex flex-row md:flex-col items-center justify-center bg-slate-50 border border-gray-100 rounded-2xl p-4 group-hover:bg-amber-400 group-hover:border-amber-400 group-hover:text-amber-950 transition-colors duration-300">
                                            <span className="text-xs font-bold uppercase tracking-widest opacity-60 mr-3 md:mr-0 md:mb-1">
                                                {event.displayDate.toLocaleString('default', { month: 'short' })}
                                            </span>
                                            <span className="text-4xl md:text-5xl font-black leading-none tracking-tighter">
                                                {event.displayDate.getDate()}
                                            </span>
                                            <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest opacity-60 mt-2">
                                                {event.displayDate.toLocaleString('default', { weekday: 'long' })}
                                            </span>
                                        </div>

                                        <div className="flex-grow flex flex-col justify-center py-2">
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-md">
                                                    {event.category}
                                                </span>
                                                {event.event_type === 'multi_day' && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-md">
                                                        Multi-Day Event
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-xl md:text-2xl font-bold text-brand-primary mb-2">
                                                {event.title}
                                            </h3>

                                            {event.theme && (
                                                <p className="text-sm font-bold text-gray-500 mb-4 italic">
                                                    Theme: {event.theme}
                                                </p>
                                            )}

                                            <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-3 sm:gap-6 text-xs font-bold text-gray-500 mt-auto pt-4 border-t border-gray-100">
                                                <span className="flex items-center gap-2"><Clock size={16} className="text-brand-secondary"/>
                                                    {event.isCalculated ? (
                                                        `${event.recurrence_rules?.start_time} - ${event.recurrence_rules?.end_time}`
                                                    ) : event.event_type === 'single_day' ? (
                                                        `${new Date(event.start_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                                                    ) : (
                                                        "View Full Schedule"
                                                    )}
                                                </span>
                                                <span className="flex items-center gap-2"><MapPin size={16} className="text-brand-secondary"/> {event.location}</span>
                                            </div>
                                        </div>

                                        {event.flyer_url && (
                                            <div className="w-full md:w-56 aspect-video md:aspect-square bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 relative">
                                                <img src={event.flyer_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                <div className="absolute inset-0 bg-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-50/50 rounded-2xl border border-dashed border-gray-200">
                                <Star size={48} className="text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-brand-primary mb-2">No Special Events</h3>
                                <p className="text-gray-500 text-sm max-w-md">
                                    There are no special or monthly events scheduled for <strong className="text-brand-primary">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</strong>. Check our weekly rhythm above!
                                </p>
                                <button onClick={goToToday} className="mt-6 text-xs font-bold text-brand-primary hover:text-amber-600 bg-white px-6 py-2.5 rounded-full shadow-sm border border-gray-200 uppercase tracking-widest transition-colors">
                                    Return to Current Month
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}