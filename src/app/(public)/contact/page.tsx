"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
    MapPin, Phone, Mail, Clock,
    Send, CheckCircle2, MessageSquare
} from "lucide-react";
// If you're using sonner for toast notifications in the public app, import it.
// Otherwise, we'll use a local success state. Let's use a local state for simplicity here.

export default function ContactPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "general", // Default option
        message: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // --- BACKEND LOGIC PLACEHOLDER ---
        // Here is where we will eventually call Supabase:
        // const { error } = await supabase.from('contact_messages').insert([{
        //     name: formData.name,
        //     email: formData.email,
        //     phone: formData.phone,
        //     subject: formData.subject,
        //     message: formData.message,
        //     status: 'unread'
        // }]);

        // For now, we simulate a network request
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setFormData({ name: "", email: "", phone: "", subject: "general", message: "" });

            // Reset the success message after 5 seconds
            setTimeout(() => setSuccess(false), 5000);
        }, 1500);
    };

    return (
        <div className="flex flex-col bg-slate-50 min-h-screen">

            {/* 1. HERO SECTION */}
            <section className="relative py-20 bg-brand-primary overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <span className="text-amber-400 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 block">
                        Get In Touch
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif font-black text-white leading-tight mb-6">
                        We'd Love to Hear <br className="hidden md:block"/> From You.
                    </h1>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                        Whether you have a question, need prayer, or want to learn more about Milk & Honey, our team is ready to connect.
                    </p>
                </div>
            </section>

            {/* 2. MAIN CONTENT AREA */}
            <section className="py-16 md:py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start -mt-10 md:-mt-20 relative z-20">

                {/* LEFT SIDE: Contact Information Cards */}
                <div className="lg:col-span-5 space-y-6">

                    {/* Primary Contact Card */}
                    <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl border border-gray-100">
                        <h3 className="text-2xl font-serif font-bold text-brand-primary mb-8">Reach Out Directly</h3>

                        <div className="space-y-8">
                            <div className="flex gap-5">
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">Our Sanctuary</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        123 Milk and Honey Way, <br/>
                                        Lagos Province 56 Headquarters, <br/>
                                        Lagos, Nigeria.
                                    </p>
                                    <a href="https://maps.google.com/?q=RCCG+Milk+and+Honey+Lagos" target="_blank" className="text-xs font-bold text-brand-primary uppercase tracking-widest mt-3 inline-block hover:text-amber-600 transition-colors">
                                        Get Directions →
                                    </a>
                                </div>
                            </div>

                            <div className="flex gap-5">
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">Phone</h4>
                                    <p className="text-sm text-gray-500">+234 (0) 123 456 7890</p>
                                </div>
                            </div>

                            <div className="flex gap-5">
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">Email</h4>
                                    <p className="text-sm text-gray-500">contact@milkandhoney.org</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Service Times Card */}
                    <div className="bg-brand-primary text-white p-8 md:p-10 rounded-[2rem] shadow-xl relative overflow-hidden">
                        <Clock size={120} className="absolute -bottom-10 -right-10 text-white/5 pointer-events-none" />
                        <h3 className="text-xl font-serif font-bold mb-6">Service Times</h3>

                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                <span className="text-sm text-amber-200 font-bold uppercase tracking-widest">Sunday Service</span>
                                <span className="text-sm font-medium">9:00 AM</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                <span className="text-sm text-amber-200 font-bold uppercase tracking-widest">Digging Deep (Tue)</span>
                                <span className="text-sm font-medium">6:00 PM</span>
                            </div>
                            <div className="flex justify-between items-center pb-2">
                                <span className="text-sm text-amber-200 font-bold uppercase tracking-widest">Faith Clinic (Thu)</span>
                                <span className="text-sm font-medium">6:00 PM</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT SIDE: The Contact Form */}
                <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl shadow-brand-primary/5 border border-gray-100">

                    <div className="mb-8">
                        <h2 className="text-3xl font-serif font-black text-brand-primary mb-3">Send a Message</h2>
                        <p className="text-sm text-gray-500">
                            Fill out the form below and our administrative team will get back to you as soon as possible.
                        </p>
                    </div>

                    {/* Success Message Banner */}
                    {success && (
                        <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                            <div className="text-green-600 mt-1"><CheckCircle2 size={24} /></div>
                            <div>
                                <h4 className="text-sm font-bold text-green-900 mb-1">Message Sent Successfully!</h4>
                                <p className="text-xs text-green-700 leading-relaxed">
                                    Thank you for reaching out to Milk & Honey. Our team has received your message and will respond shortly.
                                </p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Full Name *</label>
                                <input
                                    required
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Jane Doe"
                                    className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl text-brand-primary font-bold focus:ring-2 focus:ring-amber-400 outline-none transition-all"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+234 ..."
                                    className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl text-brand-primary font-bold focus:ring-2 focus:ring-amber-400 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Email */}
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Email Address *</label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="jane@example.com"
                                    className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl text-brand-primary font-bold focus:ring-2 focus:ring-amber-400 outline-none transition-all"
                                />
                            </div>

                            {/* Subject Category */}
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">How can we help? *</label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl text-brand-primary font-bold focus:ring-2 focus:ring-amber-400 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="general">General Inquiry</option>
                                    <option value="prayer">Prayer Request</option>
                                    <option value="testimony">Share a Testimony</option>
                                    <option value="membership">Membership / Joining</option>
                                    <option value="technical">Technical Support (Website)</option>
                                </select>
                            </div>
                        </div>

                        {/* Message Box */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Your Message *</label>
                            <textarea
                                required
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={6}
                                placeholder="Type your message here..."
                                className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl text-brand-primary focus:ring-2 focus:ring-amber-400 outline-none transition-all resize-none leading-relaxed"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || success}
                            className={`w-full md:w-auto px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                success
                                    ? 'bg-green-600 text-white cursor-default'
                                    : 'bg-brand-primary text-white hover:bg-slate-800 shadow-lg shadow-brand-primary/20 active:scale-95'
                            } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                "Sending..."
                            ) : success ? (
                                <>Sent <CheckCircle2 size={18}/></>
                            ) : (
                                <>Send Message <Send size={18}/></>
                            )}
                        </button>

                    </form>

                </div>
            </section>
        </div>
    );
}