"use client";
import React, {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";
import Link from "next/link";
import {ArrowRight, Calendar, Clock, MapPin, Star} from "lucide-react";
import SkeletonLoader from "../UI/SkeletonLoader";

export default function NextEvent() {
    const [nextEvent, setNextEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUpcomingEvent() {
            setLoading(true);
            const {data} = await supabase
                .from("church_events")
                .select("*")
                .is("deleted_at", null)
                .eq("is_active", true);

            if (data && data.length > 0) {
                const upcoming = findNextEvent(data);
                setNextEvent(upcoming);
            }
            setLoading(false);
        }

        fetchUpcomingEvent().catch(console.error)
    }, []);

    // --- DATE MATH ENGINE ---
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

    const getNextWeeklyDate = (dayName: string) => {
        const daysMap: any = {
            "sunday": 0,
            "monday": 1,
            "tuesday": 2,
            "wednesday": 3,
            "thursday": 4,
            "friday": 5,
            "saturday": 6
        };
        const targetDay = daysMap[dayName.toLowerCase()];
        if (targetDay === undefined) return null;

        const d = new Date();
        d.setHours(0, 0, 0, 0);
        const daysUntil = (targetDay + 7 - d.getDay()) % 7;
        d.setDate(d.getDate() + daysUntil);
        return d;
    };

    // Find the absolute closest event from today
    const findNextEvent = (events: any[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        let allUpcoming: any[] = [];

        events.forEach(event => {
            if (event.event_type === 'recurring') {
                if (event.recurrence_rules?.pattern_type === 'weekly' && event.recurrence_rules.day) {
                    const nextDate = getNextWeeklyDate(event.recurrence_rules.day);
                    if (nextDate) allUpcoming.push({...event, displayDate: nextDate});
                } else if (event.recurrence_rules?.pattern_type === 'monthly' && event.recurrence_rules.rule) {
                    let nextDate = calculateMonthlyDate(event.recurrence_rules.rule, currentYear, currentMonth);
                    // If the monthly date for THIS month has already passed, check NEXT month
                    if (nextDate && nextDate < today) {
                        const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
                        const nextMonthIndex = currentMonth === 11 ? 0 : currentMonth + 1;
                        nextDate = calculateMonthlyDate(event.recurrence_rules.rule, nextMonthYear, nextMonthIndex);
                    }
                    if (nextDate) allUpcoming.push({...event, displayDate: nextDate});
                }
            } else if (event.event_type === 'single_day' && event.start_datetime) {
                const eventDate = new Date(event.start_datetime);
                eventDate.setHours(0, 0, 0, 0);
                if (eventDate >= today) allUpcoming.push({...event, displayDate: eventDate});
            } else if (event.event_type === 'multi_day' && event.multi_day_schedule?.length > 0) {
                const firstDayDate = new Date(event.multi_day_schedule[0].date);
                firstDayDate.setHours(0, 0, 0, 0);
                // For multi-day, we also check if it's currently ongoing
                const lastDayDate = new Date(event.multi_day_schedule[event.multi_day_schedule.length - 1].date);
                lastDayDate.setHours(23, 59, 59, 999);
                if (lastDayDate >= today) allUpcoming.push({...event, displayDate: firstDayDate});
            }
        });

        // Sort by the closest date
        allUpcoming.sort((a, b) => a.displayDate.getTime() - b.displayDate.getTime());
        return allUpcoming.length > 0 ? allUpcoming[0] : null;
    };

    if (loading) {
        return (
            <div className="w-full h-full min-h-[250px]">
                <SkeletonLoader variant="next-event-card"/>
            </div>
        );
    }

    if (!nextEvent) {
        return (
            <div
                className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-center min-h-[250px]">
                <div
                    className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
                    <Calendar size={20}/></div>
                <h3 className="font-serif font-bold text-brand-primary text-xl mb-2">No Upcoming Events</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-6">There are no special events scheduled at this
                    time. Join us for our regular weekly services!</p>
                <Link href="/events"
                      className="text-[10px] font-bold uppercase tracking-widest text-brand-primary hover:text-amber-600 flex items-center gap-1 mt-auto">View
                    Calendar <ArrowRight size={12}/></Link>
            </div>
        );
    }

    const isToday = nextEvent.displayDate.toDateString() === new Date().toDateString();

    return (
        <div
            className={`p-6 rounded-[2rem] border transition-all flex flex-col justify-between min-h-[250px] relative overflow-hidden group ${isToday ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100 hover:border-amber-200'}`}>

            {/* Background Graphic if the flyer exists */}
            {nextEvent.flyer_url && (
                <div className="absolute inset-0 bg-slate-900 z-0">
                    <img src={nextEvent.flyer_url} alt="Event"
                         className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-700"/>
                    <div
                        className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40"></div>
                </div>
            )}

            <div className="relative z-10 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${nextEvent.flyer_url ? 'text-amber-400 bg-amber-500/20 backdrop-blur-md border border-amber-500/30' : 'bg-purple-500/20 text-purple-600'}`}>
                        {nextEvent.event_type === 'recurring' ? <Clock size={20}/> : <Star size={20}/>}
                    </div>

                    <div className={`text-right ${nextEvent.flyer_url ? 'text-white' : 'text-brand-primary'}`}>
                        <span className="block text-[10px] font-bold uppercase tracking-widest opacity-80 mb-0.5">
                            {nextEvent.displayDate.toLocaleString('default', {month: 'short'})}
                        </span>
                        <span className="block text-xl font-black leading-none">
                            {nextEvent.displayDate.getDate()}
                        </span>
                    </div>
                </div>

                <div className="mt-auto">
                    <div className="flex items-center gap-2">
                        {isToday && (
                            <span
                                className="bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm animate-pulse">
                                Today
                            </span>
                        )}
                        <span
                            className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${nextEvent.flyer_url ? 'bg-white/20 text-white border border-white/20' : 'bg-gray-100 text-gray-500'}`}>
                            {nextEvent.category}
                        </span>
                    </div>

                    <h3 className={`font-serif font-bold text-xl mt-3 md:text-2xl line-clamp-2 leading-tight ${nextEvent.flyer_url ? 'text-white' : 'text-brand-primary'}`}>
                        {nextEvent.title}
                    </h3>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/20">
                    <div
                        className={`flex items-center gap-1.5 text-xs font-bold ${nextEvent.flyer_url ? 'text-slate-300' : 'text-gray-500'}`}>
                        <MapPin size={12} className={nextEvent.flyer_url ? 'text-amber-400' : 'text-amber-500'}/>
                        <span className="truncate">{nextEvent.location}</span>
                    </div>

                    <Link href="/events"
                          className={`text-[10px] font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-black/30 px-4 py-2 rounded-full backdrop-blur-md transition-colors border border-white/10 shrink-0 ${nextEvent.flyer_url ? 'text-white hover:text-amber-400' : 'text-brand-primary hover:text-amber-600'}`}>
                        View Full Calendar <ArrowRight size={12}/>
                    </Link>
                </div>
            </div>
        </div>
    );
}