"use client";
import React, {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";
import {UploadButton} from "@/utils/uploadthing";
import {toast} from "sonner";
import {ArrowLeft, Calendar, ImageIcon, Layers, Lock, MapPin, Plus, RefreshCw, Star, Trash2, Users} from "lucide-react";

export default function EditEventPage() {
    const router = useRouter();
    const {id} = useParams();

    const [userRole, setUserRole] = useState<string>("viewer");

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [eventType, setEventType] = useState<"recurring" | "single_day" | "multi_day" | null>(null);

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [flyerUrl, setFlyerUrl] = useState("");

    const [locationSelection, setLocationSelection] = useState("Main Auditorium");
    const [customLocation, setCustomLocation] = useState("");

    const [theme, setTheme] = useState("");
    const [topic, setTopic] = useState("");
    const [guestSpeaker, setGuestSpeaker] = useState("");

    const [recurringPattern, setRecurringPattern] = useState("weekly");
    const [recurringDay, setRecurringDay] = useState("sunday");
    const [startTime, setStartTime] = useState("18:00");
    const [endTime, setEndTime] = useState("20:00");

    // --- NEW: DYNAMIC SUNDAY CONFIGURATION STATE ---
    const [sundayFactions, setSundayFactions] = useState({
        second_sunday: "Excellent Men",
        third_sunday: "The Lord's Garnet",
        fourth_sunday: "Good Women",
        fifth_sunday: "Joint Anointing Service"
    });

    const [thanksgivingSession, setThanksgivingSession] = useState<any>({
        name: "Thanksgiving Service (1st Sunday)",
        start_time: "07:30",
        end_time: "11:00",
        flyer_url: ""
    });

    const [standardSessions, setStandardSessions] = useState<any[]>([]);
    // ------------------------------------------------

    const [singleDate, setSingleDate] = useState("");
    const [multiDays, setMultiDays] = useState<any[]>([]);

    useEffect(() => {
        async function loadAuthAndEvent() {
            const {data: {session}} = await supabase.auth.getSession();
            if (session) {
                const {data: profile} = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();
                if (profile) setUserRole(profile.role);
            }

            const {data, error} = await supabase.from("church_events").select("*").eq("id", id).single();

            if (error || !data) {
                toast.error("Failed to load event data.");
                router.push("/admin/events");
                return;
            }

            setEventType(data.event_type);
            setTitle(data.title || "");
            setCategory(data.category || "");
            setDescription(data.description || "");
            setLocation(data.location || "Main Auditorium");
            setFlyerUrl(data.flyer_url || "");
            setTheme(data.theme || "");
            setTopic(data.topic || "");
            setGuestSpeaker(data.guest_speaker || "");

            if (data.location && data.location !== "Main Auditorium" && data.location !== "Parish A" && data.location !== "Parish B") {
                setLocationSelection("Custom");
                setCustomLocation(data.location);
            } else {
                setLocationSelection(data.location || "Main Auditorium");
            }

            if (data.event_type === "recurring" && data.recurrence_rules) {
                const rules = data.recurrence_rules;
                setRecurringPattern(rules.pattern_type || "weekly");
                if (rules.pattern_type === "weekly") setRecurringDay(rules.day || "sunday");
                else setRecurringDay(rules.rule || "");

                setStartTime(rules.start_time || "18:00");
                setEndTime(rules.end_time || "20:00");

                // Populate Dynamic Arrays
                if (rules.standard_sessions) setStandardSessions(rules.standard_sessions);
                else if (rules.sessions) setStandardSessions(rules.sessions);
                if (rules.thanksgiving_session) setThanksgivingSession(rules.thanksgiving_session);

                // NEW: Load existing Factions if available!
                if (rules.factions) setSundayFactions(rules.factions);

            } else if (data.event_type === "single_day") {
                if (data.start_datetime) {
                    const startDate = new Date(data.start_datetime);
                    setSingleDate(startDate.toISOString().split('T')[0]);
                    setStartTime(startDate.toTimeString().slice(0, 5));
                }
                if (data.end_datetime) setEndTime(new Date(data.end_datetime).toTimeString().slice(0, 5));
            } else if (data.event_type === "multi_day" && data.multi_day_schedule) {
                setMultiDays(data.multi_day_schedule);
            }

            setFetching(false);
        }

        if (id) {
            loadAuthAndEvent().catch(console.error);
        }
    }, [id, router]);

    const handleAddMultiDay = () => setMultiDays([...multiDays, {
        date: "",
        start_time: "18:00",
        end_time: "21:00",
        label: `Day ${multiDays.length + 1}`
    }]);
    const handleRemoveMultiDay = (index: number) => setMultiDays(multiDays.filter((_, i) => i !== index));

    const handleAddSession = () => setStandardSessions([...standardSessions, {
        name: `Service ${standardSessions.length + 1}`,
        start_time: "11:30",
        end_time: "13:30",
        flyer_url: ""
    }]);
    const handleRemoveSession = (index: number) => setStandardSessions(standardSessions.filter((_, i) => i !== index));

    const updateSessionFlyer = (index: number, url: string) => {
        const newSessions = [...standardSessions];
        newSessions[index].flyer_url = url;
        setStandardSessions(newSessions);
    };

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const finalLocation = locationSelection === "Custom" ? customLocation : locationSelection;

        const payload: any = {
            title, description, location,
            flyer_url: flyerUrl, theme, topic, guest_speaker: guestSpeaker
        };

        if (eventType === "recurring") {
            payload.guest_speaker = "";
            payload.theme = "";
            payload.topic = "";

            const rules: any = {pattern_type: recurringPattern};
            if (recurringPattern === "weekly") rules.day = recurringDay;
            else rules.rule = recurringDay;

            // 🔴 APPLY DYNAMIC SUNDAY LOGIC 🔴
            if (recurringPattern === 'weekly' && recurringDay === 'sunday' && title.toLowerCase().includes('sunday')) {
                rules.factions = sundayFactions;
                rules.thanksgiving_session = thanksgivingSession;
                rules.standard_sessions = standardSessions;
            } else {
                if (standardSessions.length > 0) rules.standard_sessions = standardSessions;
                if (thanksgivingSession) rules.thanksgiving_session = thanksgivingSession;
                if (standardSessions.length === 0 && !thanksgivingSession) {
                    rules.start_time = startTime;
                    rules.end_time = endTime;
                }
            }

            payload.recurrence_rules = rules;

        } else if (eventType === "single_day") {
            payload.start_datetime = new Date(`${singleDate}T${startTime}`).toISOString();
            payload.end_datetime = new Date(`${singleDate}T${endTime}`).toISOString();
        } else if (eventType === "multi_day") {
            payload.multi_day_schedule = multiDays;
        }

        const {error} = await supabase.from("church_events").update(payload).eq("id", id);

        if (error) {
            toast.error("Error updating event: " + error.message);
            setLoading(false);
        } else {
            toast.success("Event updated successfully!");
            router.push("/admin/events");
            router.refresh();
        }
    };

    if (fetching) return <div
        className="p-20 text-center font-bold text-brand-primary min-h-screen bg-brand-surface">Loading Event
        Data...</div>;

    return (
        <div className="min-h-screen bg-brand-surface p-4 md:p-12 font-sans">
            <div className="max-w-4xl mx-auto">
                <Link href="/admin/events"
                      className="text-sm font-bold text-brand-secondary mb-6 flex items-center gap-2 hover:underline w-fit">
                    <ArrowLeft size={16}/> Back to Events Dashboard
                </Link>

                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-brand-accent">
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                        {eventType === 'recurring' && <RefreshCw className="text-blue-600" size={24}/>}
                        {eventType === 'single_day' && <Star className="text-amber-600" size={24}/>}
                        {eventType === 'multi_day' && <Layers className="text-purple-600" size={24}/>}
                        <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary">
                            Edit {eventType === 'recurring' ? 'Recurring' : eventType === 'single_day' ? 'Special' : 'Multi-Day'} Event
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">

                        {/* 1. CORE DETAILS */}
                        <div className="space-y-6">
                            <div className='flex flex-col gap-3 mt-2'>
                                <label
                                    className="text-[9px] md:text-xs font-bold text-purple-600 uppercase tracking-widest">Step
                                    1: Edit/Change Core Details</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Event
                                        Title *</label><input required value={title}
                                                              onChange={e => setTitle(e.target.value)}
                                                              className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl text-brand-primary font-bold focus:ring-2 focus:ring-brand-primary outline-none"/>
                                    </div>
                                    <div>
                                        <label
                                            className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex justify-between">Category <span
                                            className="flex items-center gap-1 text-gray-400"><Lock
                                            size={10}/> Locked</span></label>
                                        <div
                                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 font-bold cursor-not-allowed">{category}</div>
                                    </div>
                                </div>
                            </div>

                            {/* SMART LOCATION PICKER */}
                            <div className='flex flex-col gap-3 mt-2'>
                                <label
                                    className="text-[9px] md:text-xs font-bold text-purple-600 uppercase tracking-widest">Step
                                    1.1: Edit/Change Pick Location</label>
                                <div className="bg-slate-50 p-3 rounded-2xl border border-gray-100">
                                    <label
                                        className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-3 flex items-center gap-1">
                                        <MapPin size={12}/> Event Location
                                    </label>
                                    <select
                                        value={locationSelection}
                                        onChange={e => setLocationSelection(e.target.value)}
                                        className="w-full p-4 bg-white border border-gray-200 rounded-xl text-brand-primary font-bold focus:ring-2 focus:ring-brand-primary outline-none cursor-pointer"
                                    >
                                        <option value="Main Auditorium">Main Auditorium (Default)</option>
                                        <option disabled value="Parish A">Parish A (Syncing soon...)</option>
                                        <option disabled value="Parish B">Parish B (Syncing soon...)</option>
                                        <option value="Custom">Custom / External Venue</option>
                                    </select>

                                    {locationSelection === "Custom" && (
                                        <input
                                            required
                                            placeholder="Enter specific address or venue name..."
                                            value={customLocation}
                                            onChange={e => setCustomLocation(e.target.value)}
                                            className="w-full p-4 mt-3 bg-white border border-gray-200 rounded-xl text-brand-primary focus:ring-2 focus:ring-brand-primary outline-none animate-in fade-in slide-in-from-top-2"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className='flex flex-col gap-3 mt-2'>
                                <label
                                    className="text-[9px] md:text-xs font-bold text-purple-600 uppercase tracking-widest">Step
                                    1.2: Edit/Change Description of the Event</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                                          className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl text-brand-primary focus:ring-2 focus:ring-brand-primary outline-none"/>
                            </div>
                        </div>

                        {/* 2. FLYERS & MEDIA */}
                        <div className="space-y-6">
                            <label
                                className="text-[9px] md:text-xs font-bold text-purple-600 uppercase tracking-widest">Step
                                2: Edit/Change Event Flyer(s)</label>

                            {/* ONLY DO MULTIPLE FLYERS IF IT IS SUNDAY SERVICE */}
                            {eventType === 'recurring' && recurringDay === 'sunday' && title.toLowerCase().includes('sunday') ? (
                                <div className="space-y-6">
                                    <p className="text-sm text-gray-500">Sunday Services require specific flyers for
                                        Thanksgiving and standard sessions.</p>

                                    {/* THANKSGIVING FLYER */}
                                    {thanksgivingSession && (
                                        <div
                                            className="p-4 border-2 border-brand-primary border-dashed rounded-2xl bg-brand-primary/5">
                                            <h4 className="font-bold text-brand-primary mb-4 text-sm flex items-center gap-2">✨ {thanksgivingSession.name} ({thanksgivingSession.start_time})</h4>
                                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                                <div
                                                    className="w-full sm:w-48 aspect-video bg-white border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {thanksgivingSession.flyer_url ? (
                                                        <img src={thanksgivingSession.flyer_url} alt="Thanksgiving"
                                                             className="w-full h-full object-cover"/>
                                                    ) : <div className="text-gray-300 flex flex-col items-center">
                                                        <ImageIcon size={24} className="mb-1"/><span
                                                        className="text-[9px] font-bold uppercase">No Image</span>
                                                    </div>}
                                                </div>
                                                <div className="w-full">
                                                    {!thanksgivingSession.flyer_url ? (
                                                        <UploadButton
                                                            endpoint="imageUploader"
                                                            appearance={{button: "bg-brand-primary text-white text-[10px] px-4 py-2 rounded-lg w-full sm:w-auto"}}
                                                            onClientUploadComplete={(res) => {
                                                                setThanksgivingSession({
                                                                    ...thanksgivingSession,
                                                                    flyer_url: res[0].url
                                                                });
                                                                toast.success("Thanksgiving flyer uploaded!");
                                                            }}
                                                            onUploadError={(error) => {
                                                                toast.error(`Upload Failed: ${error.message}`);
                                                            }}
                                                        />
                                                    ) : <button type="button" onClick={() => setThanksgivingSession({
                                                        ...thanksgivingSession,
                                                        flyer_url: ""
                                                    })}
                                                                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-colors">Remove
                                                        Thanksgiving Flyer</button>}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STANDARD FIRST & SECOND SERVICE */}
                                    {standardSessions.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {standardSessions.map((session, index) => (
                                                <div key={index}
                                                     className="p-4 border border-brand-accent rounded-2xl bg-slate-50">
                                                    <h4 className="font-bold text-slate-700 mb-4 text-sm">{session.name} ({session.start_time})</h4>
                                                    <div className="flex flex-col gap-4 items-center">
                                                        <div
                                                            className="w-full aspect-video bg-white border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                                                            {session.flyer_url ? (
                                                                <img src={session.flyer_url} alt={session.name}
                                                                     className="w-full h-full object-cover"/>
                                                            ) : <div
                                                                className="text-gray-300 flex flex-col items-center">
                                                                <ImageIcon size={24} className="mb-1"/><span
                                                                className="text-[9px] font-bold uppercase">No Image</span>
                                                            </div>}
                                                        </div>
                                                        <div className="w-full">
                                                            {!session.flyer_url ? (
                                                                <UploadButton
                                                                    endpoint="imageUploader"
                                                                    appearance={{button: "bg-slate-800 text-white text-[10px] px-4 py-2 rounded-lg w-full"}}
                                                                    onClientUploadComplete={(res) => {
                                                                        updateSessionFlyer(index, res[0].url);
                                                                        toast.success(`${session.name} flyer uploaded!`);
                                                                    }}
                                                                    onUploadError={(error) => {
                                                                        toast.error(`Upload Failed: ${error.message}`);
                                                                    }}
                                                                />
                                                            ) : <button type="button"
                                                                        onClick={() => updateSessionFlyer(index, "")}
                                                                        className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-colors">Remove
                                                                Flyer</button>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* STANDARD SINGLE FLYER UPLOAD */
                                <div className="p-4 border border-brand-accent rounded-2xl bg-slate-50">
                                    <h4 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2">
                                        ✨ {title || "Event Details"} <span
                                        className="text-gray-400 font-normal">({startTime} {endTime ? `- ${endTime}` : ''})</span>
                                    </h4>

                                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                                        <div
                                            className="w-full sm:w-48 aspect-square bg-white border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
                                            {flyerUrl ? <img src={flyerUrl} alt="Flyer"
                                                             className="w-full h-full object-cover"/> :
                                                <div className="text-gray-300 flex flex-col items-center"><ImageIcon
                                                    size={32} className="mb-2"/><span
                                                    className="text-[10px] font-bold uppercase">No Image</span></div>}
                                        </div>
                                        <div className="flex-1 w-full space-y-4">
                                            <p className="text-sm text-gray-500">Upload the official graphic for this
                                                event.</p>
                                            {!flyerUrl ? (
                                                <UploadButton endpoint="imageUploader"
                                                              appearance={{button: "bg-brand-primary text-white text-xs px-6 py-4 rounded-xl after:bg-brand-secondary w-full sm:w-auto"}}
                                                              onClientUploadComplete={(res) => {
                                                                  setFlyerUrl(res[0].url);
                                                                  toast.success("Flyer uploaded!");
                                                              }}
                                                              onUploadError={(error) => {
                                                                  toast.error(`Upload Failed: ${error.message}`);
                                                              }}
                                                />
                                            ) : <button type="button" onClick={() => setFlyerUrl("")}
                                                        className="bg-red-50 text-red-600 px-6 py-3 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">Remove
                                                Flyer</button>}
                                        </div>
                                    </div>

                                    {/* Multi-Session display info for other recurring events (e.g., Wednesday) */}
                                    {standardSessions.length > 0 && !title.toLowerCase().includes('sunday') && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <p className="text-xs font-bold text-brand-primary uppercase mb-3">Event
                                                Sessions</p>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {standardSessions.map((session, index) => (
                                                    <div key={index}
                                                         className="bg-white border border-gray-200 p-2 rounded-lg text-xs flex justify-between">
                                                        <span
                                                            className="font-medium text-gray-600">{session.name}</span>
                                                        <span
                                                            className="text-brand-primary font-bold">{session.start_time}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 3. TIME & LOGIC (WITH RBAC LOCK) */}
                        <div className='flex flex-col gap-3 mt-2'>
                            <label
                                className="text-[9px] md:text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">Step
                                3: Edit/Change Event Time(s)</label>
                            <div
                                className="space-y-6 p-6 md:p-8 bg-slate-50 border border-gray-100 rounded-3xl relative">
                                {userRole !== 'super-admin' && (
                                    <div
                                        className="absolute top-4 right-6 bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                                        <Lock size={12}/> Time Edit Restricted</div>
                                )}
                                <h3 className="text-xs font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2">
                                    <Calendar size={16}/> Scheduling Rules</h3>

                                {/* RECURRING */}
                                {eventType === 'recurring' && (
                                    <div className="space-y-6 animate-in fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className={userRole !== 'super-admin' ? "opacity-75" : ""}>
                                                <label
                                                    className="text-[10px] font-bold text-gray-900 uppercase block mb-2">Pattern</label>
                                                <select
                                                    disabled={userRole !== 'super-admin'}
                                                    value={recurringPattern}
                                                    onChange={e => setRecurringPattern(e.target.value)}
                                                    className={`w-full p-4 border rounded-xl text-brand-primary ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed text-gray-800' : 'bg-white focus:ring-2 focus:ring-brand-primary outline-none'}`}
                                                >
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                </select>
                                            </div>

                                            <div className={userRole !== 'super-admin' ? "opacity-75" : ""}>
                                                <label
                                                    className="text-[10px] font-bold text-gray-900 uppercase block mb-2">Rule
                                                    / Day</label>
                                                {recurringPattern === 'weekly' ? (
                                                    <select
                                                        disabled={userRole !== 'super-admin'}
                                                        value={recurringDay}
                                                        onChange={e => setRecurringDay(e.target.value)}
                                                        className={`w-full p-4 border rounded-xl text-brand-primary capitalize ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed text-gray-800' : 'bg-white focus:ring-2 focus:ring-brand-primary outline-none'}`}
                                                    >
                                                        <option value="sunday">Sunday</option>
                                                        <option value="monday">Monday</option>
                                                        <option value="tuesday">Tuesday</option>
                                                        <option value="wednesday">Wednesday</option>
                                                        <option value="thursday">Thursday</option>
                                                        <option value="friday">Friday</option>
                                                        <option value="saturday">Saturday</option>
                                                    </select>
                                                ) : (
                                                    <select
                                                        disabled={userRole !== 'super-admin'}
                                                        value={recurringDay}
                                                        onChange={e => setRecurringDay(e.target.value)}
                                                        className={`w-full p-4 border rounded-xl text-brand-primary ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed text-gray-800' : 'bg-white focus:ring-2 focus:ring-brand-primary outline-none'}`}
                                                    >
                                                        <option value="first_sunday">First Sunday</option>
                                                        <option value="first_thursday">First Thursday</option>
                                                        <option value="first_friday">First Friday</option>
                                                        <option value="last_friday">Last Friday</option>
                                                        <option value="thursday_before_first_friday">Thursday before
                                                            First Friday
                                                        </option>
                                                    </select>
                                                )}
                                            </div>
                                        </div>

                                        {/* 🔴 DYNAMIC SUNDAY CONFIGURATOR (PULLED FROM CREATION PAGE) 🔴 */}
                                        {recurringPattern === 'weekly' && recurringDay === 'sunday' && title.toLowerCase().includes('sunday') ? (
                                            <div
                                                className="mt-8 pt-8 border-t border-gray-200 animate-in fade-in slide-in-from-top-4">
                                                <div className="flex items-center gap-2 mb-6">
                                                    <Users size={20} className="text-brand-primary"/>
                                                    <h4 className="text-lg font-bold text-brand-primary font-serif">Sunday
                                                        Configuration Matrix</h4>
                                                </div>

                                                {/* Factions */}
                                                <div
                                                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
                                                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Monthly
                                                        Themes (Factions)</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div><label
                                                            className="text-xs font-bold text-gray-800 block mb-1">2nd
                                                            Sunday</label><input disabled={userRole !== 'super-admin'}
                                                                                 value={sundayFactions.second_sunday}
                                                                                 onChange={e => setSundayFactions({
                                                                                     ...sundayFactions,
                                                                                     second_sunday: e.target.value
                                                                                 })}
                                                                                 className={`w-full p-3 border rounded-lg text-brand-primary ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed' : 'bg-slate-50'}`}/>
                                                        </div>
                                                        <div><label
                                                            className="text-xs font-bold text-gray-800 block mb-1">3rd
                                                            Sunday</label><input disabled={userRole !== 'super-admin'}
                                                                                 value={sundayFactions.third_sunday}
                                                                                 onChange={e => setSundayFactions({
                                                                                     ...sundayFactions,
                                                                                     third_sunday: e.target.value
                                                                                 })}
                                                                                 className={`w-full p-3 border rounded-lg text-brand-primary ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed' : 'bg-slate-50'}`}/>
                                                        </div>
                                                        <div><label
                                                            className="text-xs font-bold text-gray-800 block mb-1">4th
                                                            Sunday</label><input disabled={userRole !== 'super-admin'}
                                                                                 value={sundayFactions.fourth_sunday}
                                                                                 onChange={e => setSundayFactions({
                                                                                     ...sundayFactions,
                                                                                     fourth_sunday: e.target.value
                                                                                 })}
                                                                                 className={`w-full p-3 border rounded-lg text-brand-primary ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed' : 'bg-slate-50'}`}/>
                                                        </div>
                                                        <div><label
                                                            className="text-xs font-bold text-gray-800 block mb-1">5th
                                                            Sunday</label><input disabled={userRole !== 'super-admin'}
                                                                                 value={sundayFactions.fifth_sunday}
                                                                                 onChange={e => setSundayFactions({
                                                                                     ...sundayFactions,
                                                                                     fifth_sunday: e.target.value
                                                                                 })}
                                                                                 className={`w-full p-3 border rounded-lg text-brand-primary ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed' : 'bg-slate-50'}`}/>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Times: Thanksgiving */}
                                                <div
                                                    className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 mb-6">
                                                    <h5 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-4">1st
                                                        Sunday: Thanksgiving Timing</h5>
                                                    <div className="flex flex-col sm:flex-row gap-4">
                                                        <div className="flex-1"><label
                                                            className="text-xs font-bold text-amber-900 block mb-1">Label</label><input
                                                            disabled={userRole !== 'super-admin'}
                                                            value={thanksgivingSession?.name || ""}
                                                            onChange={e => setThanksgivingSession({
                                                                ...thanksgivingSession,
                                                                name: e.target.value
                                                            })}
                                                            className={`w-full p-3 border border-amber-200 text-brand-primary rounded-lg ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}/>
                                                        </div>
                                                        <div className="w-full sm:w-32"><label
                                                            className="text-xs font-bold text-amber-900 block mb-1">Start</label><input
                                                            type="time" disabled={userRole !== 'super-admin'}
                                                            value={thanksgivingSession?.start_time || ""}
                                                            onChange={e => setThanksgivingSession({
                                                                ...thanksgivingSession,
                                                                start_time: e.target.value
                                                            })}
                                                            className={`w-full p-3 border border-amber-200 text-brand-primary rounded-lg ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}/>
                                                        </div>
                                                        <div className="w-full sm:w-32"><label
                                                            className="text-xs font-bold text-amber-900 block mb-1">End</label><input
                                                            type="time" disabled={userRole !== 'super-admin'}
                                                            value={thanksgivingSession?.end_time || ""}
                                                            onChange={e => setThanksgivingSession({
                                                                ...thanksgivingSession,
                                                                end_time: e.target.value
                                                            })}
                                                            className={`w-full p-3 border border-amber-200 text-brand-primary rounded-lg ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}/>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Times: Standard Sessions */}
                                                <div
                                                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">2nd-5th
                                                        Sundays: Standard Services</h5>
                                                    <div className="space-y-4">
                                                        {standardSessions.map((session, index) => (
                                                            <div key={index}
                                                                 className="flex flex-col sm:flex-row gap-4">
                                                                <div className="flex-1"><label
                                                                    className="text-xs font-bold text-gray-600 block mb-1">Service
                                                                    Name</label><input
                                                                    disabled={userRole !== 'super-admin'}
                                                                    value={session.name} onChange={e => {
                                                                    const s = [...standardSessions];
                                                                    s[index].name = e.target.value;
                                                                    setStandardSessions(s);
                                                                }}
                                                                    className={`w-full p-3 border rounded-lg text-brand-primary ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed' : 'bg-slate-50'}`}/>
                                                                </div>
                                                                <div className="w-full sm:w-32"><label
                                                                    className="text-xs font-bold text-gray-600 block mb-1">Start
                                                                    Time</label><input type="time"
                                                                                       disabled={userRole !== 'super-admin'}
                                                                                       value={session.start_time}
                                                                                       onChange={e => {
                                                                                           const s = [...standardSessions];
                                                                                           s[index].start_time = e.target.value;
                                                                                           setStandardSessions(s);
                                                                                       }}
                                                                                       className={`w-full p-3 border rounded-lg text-brand-primary ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed' : 'bg-slate-50'}`}/>
                                                                </div>
                                                                <div className="w-full sm:w-32"><label
                                                                    className="text-xs font-bold text-gray-600 block mb-1">End
                                                                    Time</label><input type="time"
                                                                                       disabled={userRole !== 'super-admin'}
                                                                                       value={session.end_time}
                                                                                       onChange={e => {
                                                                                           const s = [...standardSessions];
                                                                                           s[index].end_time = e.target.value;
                                                                                           setStandardSessions(s);
                                                                                       }}
                                                                                       className={`w-full p-3 border rounded-lg text-brand-primary ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed' : 'bg-slate-50'}`}/>
                                                                </div>
                                                                {standardSessions.length > 1 && userRole === 'super-admin' && (
                                                                    <button type="button"
                                                                            onClick={() => handleRemoveSession(index)}
                                                                            className="mt-6 p-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                                                                        <Trash2 size={18}/></button>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {userRole === 'super-admin' && (
                                                            <button type="button" onClick={handleAddSession}
                                                                    className="text-xs font-bold text-brand-primary hover:text-amber-600 flex items-center gap-1 mt-2">
                                                                <Plus size={14}/> Add Another Service
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 border-t border-gray-200 pt-6">
                                                <div><label
                                                    className="text-[10px] font-bold text-gray-900 uppercase block mb-2">Start
                                                    Time</label><input type="time" disabled={userRole !== 'super-admin'}
                                                                       value={startTime}
                                                                       onChange={e => setStartTime(e.target.value)}
                                                                       className={`w-full p-4 border rounded-xl text-brand-primary ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed text-gray-800' : 'bg-white focus:ring-2 focus:ring-brand-primary outline-none'}`}/>
                                                </div>
                                                <div><label
                                                    className="text-[10px] font-bold text-gray-900 uppercase block mb-2">End
                                                    Time</label><input type="time" disabled={userRole !== 'super-admin'}
                                                                       value={endTime}
                                                                       onChange={e => setEndTime(e.target.value)}
                                                                       className={`w-full p-4 border rounded-xl text-brand-primary ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed text-gray-800' : 'bg-white focus:ring-2 focus:ring-brand-primary outline-none'}`}/>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* SINGLE DAY */}
                                {eventType === 'single_day' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div><label
                                            className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Specific
                                            Date</label><input type="date" disabled={userRole !== 'super-admin'}
                                                               required value={singleDate}
                                                               onChange={e => setSingleDate(e.target.value)}
                                                               className={`w-full p-4 border rounded-xl ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'bg-white focus:ring-2 focus:ring-brand-primary'}`}/>
                                        </div>
                                        <div><label
                                            className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Start
                                            Time</label><input type="time" disabled={userRole !== 'super-admin'}
                                                               required value={startTime}
                                                               onChange={e => setStartTime(e.target.value)}
                                                               className={`w-full p-4 border rounded-xl ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'bg-white focus:ring-2 focus:ring-brand-primary'}`}/>
                                        </div>
                                        <div><label
                                            className="text-[10px] font-bold text-gray-400 uppercase block mb-2">End
                                            Time</label><input type="time" disabled={userRole !== 'super-admin'}
                                                               required value={endTime}
                                                               onChange={e => setEndTime(e.target.value)}
                                                               className={`w-full p-4 border rounded-xl ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'bg-white focus:ring-2 focus:ring-brand-primary'}`}/>
                                        </div>
                                    </div>
                                )}

                                {/* MULTI DAY */}
                                {eventType === 'multi_day' && (
                                    <div className="space-y-4">
                                        {multiDays.map((day, index) => (
                                            <div key={index}
                                                 className="flex flex-col sm:flex-row gap-4 items-end bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group">
                                                <div className="flex-1 w-full"><label
                                                    className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Label</label><input
                                                    disabled={userRole !== 'super-admin'} value={day.label}
                                                    onChange={e => {
                                                        const newDays = [...multiDays];
                                                        newDays[index].label = e.target.value;
                                                        setMultiDays(newDays);
                                                    }}
                                                    className={`w-full p-3 border rounded-lg ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed' : ''}`}/>
                                                </div>
                                                <div className="flex-1 w-full"><label
                                                    className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Date</label><input
                                                    type="date" disabled={userRole !== 'super-admin'} required
                                                    value={day.date} onChange={e => {
                                                    const newDays = [...multiDays];
                                                    newDays[index].date = e.target.value;
                                                    setMultiDays(newDays);
                                                }}
                                                    className={`w-full p-3 border rounded-lg ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed' : ''}`}/>
                                                </div>
                                                <div className="flex-1 w-full"><label
                                                    className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Start</label><input
                                                    type="time" disabled={userRole !== 'super-admin'} required
                                                    value={day.start_time} onChange={e => {
                                                    const newDays = [...multiDays];
                                                    newDays[index].start_time = e.target.value;
                                                    setMultiDays(newDays);
                                                }}
                                                    className={`w-full p-3 border rounded-lg ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed' : ''}`}/>
                                                </div>
                                                <div className="flex-1 w-full"><label
                                                    className="text-[10px] font-bold text-gray-400 uppercase block mb-1">End</label><input
                                                    type="time" disabled={userRole !== 'super-admin'} required
                                                    value={day.end_time} onChange={e => {
                                                    const newDays = [...multiDays];
                                                    newDays[index].end_time = e.target.value;
                                                    setMultiDays(newDays);
                                                }}
                                                    className={`w-full p-3 border rounded-lg ${userRole !== 'super-admin' ? 'bg-gray-100 cursor-not-allowed' : ''}`}/>
                                                </div>

                                                {multiDays.length > 1 && userRole === 'super-admin' && (
                                                    <button type="button" onClick={() => handleRemoveMultiDay(index)}
                                                            className="p-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                                                        <Trash2 size={18}/></button>
                                                )}
                                            </div>
                                        ))}
                                        {userRole === 'super-admin' && (
                                            <button type="button" onClick={handleAddMultiDay}
                                                    className="w-full py-4 border-2 border-dashed border-purple-200 text-purple-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors">
                                                <Plus size={18}/> Add Another Day
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 4. OPTIONAL OVERRIDES */}
                        {eventType !== 'recurring' && (
                            <div className="space-y-6">
                                <label className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-3">Step
                                    4: Edit/Change Additional Event Info</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                                    <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Guest
                                        Speaker(s)</label><input value={guestSpeaker}
                                                                 onChange={e => setGuestSpeaker(e.target.value)}
                                                                 placeholder="e.g. Pastor E.A. Adeboye"
                                                                 className="w-full p-4 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-brand-primary outline-none"/>
                                    </div>
                                    <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Specific
                                        Theme</label><input value={theme} onChange={e => setTheme(e.target.value)}
                                                            placeholder="e.g. Let There Be Light"
                                                            className="w-full p-4 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-brand-primary outline-none"/>
                                    </div>
                                    <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Specific
                                        Topic</label><input value={topic} onChange={e => setTopic(e.target.value)}
                                                            placeholder="e.g. Faith to Move Mountains"
                                                            className="w-full p-4 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-brand-primary outline-none"/>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className='flex flex-col gap-3 pt-8 border-t border-gray-100 '>
                            <label
                                className="text-[9px] md:text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">Step
                                5: Save Event(s) Changes. It goes live Immediately!!!</label>
                            <div className="flex justify-end">
                                <button type="submit" disabled={loading}
                                        className="w-full sm:w-auto px-10 py-5 bg-brand-primary text-white rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-colors disabled:opacity-50">
                                    {loading ? "Saving Changes..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}