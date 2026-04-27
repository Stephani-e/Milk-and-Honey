import React from "react";
import Link from "next/link";
import {
    Calendar, MapPin, Users,
    Award, Church, Globe, ArrowRight
} from "lucide-react";

// Timeline Data - Easily editable by the media team later!
const timelineEvents = [
    {
        year: "2010",
        title: "The Humble Beginning",
        description: "Milk & Honey Center was birthed in a small rented hall with just 15 founding members who shared a massive vision for the community.",
        icon: <Users size={24} className="text-brand-primary" />
    },
    {
        year: "2013",
        title: "The First Exodus",
        description: "Experiencing rapid growth and a hunger for God's word, the parish moved to a larger warehouse facility and held its first major community outreach.",
        icon: <MapPin size={24} className="text-brand-primary" />
    },
    {
        year: "2017",
        title: "Acquiring the Promised Land",
        description: "Through the miraculous provision of God and the sacrifice of the members, the church acquired its permanent site—the land we currently call home.",
        icon: <Church size={24} className="text-brand-primary" />
    },
    {
        year: "2022",
        title: "Elevated to Provincial Headquarters",
        description: "Recognizing the spiritual impact and administrative excellence of the parish, RCCG Global elevated Milk & Honey to the status of Headquarters for Lagos Province 56.",
        icon: <Award size={24} className="text-brand-primary" />
    }
];

export default function HistoryPage() {
    return (
        <div className="flex flex-col bg-slate-50 min-h-screen">

            {/* 1. HERO SECTION */}
            <section className="relative py-24 md:py-32 bg-brand-primary overflow-hidden">
                {/* Subtle background texture */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <span className="text-amber-400 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 block">
                        Our Heritage
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif font-black text-white leading-tight mb-6">
                        The Genesis of <br/> Milk & Honey.
                    </h1>
                    <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        A testament to God's faithfulness, from a small living room gathering to the spiritual headquarters of Lagos Province 56.
                    </p>
                </div>
            </section>

            {/* 2. THE RCCG ROOT (Honoring the Global Church) */}
            <section className="py-16 md:py-24 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-serif font-black text-brand-primary mb-6">Rooted in a Global Covenant</h2>
                        <div className="space-y-4 text-gray-500 leading-relaxed">
                            <p>
                                You cannot tell the story of Milk & Honey without honoring the roots of the <strong>Redeemed Christian Church of God (RCCG)</strong>. Founded in 1952 by Pa Josiah Akindayomi, RCCG was established on a covenant of holiness and global evangelism.
                            </p>
                            <p>
                                Today, under the leadership of the General Overseer, Pastor E.A. Adeboye, that same covenant flows through the veins of our parish. We are proud to be a vibrant branch of this massive spiritual tree, carrying the mandate to take the gospel to the ends of the earth.
                            </p>
                        </div>
                    </div>
                    <div className="bg-slate-100 rounded-[3rem] p-10 md:p-16 text-center border border-gray-200 shadow-inner flex flex-col items-center justify-center">
                        <Globe size={48} className="text-amber-500 mb-6" />
                        <h3 className="text-xl font-bold text-brand-primary mb-2">A Global Family</h3>
                        <p className="text-sm text-gray-500">Present in over 190 nations across the globe.</p>
                    </div>
                </div>
            </section>

            {/* 3. THE TIMELINE SECTION */}
            <section className="py-24 max-w-5xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-serif font-black text-brand-primary mb-4">Our Journey Through Time</h2>
                    <p className="text-gray-500">The milestones of grace that brought us to where we are today.</p>
                </div>

                {/* Vertical Timeline Wrapper */}
                <div className="relative">
                    {/* The Central Line */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-amber-100 -translate-x-1/2 rounded-full"></div>

                    <div className="space-y-16">
                        {timelineEvents.map((event, index) => {
                            // Alternate sides on desktop
                            const isEven = index % 2 === 0;

                            return (
                                <div key={index} className={`relative flex flex-col md:flex-row items-start md:items-center ${isEven ? 'md:justify-start' : 'md:justify-end'}`}>

                                    {/* The Timeline Dot/Icon */}
                                    <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-14 h-14 bg-white border-4 border-amber-100 rounded-full flex items-center justify-center shadow-lg z-10 top-0 md:top-auto">
                                        {event.icon}
                                    </div>

                                    {/* The Content Card */}
                                    <div className={`w-full pl-16 md:pl-0 md:w-[45%] ${isEven ? 'md:pr-16 text-left md:text-right' : 'md:pl-16 text-left'}`}>
                                        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-gray-100 hover:-translate-y-1 transition-transform">
                                            <span className="inline-block px-4 py-1.5 bg-amber-50 text-amber-700 font-black text-sm rounded-full mb-4 font-sans tracking-widest">
                                                {event.year}
                                            </span>
                                            <h3 className="text-2xl font-serif font-bold text-brand-primary mb-3">
                                                {event.title}
                                            </h3>
                                            <p className="text-gray-500 text-sm leading-relaxed">
                                                {event.description}
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 4. CALL TO ACTION (The Future) */}
            <section className="py-24 bg-white border-t border-gray-100 text-center">
                <div className="max-w-3xl mx-auto px-6">
                    <Calendar size={48} className="mx-auto text-amber-500 mb-6" />
                    <h2 className="text-3xl md:text-4xl font-serif font-black text-brand-primary mb-6">
                        The Story is Still Being Written.
                    </h2>
                    <p className="text-gray-500 text-lg mb-10 leading-relaxed">
                        We honor our past, but our eyes are fixed firmly on the future. God is doing a new thing at Milk & Honey, and there is a blank page waiting for your testimony.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/events" className="px-8 py-4 bg-brand-primary text-white font-bold rounded-full hover:bg-slate-800 transition-colors shadow-lg shadow-brand-primary/20">
                            Join us this Sunday
                        </Link>
                        <Link href="/departments" className="px-8 py-4 bg-amber-50 text-amber-900 font-bold rounded-full hover:bg-amber-100 transition-colors flex items-center justify-center gap-2">
                            Become a Worker <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}