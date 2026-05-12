"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, Camera, ArrowRight } from "lucide-react";
import FloatingDove from "@/components/Public/FloatingDove";
import {CHURCH_INFO} from "@/lib/constants";
import GlobalTopAd from "@/components/Home/GlobalTopAd";

const FacebookIcon = ({ size = 20, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
);

const InstagramIcon = ({ size = 20, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

const YouTubeIcon = ({ size = 20, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
    </svg>
);

const TwitterIcon = ({ size = 20, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
    </svg>
);

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [mobileMenuOpen]);

    return (
        <div className="min-h-screen flex flex-col font-sans bg-amber-50/30 relative">

            {/* 1. GLOBAL AD PLACEMENT */}
            <GlobalTopAd />

            {/* 2. PUBLIC NAVBAR */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                    {/* Logo Area */}
                    <Link href="/" className="font-serif text-2xl font-black text-brand-primary tracking-tight z-50 relative">
                        Milk<span className="text-amber-600">&</span>Honey
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8 font-bold text-sm text-gray-600">
                        <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link>

                        {/* ABOUT DROPDOWN */}
                        <div className="relative group py-6">
                            <button className="flex items-center gap-1 hover:text-brand-primary transition-colors">
                                About <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                            </button>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 bg-white border border-gray-100 shadow-xl rounded-2xl py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                <Link href="/about" className="block px-5 py-2 text-sm text-gray-600 hover:text-brand-primary hover:bg-slate-50 transition-colors">Our Story</Link>
                                <Link href="/leadership" className="block px-5 py-2 text-sm text-gray-600 hover:text-brand-primary hover:bg-slate-50 transition-colors">Leadership Registry</Link>
                                <Link href="/parishes" className="block px-5 py-2 text-sm text-gray-600 hover:text-brand-primary hover:bg-slate-50 transition-colors">Parish Network</Link>
                            </div>
                        </div>

                        {/* CONNECT DROPDOWN */}
                        <div className="relative group py-6">
                            <button className="flex items-center gap-1 hover:text-brand-primary transition-colors">
                                Connect <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                            </button>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-56 bg-white border border-gray-100 shadow-xl rounded-2xl py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                <Link href="/life-stages" className="block px-5 py-2 text-sm text-gray-600 hover:text-brand-primary hover:bg-slate-50 transition-colors">Life Stages (Fellowships)</Link>
                                <Link href="/departments" className="block px-5 py-2 text-sm text-gray-600 hover:text-brand-primary hover:bg-slate-50 transition-colors">Join the Workforce</Link>
                            </div>
                        </div>

                        {/* MEDIA DROPDOWN */}
                        <div className="relative group py-6">
                            <button className="flex items-center gap-1 hover:text-brand-primary transition-colors">
                                Media <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                            </button>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-56 bg-white border border-gray-100 shadow-xl rounded-2xl py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                <Link href="/sermons" className="block px-5 py-2 text-sm text-gray-600 hover:text-brand-primary hover:bg-slate-50 transition-colors">Watch Sermons</Link>
                                <Link href="/gallery" className="block px-5 py-2 text-sm text-gray-600 hover:text-brand-primary hover:bg-slate-50 transition-colors">Church Gallery</Link>
                                <div className="mx-4 my-1 border-t border-gray-100"></div>
                                <Link href="/socials" className="block px-5 py-2 text-sm text-gray-600 hover:text-brand-primary hover:bg-slate-50 transition-colors">
                                    Socials
                                </Link>
                                <Link href="/share" className="px-5 py-2 text-sm text-brand-primary font-bold hover:bg-slate-50 transition-colors flex items-center justify-between group/share">
                                    Share Photos <Camera size={14} className="text-amber-500 group-hover/share:scale-110 transition-transform" />
                                </Link>
                            </div>
                        </div>

                        <Link href="/events" className="hover:text-brand-primary transition-colors">Events</Link>
                        <Link href="/contact" className="hover:text-brand-primary transition-colors">Contact</Link>
                    </nav>

                    {/* Socials & CTA Button */}
                    <div className="hidden md:flex items-center gap-6 z-50">
                        {/* Desktop Navbar Social Icons */}
                        <div className="flex items-center gap-4 text-gray-400">
                            <a href={CHURCH_INFO.socialMedia.instagram} target="_blank" rel="noreferrer" className="hover:text-pink-600 transition-colors" aria-label="Instagram">
                                <InstagramIcon size={18} />
                            </a>
                            <a href={CHURCH_INFO.socialMedia.facebook} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors" aria-label="Facebook">
                                <FacebookIcon size={18} />
                            </a>
                            <a href={CHURCH_INFO.socialMedia.youtube} target="_blank" rel="noreferrer" className="hover:text-red-600 transition-colors" aria-label="YouTube">
                                <YouTubeIcon size={18} />
                            </a>
                            <a href={CHURCH_INFO.socialMedia.twitter} target="_blank" rel="noreferrer" className="hover:text-green-600 transition-colors" aria-label="X(Twitter)">
                                <TwitterIcon size={18} />
                            </a>
                        </div>
                        <Link href="/events" className="bg-amber-100 text-amber-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-amber-200 transition-colors">
                            Plan a Visit
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-brand-primary z-50 p-2 relative"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Navigation Dropdown */}
                {mobileMenuOpen && (
                    <div className="fixed top-20 left-0 w-full h-[calc(100vh-5rem)] bg-white border-b border-gray-100 shadow-2xl md:hidden flex flex-col p-6 font-bold text-gray-600 overflow-y-auto pb-10 animate-in slide-in-from-top-2 z-40">
                        <div className="flex flex-col gap-4 flex-grow">
                            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-gray-50">Home</Link>

                            {/* ... (Mobile Dropdown internals stay the exact same as previous code) ... */}
                            <div className="py-2 border-b border-gray-50">
                                <span className="text-gray-400 text-[10px] uppercase tracking-widest mb-2 block">About</span>
                                <div className="flex flex-col gap-3 pl-4 border-l-2 border-brand-primary/20">
                                    <Link href="/about" onClick={() => setMobileMenuOpen(false)}>Our Story</Link>
                                    <Link href="/leadership" onClick={() => setMobileMenuOpen(false)}>Leadership Registry</Link>
                                    <Link href="/parishes" onClick={() => setMobileMenuOpen(false)}>Parish Network</Link>
                                </div>
                            </div>
                            <div className="py-2 border-b border-gray-50">
                                <span className="text-gray-400 text-[10px] uppercase tracking-widest mb-2 block">Connect</span>
                                <div className="flex flex-col gap-3 pl-4 border-l-2 border-brand-primary/20">
                                    <Link href="/life-stages" onClick={() => setMobileMenuOpen(false)}>Life Stages</Link>
                                    <Link href="/departments" onClick={() => setMobileMenuOpen(false)}>Workforce Units</Link>
                                </div>
                            </div>
                            <div className="py-2 border-b border-gray-50">
                                <span className="text-gray-400 text-[10px] uppercase tracking-widest mb-2 block">Media</span>
                                <div className="flex flex-col gap-3 pl-4 border-l-2 border-brand-primary/20">
                                    <Link href="/sermons" onClick={() => setMobileMenuOpen(false)}>Watch Sermons</Link>
                                    <Link href="/gallery" onClick={() => setMobileMenuOpen(false)}>Church Gallery</Link>
                                    <Link href="/share" onClick={() => setMobileMenuOpen(false)} className="text-brand-primary flex items-center gap-2">
                                        Share Photos <Camera size={14} className="text-amber-500" />
                                    </Link>
                                </div>
                            </div>
                            <Link href="/events" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-gray-50">Events</Link>
                            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="py-2">Contact</Link>
                        </div>

                        {/* Mobile Socials & CTA */}
                        <div className="mt-8 pt-4">
                            <div className="flex items-center justify-center gap-6 text-gray-400 mb-6">
                                <a href={CHURCH_INFO.socialMedia.instagram} target="_blank" rel="noreferrer" className="hover:text-pink-600 transition-colors" aria-label="Instagram">
                                    <InstagramIcon size={24} />
                                </a>
                                <a href={CHURCH_INFO.socialMedia.facebook} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors" aria-label="Facebook">
                                    <FacebookIcon size={24} />
                                </a>
                                <a href={CHURCH_INFO.socialMedia.youtube} target="_blank" rel="noreferrer" className="hover:text-red-600 transition-colors" aria-label="YouTube">
                                    <YouTubeIcon size={24} />
                                </a>
                                <a href={CHURCH_INFO.socialMedia.twitter} target="_blank" rel="noreferrer" className="hover:text-green-600 transition-colors" aria-label="X(Twitter)">
                                    <TwitterIcon size={24} />
                                </a>
                            </div>
                            <Link href="/events" onClick={() => setMobileMenuOpen(false)} className="block w-full bg-brand-primary text-white text-center py-4 rounded-xl font-bold active:scale-95 transition-transform">
                                Plan a Visit
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* 3. PAGE CONTENT */}
            <main className="flex-grow">
                {children}
            </main>

            {/* 4. THE INTERACTIVE FLOATING DOVE */}
            <FloatingDove />

            {/* 5. NEW PUBLIC FOOTER (Expanded Links) */}
            <footer className="w-full bg-brand-primary border-t border-gray-100 pt-16 pb-8 font-sans mt-auto">
                {/* Top Section: Directory & Expanded Links */}
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="font-serif text-2xl font-black text-white tracking-tight mb-4 block">
                            Milk<span className="text-amber-600">&</span>Honey
                        </Link>
                        <p className="text-sm text-white leading-relaxed max-w-sm mb-6">
                            A parish of the Redeemed Christian Church of God. Raising a generation of leaders, walking in dominion, and spreading love across Lagos Province 56.
                        </p>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4 text-brand-primary">
                                <a href={CHURCH_INFO.socialMedia.instagram} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 rounded-lg hover:bg-pink-50 hover:text-pink-600 transition-colors border border-gray-100 hover:border-pink-200" aria-label="Instagram">
                                    <InstagramIcon size={20} />
                                </a>
                                <a href={CHURCH_INFO.socialMedia.facebook} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-100 hover:border-blue-200" aria-label="Facebook">
                                    <FacebookIcon size={20} />
                                </a>
                                <a href={CHURCH_INFO.socialMedia.youtube} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-100 hover:border-red-200" aria-label="YouTube">
                                    <YouTubeIcon size={20} />
                                </a>
                                <a href={CHURCH_INFO.socialMedia.twitter} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors border border-gray-100 hover:border-green-200" aria-label="X(Twitter)">
                                    <TwitterIcon size={20} />
                                </a>
                            </div>
                            <Link href="/socials" className="text-amber-400 text-sm font-bold hover:underline flex items-center gap-1 mt-2">
                                View All Platforms <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links Column 1: About & Connect */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">About & Connect</h4>
                        <ul className="space-y-3 text-sm text-gray-500 font-medium">
                            <li><Link href="/about" className="hover:text-amber-600 transition-colors">Our Story</Link></li>
                            <li><Link href="/leadership" className="hover:text-amber-600 transition-colors">Leadership Registry</Link></li>
                            <li><Link href="/parishes" className="hover:text-amber-600 transition-colors">Parish Network</Link></li>
                            <li><Link href="/life-stages" className="hover:text-amber-600 transition-colors">Life Stages</Link></li>
                            <li><Link href="/departments" className="hover:text-amber-600 transition-colors">Workforce Units</Link></li>
                        </ul>
                    </div>

                    {/* Quick Links Column 2: Media & Info */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Media & Info</h4>
                        <ul className="space-y-3 text-sm text-gray-500 font-medium">
                            <li><Link href="/sermons" className="hover:text-amber-600 transition-colors">Watch Sermons</Link></li>
                            <li><Link href="/gallery" className="hover:text-amber-600 transition-colors">Church Gallery</Link></li>
                            <li><Link href="/share" className="hover:text-amber-600 transition-colors text-white flex items-center gap-1">Share Photos</Link></li>
                            <li><Link href="/events" className="hover:text-amber-600 transition-colors">Upcoming Events</Link></li>
                            <li><Link href="/contact" className="hover:text-amber-600 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact Detail Column (UPGRADED WITH ICONS & SMART LINKS) */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Contact</h4>
                        <ul className="space-y-4 text-sm text-gray-500 font-medium">
                            <li>
                                {/* SMART MAP LINK */}
                                <a
                                    href={CHURCH_INFO.address.googleMapsLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-2 hover:text-amber-600 transition-colors group"
                                >
                                    <svg className="w-4 h-4 mt-0.5 text-white group-hover:text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="leading-tight">
                                        <p className="text-sm text-gray-500 group-hover:text-amber-600 leading-relaxed">
                                            {CHURCH_INFO.address.street}, <br/>
                                            {CHURCH_INFO.parish}, <br/>
                                            {CHURCH_INFO.address.city}, {CHURCH_INFO.address.country}.
                                        </p>
                                    </span>
                                </a>
                            </li>
                            <li>
                                <a href={`mailto:${CHURCH_INFO.contact.email}`} className="flex items-center gap-2 hover:text-amber-600 transition-colors group">
                                    <svg className="w-4 h-4 text-white group-hover:text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {CHURCH_INFO.contact.email}
                                </a>
                            </li>
                            <li>
                                <a href={`tel:${CHURCH_INFO.contact.phoneLink}`} className="flex items-center gap-2 hover:text-amber-600 transition-colors group">
                                    <svg className="w-4 h-4 text-white group-hover:text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {CHURCH_INFO.contact.phone}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section: Legal, Support, and Official Affiliation */}
                <div className="max-w-7xl mx-auto px-6 border-t border-gray-100 pt-8 flex flex-col items-center text-center">

                    {/* Secondary Navigation */}
                    <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-6 text-[10px] font-bold uppercase tracking-widest text-white ">
                        <a
                            href="https://wa.me/2340000000000?text=Hi, I am reaching out from the Milk & Honey website."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 hover:text-green-600 transition-colors"
                        >
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                            </svg>
                            WhatsApp Support
                        </a>
                        <a href={CHURCH_INFO.contact.emailTech} className="hover:text-orange-600 transition-colors">
                            Technical Support
                        </a>
                        <a href="/privacy" className="hover:text-red-600 transition-colors">
                            Privacy Policy
                        </a>
                        <a href="https://rccg.org" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors flex items-center gap-1">
                            RCCG Global
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        </a>
                    </div>

                    {/* Official Badges & CREATOR SIGNATURE */}
                    <div className="space-y-1.5 mb-4">
                        <p className="text-[9px] md:text-[10px] text-white uppercase tracking-[0.2em] font-black">
                            The Redeemed Christian Church of God (RCCG)
                        </p>
                        <p className="text-[10px] text-white font-medium">
                            © 2026 <span className="font-bold text-gray-950">Milk and Honey Center</span> • Lagos Province 56
                        </p>

                        {/* SUBTLE CREATOR LOGO/TEXT */}
                        <p className="text-[9px] text-gray-400 mt-2">
                            Designed & Built by <a href="#" target="_blank" className="font-bold hover:text-amber-600 transition-colors">Byte&Security</a>
                        </p>
                    </div>

                    {/* Secure Session / Verified */}
                    <div className="flex items-center gap-1.5 text-[8px] text-brand-primary bg-slate-50 px-3 py-1 rounded-full font-bold border border-gray-100 mt-2 uppercase tracking-wider">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                        Verified Public Domain
                    </div>

                </div>

            </footer>
        </div>
    );
}