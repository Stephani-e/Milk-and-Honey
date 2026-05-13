"use client";
import React, {useEffect, useState} from "react";
import {ChevronUp} from "lucide-react";

export default function BackToTop() {
    const [showBackToTop, setShowBackToTop] = useState(false);

    // Listen for scroll events to show/hide the button
    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 1000);
        };

        window.addEventListener("scroll", handleScroll);

        // Cleanup listener on unmounting
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Smooth scroll to the top function
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <div
            className={`fixed bottom-6 right-4 md:bottom-8 md:right-8 flex flex-col items-center gap-2 z-50 transition-all duration-300 ${
                showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
            }`}
        >
            <button
                onClick={scrollToTop}
                className="p-2 md:p-2 bg-brand-primary text-white rounded-full shadow-xl shadow-brand-primary/30 hover:scale-110 active:scale-95 transition-all"
                aria-label="Back to top"
            >
                <ChevronUp size={20}/>
            </button>

            {/* Hidden on mobile to save space, visible on desktop */}
            <span
                className="hidden md:block text-[9px] font-black uppercase tracking-widest text-brand-primary bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm border border-brand-accent">
                Back to Top
            </span>
        </div>
    );
}