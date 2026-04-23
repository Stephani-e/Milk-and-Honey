"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
    Shield, UserMinus, UserPlus, ArrowDownCircle, ArrowUpCircle,
    Mail, Loader2, Search, Filter, Trash2, Users, UserCheck, Clock, X, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

type ViewMode = 'personnel' | 'invited' | 'revoked';

export default function ProfilesManagement() {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeView, setActiveView] = useState<ViewMode>('personnel');

    // Invite Modal State
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteData, setInviteData] = useState({ email: '', full_name: '', role: 'viewer' });
    const [isInviting, setIsInviting] = useState(false);

    // Action States
    const [choiceTarget, setChoiceTarget] = useState<{user: any, direction: 'up' | 'down'} | null>(null);
    const [revokeTarget, setRevokeTarget] = useState<any | null>(null);
    const [restoreTarget, setRestoreTarget] = useState<any | null>(null);

    const USER_LIMIT = 7;
    const ROLE_HIERARCHY = ['viewer', 'editor', 'super-admin'];

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

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviting(true);

        try {

            const response = await fetch('/api/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inviteData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Invite failed");

            toast.success(`Invite sent to ${inviteData.email}`);
            setIsInviteModalOpen(false);
            fetchProfiles();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsInviting(false);
        }
    };



    const getTimeRemaining = (expiryDate: string) => {
        const total = Date.parse(expiryDate) - Date.parse(new Date().toString());
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        return { total, days, hours };
    };

    const filteredProfiles = profiles.filter(p => {
        const matchesSearch = p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesView = p.status === (activeView === 'personnel' ? 'active' : activeView);
        return matchesSearch && matchesView;
    });

    const activeCount = profiles.filter(p => p.status === 'active').length;

    const handleRoleUpdate = async (id: string, newRole: string) => {
        setChoiceTarget(null);
        if (id.startsWith('mock-')) {
            setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: newRole } : p));
            toast.success(`Mock: Role updated to ${newRole}`);
            return;
        }
        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
        if (error) toast.error("Database update failed");
        else fetchProfiles();
    };

    const executeRevoke = async (id: string) => {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 5); // 5 Day Grace Period

        const updates = { status: 'revoked', expires_at: expiry.toISOString() };

        if (id.startsWith('mock-')) {
            setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
            toast.warning("Member revoked. 5-day countdown started.");
        } else {
            await supabase.from('profiles').update(updates).eq('id', id);
            fetchProfiles();
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
                fetchProfiles();
                toast.success("Access restored.");
            }
        }
        setRestoreTarget(null);
    };

    return (
        <div className="p-4 md:p-12 max-w-6xl mx-auto min-h-screen pb-24 relative">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary">Admin Personnel</h1>
                    <p className="text-brand-secondary text-sm font-medium mt-1">Lagos Province 56 • Administration Console</p>
                </div>
                <div className="flex flex-col w-full md:w-auto items-end gap-3">
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        disabled={activeCount >= USER_LIMIT}
                        className="w-full md:w-auto bg-brand-primary text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl disabled:opacity-20 hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                        <Mail size={18} /> Invite New Staff
                    </button>
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-primary transition-all duration-500" style={{ width: `${(activeCount / USER_LIMIT) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{activeCount} / {USER_LIMIT} Slots</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mb-8 bg-brand-surface p-1.5 rounded-2xl w-fit border border-brand-accent">
                {['personnel', 'invited', 'revoked'].map((tab) => (
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

            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                    type="text"
                    placeholder={`Filter through ${activeView}...`}
                    className="w-full pl-12 pr-6 py-4 bg-white border border-brand-accent rounded-2xl outline-none shadow-sm focus:ring-2 focus:ring-brand-primary/5 transition-all"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white border border-brand-accent rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className='hidden md:block'>
                    <table className="w-full text-left">
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
                                                p.role === 'super-admin' ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20' : 'bg-white text-brand-secondary border-brand-accent'
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
                                                    <button onClick={() => setChoiceTarget({user: p, direction: 'up'})} disabled={p.role === 'super-admin'} className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl disabled:opacity-10 transition-all"><ArrowUpCircle size={24}/></button>
                                                    <button onClick={() => setChoiceTarget({user: p, direction: 'down'})} className="p-2.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-all"><ArrowDownCircle size={24}/></button>
                                                    <div className="w-px h-6 bg-gray-100 mx-1 self-center" />
                                                    <button onClick={() => setRevokeTarget(p)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20}/></button>
                                                </>
                                            ) : activeView === 'revoked' ? (
                                                <button
                                                    onClick={() => setRestoreTarget(p)}
                                                    className="px-5 py-2.5 bg-brand-surface text-brand-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-brand-accent hover:bg-brand-primary hover:text-white transition-all active:scale-95 shadow-sm"
                                                >
                                                    Restore Full Access
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic flex items-center gap-2">
                                                    <Clock size={12} /> Awaiting Verification
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {/*mobile*/}
                <div className="md:hidden divide-y divide-brand-accent">
                    {filteredProfiles.map((p) => (
                        <div key={p.id} className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-brand-primary text-lg">{p.full_name}</div>
                                    <div className="text-xs text-gray-400">{p.email}</div>
                                </div>
                                <span className="px-3 py-1 bg-brand-surface border border-brand-accent rounded-full text-[10px] font-black uppercase text-brand-primary">
                                    {p.role}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                {/* Compact buttons for mobile */}
                                <button className="flex-1 py-3 bg-brand-surface rounded-xl text-[10px] font-bold uppercase text-brand-primary border border-brand-accent">Manage</button>
                                <button className="px-4 py-3 text-red-400 bg-red-50 rounded-xl"><Trash2 size={18}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

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

            {isInviteModalOpen && (
                <div className="fixed inset-0 bg-brand-primary/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-brand-accent animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-serif font-bold text-brand-primary">Invite Staff</h2>
                            <button onClick={() => setIsInviteModalOpen(false)} className="p-2 hover:bg-brand-surface rounded-full transition-colors"><X/></button>
                        </div>

                        <form onSubmit={handleInvite} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-brand-primary  mb-2 ml-1">Full Identity Name</label>
                                <input
                                    required
                                    className="w-full px-5 py-4 bg-brand-surface border border-brand-accent text-brand-primary  rounded-2xl outline-none focus:border-brand-primary transition-all"
                                    placeholder="e.g. Brother John Doe"
                                    value={inviteData.full_name}
                                    onChange={e => setInviteData({...inviteData, full_name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-brand-primary  mb-2 ml-1">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full px-5 py-4 bg-brand-surface border border-brand-accent text-brand-primary  rounded-2xl outline-none focus:border-brand-primary transition-all"
                                    placeholder="staff@church.com"
                                    value={inviteData.email}
                                    onChange={e => setInviteData({...inviteData, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-brand-primary mb-2 ml-1">Access Level</label>
                                <select
                                    className="w-full px-5 py-4 bg-brand-surface border border-brand-accent rounded-2xl text-brand-primary  outline-none focus:border-brand-primary appearance-none cursor-pointer"
                                    value={inviteData.role}
                                    onChange={e => setInviteData({...inviteData, role: e.target.value})}
                                >
                                    <option value="viewer">Viewer (Read Only)</option>
                                    <option value="editor">Editor (Can Manage Content)</option>
                                    <option value="super-admin">Super Admin (Full Control)</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={isInviting}
                                className="w-full py-5 bg-brand-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-brand-primary/20 transition-all disabled:opacity-50"
                            >
                                {isInviting ? <Loader2 className="animate-spin" /> : <><Mail size={18}/> Send Invitation</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}