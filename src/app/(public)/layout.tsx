import React from "react";
import {supabase} from "@/lib/supabase";

import FloatingDove from "@/components/Public/FloatingDove";
import GlobalTopAd from "@/components/Home/GlobalTopAd";
import BackToTop from "@/components/UI/BackToTop";

import PublicNavbar from "@/components/Public/PublicNavbar";
import PublicFooter from "@/components/Public/PublicFooter";

export default async function PublicLayout({children}: { children: React.ReactNode }) {

    const {data: settings} = await supabase
        .from('site_settings')
        .select('*')
        .single();

    return (
        <div className="min-h-screen flex flex-col font-sans bg-amber-50/30 relative">

            {/* 1. GLOBAL AD PLACEMENT */}
            <GlobalTopAd/>

            {/* 2. PUBLIC NAVBAR */}
            <PublicNavbar settings={settings}/>

            {/* 3. PAGE CONTENT */}
            <main className="flex-grow">
                {children}
            </main>

            {/* 4. THE INTERACTIVE FLOATING DOVE */}
            <FloatingDove/>

            {/* 5. NEW PUBLIC FOOTER (Expanded Links) */}

            <PublicFooter settings={settings}/>

            <BackToTop/>
        </div>
    );
}