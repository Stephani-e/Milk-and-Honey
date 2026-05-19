import React from "react";
import Link from "next/link";
import {ArrowRight} from "lucide-react";

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

export default function PublicFooter({settings}: { settings: any }) {
    return (
        <footer className="w-full bg-brand-primary border-t border-gray-100 pt-16 pb-8 font-sans mt-auto">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

                {/* Brand Column */}
                <div className="lg:col-span-2">
                    <Link href="/" className="font-serif text-2xl font-black text-white tracking-tight mb-4 block">
                        Milk<span className="text-amber-600">&</span>Honey
                    </Link>
                    <p className="text-sm text-white leading-relaxed max-w-sm mb-6">
                        A parish of the Redeemed Christian Church of God. Raising a generation of leaders, walking
                        in dominion, and spreading love across Lagos Province 56.
                    </p>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 text-brand-primary">
                            <a href={settings?.instagram_url} target="_blank" rel="noreferrer"
                               className="p-2 bg-slate-50 rounded-lg hover:bg-pink-50 hover:text-pink-600 transition-colors border border-gray-100 hover:border-pink-200"
                               aria-label="Instagram">
                                <InstagramIcon size={20}/>
                            </a>
                            <a href={settings?.facebook_url} target="_blank" rel="noreferrer"
                               className="p-2 bg-slate-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-100 hover:border-blue-200"
                               aria-label="Facebook">
                                <FacebookIcon size={20}/>
                            </a>
                            <a href={settings?.youtube_url} target="_blank" rel="noreferrer"
                               className="p-2 bg-slate-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-100 hover:border-red-200"
                               aria-label="YouTube">
                                <YouTubeIcon size={20}/>
                            </a>
                            <a href={settings?.twitter_url} target="_blank" rel="noreferrer"
                               className="p-2 bg-slate-50 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors border border-gray-100 hover:border-green-200"
                               aria-label="X(Twitter)">
                                <TwitterIcon size={20}/>
                            </a>
                        </div>
                        <Link href="/socials"
                              className="text-amber-400 text-sm font-bold hover:underline flex items-center gap-1 mt-2">
                            View All Platforms <ArrowRight size={14}/>
                        </Link>
                    </div>
                </div>

                {/* Quick Links Column 1: About & Connect */}
                <div>
                    <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">About & Connect</h4>
                    <ul className="space-y-3 text-sm text-gray-500 font-medium">
                        <li><Link href="/about" className="hover:text-amber-600 transition-colors">Our Story</Link>
                        </li>
                        <li><Link href="/leadership" className="hover:text-amber-600 transition-colors">Leadership
                            Registry</Link></li>
                        <li><Link href="/parishes" className="hover:text-amber-600 transition-colors">Parish
                            Network</Link></li>
                        <li><Link href="/life-stages" className="hover:text-amber-600 transition-colors">Life
                            Stages</Link></li>
                        <li><Link href="/departments" className="hover:text-amber-600 transition-colors">Workforce
                            Units</Link></li>
                    </ul>
                </div>

                {/* Quick Links Column 2: Media & Info */}
                <div>
                    <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Media & Info</h4>
                    <ul className="space-y-3 text-sm text-gray-500 font-medium">
                        <li><Link href="/newsletters"
                                  className="hover:text-amber-600 transition-colors font-bold text-white">Church
                            Updates</Link></li>
                        <li><Link href="/sermons" className="hover:text-amber-600 transition-colors">Watch
                            Sermons</Link></li>
                        <li><Link href="/gallery" className="hover:text-amber-600 transition-colors">Church
                            Gallery</Link></li>
                        <li><Link href="/share"
                                  className="hover:text-amber-600 transition-colors text-white flex items-center gap-1">Share
                            Photos</Link></li>
                        <li><Link href="/events" className="hover:text-amber-600 transition-colors">Upcoming
                            Events</Link></li>
                        <li><Link href="/contact" className="hover:text-amber-600 transition-colors">Contact
                            Us</Link></li>
                    </ul>
                </div>

                {/* Contact Detail Column */}
                <div>
                    <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Contact</h4>
                    <ul className="space-y-4 text-sm text-gray-500 font-medium">
                        <li>
                            <a href={settings?.google_maps_link || "#"} target="_blank" rel="noopener noreferrer"
                               className="flex items-start gap-2 hover:text-amber-600 transition-colors group">
                                {/* SVG Map Icon */}
                                <span className="leading-tight">
                                    <p className="text-sm text-gray-500 group-hover:text-amber-600 leading-relaxed">
                                        {settings?.address_street || "Address Not Set"}, <br/>
                                        {settings?.parish_name || "Parish"}, <br/>
                                        {settings?.address_city}, {settings?.address_country}.
                                    </p>
                                </span>
                            </a>
                        </li>
                        <li>
                            <a href={`mailto:${settings?.email_public}`}
                               className="flex items-center gap-2 hover:text-amber-600 transition-colors group">
                                {/* SVG Mail Icon */}
                                {settings?.email_public || "Email Not Set"}
                            </a>
                        </li>
                        <li>
                            <a href={`tel:${settings?.phone_link}`}
                               className="flex items-center gap-2 hover:text-amber-600 transition-colors group">
                                {/* SVG Phone Icon */}
                                {settings?.phone_primary || "Phone Not Set"}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div
                className="max-w-7xl mx-auto px-6 border-t border-gray-100 pt-8 flex flex-col items-center text-center">
                <div
                    className="flex flex-wrap justify-center gap-4 md:gap-6 mb-6 text-[10px] font-bold uppercase tracking-widest text-white ">
                    <a href={`https://wa.me/${settings?.whatsapp_number}?text=Hi, I am reaching out from the Milk & Honey website.`}
                       target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-1.5 hover:text-green-600 transition-colors">
                        WhatsApp Support
                    </a>
                    <a href={`mailto:${settings?.email_tech_support}`}
                       className="hover:text-orange-600 transition-colors">
                        Technical Support
                    </a>
                    <a href="/privacy" className="hover:text-red-600 transition-colors">
                        Privacy Policy
                    </a>
                    <a href="https://rccg.org" target="_blank" rel="noopener noreferrer"
                       className="hover:text-green-600 transition-colors flex items-center gap-1">
                        RCCG Global
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </a>
                </div>

                {/* Official Badges & CREATOR SIGNATURE */}
                <div className="space-y-1.5 mb-4">
                    <p className="text-[9px] md:text-[10px] text-white uppercase tracking-[0.2em] font-black">
                        The Redeemed Christian Church of God (RCCG)
                    </p>
                    <p className="text-[10px] text-white font-medium">
                        © 2026 <span className="font-bold text-gray-950">Milk and Honey Center</span> • Lagos
                        Province 56
                    </p>

                    {/* SUBTLE CREATOR LOGO/TEXT */}
                    <p className="text-[9px] text-gray-400 mt-2">
                        Designed & Built by <a href="#" target="_blank"
                                               className="font-bold hover:text-amber-600 transition-colors">Byte&Security</a>
                    </p>
                </div>

                {/* Secure Session / Verified */}
                <div
                    className="flex items-center gap-1.5 text-[8px] text-brand-primary bg-slate-50 px-3 py-1 rounded-full font-bold border border-gray-100 mt-2 uppercase tracking-wider">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                         strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    Verified Public Domain
                </div>

            </div>
        </footer>
    );
}