"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {UserPlus, ArrowDownCircle, AlertCircle, ArrowUpCircle, Loader2, Search, Trash2, UserCheck, Clock, X, KeyRound, Users, ChevronDown} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type ViewMode = 'personnel' | 'revoked';

export default function ProfilesManagement() {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [activeView, setActiveView] = useState<ViewMode>('personnel');

    const [roleFilter, setRoleFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest"); // "newest" or "latest" (alphabetical)

    // Create Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createData, setCreateData] = useState({ email: '', full_name: '', password: '', role: 'viewer' });
    const [isCreating, setIsCreating] = useState(false);

    const [editTarget, setEditTarget] = useState<any | null>(null);
    const [isUpdatingUser, setIsUpdatingUser] = useState(false);

    // Action States
    const [choiceTarget, setChoiceTarget] = useState<{user: any, direction: 'up' | 'down'} | null>(null);
    const [revokeTarget, setRevokeTarget] = useState<any | null>(null);
    const [restoreTarget, setRestoreTarget] = useState<any | null>(null);

    const USER_LIMIT = 7;
    const ROLE_HIERARCHY = ['viewer', 'editor', 'super-admin'];

    const getEmptyStateMessage = () => {
        // 1. If the user is typing in the search bar but nothing matches
        if (searchTerm) return `No members found matching "${searchTerm}"`;

        // 2. If the "Revoked" tab is selected but empty
        if (activeView === "revoked") return "The archive is currently empty. No revoked accounts found.";

        // 3. Default state for the Personnel tab
        return "No active staff members found. Click 'Create Staff Account' to begin.";
    };

    const roleStyles: Record<string, string> = {
        'super-admin': 'bg-emerald-900 text-emerald-50 border-emerald-800 shadow-emerald-900/20',
        'editor': 'bg-indigo-900 text-indigo-50 border-indigo-800 shadow-indigo-900/20',
        'viewer': 'bg-[#FFF9F2] text-[#8C7B6A] border-[#F2E8DC] shadow-sm'
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    async function fetchProfiles() {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error("Could not fetch live data.");
        }

        setProfiles(data || []);
        setLoading(false);
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (createData.password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        setIsCreating(true);

        try {
            // Call our new direct-creation API
            const response = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Account creation failed");

            toast.success(`Account created for ${createData.full_name}! They can now log in.`);
            setIsCreateModalOpen(false);
            setCreateData({ email: '', full_name: '', password: '', role: 'viewer' }); // Reset form
            await fetchProfiles();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsCreating(false);
        }
    };

    const getTimeRemaining = (expiryDate: string) => {
        const total = Date.parse(expiryDate) - Date.parse(new Date().toString());
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        return { total, days, hours };
    };

    const filteredProfiles = profiles
        .filter(p => {
            const matchesSearch = p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.email?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesView = p.status === (activeView === 'personnel' ? 'active' : activeView);
            const matchesRole = roleFilter === "all" || p.role === roleFilter;
            return matchesSearch && matchesView && matchesRole;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') {
                return Date.parse(b.created_at) - Date.parse(a.created_at);
            }
            return a.full_name.localeCompare(b.full_name);
        })

    const activeCount = profiles.filter(p => p.status === 'active').length;

    const handleRoleUpdate = async (id: string, newRole: string) => {
        setChoiceTarget(null);
        if (id.startsWith('mock-')) {
            setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: newRole } : p));
            toast.success(`Role updated to ${newRole}`);
            return;
        }
        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
        if (error) toast.error("Database update failed");
        else fetchProfiles();
    };

    const handlePromote = (user: any) => {
        if (user.role === 'viewer') {
            setChoiceTarget({ user, direction: 'up' }); // Opens modal to pick Editor or Super Admin
        } else if (user.role === 'editor') {
            handleRoleUpdate(user.id, 'super-admin'); // Direct jump
        }
    };

    const handleDemote = (user: any) => {
        if (user.role === 'super-admin') {
            setChoiceTarget({ user, direction: 'down' }); // Opens modal to pick Editor or Viewer
        } else if (user.role === 'editor') {
            handleRoleUpdate(user.id, 'viewer'); // Direct drop
        } else if (user.role === 'viewer') {
            setRevokeTarget(user); // Trigger revoke flow
        }
    };

    const handleSensitiveUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingUser(true);
        try {
            // 1. Get the current user's session token to prove they are an admin
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch('/api/update', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    // 2. Attach the token here so your API route can read it!
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify(editTarget),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Update failed");
            }

            toast.success("Identity updated successfully");
            setEditTarget(null);
            await fetchProfiles();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsUpdatingUser(false);
        }
    };

    const executeRevoke = async (id: string) => {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 5);

        const updates = { status: 'revoked', expires_at: expiry.toISOString() };

        if (id.startsWith('mock-')) {
            setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
            toast.warning("Member revoked. 5-day countdown started.");
        } else {
            await supabase.from('profiles').update(updates).eq('id', id);
            await fetchProfiles();
        }
        setRevokeTarget(null);
        toast.warning("Member access revoked.");
    };

    const executeRestore = async (id: string, chosenRole: string) => {
        const updates = {
            status: 'active',
            expires_at: null,
            role: chosenRole
        };

        if (id.startsWith('mock-')) {
            setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
            toast.success("Mock Access Restored.");
        } else {
            const { error } = await supabase.from('profiles').update(updates).eq('id', id);
            if (error) {
                toast.error("Restore failed");
            } else {
                await fetchProfiles();
                toast.success("Access restored.");
            }
        }
        setRestoreTarget(null);
    };

    return (
        <div className="p-4 md:p-12 max-w-6xl mx-auto min-h-screen pb-24 relative">

            <div className="mb-6 md:mb-8">
                <Link
                    href="/admin"
                    className="text-xs md:text-sm text-brand-secondary font-bold hover:underline">
                    <span className="text-lg leading-none">←</span> Back to Dashboard
                </Link>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div className='w-full text-center md:text-left'>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary tracking-tight">Admin Personnel</h1>
                    <p className="text-brand-secondary text-sm font-medium">Lagos Province 56 • Administration Console</p>
                </div>
                <div className="flex flex-col w-full md:w-auto items-center md:items-end gap-3">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        disabled={activeCount >= USER_LIMIT}
                        className="w-full md:w-auto bg-brand-primary text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl disabled:opacity-20 hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                        <UserPlus size={18} /> Create Staff Account
                    </button>
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <div
                            className="flex-1 md:w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden border border-brand-accent/50"
                        >                            <div
                                className="h-full bg-brand-primary transition-all duration-700"
                                style={{ width: `${(activeCount / USER_LIMIT) * 100}%` }}
                            />
                        </div>
                        <span
                            className="text-[10px] font-black text-brand-secondary uppercase tracking-widest whitespace-nowrap"
                        >
                            {activeCount} / {USER_LIMIT} Slots
                           </span>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mb-8 bg-brand-surface p-1.5 rounded-2xl w-fit border border-brand-accent">
                {['personnel', 'revoked'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveView(tab as ViewMode)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            activeView === tab ? 'bg-white text-brand-primary shadow-sm border border-brand-accent' : 'text-gray-400 hover:text-brand-primary'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className='relative flex-1'>
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder={`Filter through ${activeView}...`}
                        className="w-full pl-12 pr-6 py-4 bg-white border border-brand-accent rounded-2xl outline-none shadow-sm focus:ring-2 focus:ring-brand-primary/5 transition-all"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 shrink-0">
                    <div className="relative flex-1 md:w-40 group">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full h-full px-4 py-4 bg-white border border-brand-accent rounded-2xl text-xs font-bold uppercase tracking-widest text-brand-primary outline-none cursor-pointer appearance-none shadow-sm"
                        >
                            <option value="all">All Roles</option>
                            <option value="super-admin">Admins</option>
                            <option value="editor">Editors</option>
                            <option value="viewer">Viewers</option>
                        </select>

                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-secondary group-hover:text-brand-primary transition-colors">
                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                        </div>
                    </div>

                    <div className="relative flex-1 md:w-40 group">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full h-full px-4 py-4 bg-white border border-brand-accent rounded-2xl text-xs font-bold uppercase tracking-widest text-brand-primary outline-none cursor-pointer appearance-none shadow-sm"
                        >
                            <option value="newest">Newest</option>
                            <option value="alphabetical">A - Z</option>
                        </select>

                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-secondary group-hover:text-brand-primary transition-colors">
                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-brand-accent rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className='hidden md:block overflow-x-auto'>
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-brand-surface/30 border-b border-brand-accent">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-primary/40">Authorized Identity</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-primary/40">Security Level</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-brand-primary/40">Access Controls</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-accent">
                        {filteredProfiles.map((p) => {
                            const time = p.expires_at ? getTimeRemaining(p.expires_at) : null;
                            return (
                                <tr key={p.id} className="hover:bg-brand-surface/10 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-brand-primary text-lg leading-tight group-hover:translate-x-1 transition-transform">{p.full_name}</div>
                                        <div className="text-xs text-gray-400 font-medium">{p.email}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1.5">
                                            <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                roleStyles[p.role] || roleStyles['viewer']
                                            }`}>
                                                {p.role}
                                            </span>
                                            {activeView === 'revoked' && time && (
                                                <div className="flex items-center gap-1 text-[9px] font-bold text-red-500 uppercase tracking-tighter bg-red-50 w-fit px-2 py-0.5 rounded-md">
                                                    <Clock size={10} /> Auto-Delete in {time.days}d {time.hours}h
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            {activeView === 'personnel' ? (
                                                <>
                                                    <button
                                                        onClick={() => handlePromote(p)}
                                                        disabled={p.role === 'super-admin'}
                                                        className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl disabled:opacity-10 transition-all"
                                                    >
                                                        <ArrowUpCircle size={24}/>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDemote(p)}
                                                        className="p-2.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                                    >
                                                        <ArrowDownCircle size={24}/>
                                                    </button>
                                                    <div className="w-px h-6 bg-gray-100 mx-1 self-center" />
                                                    <button
                                                        onClick={() => setEditTarget({ id: p.id, full_name: p.full_name, email: p.email, password: '' })}
                                                        className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                        title="Edit Security Credentials"
                                                    >
                                                        <KeyRound size={20}/>
                                                    </button>
                                                    <button onClick={() => setRevokeTarget(p)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20}/></button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => setRestoreTarget(p)}
                                                    className="px-5 py-2.5 bg-brand-surface text-brand-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-brand-accent hover:bg-brand-primary hover:text-white transition-all active:scale-95 shadow-sm"
                                                >
                                                    Restore Full Access
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>

                    {filteredProfiles.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
                            <div className="h-15 w-15 bg-brand-surface rounded-[2rem] flex items-center justify-center text-brand-primary/20 mb-6 border border-brand-accent">
                                {searchTerm ? <Search size={25} /> : <Users size={25} />}
                            </div>
                            <h3 className="text-xl font-serif font-bold text-brand-primary mb-2">
                                {searchTerm ? "No Results Found" : "Everything is Empty"}
                            </h3>
                            <p className="text-sm text-brand-secondary max-w-xs mx-auto mb-8 leading-relaxed">
                                {getEmptyStateMessage()}
                            </p>

                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline"
                                >
                                    Clear Search Filter
                                </button>
                            )}
                        </div>
                    )}

                    {profiles.length === 0 && !loading && (
                        <div className="p-20 text-center text-brand-primary font-bold italic">
                            {getEmptyStateMessage()}
                        </div>
                    )}
                </div>

                {/* MOBILE LIST */}
                <div className="md:hidden divide-y divide-brand-accent">
                    {filteredProfiles.map((p) => {
                        const time = p.expires_at ? getTimeRemaining(p.expires_at) : null;
                        const roleStyle = roleStyles[p.role] || roleStyles['viewer'];

                        return (
                            <div key={p.id} className="p-5 space-y-5">
                                <div className="flex justify-between items-start gap-4">
                                    <div className='min-w-0 flex-1'>
                                        <div className="font-bold text-brand-primary text-lg truncate">{p.full_name}</div>
                                        <div className="text-xs text-gray-400 truncate font-medium ">{p.email}</div>
                                    </div>
                                    <span className={`shrink-0 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${roleStyle}`}>
                                        {p.role}
                                    </span>
                                </div>

                                {activeView === 'revoked' && time && (
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase tracking-tight bg-red-50 p-3 rounded-xl border border-red-100">
                                        <Clock size={10} /> Auto-Delete in {time.days}d {time.hours}h
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {activeView === 'personnel' ? (
                                        <>
                                            <button
                                                onClick={() => handlePromote(p)}
                                                disabled={p.role === 'super-admin'}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 disabled:opacity-20 active:scale-95 transition-all"
                                            >
                                                <ArrowUpCircle size={15}/>
                                            </button>
                                            <button
                                                onClick={() => handleDemote(p)}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100 active:scale-95 transition-all"
                                            >
                                                <ArrowDownCircle size={15}/>
                                            </button>

                                            <div className='flex gap-2 w-full'>
                                                <button
                                                    onClick={() => setEditTarget({ id: p.id, full_name: p.full_name, email: p.email, password: '' })}
                                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 active:scale-95 transition-all"
                                                >
                                                    <KeyRound size={15}/>
                                                </button>
                                                <button
                                                    onClick={() => setRevokeTarget(p)}
                                                    className="px-6 flex items-center justify-center bg-red-50 text-red-500 rounded-xl border border-red-100 active:scale-95 transition-all"
                                                >
                                                    <Trash2 size={15}/>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setRestoreTarget(p)}
                                            className="w-full py-4 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                        >
                                            <UserCheck size={15} /> Restore Full Access
                                        </button>
                                    )}
                                </div>
                            </div>
                        )})}
                </div>
            </div>

            {/* REVOKE CONFIRMATION MODAL */}
            {revokeTarget && (
                <div className="fixed inset-0 bg-red-900/20 backdrop-blur-md z-[250] flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-red-100 max-w-sm w-full animate-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div className="h-12 w-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-4">
                                <AlertCircle size={28} />
                            </div>
                            <button
                                onClick={() => setRevokeTarget(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20}/>
                            </button>
                        </div>

                        <h3 className="text-2xl font-serif font-bold text-brand-primary mb-2">Revoke Access?</h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-8">
                            You are about to revoke access for <strong className="text-brand-primary">{revokeTarget.full_name}</strong>.
                            They will be moved to the <span className="font-bold uppercase text-[10px] tracking-widest">Revoked</span> tab for 5 days before permanent deletion.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => executeRevoke(revokeTarget.id)}
                                className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 hover:shadow-lg hover:shadow-red-200 transition-all active:scale-[0.98]"
                            >
                                Confirm Revocation
                            </button>
                            <button
                                onClick={() => setRevokeTarget(null)}
                                className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                            >
                                Cancel Action
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODALS: Restore, Role Choice (Same as before) */}
            {restoreTarget && (
                <div className="fixed inset-0 bg-brand-primary/20 backdrop-blur-md z-[120] flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-brand-accent max-w-sm w-full animate-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-2xl font-serif font-bold text-brand-primary">Restore Member</h3>
                            <button onClick={() => setRestoreTarget(null)}><X size={20}/></button>
                        </div>
                        <p className="text-xs text-gray-400 mb-6">Assign a role to <strong>{restoreTarget.full_name}</strong> to complete restoration.</p>
                        <div className="space-y-3">
                            {ROLE_HIERARCHY.map(role => (
                                <button key={role} onClick={() => executeRestore(restoreTarget.id, role)} className="w-full p-5 rounded-2xl border border-brand-accent hover:border-brand-primary hover:bg-brand-surface text-left group transition-all">
                                    <span className="block text-[9px] font-black uppercase text-gray-400 mb-1">Restore as</span>
                                    <span className="block font-bold text-brand-primary capitalize">{role}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {choiceTarget && (
                <div className="fixed inset-0 bg-brand-primary/20 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-brand-accent max-w-sm w-full animate-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-serif font-bold text-brand-primary">Update Rank</h3>
                                <p className="text-xs text-gray-400 mt-1">Select the target level for this member.</p>
                            </div>
                            <button onClick={() => setChoiceTarget(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
                        </div>
                        <div className="space-y-3">
                            {ROLE_HIERARCHY.filter(r => r !== choiceTarget.user.role).map(role => (
                                <button
                                    key={role}
                                    onClick={() => handleRoleUpdate(choiceTarget.user.id, role)}
                                    className="w-full p-6 rounded-[1.5rem] border border-brand-accent hover:border-brand-primary hover:bg-brand-surface text-left group transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="block text-[9px] font-black uppercase text-gray-400 mb-1 tracking-widest">Assign As</span>
                                            <span className="block font-bold text-brand-primary text-lg capitalize">{role.replace('-', ' ')}</span>
                                        </div>
                                        <div className="h-10 w-10 bg-brand-surface rounded-xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                            <UserCheck size={20} />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-brand-accent animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-serif font-bold text-brand-primary">Create Staff</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-brand-surface rounded-full transition-colors"><X/></button>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-brand-primary mb-2 ml-1">Full Identity Name</label>
                                <input
                                    required
                                    className="w-full px-5 py-4 bg-brand-surface border border-brand-accent text-brand-primary rounded-2xl outline-none focus:border-brand-primary transition-all"
                                    placeholder="e.g. Brother John Doe"
                                    value={createData.full_name}
                                    onChange={e => setCreateData({...createData, full_name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-brand-primary mb-2 ml-1">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full px-5 py-4 bg-brand-surface border border-brand-accent text-brand-primary rounded-2xl outline-none focus:border-brand-primary transition-all"
                                    placeholder="staff@church.com"
                                    value={createData.email}
                                    onChange={e => setCreateData({...createData, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-brand-primary mb-2 ml-1">Initial Password</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-5 py-4 bg-brand-surface border border-brand-accent text-brand-primary rounded-2xl outline-none focus:border-brand-primary transition-all"
                                    placeholder="Set a temporary password..."
                                    value={createData.password}
                                    onChange={e => setCreateData({...createData, password: e.target.value})}
                                />
                                <p className="text-[10px] text-gray-400 mt-2 ml-1">You will need to securely share this password with them.</p>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-brand-primary mb-2 ml-1">Access Level</label>
                                <select
                                    className="w-full px-5 py-4 bg-brand-surface border border-brand-accent rounded-2xl text-brand-primary outline-none focus:border-brand-primary appearance-none cursor-pointer"
                                    value={createData.role}
                                    onChange={e => setCreateData({...createData, role: e.target.value})}
                                >
                                    <option value="viewer">Viewer (Read Only)</option>
                                    <option value="editor">Editor (Can Manage Content)</option>
                                    <option value="super-admin">Super Admin (Full Control)</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="w-full py-5 bg-brand-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-brand-primary/20 transition-all disabled:opacity-50"
                            >
                                {isCreating ? <Loader2 className="animate-spin" /> : <><UserPlus size={18}/> Create Account</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {editTarget && (
                <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-brand-accent animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-serif font-bold text-brand-primary">Edit Identity</h2>
                            <button onClick={() => setEditTarget(null)} className="p-2 hover:bg-brand-surface rounded-full transition-colors"><X/></button>
                        </div>

                        <form onSubmit={handleSensitiveUpdate} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-brand-primary mb-2 ml-1">Full Name</label>
                                <input
                                    required
                                    className="w-full px-5 py-4 bg-brand-surface border border-brand-accent text-brand-primary rounded-2xl outline-none focus:border-brand-primary transition-all"
                                    value={editTarget.full_name}
                                    onChange={e => setEditTarget({...editTarget, full_name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-brand-primary mb-2 ml-1">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full px-5 py-4 bg-brand-surface border border-brand-accent text-brand-primary rounded-2xl outline-none focus:border-brand-primary transition-all"
                                    value={editTarget.email}
                                    onChange={e => setEditTarget({...editTarget, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-brand-primary mb-2 ml-1">New Password (Leave blank to keep current)</label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-4 bg-brand-surface border border-brand-accent text-brand-primary rounded-2xl outline-none focus:border-brand-primary transition-all"
                                    placeholder="Enter new security key..."
                                    value={editTarget.password}
                                    onChange={e => setEditTarget({...editTarget, password: e.target.value})}
                                />
                            </div>

                            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                                <AlertCircle className="text-amber-600 shrink-0" size={18} />
                                <p className="text-[10px] text-amber-700 leading-tight">
                                    Updating these fields will immediately change how this user logs in. Ensure you communicate new credentials to them.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdatingUser}
                                className="w-full py-5 bg-brand-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-xl transition-all disabled:opacity-50"
                            >
                                {isUpdatingUser ? <Loader2 className="animate-spin" /> : "Update Credentials"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}