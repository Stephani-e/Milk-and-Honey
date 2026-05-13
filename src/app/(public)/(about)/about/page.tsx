"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    Heart, Users,
    ArrowRight, MapPin, Phone,
    Mail, PlayCircle, Camera, Globe
} from "lucide-react";
import {CHURCH_INFO} from "@/lib/constants";

const storyImages = [
    "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1200", // Photo 1
    "https://images.unsplash.com/photo-1548625361-ec853714b434?q=80&w=1200", // Photo 2
    "https://images.unsplash.com/photo-1445112098124-3e76dd67983c?q=80&w=1200", // Photo 3
    "https://images.unsplash.com/photo-1510563800743-aed236490d08?q=80&w=1200", // Photo 4
    "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?q=80&w=1200"  // Photo 5
];

export default function AboutPage() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % storyImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col bg-white">

            {/* 1. HERO SECTION */}
            <section className="relative py-20 md:py-32 bg-brand-primary overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/90 via-brand-primary/80 to-slate-900/90"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-serif font-black text-white mb-6">
                        Our Story & Vision
                    </h1>
                    <p className="text-amber-200 text-lg md:text-xl font-bold uppercase tracking-[0.3em]">
                        Milk & Honey Center
                    </p>
                </div>
            </section>

            {/* 2. THE JOURNEY (History) */}
            <section className="py-20 md:py-32">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    <div className="relative group">
                        <div className="aspect-[4/5] bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl relative">
                            {storyImages.map((img, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                                        index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                                    }`}
                                >
                                    <img src={img} alt="Church History" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                </div>
                            ))}

                            {/* Navigation Dots */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                                {storyImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`h-2 rounded-full transition-all ${
                                            index === currentSlide ? 'bg-amber-400 w-8' : 'bg-white/40 w-2 hover:bg-white'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                        {/* Decorative Background Frame */}
                        <div className="absolute -bottom-6 -right-6 hidden md:block w-full h-full border-4 border-amber-100 rounded-[3.5rem] -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform"></div>
                    </div>

                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full text-amber-700 text-xs font-bold uppercase tracking-widest">
                            <Heart size={14} /> Established in Grace
                        </div>
                        <h2 className="text-3xl md:text-5xl font-serif font-black text-brand-primary leading-tight">
                            From a Humble Beginning to a Global Mission.
                        </h2>
                        <div className="space-y-6 text-gray-500 leading-relaxed text-lg">
                            <p>
                                Milk & Honey Center began with a simple but powerful mandate: to create a dwelling place for God's presence where lives are transformed and leaders are birthed.
                            </p>
                            <p>
                                As a vibrant parish under the <strong>Redeemed Christian Church of God (RCCG) Lagos Province 56</strong>, we have grown into a family of believers dedicated to the word of God, fervent prayer, and genuine communal love.
                            </p>
                        </div>

                        <Link href='/history' className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-full hover:bg-amber-600 transition-colors"
                        >
                            <button>
                                Our History
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 3. OFFICIAL RCCG VISION & MISSION (The 5 Pillars) */}
            <section className="py-20 md:py-24 bg-brand-primary text-white relative overflow-hidden rounded-[3rem] md:rounded-[4rem] mx-2 md:mx-6 shadow-2xl">
                <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
                    <Globe size={600} className="translate-x-1/4 -translate-y-1/4" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-amber-400 font-bold tracking-widest uppercase text-[10px] mb-2 block font-sans">The Mandate</span>
                        <h2 className="text-3xl md:text-5xl font-serif font-black mb-6">Our Global Vision</h2>
                        <p className="text-slate-300 max-w-2xl mx-auto text-base md:text-lg">As a parish of The Redeemed Christian Church of God, we are wholly committed to this global, God-given mandate.</p>
                    </div>

                    {/* SLEEKER HORIZONTAL CARD GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { id: "1", title: "To Make Heaven", text: "Our primary goal is to make heaven. We believe holiness is the non-negotiable lifestyle for every believer." },
                            { id: "2", title: "To Take As Many People With Us", text: "We are not going alone. Our mission is to win souls and lead a massive generation to the kingdom." },
                            { id: "3", title: "To have Member of RCCG in Every Family of All Nations", text: "We are an international family of God." },
                            { id: "4", title: "To Accomplish No. 1 above, Holiness Will Be Our Lifestyle", text: "Holiness will be our daily walk. We serve a holy God, and we reflect His nature in our character." },
                            { id: "5", title: "Church Planting", text: " To accomplish No. 2 and 3 above, we will plant churches within five minutes walking distance in every city and town of developing countries and within five minutes driving distance in every city and town of developed countries." },
                            {id: "6", title: "We will pursue these objectives until every Nation in the world is reached for the Lord Jesus Christ", text: ""}
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl hover:bg-white/10 transition-colors flex gap-5 items-start">
                                {/* The Number Badge (Now on the left side) */}
                                <div className="w-12 h-12 bg-amber-400 text-amber-950 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-inner">
                                    {item.id}
                                </div>
                                {/* The Text Content */}
                                <div>
                                    <h3 className="text-lg font-bold mb-2 tracking-wide">{item.title}</h3>
                                    <p className="text-slate-400 leading-relaxed text-sm">{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. INTERNAL FUNNELS (Linking to other pages) */}
            <section className="py-20 md:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl font-serif font-black text-brand-primary text-center mb-16">Explore Life at Milk & Honey</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* 1. Link to Life Stages (Youth focus) */}
                        <Link href="/life-stages" className="group relative p-8 rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500 min-h-[400px] flex flex-col justify-between">
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523580494112-071d16940a1e?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700 z-0"
                            />
                            {/* Dark Gradient Overlay for text readability */}
                            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/90 z-0" />

                            {/* Content (z-10 keeps it above the image and gradient) */}
                            <div className="relative z-10 flex justify-between items-start">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                    <Users className="text-white group-hover:scale-110 transition-transform" size={28} />
                                </div>
                                <ArrowRight className="text-white/50 group-hover:text-amber-400 group-hover:translate-x-2 transition-all" size={24} />
                            </div>

                            <div className="relative z-10 mt-auto pt-10">
                                <h4 className="text-2xl font-bold text-white mb-3">Vibrant Fellowships</h4>
                                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                                    From our energetic <span className="text-amber-400 font-bold">Youth Church</span> to our focused Men and Women groups, there is a community for you.
                                </p>
                                <span className="text-xs font-black uppercase tracking-widest text-amber-400 group-hover:underline flex items-center gap-2">
                                    Meet the family
                                </span>
                            </div>
                        </Link>

                        {/* 2. Link to Media (Sermons/Gallery focus) */}
                        <Link href="/sermons" className="group relative p-8 rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500 min-h-[400px] flex flex-col justify-between">
                            <div
                                className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700 z-0"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/90 z-0" />

                            <div className="relative z-10 flex justify-between items-start">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                    <PlayCircle className="text-white group-hover:scale-110 transition-transform" size={28} />
                                </div>
                                <ArrowRight className="text-white/50 group-hover:text-amber-400 group-hover:translate-x-2 transition-all" size={24} />
                            </div>

                            <div className="relative z-10 mt-auto pt-10">
                                <h4 className="text-2xl font-bold text-white mb-3">Sound Doctrine</h4>
                                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                                    Experience the transformation. Catch up on <span className="text-amber-400 font-bold">Sermons</span> and see God's glory in our recent moments.
                                </p>
                                <span className="text-xs font-black uppercase tracking-widest text-amber-400 group-hover:underline flex items-center gap-2">
                                    Watch & Listen
                                </span>
                            </div>
                        </Link>

                        {/* 3. Link to Workforce */}
                        <Link href="/departments" className="group relative p-8 rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500 min-h-[400px] flex flex-col justify-between">
                            <div
                                className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1510563800743-aed236490d08?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700 z-0"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/90 z-0" />

                            <div className="relative z-10 flex justify-between items-start">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                    <Camera className="text-white group-hover:scale-110 transition-transform" size={28} />
                                </div>
                                <ArrowRight className="text-white/50 group-hover:text-amber-400 group-hover:translate-x-2 transition-all" size={24} />
                            </div>

                            <div className="relative z-10 mt-auto pt-10">
                                <h4 className="text-2xl font-bold text-white mb-3">Serve the Kingdom</h4>
                                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                                    Our workforce is the engine of our church. Discover the <span className="text-amber-400 font-bold">Units</span> and find where you fit in.
                                </p>
                                <span className="text-xs font-black uppercase tracking-widest text-amber-400 group-hover:underline flex items-center gap-2">
                                    Join a Department
                                </span>
                            </div>
                        </Link>

                    </div>
                </div>
            </section>

            {/* 5. THE BIG MAP SECTION */}
            <section className="relative w-full h-[500px] md:h-[650px] bg-slate-100 group">
                {/* Visual Placeholder for Google Maps Embed */}
                <div className="absolute inset-0 bg-slate-200 flex items-center justify-center overflow-hidden">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d832.2053568590655!2d3.373985169507433!3d6.569560031888077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b927f269e1105%3A0xefd56a17bce5ff1e!2sThe%20Redeemed%20Christian%20Church%20Of%20God%2C%20Milk%20%26%20Honey!5e1!3m2!1sen!2snl!4v1777332651414!5m2!1sen!2snl"
                        className="w-full h-full grayscale-[0.5] contrast-[1.1]"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                    ></iframe>
                </div>

                {/* Floating Map Card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:left-24 md:translate-x-0 w-[90%] md:w-[400px] bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
                    <span className="text-amber-600 font-bold tracking-widest uppercase text-[10px] mb-4 block">Visit Us Today</span>
                    <h3 className="text-2xl font-serif font-black text-brand-primary mb-6">Where to find us</h3>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-brand-primary flex-shrink-0"><MapPin size={20}/></div>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {CHURCH_INFO.address.street}, <br/>
                                {CHURCH_INFO.parish}, <br/>
                                {CHURCH_INFO.address.city}, {CHURCH_INFO.address.country}.
                            </p>
                        </div>
                        <div className="flex items-center gap-4  hover:text-amber-600 transition-colors group">
                            <a href={`tel:${CHURCH_INFO.contact.phoneLink}`} className="flex items-center gap-2 hover:text-amber-600 transition-colors group">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-brand-primary flex-shrink-0"><Phone size={20}/></div>
                                <p className="text-sm text-gray-500">{CHURCH_INFO.contact.phone}</p>
                            </a>
                        </div>
                        <div className="flex items-center gap-4  hover:text-amber-600 transition-colors group">
                            <a href={`mailto:${CHURCH_INFO.contact.email}`} className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-brand-primary flex-shrink-0"><Mail size={20}/></div>
                                <p className="text-sm text-gray-500"> {CHURCH_INFO.contact.email}</p>
                            </a>
                        </div>
                    </div>

                    <a
                        href={CHURCH_INFO.address.googleMapsLink}
                        target="_blank"
                        className="mt-10 w-full bg-brand-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-brand-primary/20"
                    >
                        Open in Google Maps
                    </a>
                </div>
            </section>

        </div>
    );
}