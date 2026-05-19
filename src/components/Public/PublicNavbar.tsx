"use client";
import React, {useEffect, useState} from "react";
import Link from "next/link";
import {Camera, ChevronDown, Menu, X} from "lucide-react";

const FacebookIcon = ({size = 20, className = ""}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>);

const InstagramIcon = ({size = 20, className = ""}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>);

const YouTubeIcon = ({size = 20, className = ""}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path
            d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
    </svg>);

const TwitterIcon = ({size = 20, className = ""}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path
            d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
    </svg>);

export default function PublicNavbar({settings}: { settings: any }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (mobileMenuOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/"
                      className="font-serif text-2xl font-black text-brand-primary tracking-tight z-50 relative">
                    Milk<span className="text-amber-600">&</span>Honey
                </Link>

                <nav className="hidden md:flex items-center gap-8 font-bold text-sm text-gray-600">
                    <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link>

                    {/* ABOUT DROPDOWN */}
                    <div className="relative group py-6">
                        <button className="flex items-center gap-1 hover:text-brand-primary transition-colors">
                            About <ChevronDown size={14}
                                               className="group-hover:rotate-180 transition-transform duration-300"/>
                        </button>
                        <div
                            className="absolute top-full left-1/2 -translate-x-1/2 w-48 bg-white border border-gray-100 shadow-xl rounded-2xl py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <Link href="/about"
                                  className="block px-5 py-2 text-sm text-gray-600 hover:text-brand-primary hover:bg-slate-50 transition-colors">Our
                                Story</Link>
                            <Link href="/leadership"
                                  className="block px-5 py-2 text-sm text-gray-600 hover:text-brand-primary hover:bg-slate-50 transition-colors">Leadership
                                Registry</Link>
                            <Link href="/parishes"
                                  className="block px-5 py-2 text-sm text-gray-600 hover:text-brand-primary hover:bg-slate-50 transition-colors">Parish
                                Network</Link>
                        </div>
                    </div>

                    {/* CONNECT DROPDOWN */}
                    <div className="relative group py-6">
                        <button className="flex items-center gap-1 hover:text-brand-primary transition-colors">
                            Connect <ChevronDown size={14}
                                                 className="group-hover:rotate-180 transition-transform duration-300"/>
                        </button>
                        <div
                            className="absolute top-full left-1/2 -translate-x-1/2 w-56 bg-white border border-gray-100 shadow-xl rounded-2xl py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <Link href="/life-stages"
                                  className="block px-5 py-2 text-sm text-gray-600 hover:text-brand-primary hover:bg-slate-50 transition-colors">Life
                                Stages (Fellowships)</Link>
                            <Link href="/departments"
                                  className="block px-5 py-2 text-sm text-gray-600 hover:text-brand-primary hover:bg-slate-50 transition-colors">Join
                                the Workforce</Link>
                        </div>
                    </div>

                    {/* MEDIA DROPDOWN */}
                    <div className="relative group py-6">
                        <button className="flex items-center gap-1 hover:text-brand-primary transition-colors">
                            Media <ChevronDown size={14}
                                               className="group-hover:rotate-180 transition-transform duration-300"/>
                        </button>
                        <div
                            className="absolute top-full left-1/2 -translate-x-1/2 w-56 bg-white border border-gray-100 shadow-xl rounded-2xl py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <Link href="/sermons"
                                  className="block px-5 py-2 text-sm text-gray-600 hover:text-brand-primary hover:bg-slate-50 transition-colors">Watch
                                Sermons</Link>
                            <Link href="/gallery"
                                  className="block px-5 py-2 text-sm text-gray-600 hover:text-brand-primary hover:bg-slate-50 transition-colors">Church
                                Gallery</Link>
                            <div className="mx-4 my-1 border-t border-gray-100"></div>
                            <Link href="/socials"
                                  className="block px-5 py-2 text-sm text-gray-600 hover:text-brand-primary hover:bg-slate-50 transition-colors">
                                Socials
                            </Link>
                            <Link href="/share"
                                  className="px-5 py-2 text-sm text-brand-primary font-bold hover:bg-slate-50 transition-colors flex items-center justify-between group/share">
                                Share Photos <Camera size={14}
                                                     className="text-amber-500 group-hover/share:scale-110 transition-transform"/>
                            </Link>
                        </div>
                    </div>

                    <Link href="/events" className="hover:text-brand-primary transition-colors">Events</Link>
                    <Link href="/contact" className="hover:text-brand-primary transition-colors">Contact</Link>
                </nav>

                {/* Socials & CTA Button */}
                <div className="hidden md:flex items-center gap-6 z-50">
                    {/* Updates Link with Shaking Icon */}
                    <Link
                        href="/newsletters"
                        className="flex items-center gap-1.5 font-bold text-sm text-brand-primary group hover:text-amber-600 transition-colors"
                    >
                        <span className="relative flex items-center justify-center">
                            {/* The Bell Icon with Animation */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18" height="18"
                                viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.5"
                                strokeLinecap="round" strokeLinejoin="round"
                                className="animate-bell-shake group-hover:animate-none"
                            >
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                            {/* Small Notification Dot */}
                            <span
                                className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </span>
                        Church Updates
                    </Link>

                    <div className="h-6 w-[1px] bg-gray-200"></div>
                    <div className="flex items-center gap-4 text-gray-400">
                        {/* Desktop Navbar Social Icons */}
                        {settings?.instagram_url && (
                            <a href={settings.instagram_url} target="_blank" rel="noreferrer"
                               className="hover:text-pink-600 transition-colors"><InstagramIcon size={18}/></a>
                        )}
                        {settings?.facebook_url && (
                            <a href={settings.facebook_url} target="_blank" rel="noreferrer"
                               className="hover:text-blue-600 transition-colors"><FacebookIcon size={18}/></a>
                        )}
                        {settings?.youtube_url && (
                            <a href={settings.youtube_url} target="_blank" rel="noreferrer"
                               className="hover:text-red-600 transition-colors"><YouTubeIcon size={18}/></a>
                        )}
                        {settings?.twitter_url && (
                            <a href={settings.twitter_url} target="_blank" rel="noreferrer"
                               className="hover:text-green-600 transition-colors"><TwitterIcon size={18}/></a>
                        )}
                    </div>
                    <Link href="/events"
                          className="bg-amber-100 text-amber-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-amber-200 transition-colors">
                        Plan a Visit
                    </Link>
                </div>

                <button className="md:hidden text-brand-primary z-50 p-2 relative"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X size={28}/> : <Menu size={28}/>}
                </button>
            </div>

            {/* Mobile Navigation Dropdown */}
            {mobileMenuOpen && (
                <div
                    className="fixed top-20 left-0 w-full h-[calc(100vh-5rem)] bg-white border-b border-gray-100 shadow-2xl md:hidden flex flex-col p-6 font-bold text-gray-600 overflow-y-auto pb-10 animate-in slide-in-from-top-2 z-40">
                    <div className="flex flex-col gap-4 flex-grow">
                        <Link href="/" onClick={() => setMobileMenuOpen(false)}
                              className="py-2 border-b border-gray-50">Home</Link>

                        {/* ... (Mobile Dropdown internals ... */}
                        <div className="py-2 border-b border-gray-50">
                                <span
                                    className="text-gray-400 text-[10px] uppercase tracking-widest mb-2 block">About</span>
                            <div className="flex flex-col gap-3 pl-4 border-l-2 border-brand-primary/20">
                                <Link href="/about" onClick={() => setMobileMenuOpen(false)}>Our Story</Link>
                                <Link href="/leadership" onClick={() => setMobileMenuOpen(false)}>Leadership
                                    Registry</Link>
                                <Link href="/parishes" onClick={() => setMobileMenuOpen(false)}>Parish
                                    Network</Link>
                            </div>
                        </div>
                        <div className="py-2 border-b border-gray-50">
                                <span
                                    className="text-gray-400 text-[10px] uppercase tracking-widest mb-2 block">Connect</span>
                            <div className="flex flex-col gap-3 pl-4 border-l-2 border-brand-primary/20">
                                <Link href="/life-stages" onClick={() => setMobileMenuOpen(false)}>Life
                                    Stages</Link>
                                <Link href="/departments" onClick={() => setMobileMenuOpen(false)}>Workforce
                                    Units</Link>
                            </div>
                        </div>
                        <div className="py-2 border-b border-gray-50">
                                <span
                                    className="text-gray-400 text-[10px] uppercase tracking-widest mb-2 block">Media</span>
                            <div className="flex flex-col gap-3 pl-4 border-l-2 border-brand-primary/20">
                                <Link href="/sermons" onClick={() => setMobileMenuOpen(false)}>Watch Sermons</Link>
                                <Link href="/gallery" onClick={() => setMobileMenuOpen(false)}>Church Gallery</Link>
                                <Link href="/share" onClick={() => setMobileMenuOpen(false)}
                                      className="text-brand-primary flex items-center gap-2">
                                    Share Photos <Camera size={14} className="text-amber-500"/>
                                </Link>
                            </div>
                        </div>
                        <Link href="/events" onClick={() => setMobileMenuOpen(false)}
                              className="py-2 border-b border-gray-50">Events</Link>
                        <Link href="/contact" onClick={() => setMobileMenuOpen(false)}
                              className="py-2">Contact</Link>
                    </div>

                    {/* Mobile Socials & CTA */}
                    <div className="mt-8 pt-4">
                        <div className="flex items-center justify-center gap-6 text-gray-400 mb-6">
                            {settings?.instagram_url && (
                                <a href={settings.instagram_url} target="_blank" rel="noreferrer"
                                   className="hover:text-pink-600 transition-colors"><InstagramIcon size={15}/></a>
                            )}

                            {settings?.facebook_url && (
                                <a href={settings.facebook_url} target="_blank" rel="noreferrer"
                                   className="hover:text-blue-600 transition-colors" aria-label="Facebook">
                                    <FacebookIcon size={15}/>
                                </a>
                            )}

                            {settings?.youtube_url && (
                                <a href={settings.youtube_url} target="_blank" rel="noreferrer"
                                   className="hover:text-red-600 transition-colors" aria-label="YouTube">
                                    <YouTubeIcon size={15}/>
                                </a>
                            )}

                            {settings?.twitter_url && (
                                <a href={settings.twitter_url} target="_blank" rel="noreferrer"
                                   className="hover:text-green-600 transition-colors"><TwitterIcon size={15}/></a>
                            )}

                        </div>
                        <Link href="/events" onClick={() => setMobileMenuOpen(false)}
                              className="block w-full bg-brand-primary text-white text-center py-4 rounded-xl font-bold active:scale-95 transition-transform">
                            Plan a Visit
                        </Link>
                    </div>
                </div>
            )}


        </header>
    );
}