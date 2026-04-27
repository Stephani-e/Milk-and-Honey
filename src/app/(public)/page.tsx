import React from "react";
import Link from "next/link";
import { ArrowRight, Heart, Users, HandHeart, MapPin, Briefcase, Calendar, PlayCircle, Megaphone } from "lucide-react";

export default function HomePage() {
    return (
        <div className="flex flex-col bg-white">

            {/* 1. HERO SECTION */}
            <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
                {/* Replace with a real photo from the church later */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/90" />

                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <span className="text-amber-400 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 block">
                        Welcome Home
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black text-white leading-tight mb-6">
                        Become a part of <br className="hidden md:block"/> our community
                    </h1>
                    <p className="text-base md:text-lg text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Join us this Sunday as we worship, learn, and grow together. There is a place for you here at Milk & Honey, Lagos Province 56.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/about" className="px-8 py-4 bg-amber-400 text-amber-950 font-bold rounded-full hover:bg-amber-300 transition-colors w-full sm:w-auto text-center">
                            I'm New Here
                        </Link>
                        <Link href="/events" className="px-8 py-4 bg-white/10 text-white font-bold rounded-full border border-white/20 hover:bg-white/20 backdrop-blur-sm transition-colors w-full sm:w-auto flex items-center justify-center gap-2">
                            View Service Times <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 2. PILLARS SECTION (From Reference Image) */}
            <section className="py-20 md:py-28 bg-amber-50/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-amber-600 font-bold tracking-widest uppercase text-[10px] mb-2 block">Who We Are</span>
                        <h2 className="text-3xl md:text-4xl font-serif font-black text-brand-primary">A Church That's Relevant</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="bg-white p-10 rounded-[2rem] shadow-xl shadow-amber-900/5 border border-amber-100 hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 mb-6">
                                <Users size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-brand-primary mb-3">About Us</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                We are a vibrant parish dedicated to raising leaders and transforming our community through the love of Christ.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white p-10 rounded-[2rem] shadow-xl shadow-amber-900/5 border border-amber-100 hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 mb-6">
                                <HandHeart size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-brand-primary mb-3">Get Involved</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                From the choir to the ushering unit, discover how your unique gifts can serve the church and the world.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white p-10 rounded-[2rem] shadow-xl shadow-amber-900/5 border border-amber-100 hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 mb-6">
                                <Heart size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-brand-primary mb-3">Giving Back</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Your tithes, offerings, and donations empower our outreach programs and provincial missions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. FIND YOUR COMMUNITY (Life Stages Funnel) */}
            <section className="py-20 md:py-28 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div>
                            <span className="text-amber-600 font-bold tracking-widest uppercase text-[10px] mb-2 block">Fellowships</span>
                            <h2 className="text-3xl md:text-4xl font-serif font-black text-brand-primary">Find Your Community</h2>
                        </div>
                        <Link href="/life-stages" className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-2">
                            View All Fellowships <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {['Youth Church', 'Teens Church', 'Excellent Men', 'Good Women'].map((stage, i) => (
                            <Link href="/life-stages" key={i} className="group relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-md">
                                <div className="absolute inset-0 bg-slate-200 group-hover:scale-105 transition-transform duration-500">
                                    {/* Placeholder for real category images later */}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <h3 className="text-white font-bold text-lg md:text-xl">{stage}</h3>
                                    <span className="text-amber-400 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-2">
                                        Explore <ArrowRight size={12} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. DYNAMIC CONTENT & SIDEBAR AD PLACEMENT */}
            {/* This is where your Admin data will automatically populate later! */}
            <section className="py-20 md:py-28 bg-slate-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-12">

                        {/* Left Side: Upcoming Events / Sermons */}
                        <div className="lg:w-2/3">
                            <div className="mb-8">
                                <span className="text-amber-600 font-bold tracking-widest uppercase text-[10px] mb-2 block">Stay Updated</span>
                                <h2 className="text-3xl md:text-4xl font-serif font-black text-brand-primary">What's Happening</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* DB Card Placeholder 1: Sermon */}
                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[250px]">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                        <PlayCircle size={20} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Latest Sermon</span>
                                        <h3 className="font-serif font-bold text-brand-primary text-xl mb-2">[DB: Sermon Title]</h3>
                                        <p className="text-xs text-gray-500 line-clamp-2">This will automatically pull the newest sermon from your Supabase database.</p>
                                    </div>
                                </div>

                                {/* DB Card Placeholder 2: Event */}
                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[250px]">
                                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Next Event</span>
                                        <h3 className="font-serif font-bold text-brand-primary text-xl mb-2">[DB: Event Title]</h3>
                                        <p className="text-xs text-gray-500 line-clamp-2">This will automatically pull the next upcoming event from your calendar.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: SIDEBAR AD PLACEMENT */}
                        <div className="lg:w-1/3">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 hidden lg:block border-b border-gray-200 pb-2">
                                Featured Updates
                            </h2>

                            {/* The specific targeted Ad Slot */}
                            <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl h-[300px] lg:h-[calc(100%-3rem)] flex flex-col items-center justify-center text-gray-400 p-8 text-center shadow-sm">
                                <Megaphone size={32} className="mb-4 opacity-50" />
                                <span className="text-xs font-bold uppercase tracking-widest block mb-2 text-brand-primary">
                                    [Sidebar Ad Slot]
                                </span>
                                <p className="text-[10px] leading-relaxed max-w-xs">
                                    When an Ad Campaign is set to "Global Sidebar", it will automatically render here instead of this placeholder.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 5. JOIN THE WORKFORCE (Departments Funnel) */}
            <section className="py-24 bg-brand-primary text-white relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
                    <Briefcase size={400} />
                </div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-xl text-center md:text-left">
                        <h2 className="text-3xl md:text-5xl font-serif font-black mb-6 leading-tight">Ready to Serve?</h2>
                        <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8">
                            God has equipped you with unique talents. Whether it's playing an instrument, managing technical gear, or welcoming guests, there is a department waiting for you.
                        </p>
                        <Link href="/departments" className="inline-block px-8 py-4 bg-white text-brand-primary font-bold rounded-full hover:bg-amber-100 transition-colors">
                            Explore Workforce Units
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}