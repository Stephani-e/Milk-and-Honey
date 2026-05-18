"use client"
import React, {useEffect, useState} from "react";
import Link from "next/link";
import {toast} from "sonner";
import {Calendar, Clock, Info, Mail, MapPin, Phone, Send} from "lucide-react";
import {CHURCH_INFO} from "@/lib/constants";
import {supabase} from "@/lib/supabase";

const FacebookIcon = ({size = 20, className = ""}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
);

const InstagramIcon = ({size = 20, className = ""}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

const TwitterIcon = ({size = 20, className = ""}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path
            d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
    </svg>
);

export default function ContactPage() {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "general",
        message: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Send data to your Next.js backend API route
            // You will need to create app/api/send-email/route.ts to handle this via Resend or Nodemailer
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                toast.error("Failed to send message.", {
                    description: "The server responded with an error. Please try again.",
                });
                return;
            }

            // Trigger Success Toast
            toast.success("Message Sent Successfully!", {
                description: "Our administrative team will get back to you shortly.",
                duration: 5000,
            });

            // Clear the form
            setFormData({name: "", email: "", phone: "", subject: "general", message: ""});

        } catch (error: any) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message.", {
                description: "Please check your connection and try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchSettings = async () => {
            const {data} = await supabase
                .from('site_settings')
                .select('*')
                .single();

            if (data) setSettings(data);
        };

        fetchSettings().catch(console.error);
    }, []);

    return (
        <div className="flex flex-col bg-slate-50 min-h-screen">

            {/* HERO SECTION */}
            <section className="relative py-20 bg-brand-primary overflow-hidden">
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-20"></div>

                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <span className="text-amber-400 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 block">
                        Get In Touch
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif font-black text-white leading-tight mb-6">
                        We'd Love to Hear <br className="hidden md:block"/> From You.
                    </h1>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                        Whether you have a question, need prayer, or want to learn more about Milk & Honey, our team is
                        ready to connect.
                    </p>
                </div>
            </section>

            {/* MAIN CONTENT AREA */}
            <section
                className="py-16 md:py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start -mt-10 md:-mt-20 relative z-20"
            >

                {/* LEFT SIDE: Contact Information Cards */}
                <div className="lg:col-span-5 space-y-6">

                    {/* Primary Contact Card */}
                    <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl border border-gray-100">
                        <h3 className="text-2xl font-serif font-bold text-brand-primary mb-8">Reach Out Directly</h3>

                        <div className="space-y-8">
                            <div className="flex gap-5">
                                <div
                                    className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                                    <MapPin size={24}/>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">Our Sanctuary</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        {settings?.address_street || "Address Not Set"}, <br/>
                                        {settings?.parish_name || "Parish"}, <br/>
                                        {settings?.address_city}, {settings?.address_country}.
                                    </p>
                                    <a href={CHURCH_INFO.address.googleMapsLink} target="_blank" rel="noreferrer"
                                       className="text-xs font-bold text-brand-primary uppercase tracking-widest mt-3 inline-block hover:text-amber-600 transition-colors">
                                        Get Directions →
                                    </a>
                                </div>
                            </div>

                            <div className="flex gap-5">
                                <div
                                    className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                                    <Phone size={24}/>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">Phone</h4>
                                    <a href={`tel:${settings?.phone_link}`}
                                       className="text-sm text-gray-500 hover:text-brand-primary transition-colors">
                                        {settings?.phone_primary}
                                    </a>
                                </div>
                            </div>

                            <div className="flex gap-5">
                                <div
                                    className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                                    <Mail size={24}/>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">Email</h4>
                                    <a href={`mailto:${settings?.email_public}`}
                                       className="text-sm text-gray-500 hover:text-brand-primary transition-colors">
                                        {settings?.email_public}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Media Quick Connect */}
                    <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl border border-gray-100">
                        <h3 className="text-xl font-serif font-bold text-brand-primary mb-2">Quick Connect</h3>
                        <p className="text-sm text-gray-500 mb-6">Send us a direct message on our social channels for
                            quick inquiries.</p>
                        <div className="flex gap-4">
                            <a href={settings?.instagram_url} target="_blank" rel="noreferrer"
                               className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-pink-50 border border-gray-100 hover:border-pink-200 text-gray-600 hover:text-pink-600 py-4 rounded-xl font-bold transition-all">
                                <InstagramIcon/> Instagram
                            </a>
                            <a href={settings?.facebook_url} target="_blank" rel="noreferrer"
                               className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 text-gray-600 hover:text-blue-600 py-4 rounded-xl font-bold transition-all">
                                <FacebookIcon/> Facebook
                            </a>
                            <a href={settings?.twitter_url} target="_blank" rel="noreferrer"
                               className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-green-50 border border-gray-100 hover:border-green-200 text-gray-600 hover:text-green-600 py-4 rounded-xl font-bold transition-all">
                                <TwitterIcon/> Twitter
                            </a>
                        </div>
                    </div>

                    {/* Service Times Card */}
                    <div
                        className="bg-brand-primary text-white p-8 md:p-10 rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col justify-between">
                        <Clock size={160} className="absolute -bottom-10 -right-10 text-white/5 pointer-events-none"/>

                        <div className="relative z-10">
                            <h3 className="text-xl font-serif font-bold mb-6">Service Times</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <span className="text-sm text-amber-200 font-bold uppercase tracking-widest">Sunday (1st Service)</span>
                                    <span className="text-sm font-medium">7:30 AM</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <span className="text-sm text-amber-200 font-bold uppercase tracking-widest">Sunday (2nd Service)</span>
                                    <span className="text-sm font-medium">9:30 AM</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <span className="text-sm text-amber-200 font-bold uppercase tracking-widest">Digging Deep (Tuesday)</span>
                                    <span className="text-sm font-medium">6:00 PM</span>
                                </div>
                                <div className="flex justify-between items-center pb-2">
                                    <span className="text-sm text-amber-200 font-bold uppercase tracking-widest">Faith Clinic (Thursday)</span>
                                    <span className="text-sm font-medium">6:00 PM</span>
                                </div>
                            </div>
                        </div>

                        <Link href="/events"
                              className="relative z-10 mt-8 w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all backdrop-blur-sm">
                            <Calendar size={16}/> View Full Calendar
                        </Link>
                    </div>

                </div>

                {/* RIGHT SIDE: The Contact Form */}
                <div
                    className="lg:col-span-7 bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl shadow-brand-primary/5 border border-gray-100">

                    <div className="mb-8">
                        <h2 className="text-3xl font-serif font-black text-brand-primary mb-3">Send a Serious
                            Inquiry</h2>
                        <p className="text-sm text-gray-500">
                            Fill out the form below. For accountability and prompt response, this message is routed
                            directly to multiple departments.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label
                                    className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Full
                                    Name *</label>
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

                            <div>
                                <label
                                    className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Phone
                                    Number</label>
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
                            <div>
                                <label
                                    className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Email
                                    Address *</label>
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

                            <div>
                                <label
                                    className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">How
                                    can we help? *</label>
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

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Your
                                Message *</label>
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

                        {/* Distribution Warning Disclaimer */}
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
                            <Info size={20} className="text-amber-500 shrink-0 mt-0.5"/>
                            <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                <strong className="font-bold text-amber-900 block mb-1">Message Distribution
                                    Notice:</strong>
                                To ensure your inquiry is not missed, submitting this form will simultaneously email our
                                primary contact addresses (Admin, Media, and Pastoral team). You may also follow up by
                                phone to confirm receipt.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full md:w-auto px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-brand-primary text-white hover:bg-slate-800 shadow-lg shadow-brand-primary/20 active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? "Sending securely..." : <>Submit Inquiry <Send size={18}/></>}
                        </button>

                    </form>

                </div>
            </section>
        </div>
    );
}