"use client"
import Link from "next/link";
import {Mail, ShieldAlert} from "lucide-react";
import {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";

export default function AdminNotFound() {
    const [settings, setSettings] = useState<any>(null);
    const [currentUrl, setCurrentUrl] = useState('Unknown URL'); // 1. Add state for the URL

    useEffect(() => {
        setCurrentUrl(window.location.href);

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
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            {/* Visual Indicator */}
            <div className="bg-slate-900 p-8 rounded-full mb-8 border border-slate-800 shadow-2xl">
                <ShieldAlert size={64} className="text-amber-500"/>
            </div>

            <h1 className="text-4xl font-black text-white mb-4 font-serif">Admin Access Denied</h1>
            <p className="text-slate-400 max-w-md mb-8">
                The administrative resource you are looking for does not exist or has been moved.
                If you believe this is an error, please contact the development team.
            </p>

            {/* Help & Navigation */}
            <div className="flex flex-col gap-4 w-full max-w-xs">
                <Link
                    href="/login"
                    className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold hover:bg-brand-secondary transition-all"
                >
                    Return to Dashboard
                </Link>

                <a
                    href={`mailto:${settings?.email_tech_support || 'byteandsecurity.support+admin@gmail.com'}?subject=Admin Broken Link Report&body=I encountered an error at: ${currentUrl}`}
                    className="flex items-center justify-center gap-2 w-full bg-slate-800 text-slate-300 py-4 rounded-xl font-bold hover:bg-slate-700 transition-all"
                >
                    <Mail size={18}/> Contact Admin Support
                </a>
            </div>

            {/* Footer Debug info */}
            <div className="mt-12 text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                Error Code: 404_ADMIN_NOT_FOUND
            </div>
        </div>
    );
}