"use client";
import React, { useState, useEffect } from "react";
import { MessageCircleHeart } from "lucide-react";

const phrases = [
    "Praise the Lord! 🙏",
    "Welcome to Milk & Honey!",
    "Hallelujah!",
    "Jesus is Lord.",
    "Have a blessed day!",
    "God loves you ❤️",
    "Walking in Dominion!",
];

export default function FloatingDove() {
    const [currentPhrase, setCurrentPhrase] = useState(phrases[0]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Change the phrase and pop the bubble every 15 seconds
        const interval = setInterval(() => {
            setIsVisible(false); // Hide the current one

            setTimeout(() => {
                const random = Math.floor(Math.random() * phrases.length);
                setCurrentPhrase(phrases[random]);
                setIsVisible(true); // Show the new one
            }, 500); // Wait half a second before showing the new text

        }, 15000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 flex flex-col items-end gap-3 pointer-events-none">

            {/* The Speech Bubble */}
            <div
                className={`bg-white text-brand-primary font-bold text-xs px-5 py-3 rounded-2xl rounded-br-none shadow-xl border border-amber-100 transition-all duration-500 transform pointer-events-auto cursor-default ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
            >
                {currentPhrase}
            </div>

            {/* The Dove Button (Placeholder RCCG Logo) */}
            <button
                className="w-14 h-14 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border-2 border-white/20 group pointer-events-auto relative"
                onClick={() => setIsVisible(!isVisible)} // Allow them to manually toggle the message
            >
                {/* Custom Dove SVG (You can replace this with the official RCCG logo later) */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="group-hover:animate-pulse">
                    <path d="M21.928 11.607c-.202-.488-.535-1.091-1.023-1.638-.973-1.088-2.261-1.554-3.619-1.296-1.077.206-2.112.836-3.045 1.517-1.196.873-2.31 1.942-3.238 2.973-.859.954-1.652 1.838-2.181 2.379-1.503 1.541-3.136 2.062-4.57 1.488-.958-.383-1.724-1.173-2.16-2.224C1.517 13.433 2 11.332 2 11.332s.642-1.745 2.122-2.923c.961-.763 2.15-1.144 3.407-1.059 1.15.077 2.227.533 3.12 1.258.914.743 1.584 1.761 2.025 2.802.164.388.587.618 1.01.554.423-.064.717-.468.666-.893-.162-1.353-.699-2.616-1.523-3.666C11.666 5.922 9.771 4.966 7.6 4.966c-.452 0-.909.043-1.365.132-2.637.51-4.996 2.176-6.31 4.502C-.695 10.697.098 13.916.143 14.102c.626 2.585 2.226 4.544 4.504 5.517 2.091.895 4.596.505 6.741-1.037.754-.543 1.758-1.588 2.822-2.695.961-.998 2.083-2.148 3.161-2.936 1.055-.77 2.298-1.42 3.491-1.648.742-.142 1.42-.039 1.996.262.776.406 1.157 1.135 1.168 1.158.21.431.731.624 1.182.438.452-.186.68-.707.512-1.196z"/>
                </svg>
                {/* Red notification dot to draw attention */}
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-ping"></span>
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-brand-primary rounded-full"></span>
            </button>
        </div>
    );
}