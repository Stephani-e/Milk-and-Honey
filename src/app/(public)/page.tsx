"use client";
import React from "react";
import Link from "next/link";
import {ArrowRight, Briefcase, Camera, HandHeart, Heart, Users} from "lucide-react";
import LatestSermon from "@/components/Home/LatestSermon";
import LatestGallery from "@/components/Home/LatestGallery";
import NextEvent from "@/components/Home/NextEvent";
import SidebarAd from "@/components/Home/SidebarAd";

export default function HomePage() {

    return (
        <div className="flex flex-col bg-white">

            {/* 1. HERO SECTION */}
            <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop')] bg-cover bg-center"/>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/90"/>

                <div
                    className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <span className="text-amber-400 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 block">Welcome Home</span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black text-white leading-tight mb-6">
                        Become a part of <br className="hidden md:block"/> our community
                    </h1>
                    <p className="text-base md:text-lg text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Join us this Sunday as we worship, learn, and grow together. There is a place for you here at
                        Milk & Honey, Lagos Province 56.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4 sm:mb-6">
                        <Link href="/about"
                              className="px-8 py-4 bg-amber-400 text-amber-950 font-bold rounded-full hover:bg-amber-300 transition-colors w-full sm:w-auto text-center">I'm
                            New Here</Link>
                        <Link href="/events"
                              className="px-8 py-4 bg-white/10 text-white font-bold rounded-full border border-white/20 hover:bg-white/20 backdrop-blur-sm transition-colors w-full sm:w-auto flex items-center justify-center gap-2">View
                            Service Times <ArrowRight size={18}/></Link>
                    </div>
                    <div className="flex items-center justify-center">
                        <Link href="/socials"
                              className="text-white/80 text-sm font-bold hover:text-amber-400 transition-colors underline underline-offset-4">Or
                            connect with us online</Link>
                    </div>
                </div>
            </section>

            {/* 2. PILLARS SECTION */}
            <section className="py-20 md:py-28 bg-amber-50/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-amber-600 font-bold tracking-widest uppercase text-[10px] mb-2 block">Who We Are</span>
                        <h2 className="text-3xl md:text-4xl font-serif font-black text-brand-primary">A Church That's
                            Relevant</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div
                            className="bg-white p-10 rounded-[2rem] shadow-xl shadow-amber-900/5 border border-amber-100 hover:-translate-y-2 transition-transform duration-300">
                            <div
                                className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 mb-6">
                                <Users size={24}/></div>
                            <h3 className="text-xl font-bold text-brand-primary mb-3">About Us</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">We are a vibrant parish dedicated to
                                raising leaders and transforming our community through the love of Christ.</p>
                        </div>
                        <div
                            className="bg-white p-10 rounded-[2rem] shadow-xl shadow-amber-900/5 border border-amber-100 hover:-translate-y-2 transition-transform duration-300">
                            <div
                                className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 mb-6">
                                <HandHeart size={24}/></div>
                            <h3 className="text-xl font-bold text-brand-primary mb-3">Get Involved</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">From the choir to the ushering unit,
                                discover how your unique gifts can serve the church and the world.</p>
                        </div>
                        <div
                            className="bg-white p-10 rounded-[2rem] shadow-xl shadow-amber-900/5 border border-amber-100 hover:-translate-y-2 transition-transform duration-300">
                            <div
                                className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 mb-6">
                                <Heart size={24}/></div>
                            <h3 className="text-xl font-bold text-brand-primary mb-3">Giving Back</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">Your tithes, offerings, and donations
                                empower our outreach programs and provincial missions.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. FIND YOUR COMMUNITY */}
            <section className="py-20 md:py-28 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div>
                            <span
                                className="text-amber-600 font-bold tracking-widest uppercase text-[10px] mb-2 block">Fellowships</span>
                            <h2 className="text-3xl md:text-4xl font-serif font-black text-brand-primary">Find Your
                                Community</h2>
                        </div>
                        <Link href="/life-stages"
                              className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-2">View
                            All Fellowships <ArrowRight size={16}/></Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {['Youth Church', 'Teens Church', 'Excellent Men', 'Good Women'].map((stage, i) => (
                            <Link href="/life-stages" key={i}
                                  className="group relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-md">
                                <div
                                    className="absolute inset-0 bg-slate-200 group-hover:scale-105 transition-transform duration-500"></div>
                                <div
                                    className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"/>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <h3 className="text-white font-bold text-lg md:text-xl">{stage}</h3>
                                    <span
                                        className="text-amber-400 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-2">Explore <ArrowRight
                                        size={12}/></span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. DYNAMIC CONTENT & SIDEBAR AD PLACEMENT */}
            <section className="py-20 md:py-28 bg-slate-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-12">

                        <div className="lg:w-2/3">
                            <div className="mb-8">
                                <span
                                    className="text-amber-600 font-bold tracking-widest uppercase text-[10px] mb-2 block">Stay Updated</span>
                                <h2 className="text-3xl md:text-4xl font-serif font-black text-brand-primary">What's
                                    Happening</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <LatestSermon/>

                                <NextEvent/>
                            </div>
                        </div>

                        {/* Right Side: SIDEBAR AD PLACEMENT */}
                        <div className="lg:w-1/3">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 hidden lg:block border-b border-gray-200 pb-2">Featured
                                Updates
                            </h2>
                            <SidebarAd/>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. COMMUNITY GALLERY & MEMBER UPLOADS */}
            <section className="py-20 md:py-28 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                        <div className="lg:w-1/3 text-center lg:text-left">
                            <span className="text-amber-600 font-bold tracking-widest uppercase text-[10px] mb-2 block">Our Moments</span>
                            <h2 className="text-3xl md:text-4xl font-serif font-black text-brand-primary mb-6">Experience
                                Milk & Honey</h2>
                            <p className="text-gray-500 text-sm leading-relaxed mb-8">
                                Relive the powerful moments from our recent services, conferences, and community
                                outreaches.<br/><br/>
                                <strong className="text-brand-primary">Were you at a recent event?</strong> Share your
                                own photos and videos to be featured in our community gallery!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link href="/gallery"
                                      className="px-8 py-3.5 bg-brand-primary text-white font-bold rounded-full hover:bg-slate-800 transition-colors shadow-lg">View
                                    Gallery</Link>
                                <Link href="/share"
                                      className="px-8 py-3.5 bg-amber-100 text-amber-900 font-bold rounded-full hover:bg-amber-200 transition-colors flex items-center justify-center gap-2">
                                    <Camera size={18}/> Share Photos
                                </Link>
                            </div>
                        </div>

                        <div className="lg:w-2/3 relative w-full mt-8 lg:mt-0">
                            <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full lg:w-[120%] h-full lg:h-[120%] bg-amber-50 rounded-full blur-3xl -z-10"/>
                            <LatestGallery/>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. JOIN THE WORKFORCE */}
            <section className="py-24 bg-brand-primary text-white relative overflow-hidden">
                <div
                    className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
                    <Briefcase size={400}/></div>
                <div
                    className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-xl text-center md:text-left">
                        <h2 className="text-3xl md:text-5xl font-serif font-black mb-6 leading-tight">Ready to
                            Serve?</h2>
                        <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8">
                            God has equipped you with unique talents. Whether it's playing an instrument, managing
                            technical gear, or welcoming guests, there is a department waiting for you.
                        </p>
                        <Link href="/departments"
                              className="inline-block px-8 py-4 bg-white text-brand-primary font-bold rounded-full hover:bg-amber-100 transition-colors">Explore
                            Workforce Units</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}