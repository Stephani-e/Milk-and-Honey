"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col font-sans bg-amber-50/30">

            {/* 1. GLOBAL AD PLACEMENT */}
            <div className="w-full bg-brand-primary text-white text-center py-2 px-4 text-[10px] md:text-xs font-bold tracking-widest uppercase flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 z-50 relative">
                <span>[Global Ad Slot] Join us for the Provincial Convention 2026!</span>
                <Link href="#" className="underline decoration-white/50 hover:text-amber-200 transition-colors">Register Now</Link>
            </div>

            {/* 2. PUBLIC NAVBAR */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                    {/* Logo Area */}
                    <Link href="/" className="font-serif text-2xl font-black text-brand-primary tracking-tight z-50">
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

                        <Link href="/sermons" className="hover:text-brand-primary transition-colors">Sermons</Link>
                        <Link href="/events" className="hover:text-brand-primary transition-colors">Events</Link>
                        <Link href="/contact" className="hover:text-brand-primary transition-colors">Contact</Link>
                    </nav>

                    {/* CTA Button */}
                    <div className="hidden md:block z-50">
                        <Link href="/events" className="bg-amber-100 text-amber-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-amber-200 transition-colors">
                            Plan a Visit
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle Button */}
                    <button
                        className="md:hidden text-brand-primary z-50 p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Navigation Dropdown */}
                {mobileMenuOpen && (
                    <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg md:hidden flex flex-col p-6 gap-4 font-bold text-gray-600 animate-in slide-in-from-top-2">
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-gray-50">Home</Link>

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

                        <Link href="/sermons" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-gray-50">Sermons</Link>
                        <Link href="/events" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-gray-50">Events</Link>
                        <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="py-2">Contact</Link>

                        <Link href="/events" className="mt-4 bg-brand-primary text-white text-center py-4 rounded-xl font-bold">
                            Plan a Visit
                        </Link>
                    </div>
                )}
            </header>

            {/* 3. PAGE CONTENT */}
            <main className="flex-grow">
                {children}
            </main>

            {/* 4. PUBLIC FOOTER */}
            <footer className="bg-slate-900 text-slate-400 py-16">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="md:col-span-2">
                        <h3 className="font-serif text-2xl font-black text-white mb-4">Milk & Honey</h3>
                        <p className="text-sm leading-relaxed max-w-sm mb-6">
                            A parish of the Redeemed Christian Church of God. Raising a generation of leaders, walking in dominion, and spreading love.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Quick Links</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/about" className="hover:text-amber-400 transition-colors">Our Story</Link></li>
                            <li><Link href="/leadership" className="hover:text-amber-400 transition-colors">Leadership</Link></li>
                            <li><Link href="/gallery" className="hover:text-amber-400 transition-colors">Media Gallery</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Connect</h4>
                        <ul className="space-y-3 text-sm">
                            <li>Lagos Province 56</li>
                            <li>contact@milkandhoney.org</li>
                            <li>+234 (0) 123 456 7890</li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
}