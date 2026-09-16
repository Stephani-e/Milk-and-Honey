"use client";
import React, {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {ArrowLeft, ArrowRight, Award, Church, Globe, MapPin, Sparkles, Users,} from "lucide-react";
import {supabase} from "@/lib/supabase";

// Fallback static data if Supabase table is not yet populated
const fallbackEvents = [
    {
        year: "2010",
        title: "The Humble Beginning",
        description:
            "Milk & Honey Center was birthed in a small rented hall with just 15 founding members who shared a massive vision for the community.",
        icon_name: "Users",
    },
    {
        year: "2013",
        title: "The First Exodus",
        description:
            "Experiencing rapid growth and a hunger for God's word, the parish moved to a larger warehouse facility and held its first major community outreach.",
        icon_name: "MapPin",
    },
    {
        year: "2017",
        title: "Acquiring the Promised Land",
        description:
            "Through the miraculous provision of God and the sacrifice of the members, the church acquired its permanent site—the land we currently call home.",
        icon_name: "Church",
    },
    {
        year: "2022",
        title: "Elevated to Provincial Headquarters",
        description:
            "Recognizing the spiritual impact and administrative excellence of the parish, RCCG Global elevated Milk & Honey to the status of Headquarters for Lagos Province 56.",
        icon_name: "Award",
    },
];

// Dynamic Icon Resolver
function renderTimelineIcon(iconName: string) {
    const props = {size: 24, className: "text-brand-primary"};
    switch (iconName) {
        case "Users":
            return <Users {...props} />;
        case "MapPin":
            return <MapPin {...props} />;
        case "Church":
            return <Church {...props} />;
        case "Award":
            return <Award {...props} />;
        default:
            return <Sparkles {...props} />;
    }
}

function TimelineCard({event, index}: { event: any; index: number }) {
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {threshold: 0.15}
        );

        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, []);

    const isEven = index % 2 === 0;

    return (
        <div
            ref={cardRef}
            className={`relative flex flex-col md:flex-row items-start md:items-center transition-all duration-1000 ease-out transform ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            } ${isEven ? "md:justify-start" : "md:justify-end"}`}
        >
            {/* The Timeline Dot/Icon */}
            <div
                className="absolute left-4 md:left-1/2 -translate-x-1/2 w-12 h-12 md:w-14 md:h-14 bg-white border-4 border-amber-100 rounded-full flex items-center justify-center shadow-lg z-10 top-0 md:top-auto">
                {renderTimelineIcon(event.icon_name)}
            </div>

            {/* The Content Card */}
            <div
                className={`w-full pl-14 md:pl-0 md:w-[45%] ${
                    isEven ? "md:pr-12 text-left md:text-right" : "md:pl-12 text-left"
                }`}
            >
                <div
                    className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 border border-gray-100 hover:-translate-y-1.5 transition-transform duration-300"
                >
                    <span
                        className="inline-block px-3.5 py-1 bg-amber-50 text-amber-700 font-black text-xs sm:text-sm rounded-full mb-3 font-sans tracking-widest"
                    >
                        {event.year}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-brand-primary mb-2 sm:mb-3">
                        {event.title}
                    </h3>
                    <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
                        {event.description}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function HistoryPage() {
    const [events, setEvents] = useState<any[]>(fallbackEvents);

    useEffect(() => {
        const fetchTimeline = async () => {
            const {data, error} = await supabase
                .from("timeline_events")
                .select("*")
                .order("year", {ascending: true});

            if (data && data.length > 0 && !error) {
                setEvents(data);
            }
        };

        fetchTimeline().catch(console.error);
    }, []);

    return (
        <div className="flex flex-col bg-slate-50 min-h-screen">
            {/* 1. HERO SECTION */}
            <section className="relative py-20 sm:py-28 md:py-32 bg-slate-900 overflow-hidden">
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat"></div>
                <div
                    className="absolute inset-0 bg-gradient-to-b from-brand-primary/90 via-brand-primary/80 to-slate-900/90"></div>

                <div className="absolute top-8 left-6 md:left-12 z-20">
                    <Link
                        href="/about"
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white text-xs md:text-sm font-bold tracking-widest uppercase transition-colors"
                    >
                        <ArrowLeft size={16}/> Back to About Us
                    </Link>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
                    <span
                        className="text-amber-400 font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-xs sm:text-sm mb-3 block">
                        Our Heritage
                    </span>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black text-white leading-tight mb-4 sm:mb-6">
                        The Genesis of <br className="hidden sm:inline"/>{" Milk & Honey"}
                    </h1>
                    <p className="text-slate-200 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        A testament to God's faithfulness, from a small living room
                        gathering to the spiritual headquarters of Lagos Province 56.
                    </p>
                </div>
            </section>

            {/* 2. THE RCCG ROOT */}
            <section className="py-12 sm:py-20 md:py-24 bg-white border-b border-gray-100">
                <div
                    className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-center">
                    {/* LEFT SIDE */}
                    <div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-brand-primary mb-4 sm:mb-6 leading-tight">
                            Rooted in a Divine Covenant
                        </h2>
                        <div className="space-y-4 sm:space-y-5 text-gray-600 leading-relaxed text-base sm:text-lg">
                            <p>
                                The story of Milk &amp; Honey is a continuation of a profound global
                                mandate. <strong>The Redeemed Christian Church of God (RCCG)</strong>{" "}
                                was established in 1952 by Rev. Josiah Olufemi Akindayomi.
                            </p>
                            <p>
                                Despite being unable to read or write in English, God gave him a
                                vision of the words{" "}
                                <span className="font-bold italic text-brand-primary">
                                    "The Redeemed Christian Church of God"
                                </span>{" "}
                                written on a blackboard. In that encounter, God made a covenant
                                with him: that this church would spread to the ends of the earth.
                            </p>
                            <p>
                                In 1981, the mantle of leadership passed to our General
                                Overseer, <strong>Pastor E.A. Adeboye</strong>. Under his visionary
                                guidance, the church exploded globally. Today, Milk &amp; Honey
                                stands proudly as a direct fruit of that original 1952 covenant.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Masonry Photo Grid */}
                    <div
                        className="relative w-full h-[380px] sm:h-[450px] md:h-[520px] rounded-3xl sm:rounded-[3rem] overflow-hidden shadow-2xl group bg-slate-900">
                        <div className="absolute -inset-10 grid grid-cols-2 gap-3 sm:gap-4 p-4">
                            <div
                                className="flex flex-col gap-3 sm:gap-4 -translate-y-8 group-hover:-translate-y-12 transition-transform duration-1000 ease-out h-full">
                                <div className="h-[40%] w-full relative rounded-xl sm:rounded-2xl overflow-hidden">
                                    <img
                                        src="/history-images/history-1.jpg"
                                        alt="RCCG Worship"
                                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                                    />
                                </div>
                                <div className="h-[60%] w-full relative rounded-xl sm:rounded-2xl overflow-hidden">
                                    <img
                                        src="/history-images/history-2.jpg"
                                        alt="YAYA"
                                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                                    />
                                </div>
                            </div>

                            <div
                                className="flex flex-col gap-3 sm:gap-4 translate-y-8 group-hover:translate-y-12 transition-transform duration-1000 ease-out h-full">
                                <div className="h-[60%] w-full relative rounded-xl sm:rounded-2xl overflow-hidden">
                                    <img
                                        src="/history-images/history-3.jpg"
                                        alt="Church Assembly"
                                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                                    />
                                </div>
                                <div className="h-[40%] w-full relative rounded-xl sm:rounded-2xl overflow-hidden">
                                    <img
                                        src="/history-images/history-4.jpg"
                                        alt="Praise and Worship"
                                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                                    />
                                </div>
                            </div>
                        </div>

                        <div
                            className="absolute inset-0 bg-slate-900/50 transition-colors duration-500 group-hover:bg-slate-900/60 z-10"></div>

                        <div
                            className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6">
                            <div
                                className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-2xl border border-white/20">
                                <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400"/>
                            </div>
                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-white mb-2 sm:mb-3 tracking-wide">
                                A Global Family
                            </h3>
                            <p className="text-amber-100 text-sm sm:text-lg font-medium max-w-xs mx-auto leading-relaxed">
                                Present in over 190 nations, united by one covenant.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. THE TIMELINE SECTION */}
            <section className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 overflow-hidden w-full">
                <div className="text-center mb-12 sm:mb-20">
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black text-brand-primary mb-3 sm:mb-4">
                        Our Journey Through Time
                    </h2>
                    <p className="text-gray-500 text-sm sm:text-base">
                        The milestones of grace that brought us to where we are today.
                    </p>
                </div>

                <div className="relative">
                    {/* Central Vertical Line */}
                    <div
                        className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-amber-100 -translate-x-1/2 rounded-full"></div>

                    <div className="space-y-10 sm:space-y-16">
                        {events.map((event, index) => (
                            <TimelineCard key={event.id || index} event={event} index={index}/>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. CALL TO ACTION */}
            <section className="py-16 sm:py-24 bg-white border-t border-gray-100 text-center relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat"></div>
                <div
                    className="absolute inset-0 bg-gradient-to-b from-brand-primary/95 via-brand-primary/90 to-slate-900/95"></div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-white mb-4 sm:mb-6">
                        The Story is Still Being Written.
                    </h2>
                    <p className="text-slate-200 text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto">
                        We honor our past, but our eyes are fixed firmly on the future. God is
                        doing a new thing at Milk &amp; Honey, and there is a blank page waiting
                        for your testimony.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            href="/events"
                            className="px-8 py-4 bg-amber-400 text-slate-900 font-bold rounded-full hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20"
                        >
                            Join us this Sunday
                        </Link>
                        <Link
                            href="/departments"
                            className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold rounded-full hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                        >
                            Become a Worker <ArrowRight size={18}/>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}