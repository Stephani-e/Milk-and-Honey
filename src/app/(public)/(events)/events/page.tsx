"use client";
import React, {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";
import Link from "next/link";
import {
    ArrowRight,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    Info,
    MapPin,
    Radio,
    Star,
    Users
} from "lucide-react";
import SkeletonLoader from "@/components/UI/SkeletonLoader";

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [monthlyTheme, setMonthlyTheme] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentNotice, setCurrentNotice] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            // Fetch Events
            const {data: eventData} = await supabase
                .from("church_events")
                .select("*")
                .is("deleted_at", null)
                .eq("is_active", true);

            if (eventData) setEvents(eventData);

            // Fetch Global Theme (Which now includes our takeover toggles!)
            const {data: themeData} = await supabase
                .from("monthly_themes")
                .select("*")
                .eq("id", 1)
                .single();

            if (themeData) setMonthlyTheme(themeData);

            setLoading(false);
        }

        fetchData().catch(error => console.error("Error fetching data:", error));
    }, []);

    useEffect(() => {
        async function fetchNoticeForMonth() {
            const monthYearString = currentDate.toLocaleString('default', {month: 'long', year: 'numeric'});

            const {data} = await supabase
                .from("monthly_themes")
                .select("special_notice")
                .eq("month_year", monthYearString)
                .maybeSingle(); // maybeSingle is safe and won't throw errors if no notice exists

            setCurrentNotice(data?.special_notice || null);
        }

        fetchNoticeForMonth().catch(error => console.error("Error fetching notice:", error));
    }, [currentDate]);

    // --- THE DATE MATH ENGINE ---
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
            case 'first_sunday':
                return getNthDayOfMonth(year, month, 0, 1);
            case 'second_sunday':
                return getNthDayOfMonth(year, month, 0, 2);
            case 'third_sunday':
                return getNthDayOfMonth(year, month, 0, 3);
            case 'last_sunday':
                return getNthDayOfMonth(year, month, 0, 4);

            case 'first_thursday':
                return getNthDayOfMonth(year, month, 4, 1);
            case 'first_friday':
                return getNthDayOfMonth(year, month, 5, 1);

            case 'first_day':
                return new Date(year, month, 1);
            case 'second_saturday':
                return getNthDayOfMonth(year, month, 6, 2);

            case 'last_friday':
                return getLastFriday(year, month);
            case 'thursday_before_first_friday':
                return getThursdayBeforeFirstFriday(year, month);

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
        // 1. First, sort by the Day of the Week
        const dayA = a.recurrence_rules?.day?.toLowerCase();
        const dayB = b.recurrence_rules?.day?.toLowerCase();

        const dayDiff = (dayOrder[dayA] || 99) - (dayOrder[dayB] || 99);

        if (dayDiff !== 0) {
            return dayDiff; // Different days, normal sort applies
        }

        // Helper function to safely extract the earliest start time
        const getSortTime = (event: any) => {
            const rules = event.recurrence_rules;
            if (!rules) return "24:00";

            // A. If it has a standard single start time, use it
            if (rules.start_time) return rules.start_time;

            // B. If it has multiple sessions, grab the start time of the VERY FIRST session
            if (rules.standard_sessions && rules.standard_sessions.length > 0) {
                return rules.standard_sessions[0].start_time || "24:00";
            }

            // C. Fallback
            return "24:00";
        };

        // 2. TIE-BREAKER: If they are on the SAME day, sort chronologically by start time!
        const timeA = getSortTime(a);
        const timeB = getSortTime(b);

        return timeA.localeCompare(timeB);
    });

    let plottedEvents: any[] = [];

    events.forEach(event => {
        if (event.event_type === 'recurring' && event.recurrence_rules?.pattern_type === 'monthly') {
            const calculatedDate = calculateMonthlyDate(event.recurrence_rules.rule, year, month);
            if (calculatedDate) {
                plottedEvents.push({...event, displayDate: calculatedDate, isCalculated: true});
            }
        }

        if (event.event_type === 'single_day' && event.start_datetime) {
            const eventDate = new Date(event.start_datetime);
            if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
                plottedEvents.push({...event, displayDate: eventDate});
            }
        }

        if (event.event_type === 'multi_day' && event.multi_day_schedule && event.multi_day_schedule.length > 0) {
            const firstDayDate = new Date(event.multi_day_schedule[0].date);
            if (firstDayDate.getFullYear() === year && firstDayDate.getMonth() === month) {
                plottedEvents.push({...event, displayDate: firstDayDate});
            }
        }
    });

    plottedEvents.sort((a, b) => a.displayDate.getTime() - b.displayDate.getTime());

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    // STRICT ADMIN-CONTROLLED TAKEOVER LOGIC
    const getActiveTakeoverEvent = () => {
        if (!monthlyTheme) return null;

        if (monthlyTheme.is_convention_active || monthlyTheme.is_congress_active) {
            return {
                title: monthlyTheme.takeover_title || (monthlyTheme.is_convention_active ? "RCCG Annual Convention" : "Holy Ghost Congress"),
                theme: monthlyTheme.takeover_theme,
                location: monthlyTheme.takeover_location || "Viewing Center",
                flyer_url: monthlyTheme.takeover_flyer_url,
                link: monthlyTheme.takeover_link,
                type: monthlyTheme.is_convention_active ? "Convention" : "Congress"
            };
        }

        return null;
    };

    const activeTakeover = getActiveTakeoverEvent();

    if (loading) {
        return (
            <SkeletonLoader variant="event-list"/>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-24">

            {/* HERO SECTION WITH DYNAMIC THEME */}
            <div className="bg-slate-900 text-white pt-24 pb-20 px-6 relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-70 blur-[2px] transition-all duration-1000 scale-105"
                    style={{
                        backgroundImage: `url('${monthlyTheme?.theme_banner_url || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop"}')`
                    }}
                />

                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900"/>

                <div
                    className="max-w-6xl mx-auto relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <span className="text-amber-400 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 block">
                        {monthlyTheme?.theme_title && !activeTakeover ? `Theme for ${monthlyTheme.month_year}` : "Church Calendar"}
                    </span>

                    <h1 className="text-4xl md:text-6xl font-serif font-black mb-4">
                        {activeTakeover ? "Special Viewing Center Mode" : (monthlyTheme?.theme_title || "Join Us In Fellowship")}
                    </h1>

                    {monthlyTheme?.scripture && !activeTakeover && (
                        <p className="text-amber-400 max-w-2xl mx-auto text-lg md:text-xl font-serif font-bold italic mb-6">
                            "{monthlyTheme.scripture}"
                        </p>
                    )}

                    <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                        {activeTakeover
                            ? "Regular weekly events are temporarily paused as we stream the global event live."
                            : "Whether it is our weekly services or special monthly gatherings, there is always a place for you. Mark your calendars and come expectantly."}
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-10 relative z-20">

                {/* TAKEOVER VIEW (Hides regular calendar when Switch is ON) */}
                {activeTakeover ? (
                    <div
                        className="bg-white rounded-[2rem] shadow-2xl border-4 border-amber-400 p-6 md:p-12 animate-in zoom-in-95 duration-500 overflow-hidden relative">
                        {/* Decorative background glow */}
                        <div
                            className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"
                        ></div>

                        <div className="flex flex-col md:flex-row gap-8 md:gap-12 relative z-10">
                            {/* Left: Info */}
                            <div className="flex-1">
                                <div
                                    className="flex items-center gap-2 text-amber-600 font-black uppercase tracking-widest text-xs mb-4 bg-amber-50 w-fit px-4 py-2 rounded-full">
                                    <Radio size={16} className="animate-pulse"/> Live Viewing Center
                                </div>
                                <h2 className="text-3xl md:text-5xl font-serif font-black text-brand-primary mb-4 leading-tight">
                                    {activeTakeover.title}
                                </h2>
                                {activeTakeover.theme && (
                                    <p className="text-xl font-bold text-gray-900 mb-6 italic">
                                        Theme: {activeTakeover.theme}
                                    </p>
                                )}
                                <div className="space-y-4 mb-8">
                                    <div
                                        className="flex items-center gap-3 text-gray-900 bg-slate-50 p-4 rounded-xl border border-gray-100">
                                        <MapPin className="text-amber-500 shrink-0" size={24}/>
                                        <div>
                                            <span className="block font-bold text-sm">Location</span>
                                            <span
                                                className="text-brand-primary font-black">{activeTakeover.location}</span>
                                        </div>
                                    </div>
                                    <div
                                        className="flex items-center gap-3 text-gray-900 bg-slate-50 p-4 rounded-xl border border-gray-100">
                                        <Info className="text-blue-500 shrink-0" size={24}/>
                                        <div>
                                            <span className="block font-bold text-sm">Notice</span>
                                            <span className="text-gray-900 text-sm">All regular house fellowships and weekly physical gatherings are suspended for the duration of this event.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Flyer/Schedule */}
                            <div className="flex-1 flex items-center justify-center">
                                {activeTakeover.flyer_url ? (
                                    <img
                                        src={activeTakeover.flyer_url}
                                        alt={activeTakeover.title}
                                        className="w-full max-w-md rounded-2xl shadow-xl border border-gray-100 object-cover rotate-1 hover:rotate-0 transition-transform duration-300"
                                    />
                                ) : (
                                    <div
                                        className="w-full aspect-square max-w-md bg-slate-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
                                        <Star size={48} className="mb-4"/>
                                        <p className="font-bold uppercase tracking-widest text-xs">{activeTakeover.type} Ongoing</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* REGULAR VIEW (Visible when Takeovers are OFF) */
                    <>
                        {/* PART 1: THE WEEKLY RHYTHM */}
                        <div className="mt-20 mb-20">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 px-2">
                                <div className="flex items-center gap-3">
                                    <Users className="text-brand-primary" size={24}/>
                                    <h2 className="text-2xl md:text-3xl font-serif font-black text-brand-primary">Our
                                        Weekly Rhythm</h2>
                                </div>
                                <Link
                                    href="/events/weekly"
                                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-md hover:bg-amber-600 transition-all hover:scale-105 active:scale-95"
                                >
                                    <Clock size={14}/> View Live Countdowns
                                </Link>
                            </div>

                            <div
                                className="bg-white rounded-3xl p-2 md:p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-2 md:gap-4 overflow-x-auto no-scrollbar">
                                {weeklyEvents.map((event) => (
                                    <div key={event.id}
                                         className="flex-1 min-w-[250px] p-4 bg-slate-50 rounded-2xl border border-brand-primary/10 border-l-4 border-l-brand-primary hover:border-l-amber-500 hover:shadow-md transition-all">
                                        <span
                                            className="text-[10px] font-bold uppercase tracking-widest text-purple-600 mb-1 block">
                                            Every {event.recurrence_rules?.day}
                                        </span>
                                        <h3 className="font-bold text-brand-primary text-lg mb-2 truncate">{event.title}</h3>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                            <MapPin size={12} className="text-amber-500"/> <span
                                            className="truncate">{event.location}</span>
                                        </div>
                                    </div>
                                ))}

                                <Link href="/events/weekly"
                                      className="flex-1 min-w-[200px] p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/20 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-brand-primary hover:text-white transition-colors">
                                    <ArrowRight size={24}
                                                className="text-brand-primary group-hover:text-white mb-2 transition-colors"/>
                                    <span
                                        className="font-bold text-sm text-brand-primary group-hover:text-white transition-colors">See Live Schedule</span>
                                </Link>
                            </div>
                        </div>

                        {/* PART 2: THE DYNAMIC MONTHLY CALENDAR */}
                        <div>
                            <div
                                className="bg-white rounded-t-3xl border border-gray-200 p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm z-10 relative">
                                <div className="flex items-center gap-3">
                                    <CalendarIcon className="text-brand-primary" size={24}/>
                                    <h2 className="text-2xl md:text-3xl font-serif font-black text-brand-primary">
                                        Special & Monthly
                                    </h2>
                                </div>

                                <div
                                    className="flex items-center justify-between sm:justify-end gap-2 md:gap-4 bg-slate-50 p-1.5 md:p-2 rounded-2xl border border-gray-200 w-full sm:w-auto">
                                    <button onClick={prevMonth}
                                            className="p-2 md:p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-brand-primary hover:text-white transition-all">
                                        <ChevronLeft size={20}/></button>
                                    <span
                                        className="w-32 md:w-40 text-center font-black text-brand-primary uppercase tracking-widest text-xs md:text-sm">
                                        {currentDate.toLocaleString('default', {month: 'long', year: 'numeric'})}
                                    </span>
                                    <button onClick={nextMonth}
                                            className="p-2 md:p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-brand-primary hover:text-white transition-all">
                                        <ChevronRight size={20}/></button>
                                </div>
                            </div>

                            <div
                                className="bg-white rounded-b-3xl border-x border-b border-gray-200 p-4 md:p-8 shadow-sm min-h-[400px]">
                                {currentNotice && (
                                    <div
                                        className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex gap-4 items-start shadow-sm animate-in slide-in-from-top-4">
                                        <div className="p-2 bg-amber-100 text-amber-600 rounded-full shrink-0">
                                            <Info size={20}/>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-amber-800 mb-1">
                                                Schedule Notice for {currentDate.toLocaleString('default', {
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                            </h4>
                                            <p className="text-sm text-amber-700/80 leading-relaxed font-medium">
                                                {currentNotice}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {plottedEvents.length > 0 ? (
                                    <div className="space-y-4 md:space-y-6">
                                        {plottedEvents.map((event, idx) => {

                                            const eventDateForCheck = new Date(event.displayDate);
                                            eventDateForCheck.setHours(23, 59, 59, 999);

                                            const isPast = eventDateForCheck < new Date();
                                            const isToday = event.displayDate.toDateString() === new Date().toDateString();

                                            const cardStyle = isPast
                                                ? "bg-slate-50 border-gray-200 opacity-60 grayscale hover:grayscale-0"
                                                : isToday
                                                    ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400/50 shadow-lg scale-[1.01]"
                                                    : "bg-white border-brand-primary/20 hover:border-brand-primary hover:shadow-xl shadow-md";

                                            const badgeStyle = isPast
                                                ? "bg-gray-200 text-gray-400 border border-gray-300"
                                                : isToday
                                                    ? "bg-amber-400 text-amber-950 border border-amber-500 shadow-sm"
                                                    : "bg-brand-primary/5 text-brand-primary border border-brand-primary/20 group-hover:bg-brand-primary group-hover:text-white";

                                            return (
                                                <div key={idx}
                                                     className={`flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 rounded-3xl border transition-all duration-300 group ${cardStyle}`}>

                                                    <div
                                                        className={`w-full md:w-32 flex-shrink-0 flex flex-row md:flex-col items-center justify-center rounded-2xl p-4 transition-colors duration-300 ${badgeStyle}`}>
                                                        <span
                                                            className="text-xs font-bold uppercase tracking-widest opacity-80 mr-3 md:mr-0 md:mb-1">
                                                            {event.displayDate.toLocaleString('default', {month: 'short'})}
                                                        </span>
                                                        <span
                                                            className="text-4xl md:text-5xl font-black leading-none tracking-tighter">
                                                            {event.displayDate.getDate()}
                                                        </span>
                                                        <span
                                                            className="hidden md:block text-[10px] font-bold uppercase tracking-widest opacity-80 mt-2">
                                                            {event.displayDate.toLocaleString('default', {weekday: 'long'})}
                                                        </span>
                                                    </div>

                                                    <div className="flex-grow flex flex-col justify-center py-2">
                                                        <div className="flex flex-wrap gap-2 mb-3 items-center">
                                                            {isToday && (
                                                                <span
                                                                    className="text-[9px] font-black uppercase tracking-widest text-white bg-amber-500 px-2.5 py-1 rounded-md animate-pulse">
                                                                    Happening Today
                                                                </span>
                                                            )}
                                                            {isPast && (
                                                                <span
                                                                    className="text-[9px] font-black uppercase tracking-widest text-gray-500 bg-gray-200 px-2.5 py-1 rounded-md">
                                                                    Passed
                                                                </span>
                                                            )}
                                                            <span
                                                                className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${isPast ? 'bg-gray-200 text-gray-500' : 'text-amber-600 bg-amber-50 border border-amber-100'}`}>
                                                                {event.category}
                                                            </span>
                                                            {event.event_type === 'multi_day' && (
                                                                <span
                                                                    className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${isPast ? 'bg-gray-200 text-gray-500' : 'text-purple-600 bg-purple-50 border border-purple-100'}`}>
                                                                    Multi-Day Event
                                                                </span>
                                                            )}
                                                        </div>

                                                        <h3 className={`text-xl md:text-2xl font-bold mb-2 ${isPast ? 'text-gray-500' : 'text-brand-primary'}`}>
                                                            {event.title}
                                                        </h3>

                                                        {event.theme && (
                                                            <p className={`text-sm font-bold mb-4 italic ${isPast ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                Theme: {event.theme}
                                                            </p>
                                                        )}

                                                        <div
                                                            className={`flex flex-col sm:flex-row flex-wrap sm:items-center gap-3 sm:gap-6 text-xs font-bold mt-auto pt-4 border-t ${isPast ? 'border-gray-200 text-gray-400' : 'border-gray-100 text-gray-600'}`}>
                                                            <span className="flex items-center gap-2"><Clock size={16}
                                                                                                             className={isPast ? "text-gray-400" : "text-brand-secondary"}/>
                                                                {event.isCalculated ? (
                                                                    `${event.recurrence_rules?.start_time} - ${event.recurrence_rules?.end_time}`
                                                                ) : event.event_type === 'single_day' ? (
                                                                    `${new Date(event.start_datetime).toLocaleTimeString([], {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}`
                                                                ) : (
                                                                    "View Full Schedule"
                                                                )}
                                                            </span>
                                                            <span className="flex items-center gap-2"><MapPin size={16}
                                                                                                              className={isPast ? "text-gray-400" : "text-brand-secondary"}/> {event.location}</span>
                                                        </div>
                                                    </div>

                                                    {event.flyer_url && (
                                                        <div
                                                            className={`w-full md:w-56 aspect-video md:aspect-square rounded-2xl overflow-hidden flex-shrink-0 border relative ${isPast ? 'border-gray-200 opacity-50' : 'bg-slate-100 border-gray-100'}`}>
                                                            <img src={event.flyer_url} alt={event.title}
                                                                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                                                            {!isPast && <div
                                                                className="absolute inset-0 bg-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div
                                        className="flex flex-col items-center justify-center py-24 text-center bg-slate-50/50 rounded-2xl border border-dashed border-gray-200">
                                        <Star size={48} className="text-gray-300 mb-4"/>
                                        <h3 className="text-xl font-bold text-brand-primary mb-2">No Special Events</h3>
                                        <p className="text-gray-500 text-sm max-w-md">
                                            There are no special or monthly events scheduled for <strong
                                            className="text-brand-primary">{currentDate.toLocaleString('default', {
                                            month: 'long',
                                            year: 'numeric'
                                        })}</strong>. Check our weekly rhythm above!
                                        </p>
                                        <button onClick={goToToday}
                                                className="mt-6 text-xs font-bold text-brand-primary hover:text-amber-600 bg-white px-6 py-2.5 rounded-full shadow-sm border border-gray-200 uppercase tracking-widest transition-colors">
                                            Return to Current Month
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}