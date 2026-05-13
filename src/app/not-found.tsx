import React from "react";
import Link from "next/link";
import {BookOpen, Home} from "lucide-react";

export default function NotFound() {
    return (
        <div
            className="min-h-[80vh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">

            {/* Background Decorative Elements */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-100/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="flex-grow flex flex-col items-center justify-center p-6 text-center relative z-10">
                <div className=" relative max-w-2xl mx-auto flex flex-col items-center">
                    {/* Graphic 404 */}
                    <h1 className="text-8xl md:text-[150px] font-black text-brand-primary leading-none tracking-tighter drop-shadow-sm mb-4">
                        404
                    </h1>

                    <div
                        className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-amber-200 shadow-sm">
                        Page Not Found
                    </div>

                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">
                        Looks like you've wandered off the path.
                    </h2>

                    <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-10 max-w-lg">
                        The page you are looking for might have been removed, had its name changed, or is temporarily
                        unavailable. Let's get you back home!
                    </p>

                    {/* Call-to-Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <Link
                            href="/"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-primary text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all hover:-translate-y-1"
                        >
                            <Home size={18}/> Back to Homepage
                        </Link>

                        <Link
                            href="/sermons"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-brand-primary border border-gray-200 px-8 py-4 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all hover:-translate-y-1"
                        >
                            <BookOpen size={18} className="text-amber-500"/> Watch a Sermon
                        </Link>
                    </div>
                </div>

                <footer className="w-full border-t border-gray-200 bg-white mt-6 py-6 md:py-8 z-10 relative">
                    <div
                        className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-gray-400">
                        <p>© {new Date().getFullYear()} RCCG Milk & Honey Parish. All rights reserved.</p>

                        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
                            <Link href="/about"
                                  className="hover:text-amber-600 transition-colors uppercase tracking-wider">About
                                Us</Link>
                            <Link href="/contact"
                                  className="hover:text-amber-600 transition-colors uppercase tracking-wider">Contact</Link>
                            <Link href="/events"
                                  className="hover:text-amber-600 transition-colors uppercase tracking-wider">Events</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}