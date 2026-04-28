import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, Database, ArrowLeft, Camera } from "lucide-react";
import { CHURCH_INFO } from "@/lib/constants";

export default function PrivacyPolicyPage() {
    return (
        <div className="flex flex-col bg-slate-50 min-h-screen pb-24">

            {/* HERO SECTION */}
            <section className="relative py-20 bg-brand-primary overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                            <ShieldCheck size={32} className="text-amber-400" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-black text-white leading-tight mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-amber-200 text-sm font-bold uppercase tracking-widest">
                        Effective Date: April 2026
                    </p>
                </div>
            </section>

            {/* MAIN CONTENT AREA */}
            <section className="max-w-4xl mx-auto px-6 -mt-10 relative z-20">
                <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 md:p-16">

                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-brand-primary transition-colors mb-10">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>

                    <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed space-y-10">

                        {/* 1. Introduction */}
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-brand-primary mb-4 border-b border-gray-100 pb-2">1. Introduction</h2>
                            <p>
                                Welcome to the official website of <strong>{CHURCH_INFO.name}</strong>, {CHURCH_INFO.parish}. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.
                            </p>
                        </div>

                        {/* 2. What We Collect */}
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-brand-primary mb-4 border-b border-gray-100 pb-2 flex items-center gap-3">
                                <Database size={24} className="text-amber-500" />
                                2. The Data We Collect About You
                            </h2>
                            <p className="mb-4">
                                Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store, and transfer different kinds of personal data about you which we have grouped together as follows:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Identity Data:</strong> includes first name, last name, or similar identifiers.</li>
                                <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
                                <li><strong>Inquiry Data:</strong> includes prayer requests, testimonies, or any personal context you choose to share in our contact forms.</li>
                                <li><strong>Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting, and operating system (collected automatically for website analytics and security).</li>
                            </ul>
                        </div>

                        {/* 3. How We Use It */}
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-brand-primary mb-4 border-b border-gray-100 pb-2 flex items-center gap-3">
                                <Eye size={24} className="text-amber-500" />
                                3. How We Use Your Personal Data
                            </h2>
                            <p className="mb-4">
                                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>To respond to your inquiries, prayer requests, and contact form submissions.</li>
                                <li>To route your specific requests to the appropriate church department (e.g., Pastoral, Media, or Administrative teams).</li>
                                <li>To manage our relationship with you, including notifying you about changes to our terms or privacy policy.</li>
                                <li>To administer and protect our website (including troubleshooting, data analysis, testing, system maintenance, and support).</li>
                            </ul>
                        </div>

                        {/* 4. NEW: Photography & Media Consent */}
                        <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                            <h2 className="text-2xl font-serif font-bold text-brand-primary mb-4 border-b border-amber-200 pb-2 flex items-center gap-3">
                                <Camera size={24} className="text-amber-500" />
                                4. Photography, Videography & Live Streaming
                            </h2>
                            <p className="mb-4">
                                As a vibrant church community, we frequently capture photographs, record video/audio, and live stream our services and major events. These media materials are strictly used for our ministry purposes to share the gospel and church life. This includes, but is not limited to, use on our website, official social media channels, promotional materials, and internal archives.
                            </p>
                            <ul className="list-disc pl-6 space-y-3">
                                <li>
                                    <strong>Implied Consent:</strong> By attending our public services and events at {CHURCH_INFO.name}, you consent to the capture and use of your image, likeness, and voice for these stated ministry purposes.
                                </li>
                                <li>
                                    <strong>Opting Out:</strong> We deeply respect your privacy. If you or a family member prefer not to be photographed or recorded, please inform one of our ushers upon arrival, or contact our administrative team via email. We will make every reasonable effort to accommodate your request and ensure our media team is aware.
                                </li>
                                <li>
                                    <strong>Takedown Requests:</strong> If you see a photo or video of yourself on our digital platforms that you wish to have removed, please contact us immediately, and we will take it down promptly.
                                </li>
                            </ul>
                        </div>

                        {/* 5. Data Security */}
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-brand-primary mb-4 border-b border-gray-100 pb-2 flex items-center gap-3">
                                <Lock size={24} className="text-amber-500" />
                                5. Data Security & Storage
                            </h2>
                            <p>
                                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. Our databases are secured with modern encryption standards, and access to your personal data is strictly limited to authorized administrative and pastoral staff who have a ministry-related need to know.
                            </p>
                            <p className="mt-4">
                                We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website or servicing you, so long as those parties agree to keep this information confidential.
                            </p>
                        </div>

                        {/* 6. Data Retention */}
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-brand-primary mb-4 border-b border-gray-100 pb-2">6. Data Retention</h2>
                            <p>
                                We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements. Prayer requests and general inquiries are archived or deleted periodically as part of our internal data hygiene practices.
                            </p>
                        </div>

                        {/* 7. Contact Information */}
                        <div className="bg-slate-50 p-8 rounded-2xl border border-gray-100 mt-12">
                            <h2 className="text-xl font-serif font-bold text-brand-primary mb-4">7. Contact Us Regarding Your Privacy</h2>
                            <p className="mb-6">
                                If you have any questions about this privacy policy, or wish to issue a media takedown request, please contact our administrative team:
                            </p>
                            <div className="space-y-2 text-sm">
                                <p><strong>Entity:</strong> {CHURCH_INFO.name} ({CHURCH_INFO.parish})</p>
                                <p><strong>Email Address:</strong> <a href={`mailto:${CHURCH_INFO.contact.email}`} className="text-brand-primary font-bold hover:underline">{CHURCH_INFO.contact.email}</a></p>
                                <p><strong>Physical Address:</strong> {CHURCH_INFO.address.street}, {CHURCH_INFO.address.city}, {CHURCH_INFO.address.country}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}