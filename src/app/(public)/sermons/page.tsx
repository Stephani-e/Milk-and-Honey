"use client";
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
    Play, Search, Calendar, User,
    BookOpen, Headphones, ArrowRight, PlayCircle, Loader2, ChevronDown, ChevronUp
} from "lucide-react";

export default function SermonsPage() {
    const [sermons, setSermons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState<"All" | "Sunday" | "Tuesday" | "Thursday" | "Monthly" | "Special">("All");

    // Sub-filter states
    const [sundayHostFilter, setSundayHostFilter] = useState<"All" | "Thanksgiving" | "General/Last Sunday" | "Men" | "Women" | "Youth">("All");
    const [sundayServiceFilter, setSundayServiceFilter] = useState<"All Services" | "First Service" | "Second Service">("All Services");
    const [monthlyFilter, setMonthlyFilter] = useState<string>("All");
    const [specialFilter, setSpecialFilter] = useState<string>("All");

    // Accordion State for Year and Month timeline
    const [expandedYears, setExpandedYears] = useState<string[]>([]);
    const [expandedMonths, setExpandedMonths] = useState<string[]>([]);

    // Quick Jump Filters
    const [jumpYear, setJumpYear] = useState<string>("All");
    const [jumpMonth, setJumpMonth] = useState<string>("All");

    useEffect(() => {
        fetchPublicSermons();
    }, []);

    async function fetchPublicSermons() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("sermons")
                .select("*")
                .eq("status", "published")
                .eq("is_archived", false)
                .is("deleted_at", null)
                .order("service_date", { ascending: false });

            if (error) throw error;
            if (data) {
                setSermons(data);
                // Auto-expand the most recent year and month by default
                if (data.length > 0) {
                    const firstDate = new Date(data[0].service_date);
                    if (!isNaN(firstDate.getTime())) {
                        const firstYear = firstDate.getFullYear().toString();
                        const firstMonthKey = `${firstYear}-${firstDate.toLocaleString('default', { month: 'long' })}`;

                        setExpandedYears([firstYear]);
                        setExpandedMonths([firstMonthKey]);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching public sermons:", error);
        } finally {
            setLoading(false);
        }
    }

    // Extract unique names for dynamic sub-filters
    const monthlyServiceNames = useMemo(() => {
        const names = sermons.filter(s => s.service_category === "Monthly" && s.special_service_name).map(s => s.special_service_name);
        return ["All", ...Array.from(new Set(names))];
    }, [sermons]);

    const specialServiceNames = useMemo(() => {
        const names = sermons.filter(s => s.service_category === "Special" && s.special_service_name).map(s => s.special_service_name);
        return ["All", ...Array.from(new Set(names))];
    }, [sermons]);

    // Extract available years and months for the Jump Dropdowns
    const availableYears = useMemo(() => {
        const years = sermons.map(s => new Date(s.service_date).getFullYear().toString()).filter(y => y !== "NaN");
        return ["All", ...Array.from(new Set(years))].sort((a, b) => b.localeCompare(a));
    }, [sermons]);

    const availableMonths = useMemo(() => {
        const months = sermons.map(s => new Date(s.service_date).toLocaleString('default', { month: 'long' })).filter(m => m !== "Invalid Date");
        const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return ["All", ...Array.from(new Set(months))].sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
    }, [sermons]);

    // Dynamic filtering
    const filteredSermons = sermons.filter(sermon => {
        const safeTitle = sermon.title || "";
        const safePreacher = sermon.preacher || "";

        const matchesSearch =
            safeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            safePreacher.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesCategory = true;

        if (filterCategory === "Sunday") {
            matchesCategory = sermon.service_category === "Weekly" && sermon.weekly_type === "Sunday";
            if (matchesCategory) {
                if (sundayHostFilter === "Thanksgiving") {
                    matchesCategory = sermon.is_thanksgiving === true;
                } else if (sundayHostFilter !== "All") {
                    matchesCategory = sermon.is_thanksgiving === false && sermon.host === sundayHostFilter;
                }
                if (matchesCategory && sundayHostFilter !== "Thanksgiving" && sundayServiceFilter !== "All Services") {
                    matchesCategory = sermon.service_number === sundayServiceFilter;
                }
            }
        } else if (filterCategory === "Tuesday") {
            matchesCategory = sermon.service_category === "Weekly" && sermon.weekly_type === "Tuesday";
        } else if (filterCategory === "Thursday") {
            matchesCategory = sermon.service_category === "Weekly" && sermon.weekly_type === "Thursday";
        } else if (filterCategory === "Monthly") {
            matchesCategory = sermon.service_category === "Monthly";
            if (matchesCategory && monthlyFilter !== "All") {
                matchesCategory = sermon.special_service_name === monthlyFilter;
            }
        } else if (filterCategory === "Special") {
            matchesCategory = sermon.service_category === "Special";
            if (matchesCategory && specialFilter !== "All") {
                matchesCategory = sermon.special_service_name === specialFilter;
            }
        }

        return matchesSearch && matchesCategory;
    });

    // Grouping logic (Year -> Month)
    const groupedSermons = useMemo(() => {
        let toGroup = filteredSermons;

        // Apply Jump Filters
        if (jumpYear !== "All") {
            toGroup = toGroup.filter(s => new Date(s.service_date).getFullYear().toString() === jumpYear);
        }
        if (jumpMonth !== "All") {
            toGroup = toGroup.filter(s => new Date(s.service_date).toLocaleString('default', { month: 'long' }) === jumpMonth);
        }

        return toGroup.reduce((acc: any, sermon: any) => {
            const date = new Date(sermon.service_date);
            if (isNaN(date.getTime())) return acc; // Skip invalid dates

            const year = date.getFullYear().toString();
            const month = date.toLocaleString('default', { month: 'long' });

            if (!acc[year]) acc[year] = {};
            if (!acc[year][month]) acc[year][month] = [];

            acc[year][month].push(sermon);
            return acc;
        }, {});
    }, [filteredSermons, jumpYear, jumpMonth]);

    // Accordion Toggle Handlers
// Accordion Toggle Handlers (Updated to prevent bubbling)
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

    // If there is an active search or jump filter, force expand to reveal findings
    const isYearExpanded = (year: string) => {
        if (searchQuery.trim() !== "" || jumpYear !== "All" || filterCategory !== "All") return true;
        return expandedYears.includes(year);
    };

    const isMonthExpanded = (monthKey: string) => {
        if (searchQuery.trim() !== "" || jumpMonth !== "All" || filterCategory !== "All") return true;
        return expandedMonths.includes(monthKey);
    };

    const featuredSermon = sermons.find(s => s.service_category === "Weekly" && s.weekly_type === "Sunday" && s.youtube_url) || sermons[0];

    const getSermonBadge = (sermon: any) => {
        if (sermon.service_category === "Weekly") {
            if (sermon.weekly_type === "Sunday") {
                if (sermon.is_thanksgiving) return "Thanksgiving";
                if (sermon.service_number) return `Sunday • ${sermon.service_number}`;
                return "Sunday Service";
            }
            if (sermon.weekly_type === "Tuesday") return "Digging Deep";
            if (sermon.weekly_type === "Thursday") return "Faith Clinic";
            return sermon.weekly_type;
        } else if (sermon.service_category === "Monthly") {
            return sermon.special_service_name || "Monthly Service";
        } else {
            return `Special Event`;
        }
    };

    const getThumbnail = (sermon: any) => {
        if (sermon?.banner_url) return sermon.banner_url;
        if (sermon?.youtube_url) {
            const videoIdMatch = sermon.youtube_url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
            if (videoIdMatch && videoIdMatch[1]) return `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
        }
        return "https://hegyctrfwn.ufs.sh/f/iMcVGeeTb1N4go9KLrcAQBW5E03lrCpOqKzJIRZUnG9sLDHa";
    };

    return (
        <div className="flex flex-col bg-slate-50 min-h-screen pb-24">

            {/* HERO SECTION */}
            <section className="relative py-16 md:py-20 bg-brand-primary overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-center">
                    <span className="text-amber-400 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 block">
                        Media Library
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif font-black text-white leading-tight mb-4">
                        Experience the Word.
                    </h1>
                    <p className="text-slate-300 text-sm md:text-lg max-w-2xl mx-auto">
                        Watch recent messages, explore past series, and let the undiluted word of God transform your life.
                    </p>
                </div>
            </section>

            {loading ? (
                <div className="py-32 flex flex-col items-center justify-center text-brand-primary">
                    <Loader2 size={48} className="animate-spin mb-4" />
                    <p className="font-bold tracking-widest uppercase text-xs">Loading Library...</p>
                </div>
            ) : (
                <>
                    {/* FEATURED MESSAGE */}
                    {featuredSermon && (
                        <section className="max-w-7xl mx-auto px-4 md:px-6 -mt-8 md:-mt-10 relative z-20 mb-12">
                            <a href={featuredSermon.youtube_url || "#"} target="_blank" rel="noreferrer" className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col lg:flex-row group cursor-pointer block">
                                <div className="w-full lg:w-3/5 h-56 md:h-96 relative overflow-hidden bg-slate-900">
                                    <div className="absolute inset-0 bg-brand-primary/20 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
                                    <img src={getThumbnail(featuredSermon)} alt={featuredSermon.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-primary/90 backdrop-blur-md rounded-full flex items-center justify-center text-white group-hover:bg-amber-500 group-hover:scale-110 transition-all shadow-2xl">
                                            <Play size={28} className="ml-1.5 md:ml-2 md:w-8 md:h-8" fill="currentColor" />
                                        </div>
                                    </div>
                                    <span className="absolute top-4 left-4 md:top-6 md:left-6 z-20 bg-amber-500 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 md:px-4 py-1.5 rounded-full shadow-lg">Latest Message</span>
                                </div>
                                <div className="w-full lg:w-2/5 p-6 md:p-12 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 text-amber-600 mb-3 md:mb-4 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                                        <BookOpen size={16} /> {getSermonBadge(featuredSermon)}
                                    </div>
                                    <h2 className="text-2xl md:text-4xl font-serif font-black text-brand-primary mb-4 leading-tight group-hover:text-amber-600 transition-colors">
                                        {featuredSermon.title}
                                    </h2>
                                    <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                                        <p className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-500 font-medium"><User size={16} className="text-gray-400" /> {featuredSermon.preacher}</p>
                                        <p className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-500 font-medium"><Calendar size={16} className="text-gray-400" /> {new Date(featuredSermon.service_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs md:text-sm font-black uppercase tracking-widest text-brand-primary group-hover:text-amber-600 transition-colors">Watch Now <ArrowRight size={16} /></div>
                                </div>
                            </a>
                        </section>
                    )}

                    {/* SEARCH & FILTER BAR */}
                    <section className="max-w-7xl mx-auto px-4 md:px-6 mb-10">
                        <div className={`bg-white p-3 md:p-4 shadow-lg border border-gray-100 flex flex-col relative z-30 transition-all duration-300 ${filterCategory === 'Sunday' || filterCategory === 'Monthly' || filterCategory === 'Special'}`}>

                            <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center w-full">
                                <div className="flex overflow-x-auto no-scrollbar w-full md:w-auto gap-2 md:pl-2 pb-1 md:pb-0">
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
                                <div className="hidden md:block w-[1px] h-8 bg-gray-200 mx-1"></div>
                                <div className="flex-1 w-full relative flex items-center">
                                    <Search className="absolute left-4 text-gray-400" size={18} />
                                    <input type="text" placeholder="Search title or preacher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-2 bg-slate-50 md:bg-transparent rounded-full md:rounded-none border-none focus:ring-0 text-brand-primary font-bold placeholder-gray-400 outline-none text-sm" />
                                </div>
                            </div>

                            {/* SUB-FILTERS */}
                            <div className="flex flex-col gap-2 mt-1">

                                {/* Sunday Sub-filters */}
                                {filterCategory === "Sunday" && (
                                    <div className="flex flex-col gap-2 pt-2 md:pt-3 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center overflow-x-auto no-scrollbar gap-2 px-1">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 shrink-0 mr-1">Type:</span>
                                            {["All", "Thanksgiving", "General/Last Sunday", "Men", "Women", "Youth"].map((subTab) => (
                                                <button key={subTab} onClick={() => { setSundayHostFilter(subTab as any); if (subTab === "Thanksgiving") setSundayServiceFilter("All Services"); }} className={`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold transition-all ${sundayHostFilter === subTab ? "bg-amber-100 text-amber-700" : "bg-white text-gray-500 border border-gray-200"}`}>
                                                    {subTab === "General/Last Sunday" ? "General Sunday" : subTab}
                                                </button>
                                            ))}
                                        </div>
                                        {sundayHostFilter !== "Thanksgiving" && (
                                            <div className="flex items-center overflow-x-auto no-scrollbar gap-2 px-1 animate-in fade-in">
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 shrink-0 mr-1">Service:</span>
                                                {["All Services", "First Service", "Second Service"].map((serviceTab) => (
                                                    <button key={serviceTab} onClick={() => setSundayServiceFilter(serviceTab as any)} className={`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold transition-all ${sundayServiceFilter === serviceTab ? "bg-blue-100 text-blue-700" : "bg-white text-gray-500 border border-gray-200"}`}>
                                                        {serviceTab}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Monthly Sub-filters */}
                                {filterCategory === "Monthly" && monthlyServiceNames.length > 1 && (
                                    <div className="flex items-center overflow-x-auto no-scrollbar gap-2 px-1 pt-2 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 shrink-0 mr-1">Event:</span>
                                        {monthlyServiceNames.map((name) => (
                                            <button key={name} onClick={() => setMonthlyFilter(name)} className={`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold transition-all ${monthlyFilter === name ? "bg-blue-100 text-blue-700" : "bg-white text-gray-500 border border-gray-200"}`}>
                                                {name}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Special Sub-filters */}
                                {filterCategory === "Special" && specialServiceNames.length > 1 && (
                                    <div className="flex items-center overflow-x-auto no-scrollbar gap-2 px-1 pt-2 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 shrink-0 mr-1">Event:</span>
                                        {specialServiceNames.map((name) => (
                                            <button key={name} onClick={() => setSpecialFilter(name)} className={`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold transition-all ${specialFilter === name ? "bg-purple-100 text-purple-700" : "bg-white text-gray-500 border border-gray-200"}`}>
                                                {name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* JUMP FILTERS (Date Selection) */}
                            <div className="flex items-center gap-3 pt-4 mt-2 border-t border-gray-100 justify-end w-full">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Jump To Date:</span>
                                <select
                                    value={jumpMonth}
                                    onChange={(e) => setJumpMonth(e.target.value)}
                                    className="bg-slate-50 border border-gray-200 text-brand-primary text-[10px] md:text-xs font-bold rounded-lg px-2 md:px-3 py-1.5 outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
                                >
                                    <option value="All">All Months</option>
                                    {availableMonths.filter(m => m !== "All").map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <select
                                    value={jumpYear}
                                    onChange={(e) => setJumpYear(e.target.value)}
                                    className="bg-slate-50 border border-gray-200 text-brand-primary text-[10px] md:text-xs font-bold rounded-lg px-2 md:px-3 py-1.5 outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
                                >
                                    <option value="All">All Years</option>
                                    {availableYears.filter(y => y !== "All").map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* TIMELINE ARCHIVE GRID */}
                    <section className="max-w-7xl mx-auto px-4 md:px-6 mb-24 w-full">
                        {Object.keys(groupedSermons).length > 0 ? (
                            <div className="space-y-12 md:space-y-16">
                                {Object.keys(groupedSermons).sort((a, b) => b.localeCompare(a)).map((year) => {

                                    // Calculate total messages in this year for the badge
                                    const totalYearMessages = Object.values(groupedSermons[year]).reduce((total: number, monthArr: any) => total + monthArr.length, 0);

                                    return (
                                        <div key={year} className="flex flex-col w-full">

                                            {/* YEAR HEADER */}
                                            <button
                                                type="button"
                                                onClick={(e) => toggleYear(e, year)}
                                                className="flex items-center justify-between w-full text-left pb-2 mb-6 border-b-[3px] border-brand-primary/20 group hover:border-brand-primary transition-colors cursor-pointer"
                                            >
                                                {/* Wrapping the text in flex-1 forces it to stay permanently on the left */}
                                                <div className="flex flex-wrap items-center gap-3 md:gap-4 flex-1">
                                                    <h2 className="text-3xl md:text-5xl font-serif font-black text-brand-primary group-hover:text-amber-600 transition-colors m-0">
                                                        {year}
                                                    </h2>
                                                    <span className="bg-brand-primary/10 text-brand-primary text-[10px] md:text-xs px-3 py-1 rounded-full font-bold font-sans tracking-widest uppercase mt-1 md:mt-2">
                                                    {totalYearMessages} {totalYearMessages === 1 ? 'Message' : 'Messages'}
                                                </span>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-brand-primary/5 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all shrink-0 ml-4">
                                                    {isYearExpanded(year) ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                                </div>
                                            </button>

                                            {/* MONTHS WITHIN THE YEAR */}
                                            {isYearExpanded(year) && (
                                                <div className="space-y-8 pl-0 md:pl-4 animate-in slide-in-from-top-4 fade-in duration-300 w-full">

                                                    {/* Maintain chronological sorting for months */}
                                                    {Object.keys(groupedSermons[year])
                                                        .sort((a, b) => {
                                                            const m = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                                                            return m.indexOf(b) - m.indexOf(a); // Sort descending
                                                        })
                                                        .map((month) => {
                                                            const monthKey = `${year}-${month}`;
                                                            const monthMessages = groupedSermons[year][month];

                                                            return (
                                                                <div key={monthKey} className="flex flex-col bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm w-full">

                                                                    {/* MONTH HEADER */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => toggleMonth(e, monthKey)}
                                                                        className="flex items-center justify-between w-full text-left pb-4 border-b border-gray-100 group cursor-pointer"
                                                                    >
                                                                        <div className="flex items-center gap-3 flex-1">
                                                                            <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-800 group-hover:text-brand-primary transition-colors m-0">
                                                                                {month}
                                                                            </h3>
                                                                            <span className="bg-gray-100 text-gray-500 text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-bold font-sans self-center mt-1">
                                                                        {monthMessages.length}
                                                                    </span>
                                                                        </div>
                                                                        <div className="text-gray-400 group-hover:text-brand-primary transition-colors shrink-0 ml-4">
                                                                            {isMonthExpanded(monthKey) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                                        </div>
                                                                    </button>

                                                                    {/* SERMON CARDS FOR THIS MONTH */}
                                                                    {isMonthExpanded(monthKey) && (
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-6 animate-in slide-in-from-top-2 fade-in duration-300 w-full">
                                                                            {monthMessages.map((sermon: any) => (
                                                                                <a key={sermon.id} href={sermon.youtube_url || "#"} target="_blank" rel="noreferrer" className="bg-slate-50 rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100 group cursor-pointer hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-300 flex flex-col hover:shadow-lg">
                                                                                    <div className="h-40 relative overflow-hidden bg-slate-900">
                                                                                        <div className="absolute inset-0 bg-brand-primary/20 group-hover:bg-brand-primary/40 transition-colors z-10 duration-300"></div>
                                                                                        <img src={getThumbnail(sermon)} alt={sermon.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700" />
                                                                                        {sermon.youtube_url && (
                                                                                            <div className="absolute bottom-3 left-3 z-20 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 group-hover:bg-amber-500 group-hover:border-amber-500 transition-colors">
                                                                                                <Play size={14} fill="currentColor" className="ml-0.5" />
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="p-4 md:p-5 flex flex-col flex-grow">
                                                                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                                                                    <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${sermon.service_category === "Weekly" ? "bg-purple-100 text-purple-700" : sermon.service_category === "Monthly" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                                                                                        {getSermonBadge(sermon)}
                                                                                    </span>
                                                                                            {sermon.is_multi_day && sermon.day_identifier && (
                                                                                                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-gray-200 text-gray-600">
                                                                                            {sermon.day_identifier}
                                                                                        </span>
                                                                                            )}
                                                                                            {sermon.service_category === "Weekly" && sermon.weekly_type === "Sunday" && sermon.host && sermon.host !== "General/Last Sunday" && (
                                                                                                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                                                                                            {sermon.host}
                                                                                        </span>
                                                                                            )}
                                                                                        </div>
                                                                                        <h3 className="text-base md:text-lg font-serif font-black text-brand-primary mb-2 line-clamp-2 leading-tight group-hover:text-amber-600 transition-colors">
                                                                                            {sermon.title}
                                                                                        </h3>

                                                                                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-3">
                                                                                            {sermon.link_ig && <button onClick={(e) => { e.preventDefault(); window.open(sermon.link_ig, '_blank'); }} className="p-1.5 bg-pink-100 text-pink-700 rounded-md hover:bg-pink-200"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></button>}
                                                                                            {sermon.link_twitter && <button onClick={(e) => { e.preventDefault(); window.open(sermon.link_twitter, '_blank'); }} className="p-1.5 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l16 16"></path><path d="M4 20L20 4"></path></svg></button>}
                                                                                            {sermon.link_facebook && <button onClick={(e) => { e.preventDefault(); window.open(sermon.link_facebook, '_blank'); }} className="p-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></button>}
                                                                                            {(sermon.link_spotify || sermon.link_apple || sermon.link_ytmusic) && (
                                                                                                <div className="flex items-center gap-1.5 ml-1 pl-1.5 border-l border-gray-200">
                                                                                                    {sermon.link_spotify && <button onClick={(e) => { e.preventDefault(); window.open(sermon.link_spotify, '_blank'); }} className="text-green-600"><Headphones size={12}/></button>}
                                                                                                    {sermon.link_apple && <button onClick={(e) => { e.preventDefault(); window.open(sermon.link_apple, '_blank'); }} className="text-purple-600"><Headphones size={12}/></button>}
                                                                                                    {sermon.link_ytmusic && <button onClick={(e) => { e.preventDefault(); window.open(sermon.link_ytmusic, '_blank'); }} className="text-red-600"><Headphones size={12}/></button>}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>

                                                                                        <div className="mt-auto pt-3 border-t border-gray-200 flex items-center justify-between text-[10px] md:text-xs text-gray-500 font-medium">
                                                                                            <span className="flex items-center gap-1"><User size={12} className="text-gray-400"/> {sermon.preacher}</span>
                                                                                            <span>{new Date(sermon.service_date).toLocaleDateString('en-GB')}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </a>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            )}
                                        </div>
                                    )})}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-white rounded-[2rem] md:rounded-[3rem] border border-gray-100 shadow-sm mx-4 md:mx-0">
                                <PlayCircle size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl md:text-2xl font-bold text-brand-primary mb-2">No messages found</h3>
                                <p className="text-sm md:text-base text-gray-500 px-4">Try adjusting your search or filters to find what you're looking for.</p>
                                <button onClick={() => { setSearchQuery(""); setFilterCategory("All"); setSundayHostFilter("All"); setSundayServiceFilter("All Services"); setMonthlyFilter("All"); setSpecialFilter("All"); setJumpYear("All"); setJumpMonth("All"); }} className="mt-6 text-sm font-bold text-amber-600 hover:text-amber-700 underline">
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </section>

                    {/* AUDIO PROMO */}
                    <section className="max-w-7xl mx-auto px-4 md:px-6">
                        <div className="bg-brand-primary rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10 relative overflow-hidden shadow-2xl">
                            <Headphones size={150} className="absolute -right-5 -bottom-5 md:-right-10 md:-bottom-10 text-white/5 pointer-events-none md:w-[200px] md:h-[200px]" />
                            <div className="relative z-10 max-w-xl text-center md:text-left">
                                <h2 className="text-2xl md:text-4xl font-serif font-black text-white mb-3 md:mb-4">Listen on the Go.</h2>
                                <p className="text-slate-300 leading-relaxed text-sm md:text-lg">Take the word with you anywhere. All our Sunday messages and Bible studies are uploaded weekly to major audio platforms.</p>
                            </div>
                            <div className="relative z-10 flex flex-col sm:flex-row gap-3 md:gap-4 w-full md:w-auto">
                                <a href="https://spotify.com" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 md:gap-3 bg-white text-brand-primary px-6 md:px-8 py-3 md:py-4 rounded-xl text-sm md:text-base font-bold hover:bg-amber-400 transition-colors shadow-lg">Spotify</a>
                                <a href="https://apple.com/podcasts" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 md:gap-3 bg-white/10 text-white border border-white/20 px-6 md:px-8 py-3 md:py-4 rounded-xl text-sm md:text-base font-bold hover:bg-white/20 transition-colors backdrop-blur-sm">Apple Podcasts</a>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}