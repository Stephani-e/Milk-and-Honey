"use client";
import React, {useEffect, useMemo, useState} from "react";
import {supabase} from "@/lib/supabase";
import Link from "next/link";
import {Calendar, Camera, ChevronDown, ChevronUp, Image as ImageIcon, Loader2, Search, Smartphone} from "lucide-react";
import {CHURCH_INFO} from "@/lib/constants";

export default function GalleryPage() {
    const [galleries, setGalleries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTopBtn, setShowTopBtn] = useState(false);

    // Search and Filter State (Identical to Sermon UX)
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState<"All" | "Sunday" | "Tuesday" | "Thursday" | "Monthly" | "Special">("All");

    // Sub-filter states
    const [sundayHostFilter, setSundayHostFilter] = useState<"All" | "Thanksgiving" | "General/Last Sunday" | "Men" | "Women" | "Youth">("All");
    const [sundayServiceFilter, setSundayServiceFilter] = useState<"All Services" | "First Service" | "Second Service">("All Services");
    const [monthlyFilter, setMonthlyFilter] = useState<string>("All");
    const [specialFilter, setSpecialFilter] = useState<string>("All");

    // Accordion State
    const [expandedYears, setExpandedYears] = useState<string[]>([]);
    const [expandedMonths, setExpandedMonths] = useState<string[]>([]);

    // Quick Jump Filters
    const [jumpYear, setJumpYear] = useState<string>("All");
    const [jumpMonth, setJumpMonth] = useState<string>("All");

    useEffect(() => {
        fetchPublicGalleries().catch(console.error)
    }, []);

    useEffect(() => {
        const handleScroll = () => setShowTopBtn(window.scrollY > 400);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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

    const scrollToTop = () => window.scrollTo({top: 0, behavior: "smooth"});

    async function fetchPublicGalleries() {
        setLoading(true);
        try {
            const {data, error} = await supabase
                .from("media_gallery")
                .select("*")
                .eq("status", "published")
                .eq("is_archived", false)
                .order("service_date", {ascending: false})
                .is("deleted_at", null)

            if (error) {
                console.error("Error fetching public galleries:", error.message);
            }

            if (data) {
                // Parse JSON media arrays if they come back as strings
                const parsedData = data.map(item => ({
                    ...item,
                    media_urls: typeof item.media_urls === 'string' ? JSON.parse(item.media_urls) : item.media_urls
                }));

                setGalleries(parsedData);

                // Auto-expand the most recent year/month
                if (parsedData.length > 0) {
                    const firstDate = new Date(parsedData[0].service_date);
                    if (!isNaN(firstDate.getTime())) {
                        const firstYear = firstDate.getFullYear().toString();
                        const firstMonthKey = `${firstYear}-${firstDate.toLocaleString('default', {month: 'long'})}`;
                        setExpandedYears([firstYear]);
                        setExpandedMonths([firstMonthKey]);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching public galleries:", error);
        } finally {
            setLoading(false);
        }
    }

    // Dynamic Filter Extraction
    const monthlyServiceNames = useMemo(() => {
        const names = galleries.filter(g => g.service_category === "Monthly" && g.special_service_name).map(g => g.special_service_name);
        return ["All", ...Array.from(new Set(names))];
    }, [galleries]);

    const specialServiceNames = useMemo(() => {
        const names = galleries.filter(g => g.service_category === "Special" && g.special_service_name).map(g => g.special_service_name);
        return ["All", ...Array.from(new Set(names))];
    }, [galleries]);

    const availableYears = useMemo(() => {
        const years = galleries.map(g => new Date(g.service_date).getFullYear().toString()).filter(y => y !== "NaN");
        return ["All", ...Array.from(new Set(years))].sort((a, b) => b.localeCompare(a));
    }, [galleries]);

    const availableMonths = useMemo(() => {
        const months = galleries.map(g => new Date(g.service_date).toLocaleString('default', {month: 'long'})).filter(m => m !== "Invalid Date");
        const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return ["All", ...Array.from(new Set(months))].sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
    }, [galleries]);

    // Filtering Logic
    const filteredGalleries = galleries.filter(gallery => {
        const safeTitle = gallery.title || "";
        const matchesSearch = safeTitle.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesCategory = true;

        if (filterCategory === "Sunday") {
            matchesCategory = gallery.service_category === "Weekly" && gallery.weekly_type === "Sunday";
            if (matchesCategory) {
                if (sundayHostFilter === "Thanksgiving") matchesCategory = gallery.is_thanksgiving === true;
                else if (sundayHostFilter !== "All") matchesCategory = gallery.is_thanksgiving === false && gallery.host === sundayHostFilter;

                if (matchesCategory && sundayHostFilter !== "Thanksgiving" && sundayServiceFilter !== "All Services") {
                    matchesCategory = gallery.service_number === sundayServiceFilter;
                }
            }
        } else if (filterCategory === "Tuesday") {
            matchesCategory = gallery.service_category === "Weekly" && gallery.weekly_type === "Tuesday";
        } else if (filterCategory === "Thursday") {
            matchesCategory = gallery.service_category === "Weekly" && gallery.weekly_type === "Thursday";
        } else if (filterCategory === "Monthly") {
            matchesCategory = gallery.service_category === "Monthly";
            if (matchesCategory && monthlyFilter !== "All") matchesCategory = gallery.special_service_name === monthlyFilter;
        } else if (filterCategory === "Special") {
            matchesCategory = gallery.service_category === "Special";
            if (matchesCategory && specialFilter !== "All") matchesCategory = gallery.special_service_name === specialFilter;
        }

        return matchesSearch && matchesCategory;
    });

    // Grouping Logic
    const groupedGalleries = useMemo(() => {
        let toGroup = filteredGalleries;
        if (jumpYear !== "All") toGroup = toGroup.filter(g => new Date(g.service_date).getFullYear().toString() === jumpYear);
        if (jumpMonth !== "All") toGroup = toGroup.filter(g => new Date(g.service_date).toLocaleString('default', {month: 'long'}) === jumpMonth);

        return toGroup.reduce((acc: any, gallery: any) => {
            const date = new Date(gallery.service_date);
            if (isNaN(date.getTime())) return acc;

            const year = date.getFullYear().toString();
            const month = date.toLocaleString('default', {month: 'long'});

            if (!acc[year]) acc[year] = {};
            if (!acc[year][month]) acc[year][month] = [];

            acc[year][month].push(gallery);
            return acc;
        }, {});
    }, [filteredGalleries, jumpYear, jumpMonth]);

    const toggleYear = (e: React.MouseEvent, year: string) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedYears(prev => prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]);
    };

    const toggleMonth = (e: React.MouseEvent, monthKey: string) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedMonths(prev => prev.includes(monthKey) ? prev.filter(m => m !== monthKey) : [...prev, monthKey]);
    };

    const isYearExpanded = (year: string) => (searchQuery.trim() !== "" || jumpYear !== "All" || filterCategory !== "All") ? true : expandedYears.includes(year);
    const isMonthExpanded = (monthKey: string) => (searchQuery.trim() !== "" || jumpMonth !== "All" || filterCategory !== "All") ? true : expandedMonths.includes(monthKey);

    const getBadge = (gallery: any) => {
        if (gallery.service_category === "Weekly") {
            if (gallery.weekly_type === "Sunday") {
                if (gallery.is_thanksgiving) return "Thanksgiving";
                if (gallery.service_number) return `Sunday • ${gallery.service_number}`;
                return "Sunday Service";
            }
            if (gallery.weekly_type === "Tuesday") return "Digging Deep";
            if (gallery.weekly_type === "Thursday") return "Faith Clinic";
            return gallery.weekly_type;
        }
        if (gallery.service_category === "Monthly") return gallery.special_service_name || "Monthly Service";
        return `Special Event`;
    };

    // Extract Cover Image/Video
    const getAlbumCover = (mediaArray: any[]) => {
        if (!mediaArray || mediaArray.length === 0) return null;
        return mediaArray[0]; // Returns { url, type }
    };

    return (
        <div className="flex flex-col bg-slate-50 min-h-screen pb-24 relative">

            {/* HERO SECTION */}
            <section
                className="relative py-24 md:py-32 bg-slate-900 overflow-hidden flex items-center justify-center min-h-[400px]">

                {/* IMAGE COLLAGE BACKGROUND */}
                <div
                    className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-2 md:gap-3 p-2 md:p-3 opacity-30 scale-105">
                    {/* Image 1 (Tall - Spans 2 rows) */}
                    <div className="row-span-2 md:col-span-1 rounded-xl md:rounded-2xl overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=800&auto=format&fit=crop"
                            className="w-full h-full object-cover" alt="Gallery background 1"/>
                    </div>
                    {/* Image 2 (Standard) */}
                    <div className="col-span-1 rounded-xl md:rounded-2xl overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?q=80&w=800&auto=format&fit=crop"
                            className="w-full h-full object-cover" alt="Gallery background 2"/>
                    </div>
                    {/* Image 3 (Wide on mobile, standard on desktop) */}
                    <div className="col-span-2 md:col-span-1 rounded-xl md:rounded-2xl overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1478147424044-f252df6e8557?q=80&w=800&auto=format&fit=crop"
                            className="w-full h-full object-cover" alt="Gallery background 3"/>
                    </div>
                    {/* Image 4 (Tall - Hidden on mobile, visible on desktop) */}
                    <div className="row-span-2 col-span-1 hidden md:block rounded-2xl overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop"
                            className="w-full h-full object-cover" alt="Gallery background 4"/>
                    </div>
                    {/* Image 5 (Wide) */}
                    <div className="col-span-2 md:col-span-2 rounded-xl md:rounded-2xl overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1200&auto=format&fit=crop"
                            className="w-full h-full object-cover object-top" alt="Gallery background 5"/>
                    </div>
                </div>

                {/* GRADIENT OVERLAY (For text readability) */}
                <div
                    className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40"></div>

                {/* HERO CONTENT */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-center mt-4">
                    <span
                        className="text-amber-400 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 block drop-shadow-md">
                        Our Moments
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif font-black text-white leading-tight mb-4 drop-shadow-lg">
                        Church Gallery.
                    </h1>
                    <p className="text-slate-200 text-sm md:text-lg max-w-2xl mx-auto drop-shadow-md font-medium">
                        Relive the powerful moments from our recent services, conferences, and community outreaches.
                    </p>
                </div>
            </section>

            {loading ? (
                <div className="py-32 flex flex-col items-center justify-center text-brand-primary">
                    <Loader2 size={48} className="animate-spin mb-4"/>
                    <p className="font-bold tracking-widest uppercase text-xs">Loading Albums...</p>
                </div>
            ) : (
                <>
                    {/* SEARCH & FILTER BAR */}
                    <section className="max-w-7xl mx-auto px-4 md:px-6 mb-10 w-full -mt-8 relative z-20">
                        <div
                            className={`bg-white p-3 md:p-4 shadow-xl shadow-slate-200/50 border border-gray-100 rounded-xl flex flex-col relative transition-all duration-300 ${filterCategory === 'Sunday' || filterCategory === 'Monthly' || filterCategory === 'Special'}`}>

                            <div className="flex flex-col lg:flex-row gap-3 md:gap-4 items-center w-full">
                                {/* Scrollable Category Buttons */}
                                <div className="w-full lg:w-auto overflow-x-auto no-scrollbar">
                                    <div className="flex gap-2 pb-2 lg:pb-0 px-1">
                                        {["All", "Sunday", "Tuesday", "Thursday", "Monthly", "Special"].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => {
                                                    setFilterCategory(tab as any);
                                                    setSundayHostFilter("All");
                                                    setSundayServiceFilter("All Services");
                                                    setMonthlyFilter("All");
                                                    setSpecialFilter("All");
                                                }}
                                                className={`whitespace-nowrap px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[11px] md:text-xs font-bold transition-all shrink-0 ${
                                                    filterCategory === tab ? "bg-brand-primary text-white shadow-md" : "bg-slate-50 text-gray-500 hover:bg-slate-100"
                                                }`}
                                            >
                                                {tab === "Tuesday" ? "Digging Deep" : tab === "Thursday" ? "Faith Clinic" : tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="hidden lg:block w-[1px] h-8 bg-gray-200 mx-1 shrink-0"></div>

                                {/* Search Bar */}
                                <div
                                    className="flex-1 w-full relative flex items-center bg-slate-50 rounded-full overflow-hidden border border-gray-100">
                                    <Search className="absolute left-4 text-gray-400" size={18}/>
                                    <input
                                        type="text"
                                        placeholder="Search album title..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-2.5 md:py-3 bg-transparent border-none focus:ring-0 text-brand-primary font-bold placeholder-gray-400 outline-none text-xs md:text-sm"
                                    />
                                </div>
                            </div>

                            {/* SUB-FILTERS */}
                            <div className="flex flex-col gap-2 mt-2">
                                {/* Sunday Sub-filters */}
                                {filterCategory === "Sunday" && (
                                    <div
                                        className="flex flex-col gap-2 pt-3 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 w-full overflow-hidden">
                                        <div className="w-full overflow-x-auto no-scrollbar">
                                            <div className="flex items-center gap-2 px-1 pb-1 w-max min-w-full">
                                                <span
                                                    className="text-[9px] font-bold uppercase tracking-widest text-gray-400 shrink-0 mr-1">Type:</span>
                                                {["All", "Thanksgiving", "General/Last Sunday", "Men", "Women", "Youth"].map((subTab) => (
                                                    <button key={subTab} onClick={() => {
                                                        setSundayHostFilter(subTab as any);
                                                        if (subTab === "Thanksgiving") setSundayServiceFilter("All Services");
                                                    }}
                                                            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold transition-all shrink-0 ${sundayHostFilter === subTab ? "bg-amber-100 text-amber-700" : "bg-white text-gray-500 border border-gray-200"}`}>
                                                        {subTab === "General/Last Sunday" ? "General Sunday" : subTab}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        {sundayHostFilter !== "Thanksgiving" && (
                                            <div className="w-full overflow-x-auto no-scrollbar animate-in fade-in">
                                                <div className="flex items-center gap-2 px-1 pb-1 w-max min-w-full">
                                                    <span
                                                        className="text-[9px] font-bold uppercase tracking-widest text-gray-400 shrink-0 mr-1">Service:</span>
                                                    {["All Services", "First Service", "Second Service"].map((serviceTab) => (
                                                        <button key={serviceTab}
                                                                onClick={() => setSundayServiceFilter(serviceTab as any)}
                                                                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold transition-all shrink-0 ${sundayServiceFilter === serviceTab ? "bg-blue-100 text-blue-700" : "bg-white text-gray-500 border border-gray-200"}`}>
                                                            {serviceTab}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Monthly Sub-filters */}
                                {filterCategory === "Monthly" && monthlyServiceNames.length > 1 && (
                                    <div
                                        className="pt-3 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 w-full overflow-hidden">
                                        <div className="w-full overflow-x-auto no-scrollbar">
                                            <div className="flex items-center gap-2 px-1 pb-1 w-max min-w-full">
                                                <span
                                                    className="text-[9px] font-bold uppercase tracking-widest text-gray-400 shrink-0 mr-1">Event:</span>
                                                {monthlyServiceNames.map((name) => (
                                                    <button key={name} onClick={() => setMonthlyFilter(name)}
                                                            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold transition-all shrink-0 ${monthlyFilter === name ? "bg-blue-100 text-blue-700" : "bg-white text-gray-500 border border-gray-200"}`}>
                                                        {name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Special Sub-filters */}
                                {filterCategory === "Special" && specialServiceNames.length > 1 && (
                                    <div
                                        className="pt-3 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 w-full overflow-hidden">
                                        <div className="w-full overflow-x-auto no-scrollbar">
                                            <div className="flex items-center gap-2 px-1 pb-1 w-max min-w-full">
                                                <span
                                                    className="text-[9px] font-bold uppercase tracking-widest text-gray-400 shrink-0 mr-1">Event:</span>
                                                {specialServiceNames.map((name) => (
                                                    <button key={name} onClick={() => setSpecialFilter(name)}
                                                            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold transition-all shrink-0 ${specialFilter === name ? "bg-purple-100 text-purple-700" : "bg-white text-gray-500 border border-gray-200"}`}>
                                                        {name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* JUMP FILTERS */}
                            <div
                                className="flex flex-wrap items-center justify-end gap-2 md:gap-3 pt-4 mt-2 border-t border-gray-100 w-full">
                                <span
                                    className="text-[10px] font-bold uppercase tracking-widest text-gray-400 shrink-0">Jump To:</span>
                                <div className="flex gap-2 flex-1 sm:flex-none justify-end">
                                    <select value={jumpMonth} onChange={(e) => setJumpMonth(e.target.value)}
                                            className="bg-slate-50 border border-gray-200 text-brand-primary text-[10px] md:text-xs font-bold rounded-lg px-2 md:px-3 py-1.5 outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer w-1/2 sm:w-auto">
                                        <option value="All">All Months</option>
                                        {availableMonths.filter(m => m !== "All").map(m => <option key={m}
                                                                                                   value={m}>{m}</option>)}
                                    </select>
                                    <select value={jumpYear} onChange={(e) => setJumpYear(e.target.value)}
                                            className="bg-slate-50 border border-gray-200 text-brand-primary text-[10px] md:text-xs font-bold rounded-lg px-2 md:px-3 py-1.5 outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer w-1/2 sm:w-auto">
                                        <option value="All">All Years</option>
                                        {availableYears.filter(y => y !== "All").map(y => <option key={y}
                                                                                                  value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* TIMELINE ARCHIVE GRID */}
                    <section className="max-w-7xl mx-auto px-4 md:px-6 mb-24 w-full">
                        {Object.keys(groupedGalleries).length > 0 ? (
                            <div className="space-y-12 md:space-y-16">
                                {Object.keys(groupedGalleries).sort((a, b) => b.localeCompare(a)).map((year) => {

                                    const totalYearAlbums = Object.values(groupedGalleries[year]).reduce((total: number, monthArr: any) => total + monthArr.length, 0);

                                    return (
                                        <div key={year} className="flex flex-col w-full">
                                            {/* YEAR HEADER */}
                                            <button type="button" onClick={(e) => toggleYear(e, year)}
                                                    className="flex items-center justify-between w-full text-left pb-2 mb-6 border-b-[3px] border-brand-primary/20 group hover:border-brand-primary transition-colors cursor-pointer">
                                                <div className="flex flex-wrap items-center gap-3 md:gap-4 flex-1">
                                                    <h2 className="text-3xl md:text-5xl font-serif font-black text-brand-primary group-hover:text-amber-600 transition-colors m-0">{year}</h2>
                                                    <span
                                                        className="bg-brand-primary/10 text-brand-primary text-[10px] md:text-xs px-3 py-1 rounded-full font-bold font-sans tracking-widest uppercase mt-1 md:mt-2">
                                                        {totalYearAlbums} {totalYearAlbums === 1 ? 'Album' : 'Albums'}
                                                    </span>
                                                </div>
                                                <div
                                                    className="w-10 h-10 rounded-full bg-brand-primary/5 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all shrink-0 ml-4">
                                                    {isYearExpanded(year) ? <ChevronUp size={24}/> :
                                                        <ChevronDown size={24}/>}
                                                </div>
                                            </button>

                                            {/* MONTHS WITHIN YEAR */}
                                            {isYearExpanded(year) && (
                                                <div
                                                    className="space-y-8 pl-0 md:pl-4 animate-in slide-in-from-top-4 fade-in duration-300 w-full">
                                                    {Object.keys(groupedGalleries[year])
                                                        .sort((a, b) => {
                                                            const m = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                                                            return m.indexOf(b) - m.indexOf(a);
                                                        })
                                                        .map((month) => {
                                                            const monthKey = `${year}-${month}`;
                                                            const monthAlbums = groupedGalleries[year][month];

                                                            return (
                                                                <div key={monthKey}
                                                                     className="flex flex-col bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm w-full overflow-hidden">
                                                                    <button type="button"
                                                                            onClick={(e) => toggleMonth(e, monthKey)}
                                                                            className="flex items-center justify-between w-full text-left pb-4 border-b border-gray-100 group cursor-pointer">
                                                                        <div className="flex items-center gap-3 flex-1">
                                                                            <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-800 group-hover:text-brand-primary transition-colors m-0">{month}</h3>
                                                                            <span
                                                                                className="bg-gray-100 text-gray-500 text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-bold font-sans self-center mt-1">
                                                                                {monthAlbums.length}
                                                                            </span>
                                                                        </div>
                                                                        <div
                                                                            className="text-gray-400 group-hover:text-brand-primary transition-colors shrink-0 ml-4">
                                                                            {isMonthExpanded(monthKey) ?
                                                                                <ChevronUp size={20}/> :
                                                                                <ChevronDown size={20}/>}
                                                                        </div>
                                                                    </button>

                                                                    {/* ALBUM CARDS */}
                                                                    {isMonthExpanded(monthKey) && (
                                                                        <div
                                                                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-6 animate-in slide-in-from-top-2 fade-in duration-300 w-full">
                                                                            {monthAlbums.map((album: any) => {
                                                                                const cover = getAlbumCover(album.media_urls);
                                                                                const fileCount = album.media_urls ? album.media_urls.length : 0;

                                                                                return (
                                                                                    <Link key={album.id}
                                                                                          href={`/gallery/${album.id}`}
                                                                                          className="bg-slate-50 rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100 group cursor-pointer hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-300 flex flex-col hover:shadow-lg w-full">

                                                                                        {/* Album Cover */}
                                                                                        <div
                                                                                            className="h-48 relative overflow-hidden bg-slate-900 w-full">
                                                                                            <div
                                                                                                className="absolute inset-0 bg-brand-primary/20 group-hover:bg-brand-primary/40 transition-colors z-10 duration-300"></div>

                                                                                            {cover?.type === 'video' ? (
                                                                                                <video src={cover.url}
                                                                                                       className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700"
                                                                                                       muted
                                                                                                       playsInline/>
                                                                                            ) : (
                                                                                                <img
                                                                                                    src={cover?.url || "https://hegyctrfwn.ufs.sh/f/iMcVGeeTb1N4go9KLrcAQBW5E03lrCpOqKzJIRZUnG9sLDHa"}
                                                                                                    alt={album.title}
                                                                                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700"/>
                                                                                            )}

                                                                                            {/* Count Badge Overlay */}
                                                                                            <div
                                                                                                className="absolute bottom-3 right-3 z-20 bg-black/60 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1.5 text-white text-[10px] font-bold border border-white/20">
                                                                                                <Camera
                                                                                                    size={12}/> {fileCount}
                                                                                            </div>
                                                                                        </div>

                                                                                        <div
                                                                                            className="p-4 md:p-5 flex flex-col flex-grow w-full overflow-hidden">
                                                                                            <div
                                                                                                className="flex flex-wrap gap-1.5 mb-2">
                                                                                                <span
                                                                                                    className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shrink-0 ${album.service_category === "Weekly" ? "bg-purple-100 text-purple-700" : album.service_category === "Monthly" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                                                                                                    {getBadge(album)}
                                                                                                </span>
                                                                                                {album.is_multi_day && album.day_identifier && (
                                                                                                    <span
                                                                                                        className="text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-gray-200 text-gray-600 shrink-0">
                                                                                                        {album.day_identifier}
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>

                                                                                            <h3 className="text-base md:text-lg font-serif font-black text-brand-primary mb-2 line-clamp-2 leading-tight group-hover:text-amber-600 transition-colors break-words">
                                                                                                {album.title}
                                                                                            </h3>

                                                                                            <div
                                                                                                className="mt-auto flex items-center justify-between text-[10px] md:text-xs text-gray-500 font-medium pt-2">
                                                                                                <span
                                                                                                    className="flex items-center gap-1"><Calendar
                                                                                                    size={12}
                                                                                                    className="text-gray-400 shrink-0"/> {new Date(album.service_date).toLocaleDateString('en-GB')}</span>
                                                                                                <span
                                                                                                    className="text-amber-600 font-bold group-hover:underline">Open Album</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </Link>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div
                                className="py-20 text-center bg-white rounded-[2rem] md:rounded-[3rem] border border-gray-100 shadow-sm mx-4 md:mx-0">
                                <ImageIcon size={48} className="mx-auto text-gray-300 mb-4"/>
                                <h3 className="text-xl md:text-2xl font-bold text-brand-primary mb-2">No albums
                                    found</h3>
                                <p className="text-sm md:text-base text-gray-500 px-4">Try adjusting your search or
                                    filters to find what you're looking for.</p>
                                <button onClick={() => {
                                    setSearchQuery("");
                                    setFilterCategory("All");
                                    setJumpYear("All");
                                    setJumpMonth("All");
                                }} className="mt-6 text-sm font-bold text-amber-600 hover:text-amber-700 underline">
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </section>

                    {/* SOCIAL MEDIA PROMO */}
                    <section className="max-w-7xl mx-auto px-4 md:px-6 mb-24">
                        <div
                            className="bg-brand-primary rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-10 relative overflow-hidden shadow-2xl">
                            {/* Background Watermark Icon */}
                            <Smartphone size={150}
                                        className="absolute -right-5 -bottom-5 md:-right-10 md:-bottom-10 text-white/5 pointer-events-none md:w-[200px] md:h-[200px]"/>

                            <div className="relative z-10 max-w-xl text-center lg:text-left">
                                <h2 className="text-2xl md:text-4xl font-serif font-black text-white mb-3 md:mb-4">Want
                                    to see more?</h2>
                                <p className="text-slate-300 leading-relaxed text-sm md:text-lg">
                                    Join our digital community! Follow us across our social platforms for daily updates,
                                    behind-the-scenes moments, and hundreds of extra photos.
                                </p>
                            </div>

                            <div
                                className="relative z-10 flex flex-col sm:flex-row flex-wrap justify-center lg:justify-end gap-3 md:gap-4 w-full lg:w-auto">

                                {/* Instagram */}
                                <a href={CHURCH_INFO.socialMedia.instagram} target="_blank" rel="noreferrer"
                                   className="flex flex-1 sm:flex-none items-center justify-center gap-2 md:gap-3 bg-white text-brand-primary px-6 md:px-8 py-3 md:py-4 rounded-xl text-sm md:text-base font-bold hover:bg-[#E1306C] hover:text-white transition-all shadow-lg group">
                                    <InstagramIcon size={18}
                                                   className="group-hover:scale-110 transition-transform"/> Instagram
                                </a>

                                {/* Facebook */}
                                <a href={CHURCH_INFO.socialMedia.facebook} target="_blank" rel="noreferrer"
                                   className="flex flex-1 sm:flex-none items-center justify-center gap-2 md:gap-3 bg-white/10 text-white border border-white/20 px-6 md:px-8 py-3 md:py-4 rounded-xl text-sm md:text-base font-bold hover:bg-[#1877F2] hover:text-white transition-all backdrop-blur-sm group">
                                    <FacebookIcon size={18}
                                                  className="group-hover:scale-110 transition-transform"/> Facebook
                                </a>

                                {/* Twitter / X */}
                                <a href={CHURCH_INFO.socialMedia.twitter} target="_blank" rel="noreferrer"
                                   className="flex flex-1 sm:flex-none w-full sm:w-auto items-center justify-center gap-2 md:gap-3 bg-white text-brand-primary px-6 md:px-8 py-3 md:py-4 rounded-xl text-sm md:text-base font-bold hover:bg-slate-900 hover:text-white transition-all shadow-lg group">
                                    <TwitterIcon size={18} className="group-hover:scale-110 transition-transform"/> X
                                    (Twitter)
                                </a>

                            </div>
                        </div>
                    </section>
                </>
            )}

            {/* SCROLL TO TOP BUTTON */}
            <div
                className={`fixed bottom-8 left-4 md:left-8 z-40 flex flex-col items-center gap-2 transition-all duration-300 transform ${showTopBtn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}>
                <button onClick={scrollToTop}
                        className="p-2 md:p-2 bg-brand-primary text-white rounded-full shadow-2xl hover:bg-amber-600 hover:-translate-y-1 transition-all flex items-center justify-center">
                    <ChevronUp size={20}/>
                </button>
                <span
                    className="hidden md:block text-[9px] font-black uppercase tracking-widest text-brand-primary bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm border border-brand-accent">
                    Back to Top
                </span>
            </div>
        </div>
    );
}