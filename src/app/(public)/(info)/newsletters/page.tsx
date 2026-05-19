"use client";
import React, {Suspense, useEffect, useState} from "react";
import Link from "next/link";
import {ArrowRight, Calendar, ChevronLeft, ChevronRight, Clock, Mail, Megaphone, Newspaper,} from "lucide-react";
import {supabase} from "@/lib/supabase";
import SkeletonLoader from "@/components/UI/SkeletonLoader";
import {useSearchParams} from "next/navigation";

const ITEMS_PER_PAGE = 7;

// --- SVG Icons ---
const Instagram = ({size = 20, className = ""}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

const Twitter = ({size = 20, className = ""}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path
            d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
    </svg>
);

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

const getNextOccurrence = (event: any, now: Date) => {
    const year = now.getFullYear();
    const month = now.getMonth();
    if (event.event_type === 'single_day' && event.start_datetime) {
        const d = new Date(event.start_datetime);
        return d > now ? d : null;
    }
    if (event.event_type === 'multi_day' && event.multi_day_schedule) {
        const schedule = typeof event.multi_day_schedule === 'string' ? JSON.parse(event.multi_day_schedule) : event.multi_day_schedule;
        for (let day of schedule) {
            const d = new Date(`${day.date}T${day.start_time || '00:00'}:00`);
            if (d > now) return d;
        }
        return null;
    }
    if (event.event_type === 'recurring' && event.recurrence_rules) {
        const rules = typeof event.recurrence_rules === 'string' ? JSON.parse(event.recurrence_rules) : event.recurrence_rules;
        if (rules.pattern_type === 'weekly') {
            const dayMap: Record<string, number> = {
                "sunday": 0,
                "monday": 1,
                "tuesday": 2,
                "wednesday": 3,
                "thursday": 4,
                "friday": 5,
                "saturday": 6
            };
            const targetDay = dayMap[rules.day?.toLowerCase()];
            if (targetDay === undefined) return null;
            let d = new Date(now);
            const [hours, minutes] = (rules.start_time || "00:00").split(':');
            d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            if (d.getDay() === targetDay && d > now) return d;
            d.setDate(d.getDate() + ((targetDay + 7 - d.getDay()) % 7 || 7));
            return d;
        }
        if (rules.pattern_type === 'monthly') {
            const [hours, minutes] = (rules.start_time || "00:00").split(':');
            let d = calculateMonthlyDate(rules.rule, year, month);
            if (d) {
                d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                if (d > now) return d;
            }
            let nextMonth = month === 11 ? 0 : month + 1;
            let nextYear = month === 11 ? year + 1 : year;
            let dNext = calculateMonthlyDate(rules.rule, nextYear, nextMonth);
            if (dNext) {
                dNext.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                return dNext;
            }
        }
    }
    return null;
};

function NewsletterContent() {
    const searchParams = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");

    const [newsletters, setNewsletters] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const now = new Date();
            const nowIso = now.toISOString();

            const [eventsRes, settingsRes, newsRes] = await Promise.all([
                supabase.from('church_events').select('*').eq('is_active', true).is('deleted_at', null),
                supabase.from('site_settings').select('*').single(),
                supabase.from('newsletters')
                    .select('*', {count: 'exact'})
                    .eq('is_published', true)
                    .lte('published_at', nowIso)
                    .order('is_pinned', {ascending: false})
                    .order('published_at', {ascending: false})
                    .range((currentPage - 1) * ITEMS_PER_PAGE, (currentPage * ITEMS_PER_PAGE) - 1)
            ]);

            setEvents(eventsRes.data || []);
            setSettings(settingsRes.data);
            setNewsletters(newsRes.data || []);
            setTotalCount(newsRes.count || 0);
            setLoading(false);
        }

        loadData().catch(error => console.error('Error loading data:', error));
    }, [currentPage]);

    // Process events
// --- UPDATED EVENT PROCESSING LOGIC ---
    const processedEvents = events
        .map(event => {
            const nextDate = getNextOccurrence(event, new Date());
            if (!nextDate) return null;

            let timeString = nextDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

            // Logic: Check for the multi-session array
            const rules = typeof event.recurrence_rules === 'string'
                ? JSON.parse(event.recurrence_rules)
                : event.recurrence_rules;

            if (event.event_type === 'multi_day') {
                timeString = "Multi-Day Event";
            }
            // If it's recurring and has an array of sessions, show "Multiple Sessions"
            else if (event.event_type === 'recurring' && rules?.standard_sessions && rules.standard_sessions.length > 0) {
                timeString = "Multiple Sessions";
            }
            // If it has a specific rule (like "Holy Ghost Service" at 6pm), use that rule's time
            else if (rules?.start_time) {
                timeString = rules.start_time;
            }

            return {...event, nextDate, timeString};
        })
        .filter(Boolean)
        .sort((a, b) => a!.nextDate.getTime() - b!.nextDate.getTime())
        .slice(0, 4);

    if (loading) return <div className="min-h-screen bg-slate-50 p-12"><SkeletonLoader variant="newsletter"/></div>;

    const featuredNewsletter = newsletters[0];
    const olderNewsletters = newsletters.slice(1);
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="bg-slate-50 min-h-screen pb-24 font-sans">

            {/* HERO SECTION */}
            <section className="bg-brand-primary py-16 md:py-24 relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <span
                        className="text-amber-400 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 flex items-center gap-2">
                        <Newspaper size={16}/> Church Updates
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif font-black text-white leading-tight max-w-2xl">
                        News, Stories & Announcements.
                    </h1>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-6 -mt-10 relative z-20 space-y-12">

                {/* TOP SECTION: Split View (Events & Ads) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Side: Upcoming Highlights */}
                    <div
                        className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-brand-primary/5 border border-gray-100">
                        <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                            <h2 className="text-xl font-bold text-brand-primary flex items-center gap-2">
                                <Calendar className="text-brand-secondary" size={20}/> Upcoming Highlights
                            </h2>
                            <Link href="/events"
                                  className="text-xs font-bold text-gray-400 hover:text-brand-primary uppercase tracking-widest transition-colors">
                                Full Calendar →
                            </Link>
                        </div>

                        {processedEvents.length === 0 ? (
                            <div
                                className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-gray-200">
                                <p className="text-sm font-bold text-gray-400 italic">No major upcoming events listed at
                                    the moment. Stay tuned!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {processedEvents.map((event: any, idx: number) => (
                                    <div key={idx}
                                         className="flex gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-brand-surface border border-transparent hover:border-brand-accent transition-all group">
                                        <div
                                            className="bg-white border border-gray-100 w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 shadow-sm group-hover:border-brand-secondary transition-colors">
                                            <span
                                                className="text-[10px] font-black uppercase text-brand-secondary leading-none">
                                                {event.nextDate.toLocaleDateString('en-US', {month: 'short'})}
                                            </span>
                                            <span className="text-lg font-black text-brand-primary leading-none mt-1">
                                                {event.nextDate.getDate()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-brand-primary text-sm line-clamp-1">{event.title}</h3>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <Clock size={12}/> {event.timeString}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Side: Advertisement Box */}
                    <div
                        className="bg-gradient-to-br from-brand-primary to-slate-900 rounded-3xl p-8 shadow-xl text-center flex flex-col justify-center items-center relative overflow-hidden group">
                        <div
                            className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-brand-secondary/20 transition-colors duration-500"></div>
                        <Megaphone size={32} className="text-amber-400 mb-4 animate-bounce"/>
                        <h3 className="text-white font-serif font-black text-2xl mb-2 relative z-10">Partner With
                            Us</h3>
                        <p className="text-slate-300 text-sm mb-6 relative z-10 leading-relaxed">
                            Reach the Milk & Honey community. Advertise your brand or upcoming event right here.
                        </p>
                        <div className="w-full space-y-3 relative z-10">
                            <Link href="/contact"
                                  className="block bg-amber-400 text-amber-950 px-6 py-3 rounded-xl font-bold text-sm hover:bg-amber-300 transition-colors">
                                Book via Email
                            </Link>
                            <div className="flex items-center justify-center gap-2 pt-2">
                                <span className="text-xs text-slate-400 font-medium">Or DM us on:</span>
                                <a href={settings?.instagram_url} target="_blank" rel="noreferrer"
                                   className="text-white hover:text-pink-400 transition-colors"><Instagram
                                    size={18}/></a>
                                <a href={settings?.twitter_url} target="_blank" rel="noreferrer"
                                   className="text-white hover:text-blue-400 transition-colors"><Twitter size={18}/></a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* EMAIL SUBSCRIPTION BANNER */}
                <div
                    className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-brand-primary/5 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="md:w-1/2 text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary mb-2">Never Miss an
                            Update</h2>
                        <p className="text-gray-500 text-sm">Join our digital mailing list to receive the latest
                            sermons, announcements, and family news directly in your inbox.</p>
                    </div>
                    <div className="md:w-1/2 w-full">
                        <form className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-grow">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    required
                                    className="w-full py-4 pl-12 pr-4 bg-slate-50 border border-gray-200 text-brand-primary rounded-xl outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-sm font-medium"
                                />
                            </div>
                            <button type="submit"
                                    className="bg-brand-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 flex-shrink-0">
                                Subscribe
                            </button>
                        </form>
                        <p className="text-[10px] text-gray-400 mt-2 text-center md:text-left">* We respect your
                            privacy. No spam, ever.</p>
                    </div>
                </div>

                {/* BOTTOM SECTION: Newsletter Feed */}
                <div className="pt-8">
                    {!featuredNewsletter ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <Newspaper size={48} className="mx-auto text-gray-300 mb-4"/>
                            <h3 className="text-lg font-bold text-brand-primary">No updates published yet.</h3>
                            <p className="text-gray-500 mt-2">Check back soon for the latest news from the Milk & Honey
                                family.</p>
                        </div>
                    ) : (
                        <div className="space-y-12">

                            {/* 1. THE FEATURED NEWSLETTER (Pinned or Newest) */}
                            <Link
                                href={`/newsletters/${featuredNewsletter.slug}`}
                                className="group grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                            >
                                <div className="aspect-video md:aspect-auto bg-slate-100 relative overflow-hidden">
                                    {featuredNewsletter.cover_image_url ? (
                                        <img
                                            src={featuredNewsletter.cover_image_url}
                                            alt={featuredNewsletter.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full flex items-center justify-center bg-brand-surface text-brand-primary/20">
                                            <Newspaper size={64}/>
                                        </div>
                                    )}
                                    <div
                                        className="absolute top-4 left-4 bg-amber-400 text-amber-950 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                                        {featuredNewsletter.is_pinned ? " Pinned Update" : "Latest Update"}
                                    </div>
                                </div>
                                <div className="p-8 md:p-12 flex flex-col justify-center">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                        {new Date(featuredNewsletter.published_at).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                    <h3 className="font-serif font-black text-2xl md:text-3xl text-brand-primary mb-4 leading-tight group-hover:text-brand-secondary transition-colors">
                                        {featuredNewsletter.title}
                                    </h3>
                                    <p className="text-base text-gray-600 mb-8 leading-relaxed">
                                        {featuredNewsletter.excerpt}
                                    </p>
                                    <div
                                        className="mt-auto flex items-center gap-2 text-sm font-bold text-brand-primary group-hover:text-amber-600 transition-colors">
                                        Read Full Article <ArrowRight size={16}/>
                                    </div>
                                </div>
                            </Link>

                            {/* 2. THE TABLE ARCHIVE (Paginated) */}
                            {olderNewsletters.length > 0 && (
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div
                                        className="px-6 py-5 border-b border-gray-100 bg-slate-50/50 flex justify-between items-center">
                                        <h3 className="font-bold text-brand-primary uppercase tracking-widest text-xs">Previous
                                            Updates Archive</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400 w-36">Date</th>
                                                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Newsletter
                                                    Details
                                                </th>
                                                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400 hidden sm:table-cell w-40">Author</th>
                                                <th className="p-5 text-right w-16"></th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                            {olderNewsletters.map((newsletter) => (
                                                <tr key={newsletter.id}
                                                    className="hover:bg-slate-50 transition-colors group cursor-pointer relative">
                                                    <td className="p-5 align-top">
                                                        <Link href={`/newsletters/${newsletter.slug}`}
                                                              className="absolute inset-0 z-10"><span
                                                            className="sr-only">View Newsletter</span></Link>
                                                        <span
                                                            className="text-xs font-bold text-brand-primary uppercase tracking-wider block mt-1">
                                                                {new Date(newsletter.published_at).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                    </td>
                                                    <td className="p-5 align-top">
                                                        <h4 className="font-bold text-brand-primary text-base mb-1 group-hover:text-brand-secondary transition-colors">{newsletter.title}</h4>
                                                        <p className="text-xs text-gray-500 line-clamp-2 md:line-clamp-1">{newsletter.excerpt}</p>
                                                    </td>
                                                    <td className="p-5 align-top hidden sm:table-cell">
                                                        <span
                                                            className="text-xs font-medium text-gray-600 block mt-1">{newsletter.author_name}</span>
                                                    </td>
                                                    <td className="p-5 align-top text-right">
                                                        <div
                                                            className="w-8 h-8 rounded-full bg-brand-surface text-brand-secondary flex items-center justify-center group-hover:bg-brand-secondary group-hover:text-white transition-colors ml-auto mt-0.5">
                                                            <ArrowRight size={14} strokeWidth={3}/>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div
                                            className="p-5 border-t border-gray-100 flex items-center justify-between bg-slate-50/50">
                                            <span
                                                className="text-xs font-bold text-gray-400">Page {currentPage} of {totalPages}</span>
                                            <div className="flex items-center gap-2">
                                                {currentPage > 1 ? (
                                                    <Link href={`/newsletters?page=${currentPage - 1}`}
                                                          className="p-2 bg-white border border-gray-200 rounded-lg text-brand-primary hover:bg-gray-50 transition-colors">
                                                        <ChevronLeft size={16}/>
                                                    </Link>
                                                ) : (
                                                    <div
                                                        className="p-2 border border-gray-100 rounded-lg text-gray-300 cursor-not-allowed">
                                                        <ChevronLeft size={16}/></div>
                                                )}

                                                {currentPage < totalPages ? (
                                                    <Link href={`/newsletters?page=${currentPage + 1}`}
                                                          className="p-2 bg-white border border-gray-200 rounded-lg text-brand-primary hover:bg-gray-50 transition-colors">
                                                        <ChevronRight size={16}/>
                                                    </Link>
                                                ) : (
                                                    <div
                                                        className="p-2 border border-gray-100 rounded-lg text-gray-300 cursor-not-allowed">
                                                        <ChevronRight size={16}/></div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function PublicNewslettersPage() {
    return (
        <Suspense fallback={<SkeletonLoader variant="newsletter"/>}>
            <NewsletterContent/>
        </Suspense>
    );
}