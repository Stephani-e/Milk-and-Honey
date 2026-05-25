"use client";
import React, {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";
import {useAuth} from "@/components/Admin/Admin Guard";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import ConfirmModal from "@/components/Admin/ConfirmModal";
import {
    AlertCircle,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Clock,
    Edit3,
    Eraser,
    Flame,
    ImageIcon,
    Info,
    LinkIcon,
    List,
    MapPin,
    MapPinX,
    Plus,
    Radio,
    RefreshCw,
    Star,
    Trash2,
    User
} from "lucide-react";
import {UploadButton} from "@/utils/uploadthing";
import AdminSkeletonLoader from "@/components/Admin/SkeletonLoader";

const SPECIAL_PAGE_SIZE = 11;

export default function EventsDashboardPage() {
    const router = useRouter();
    const {role} = useAuth();

    // TABS STATE
    const [activeTab, setActiveTab] = useState<"calendar" | "notices">("calendar");

    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewTrash, setViewTrash] = useState(false);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);

    // SPECIAL EVENTS PAGINATION STATE
    const [specialPage, setSpecialPage] = useState(1);

    // NOTICE STATES
    const [noticeMonthInput, setNoticeMonthInput] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    const formattedNoticeMonth = React.useMemo(() => {
        const [y, m] = noticeMonthInput.split('-');
        return new Date(parseInt(y), parseInt(m) - 1).toLocaleString('default', {month: 'long', year: 'numeric'});
    }, [noticeMonthInput]);

    const [noticeText, setNoticeText] = useState("");
    const [savingNotice, setSavingNotice] = useState(false);

    // ACTIVE NOTICES LIST STATES
    const [allNotices, setAllNotices] = useState<any[]>([]);
    const [loadingNotices, setLoadingNotices] = useState(false);

    // THEME STATES
    const [themeMonthInput, setThemeMonthInput] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    const formattedThemeMonth = React.useMemo(() => {
        const [y, m] = themeMonthInput.split('-');
        return new Date(parseInt(y), parseInt(m) - 1).toLocaleString('default', {month: 'long', year: 'numeric'});
    }, [themeMonthInput]);

    const [themeData, setThemeData] = useState({
        month: new Date().toLocaleString('default', {month: 'long', year: 'numeric'}),
        theme: "Walking in Dominion",
        scripture: "Genesis 1:26-28",
        is_convention_active: false,
        is_congress_active: false,
        theme_banner_url: "",
        takeover_title: "",
        takeover_theme: "",
        takeover_location: "Main Auditorium (Viewing Center)",
        takeover_start_date: "",
        takeover_end_date: "",
        takeover_official_location: "Redemption City of God",
        takeover_flyer_url: "",
        takeover_link: "",
        savingTheme: false,
    });

    const [modalType, setModalType] = useState<"delete" | "restore" | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        fetchEvents().catch(console.error);
    }, [viewTrash]);

    // Fetch Notice for the active editor
    useEffect(() => {
        fetchNotice().catch(console.error);
    }, [formattedNoticeMonth]);

    async function fetchNotice() {
        try {
            const {
                data,
                error
            } = await supabase.from('monthly_themes').select('special_notice').eq('month_year', formattedNoticeMonth).maybeSingle();
            if (error) console.error("Notice fetch error:", error.message);
            setNoticeText(data?.special_notice || "");
        } catch (err) {
            console.error("System error fetching notice:", err);
        }
    }

    // Fetch All Notices from the list below
    const fetchAllNotices = async () => {
        setLoadingNotices(true);
        try {
            const {data, error} = await supabase
                .from('monthly_themes')
                .select('id, month_year, special_notice')
                .not('special_notice', 'is', null)
                .neq('special_notice', '');

            if (error) console.error("Fetch all notices error:", error.message);
            setAllNotices(data || []);
        } catch (err) {
            console.error("System error fetching all notices:", err);
        } finally {
            setLoadingNotices(false);
        }
    };

    // Load active notices whenever the user switches to the Notices tab
    useEffect(() => {
        if (activeTab === "notices") fetchAllNotices().catch(console.error);
    }, [activeTab]);

    useEffect(() => {
        async function fetchTheme() {
            try {
                const {
                    data,
                    error
                } = await supabase.from('monthly_themes').select('*').eq('month_year', formattedThemeMonth).maybeSingle();

                if (error) console.error("Error fetching theme:", error.message);

                if (data) {
                    setThemeData({
                        month: data.month_year || new Date().toLocaleString('default', {
                            month: 'long',
                            year: 'numeric'
                        }),
                        theme: data.theme_title || "",
                        scripture: data.scripture || "",
                        is_convention_active: data.is_convention_active || false,
                        is_congress_active: data.is_congress_active || false,
                        // FIX: Default to empty string instead of boolean false
                        theme_banner_url: data.theme_banner_url || "",
                        takeover_title: data.takeover_title || "",
                        takeover_theme: data.takeover_theme || "",
                        takeover_start_date: data.takeover_start_date || "",
                        takeover_end_date: data.takeover_end_date || "",
                        takeover_official_location: data.takeover_official_location || "Redemption City of God",
                        takeover_location: data.takeover_location || "Main Auditorium (Viewing Center)",
                        takeover_flyer_url: data.takeover_flyer_url || "",
                        takeover_link: data.takeover_link || "",
                        savingTheme: false
                    });
                } else {
                    setThemeData({
                        theme: "",
                        scripture: "",
                        theme_banner_url: "",
                        is_convention_active: false,
                        is_congress_active: false,
                        takeover_title: "",
                        takeover_theme: "",
                        takeover_location: "Main Auditorium (Viewing Center)",
                        month: formattedThemeMonth,
                        takeover_start_date: "",
                        takeover_end_date: "",
                        takeover_official_location: "Redemption City of God",
                        takeover_flyer_url: "",
                        takeover_link: "",
                        savingTheme: false
                    });
                }
            } catch (err) {
                console.error("System error fetching theme:", err);
            }
        }

        fetchTheme().catch(console.error);
    }, [formattedThemeMonth]);

    async function fetchEvents() {
        setLoading(true);
        try {
            let query = supabase.from("church_events").select("*");
            if (viewTrash) query = query.not("deleted_at", "is", null);
            else query = query.is("deleted_at", null);
            query = query.order("created_at", {ascending: false});

            const {data, error} = await query;
            if (error) toast.error("Error loading events: " + error.message);
            else setEvents(data || []);
        } catch (err) {
            toast.error("System error loading events.");
        } finally {
            setLoading(false);
        }
    }

    const handleSaveNotice = async () => {
        setSavingNotice(true);
        try {
            const {data: existingRow} = await supabase.from('monthly_themes').select('id').eq('month_year', formattedNoticeMonth).maybeSingle();

            let error;
            if (existingRow) {
                const res = await supabase.from('monthly_themes').update({special_notice: noticeText}).eq('id', existingRow.id);
                error = res.error;
            } else {
                const {data: maxData} = await supabase.from('monthly_themes').select('id').order('id', {ascending: false}).limit(1).maybeSingle();
                const nextId = (maxData?.id || 0) + 1;
                const res = await supabase.from('monthly_themes').insert({
                    id: nextId,
                    month_year: formattedNoticeMonth,
                    special_notice: noticeText
                });
                error = res.error;
            }

            if (error) toast.error("Error saving notice: " + error.message);
            else {
                toast.success(noticeText ? `Notice saved for ${formattedNoticeMonth}!` : `Notice cleared for ${formattedNoticeMonth}!`);
                await fetchAllNotices();
            }
        } finally {
            setSavingNotice(false);
        }
    };

    const handleDeleteNotice = async (id: number) => {
        const {error} = await supabase.from('monthly_themes').update({special_notice: null}).eq('id', id);
        if (error) toast.error("Error deleting notice.");
        else {
            toast.success("Notice deleted.");
            await fetchAllNotices();
            await fetchNotice();
        }
    };

    const handleEditNotice = (monthYearStr: string) => {
        const d = new Date(monthYearStr);
        setNoticeMonthInput(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    const handleSaveTheme = async () => {
        setThemeData(prev => ({...prev, savingTheme: true}));

        try {
            const {data: existingRow} = await supabase.from('monthly_themes').select('id').eq('month_year', formattedThemeMonth).maybeSingle();

            const payload = {
                month_year: formattedThemeMonth,
                theme_title: themeData.theme,
                scripture: themeData.scripture,
                theme_banner_url: themeData.theme_banner_url,
                is_convention_active: themeData.is_convention_active,
                is_congress_active: themeData.is_congress_active,
                takeover_title: themeData.takeover_title,
                takeover_theme: themeData.takeover_theme,
                takeover_start_date: themeData.takeover_start_date,
                takeover_end_date: themeData.takeover_end_date,
                takeover_official_location: themeData.takeover_official_location,
                takeover_location: themeData.takeover_location,
                takeover_flyer_url: themeData.takeover_flyer_url,
                takeover_link: themeData.takeover_link
            };

            let error;
            if (existingRow) {
                const res = await supabase.from('monthly_themes').update(payload).eq('id', existingRow.id);
                error = res.error;
            } else {
                const {data: maxData} = await supabase.from('monthly_themes').select('id').order('id', {ascending: false}).limit(1).maybeSingle();
                const nextId = (maxData?.id || 0) + 1;
                const res = await supabase.from('monthly_themes').insert({id: nextId, ...payload});
                error = res.error;
            }

            if (error) toast.error("Error saving settings: " + error.message);
            else toast.success(`Settings saved for ${formattedThemeMonth}!`);
        } finally {
            setThemeData(prev => ({...prev, savingTheme: false}));
        }
    };

    const handleConfirmAction = async () => {
        if (!selectedEvent) return;
        if (modalType === "delete") {
            if (viewTrash) {
                await supabase.from("church_events").delete().eq("id", selectedEvent.id);
                toast.error("Event permanently deleted.");
            } else {
                await supabase.from("church_events").update({
                    deleted_at: new Date(),
                    is_active: false
                }).eq("id", selectedEvent.id);
                toast.success("Event moved to Trash.");
            }
        } else if (modalType === "restore") {
            await supabase.from("church_events").update({deleted_at: null, is_active: true}).eq("id", selectedEvent.id);
            toast.success("Event Restored.");
        }
        await fetchEvents();
        setModalType(null);
    };

    const updateTakeover = (key: string, value: any) => {
        setThemeData(prev => ({...prev, [key]: value}));
    };

    // Derived Event Lists
    const recurringEvents = events.filter(e => e.event_type === 'recurring');
    const specialEvents = events.filter(e => e.event_type === 'single_day' || e.event_type === 'multi_day');

    // Pagination for Special Events
    const totalSpecialPages = Math.ceil(specialEvents.length / SPECIAL_PAGE_SIZE);
    const paginatedSpecialEvents = specialEvents.slice((specialPage - 1) * SPECIAL_PAGE_SIZE, specialPage * SPECIAL_PAGE_SIZE);

    const translateRule = (ruleString: string) => {
        if (!ruleString) return "";
        const translations: Record<string, string> = {
            "first_sunday": "First Sunday of the Month",
            "first_thursday": "First Thursday of the Month",
            "first_friday": "First Friday of the Month",
            "thursday_before_first_friday": "Thursday before the First Friday (Holy Communion)",
            "last_friday": "Last Friday of the Month",
        };
        return translations[ruleString] || ruleString.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const renderExpandedDetails = (event: any) => {
        return (
            <div
                className="mt-4 pt-4 border-t border-gray-100 text-sm space-y-3 animate-in fade-in slide-in-from-top-2">
                {event.guest_speaker && (
                    <div className="flex items-center gap-2 text-purple-700 bg-purple-50 p-2 rounded-lg font-bold">
                        <User size={14}/> Guest: {event.guest_speaker}
                    </div>
                )}
                {event.theme && <p><span
                    className="font-bold text-gray-500 uppercase text-[10px] tracking-wider block">Theme</span>{event.theme}
                </p>}

                <div>
                    <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider block mb-1">Schedule Details</span>

                    {event.event_type === 'recurring' && event.recurrence_rules && (
                        <div className="bg-slate-50 p-3 rounded-xl text-xs font-mono text-slate-600">
                            {event.recurrence_rules.pattern_type === 'weekly' && event.recurrence_rules.day && (
                                <p>Every <span
                                    className="capitalize font-bold text-brand-primary">{event.recurrence_rules.day}</span>
                                </p>
                            )}
                            {event.recurrence_rules.pattern_type === 'monthly' && (
                                <p className="mt-1 font-bold text-brand-primary bg-brand-primary/5 p-1.5 rounded inline-block">
                                    Rule: {translateRule(event.recurrence_rules.rule)}
                                </p>
                            )}
                            {event.recurrence_rules.sessions ? (
                                <ul className="mt-2 space-y-1 list-disc list-inside">
                                    {event.recurrence_rules.sessions.map((s: any, i: number) => (
                                        <li key={i}>{s.name}: {s.start_time} - {s.end_time}</li>
                                    ))}
                                </ul>
                            ) : event.recurrence_rules.start_time ? (
                                <p className="mt-2">{event.recurrence_rules.start_time} - {event.recurrence_rules.end_time}</p>
                            ) : null}
                        </div>
                    )}

                    {event.event_type === 'multi_day' && event.multi_day_schedule && (
                        <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-2">
                            {event.multi_day_schedule.map((day: any, i: number) => (
                                <div key={i}
                                     className="flex justify-between border-b border-slate-200 pb-1 last:border-0 last:pb-0">
                                    <span className="font-bold text-brand-primary">{day.label}</span>
                                    <span
                                        className="text-slate-500">{new Date(day.date).toLocaleDateString('en-GB')} | {day.start_time}-{day.end_time}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {event.event_type === 'single_day' && event.start_datetime && (
                        <div className="bg-slate-50 p-3 rounded-xl text-xs">
                            <p className="font-bold text-brand-primary">{new Date(event.start_datetime).toLocaleDateString('en-GB')}</p>
                            <p className="text-slate-500">{new Date(event.start_datetime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })} - {new Date(event.end_datetime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Converted from a Component to a render function to avoid the remounting bug
    const renderEventListItem = (event: any) => {
        const isExpanded = expandedId === event.id;

        return (
            <div key={event.id}
                 className={`flex flex-col p-4 border rounded-2xl transition-all ${isExpanded ? 'border-brand-primary bg-white shadow-md' : 'border-brand-accent bg-slate-50/50 hover:bg-white hover:shadow-sm'}`}>
                <div className="flex gap-4">
                    <div
                        className="w-16 h-16 bg-slate-200 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                        {event.flyer_url ? (
                            <img src={event.flyer_url} alt={event.title} className="w-full h-full object-cover"/>
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center text-brand-secondary/50 bg-brand-primary/5">
                                <Calendar size={20}/>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-1">
                            <span
                                className="text-[9px] font-bold text-purple-600 uppercase tracking-widest truncate pr-2">
                                {event.category}
                            </span>
                            {event.event_type === 'multi_day' && <span
                                className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">Multi-Day</span>}
                        </div>
                        <h4 className="font-bold text-brand-primary text-sm truncate mb-1">{event.title}</h4>
                        <div className="text-[10px] text-gray-500 font-bold flex items-center gap-1 truncate">
                            <Clock size={10}/>
                            {event.event_type === 'recurring' ? "Infinite Schedule" :
                                event.event_type === 'single_day' && event.start_datetime ? new Date(event.start_datetime).toLocaleDateString('en-GB') :
                                    "Check Schedule"}
                        </div>
                    </div>

                    <div className="flex flex-col justify-between items-end gap-2 border-l border-brand-accent pl-3">
                        <button onClick={() => setExpandedId(isExpanded ? null : event.id)}
                                className="p-1 text-gray-400 hover:text-brand-primary bg-gray-50 rounded-md transition-colors">
                            {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        </button>

                        {role !== 'viewer' && (
                            <div className="flex items-center gap-3">
                                {viewTrash ? (
                                    <>
                                        <button onClick={() => {
                                            setSelectedEvent(event);
                                            setModalType("restore");
                                        }} title="Restore"
                                                className="text-emerald-600 hover:scale-110 transition-transform">
                                            <RefreshCw size={14}/></button>
                                        {role === 'super-admin' && <button onClick={() => {
                                            setSelectedEvent(event);
                                            setModalType("delete");
                                        }} title="Purge" className="text-red-400 hover:text-red-600 transition-colors">
                                            <Trash2 size={14}/></button>}
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => router.push(`/admin/events/edit/${event.id}`)}
                                                title="Edit"
                                                className="text-brand-secondary hover:text-brand-primary transition-colors">
                                            <Edit3 size={14}/></button>
                                        <button onClick={() => {
                                            setSelectedEvent(event);
                                            setModalType("delete");
                                        }} title="Trash" className="text-red-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={14}/></button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {isExpanded && renderExpandedDetails(event)}
            </div>
        );
    };

    if (loading && events.length === 0) {
        return (
            <div className="min-h-screen bg-brand-surface p-4 md:p-12">
                <AdminSkeletonLoader variant="events-dashboard"/>
            </div>
        );
    }

    // Removed the @ts-ignore
    return (
        <div className="min-h-screen bg-brand-surface p-4 md:p-12 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* Header Row */}
                <div className="flex justify-between items-center mb-6">
                    <Link href="/admin" className="text-xs md:text-sm text-brand-secondary font-bold hover:underline">
                        <span className="text-lg leading-none">←</span> Back to Admin Dashboard
                    </Link>

                    {role !== 'viewer' && (
                        <button
                            onClick={() => {
                                setViewTrash(!viewTrash);
                                setActiveTab("calendar"); // Ensure we are on the calendar tab if viewing trash
                            }}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${viewTrash ? 'bg-brand-primary text-white' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                        >
                            <Trash2 size={14}/> {viewTrash ? "Exit Trash" : "View Trash"}
                        </button>
                    )}
                </div>

                {/* Main Title Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary">
                        {viewTrash ? "Deleted Events" : "Church Schedule"}
                    </h1>

                    {/* TAB SWITCHER */}
                    {!viewTrash && (
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                            <button
                                onClick={() => setActiveTab("calendar")}
                                className={`whitespace-nowrap px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === "calendar" ? "bg-white text-brand-primary shadow-sm" : "text-gray-500 hover:text-brand-primary"}`}
                            >
                                <Calendar size={14}/> Calendar & Themes
                            </button>
                            <button
                                onClick={() => setActiveTab("notices")}
                                className={`whitespace-nowrap px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === "notices" ? "bg-white text-amber-600 shadow-sm" : "text-gray-500 hover:text-amber-600"}`}
                            >
                                <AlertCircle size={14}/> Schedule Notices
                            </button>
                        </div>
                    )}
                </div>

                {/* TAB 1: SCHEDULE NOTICES                   */}
                {activeTab === "notices" && !viewTrash && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">

                        {/* Editor Box */}
                        <div className="bg-amber-50/50 p-6 md:p-8 rounded-3xl border border-amber-200 mb-8 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Info size={20}/></div>
                                    <div>
                                        <h3 className="text-lg font-serif font-bold text-amber-800">Schedule
                                            Notices</h3>
                                        <p className="text-[10px] text-amber-700/70 uppercase tracking-widest">Add
                                            temporary schedule changes or cancellation notices.</p>
                                    </div>
                                </div>
                                <div
                                    className="flex items-center gap-2 bg-white p-2 rounded-xl border border-amber-100 shadow-sm">
                                    <label
                                        className="text-[10px] font-bold text-amber-600 uppercase tracking-widest pl-2">Select
                                        Month:</label>
                                    <input type="month" value={noticeMonthInput}
                                           onChange={(e) => setNoticeMonthInput(e.target.value)}
                                           className="bg-amber-100 text-amber-900 px-4 py-2 rounded-lg font-bold text-sm text-center outline-none cursor-pointer"/>
                                </div>
                            </div>

                            <textarea
                                value={noticeText} onChange={(e) => setNoticeText(e.target.value)}
                                disabled={role === 'viewer'} rows={4}
                                className="w-full p-5 border border-amber-200 rounded-xl text-amber-900 font-medium focus:ring-2 focus:ring-amber-400 outline-none resize-none bg-white shadow-sm"
                                placeholder={`Type any schedule updates for ${formattedNoticeMonth} here... (e.g., "First Day Prayers moved to the 4th")`}
                            />

                            <div className="mt-4 flex justify-between items-center">
                                {/* Clear Button */}
                                <button
                                    onClick={() => setNoticeText("")}
                                    disabled={role === 'viewer' || !noticeText}
                                    className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    <Eraser size={14}/> Clear Input
                                </button>

                                <button
                                    onClick={handleSaveNotice}
                                    disabled={savingNotice || role === 'viewer'}
                                    className="bg-amber-500 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-amber-600 transition-colors disabled:opacity-50"
                                >
                                    {savingNotice ? "Saving..." : `Save Notice for ${formattedNoticeMonth}`}
                                </button>
                            </div>
                        </div>

                        {/* Active Notices List Below */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-brand-accent mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-slate-100 text-brand-primary rounded-lg"><List size={18}/></div>
                                <h3 className="text-xl font-serif font-bold text-brand-primary">Active Notices</h3>
                            </div>

                            {loadingNotices ? (
                                <div className="text-center py-10 font-bold text-gray-400">Loading notices...</div>
                            ) : allNotices.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                                    <AlertCircle size={32} className="mx-auto text-gray-300 mb-3"/>
                                    <p className="text-gray-400 font-bold text-sm">No notices currently active.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {allNotices.map((notice) => (
                                        <div key={notice.id}
                                             className="bg-slate-50 border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                                            <div>
                                                <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2">{notice.month_year}</h4>
                                                <p className="text-sm text-gray-600 font-medium whitespace-pre-wrap mb-4">{notice.special_notice}</p>
                                            </div>
                                            {role !== 'viewer' && (
                                                <div
                                                    className="flex items-center gap-2 justify-end border-t border-gray-200 pt-3">
                                                    <button
                                                        onClick={() => handleEditNotice(notice.month_year)}
                                                        className="text-[10px] font-bold bg-white text-brand-primary px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center gap-1 transition-colors"
                                                    >
                                                        <Edit3 size={12}/> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteNotice(notice.id)}
                                                        className="text-[10px] font-bold bg-red-50 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-100 flex items-center gap-1 transition-colors"
                                                    >
                                                        <Trash2 size={12}/> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {/* TAB 2: CALENDAR & THEMES (Main Grid)      */}
                {activeTab === "calendar" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">

                        {!viewTrash && (
                            <div
                                className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-brand-accent mb-8 relative overflow-hidden">
                                <div
                                    className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-full -z-0 pointer-events-none"></div>

                                <div
                                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
                                    <div>
                                        <h2 className="text-xl font-serif font-bold text-brand-primary">Global
                                            Configuration</h2>
                                        <p className="text-xs text-gray-500">Update the theme and control active public
                                            calendar modes.</p>
                                    </div>
                                    <div
                                        className="bg-brand-primary text-white px-4 py-2 rounded-xl font-bold text-sm text-center shadow-md">
                                        {themeData.month}
                                    </div>
                                </div>

                                {/* SECTION A: Monthly Theme Inputs */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 mb-8">
                                    <div className="md:col-span-2">
                                        <label
                                            className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Theme
                                            Title</label>
                                        <input value={themeData.theme}
                                               onChange={(e) => setThemeData({...themeData, theme: e.target.value})}
                                               disabled={role === 'viewer'}
                                               className={`w-full p-3 border rounded-xl text-brand-primary font-bold outline-none ${role === 'viewer' ? 'bg-gray-50 cursor-not-allowed text-gray-500' : 'focus:ring-2 focus:ring-brand-primary'}`}/>
                                    </div>
                                    <div>
                                        <label
                                            className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Anchor
                                            Scripture</label>
                                        <input value={themeData.scripture}
                                               onChange={(e) => setThemeData({...themeData, scripture: e.target.value})}
                                               disabled={role === 'viewer'}
                                               className={`w-full p-3 border rounded-xl text-brand-primary outline-none ${role === 'viewer' ? 'bg-gray-50 cursor-not-allowed text-gray-500' : 'focus:ring-2 focus:ring-brand-primary'}`}/>
                                    </div>
                                    <div className="flex flex-col">
                                        <label
                                            className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                                            Background Banner (Optional)
                                        </label>
                                        <div
                                            className="w-full h-full min-h-[120px] bg-slate-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center overflow-hidden relative group">

                                            {isUploadingBanner ? (
                                                // 1. THE UPLOADING STATE
                                                <div className="flex flex-col items-center justify-center p-4 gap-2">
                                                    <svg className="animate-spin h-6 w-6 text-brand-primary"
                                                         xmlns="http://www.w3.org/2000/svg" fill="none"
                                                         viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10"
                                                                stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor"
                                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span
                                                        className="text-[10px] font-bold text-brand-primary uppercase tracking-widest animate-pulse text-center">
                                                        Processing...
                                                    </span>
                                                </div>
                                            ) : themeData.theme_banner_url ? (
                                                // 2. THE PREVIEW STATE
                                                <>
                                                    <img src={themeData.theme_banner_url} alt="Theme Banner"
                                                         className="w-full h-full object-cover"/>
                                                    <button onClick={() => setThemeData({
                                                        ...themeData,
                                                        theme_banner_url: ""
                                                    })}
                                                            className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold">Remove
                                                        Banner
                                                    </button>
                                                </>
                                            ) : (
                                                // 3. THE UPLOAD BUTTON
                                                <div className="flex flex-col items-center p-4">
                                                    <ImageIcon size={24} className="text-gray-300 mb-2"/>
                                                    <UploadButton
                                                        endpoint="imageUploader"
                                                        appearance={{button: "bg-brand-primary text-white text-[10px] px-3 py-1.5 rounded-lg"}}
                                                        content={{
                                                            button({ready}) {
                                                                return ready ? "Select Banner" : "Loading...";
                                                            }
                                                        }}
                                                        onUploadBegin={() => {
                                                            setIsUploadingBanner(true); // Trigger Spinner
                                                        }}
                                                        onClientUploadComplete={(res: any) => {
                                                            setThemeData({
                                                                ...themeData,
                                                                theme_banner_url: res[0].url
                                                            });
                                                            setIsUploadingBanner(false); // Stop Spinner
                                                            toast.success("Theme banner uploaded!");
                                                        }}
                                                        onUploadError={(error) => {
                                                            setIsUploadingBanner(false); // Stop Spinner on error
                                                            toast.error(`Upload failed: ${error.message}`);
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION B: Takeover Toggles */}
                                <div className="border-t border-gray-100 pt-6 relative z-10">
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4">Calendar
                                        Takeover Modes</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div
                                            className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors ${themeData.is_convention_active ? 'border-amber-400 bg-amber-50/50' : 'border-gray-100 bg-slate-50'}`}>
                                            <button type="button" disabled={role === 'viewer'}
                                                    onClick={() => setThemeData({
                                                        ...themeData,
                                                        is_convention_active: !themeData.is_convention_active,
                                                        is_congress_active: false
                                                    })}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 ${themeData.is_convention_active ? 'bg-amber-500' : 'bg-gray-300'}`}>
                                                <span
                                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${themeData.is_convention_active ? 'translate-x-5' : 'translate-x-0'}`}/>
                                            </button>
                                            <div>
                                                <h4 className="text-sm font-bold text-brand-primary flex items-center gap-1.5">
                                                    <Radio size={14}
                                                           className={themeData.is_convention_active ? "text-amber-500" : "text-gray-400"}/> Annual
                                                    Convention</h4>
                                                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">Overrides
                                                    the public calendar. Turn on during the week of the convention.</p>
                                            </div>
                                        </div>
                                        <div
                                            className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors ${themeData.is_congress_active ? 'border-blue-400 bg-blue-50/50' : 'border-gray-100 bg-slate-50'}`}>
                                            <button type="button" disabled={role === 'viewer'}
                                                    onClick={() => setThemeData({
                                                        ...themeData,
                                                        is_congress_active: !themeData.is_congress_active,
                                                        is_convention_active: false
                                                    })}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeData.is_congress_active ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                                <span
                                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${themeData.is_congress_active ? 'translate-x-5' : 'translate-x-0'}`}/>
                                            </button>
                                            <div>
                                                <h4 className="text-sm font-bold text-brand-primary flex items-center gap-1.5">
                                                    <Flame size={14}
                                                           className={themeData.is_congress_active ? "text-blue-500" : "text-gray-400"}/> Holy
                                                    Ghost Congress</h4>
                                                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">Overrides
                                                    the public calendar for the December Holy Ghost Congress.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION C: TAKEOVER EVENT DETAILS */}
                                {(themeData.is_convention_active || themeData.is_congress_active) && (
                                    <div
                                        className={`mt-6 p-6 rounded-2xl border ${themeData.is_convention_active ? 'border-amber-200 bg-amber-50/30' : 'border-blue-200 bg-blue-50/30'} animate-in fade-in slide-in-from-top-4`}>
                                        <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 ${themeData.is_convention_active ? 'text-amber-600' : 'text-blue-600'}`}>{themeData.is_convention_active ? 'Convention' : 'Congress'} Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <label
                                                        className="text-[10px] font-bold text-gray-900 uppercase tracking-widest block mb-1">Official
                                                        Event Title *</label>
                                                    <input value={themeData.takeover_title}
                                                           onChange={(e) => updateTakeover('takeover_title', e.target.value)}
                                                           placeholder="e.g. RCCG 74th Annual Convention"
                                                           className="w-full p-3 border border-white rounded-xl bg-white focus:ring-2 focus:ring-brand-primary outline-none text-gray-900"/>
                                                </div>
                                                <div>
                                                    <label
                                                        className="text-[10px] font-bold text-gray-900 uppercase tracking-widest block mb-1">Theme
                                                        (Optional)</label>
                                                    <input value={themeData.takeover_theme}
                                                           onChange={(e) => updateTakeover('takeover_theme', e.target.value)}
                                                           placeholder="e.g. Heaven"
                                                           className="w-full p-3 border border-white rounded-xl bg-white focus:ring-2 focus:ring-brand-primary outline-none text-gray-900"/>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <label
                                                            className="text-[10px] font-bold text-gray-900 uppercase tracking-widest block mb-1"><Calendar
                                                            size={10} className="inline mr-1"/>Start Date</label>
                                                        <input type="date" value={themeData.takeover_start_date}
                                                               onChange={(e) => updateTakeover('takeover_start_date', e.target.value)}
                                                               className="w-full p-3 border border-white rounded-xl bg-white outline-none text-gray-900"/>
                                                    </div>
                                                    <div className="flex-1">
                                                        <label
                                                            className="text-[10px] font-bold text-gray-900 uppercase tracking-widest block mb-1"><Calendar
                                                            size={10} className="inline mr-1"/>End Date</label>
                                                        <input type="date" value={themeData.takeover_end_date}
                                                               onChange={(e) => updateTakeover('takeover_end_date', e.target.value)}
                                                               className="w-full p-3 border border-white rounded-xl bg-white outline-none text-gray-900"/>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <label
                                                            className="text-[10px] font-bold text-gray-900 uppercase tracking-widest block mb-1"><MapPinX
                                                            size={10} className="inline mr-1"/>Official Location</label>
                                                        <input value={themeData.takeover_official_location}
                                                               onChange={(e) => updateTakeover('takeover_official_location', e.target.value)}
                                                               placeholder="e.g. Redemption Camp"
                                                               className="w-full p-3 border border-white rounded-xl bg-white outline-none text-gray-900"/>
                                                    </div>
                                                    <div className="flex-1">
                                                        <label
                                                            className="text-[10px] font-bold text-gray-900 uppercase tracking-widest block mb-1"><MapPin
                                                            size={10} className="inline mr-1"/>Viewing Center</label>
                                                        <input value={themeData.takeover_location}
                                                               onChange={(e) => updateTakeover('takeover_location', e.target.value)}
                                                               placeholder="Viewing Center"
                                                               className="w-full p-3 border border-white rounded-xl bg-white outline-none text-gray-900"/>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label
                                                        className="text-[10px] font-bold text-gray-900 uppercase tracking-widest block mb-1"><LinkIcon
                                                        size={10} className="inline mr-1"/>Info Link</label>
                                                    <input value={themeData.takeover_link}
                                                           onChange={(e) => updateTakeover('takeover_link', e.target.value)}
                                                           placeholder="e.g. https://rccg.org"
                                                           className="w-full p-3 border border-white rounded-xl bg-white outline-none text-gray-700"/>
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <label
                                                    className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Event
                                                    Banner / Flyer</label>
                                                <div
                                                    className="w-full aspect-video bg-white border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center overflow-hidden relative">
                                                    {themeData.takeover_flyer_url ? (
                                                        <>
                                                            <img src={themeData.takeover_flyer_url}
                                                                 alt="Takeover Banner"
                                                                 className="w-full h-full object-cover"/>
                                                            <button
                                                                onClick={() => updateTakeover('takeover_flyer_url', '')}
                                                                className="absolute bottom-2 right-2 bg-red-500 text-white p-2 rounded-lg text-xs font-bold shadow-md hover:bg-red-600">Remove
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center p-4">
                                                            <ImageIcon size={32} className="text-gray-300 mb-2"/>
                                                            <UploadButton
                                                                endpoint="imageUploader"
                                                                appearance={{button: "bg-brand-primary text-white text-[10px] px-4 py-2 rounded-lg"}}
                                                                onClientUploadComplete={(res: any) => updateTakeover('takeover_flyer_url', res[0].url)}
                                                                onUploadError={(error) => {
                                                                    toast.error(`Upload failed: ${error.message}`);
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 flex justify-end relative z-10 border-t border-gray-100 pt-6">
                                    <button onClick={handleSaveTheme}
                                            disabled={themeData.savingTheme || role === 'viewer'}
                                            className="bg-brand-primary text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-colors disabled:opacity-50">
                                        {themeData.savingTheme ? "Saving..." : "Save Global Settings"}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-row justify-end items-center mb-6 md:mb-8 gap-4">
                            {role !== 'viewer' && !viewTrash && (
                                <button onClick={() => router.push("/admin/events/new")}
                                        className="bg-brand-secondary text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-brand-primary transition-colors flex items-center gap-2 mr-auto">
                                    <Plus size={16}/> Add New Event
                                </button>
                            )}

                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                            {/* LEFT CARD: RECURRING SCHEDULE */}
                            <div
                                className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-brand-accent flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><RefreshCw size={18}/>
                                    </div>
                                    <h2 className="text-xl font-serif font-bold text-brand-primary">Recurring
                                        Schedule</h2>
                                </div>
                                <p className="text-xs text-gray-500 mb-6">The standard weekly & monthly heartbeat of the
                                    church. These loop infinitely.</p>

                                <div className="space-y-3 flex-grow">
                                    {loading ? (
                                        <div
                                            className="text-center p-8 text-sm text-gray-400 font-bold">Loading...</div>
                                    ) : recurringEvents.length > 0 ? (
                                        // FIX: Now calling the render function instead of re-mounting a component!
                                        recurringEvents.map(event => renderEventListItem(event))
                                    ) : (
                                        <div
                                            className="text-center p-8 border-2 border-dashed border-gray-100 rounded-2xl">
                                            <AlertCircle size={24} className="mx-auto text-gray-300 mb-2"/>
                                            <p className="text-xs text-gray-400 font-bold">No recurring events
                                                found.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT CARD: SPECIAL & GUEST EVENTS WITH PAGINATION */}
                            <div
                                className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-brand-accent flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Star size={18}/></div>
                                    <h2 className="text-xl font-serif font-bold text-brand-primary">Special &
                                        Upcoming</h2>
                                </div>
                                <p className="text-xs text-gray-500 mb-6">One-off guest speakers, special programs, and
                                    multi-day conferences.</p>

                                <div className="space-y-3 flex-grow">
                                    {loading ? (
                                        <div
                                            className="text-center p-8 text-sm text-gray-400 font-bold">Loading...</div>
                                    ) : paginatedSpecialEvents.length > 0 ? (
                                        // FIX: Now calling the render function instead of re-mounting a component!
                                        paginatedSpecialEvents.map(event => renderEventListItem(event))
                                    ) : (
                                        <div
                                            className="text-center p-8 border-2 border-dashed border-gray-100 rounded-2xl">
                                            <AlertCircle size={24} className="mx-auto text-gray-300 mb-2"/>
                                            <p className="text-xs text-gray-400 font-bold">No special events found.</p>
                                        </div>
                                    )}
                                </div>

                                {/* PAGINATION CONTROLS */}
                                {totalSpecialPages > 0 && (
                                    <div
                                        className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <button
                                            onClick={() => setSpecialPage(p => Math.max(1, p - 1))}
                                            disabled={specialPage === 1}
                                            className="p-2 bg-gray-50 text-brand-primary rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                                        >
                                            <ChevronLeft size={12}/>
                                        </button>
                                        <span className="text-xs font-bold text-gray-500">
                                            Page <span
                                            className="text-brand-primary">{specialPage}</span> of {totalSpecialPages}
                                        </span>
                                        <button
                                            onClick={() => setSpecialPage(p => Math.min(totalSpecialPages, p + 1))}
                                            disabled={specialPage === totalSpecialPages}
                                            className="p-2 bg-gray-50 text-brand-primary rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                                        >
                                            <ChevronRight size={12}/>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* CONFIRMATION MODAL (For Events) */}
            <ConfirmModal
                isOpen={!!modalType}
                title={modalType === "delete" ? (viewTrash ? "Permanently Delete Event?" : "Move to Trash?") : "Restore Event?"}
                message={modalType === "delete" ? (viewTrash ? "This action is permanent and cannot be undone." : "This will hide the event from the public calendar. You can restore it from the trash.") : "This event will be active again on the public site."}
                variant={modalType === "delete" ? "danger" : "primary"}
                onClose={() => setModalType(null)}
                onConfirm={handleConfirmAction}
            />
        </div>
    );
}