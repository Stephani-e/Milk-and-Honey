"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, Home, ShieldCheck, Users, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ConfirmModal from "@/components/Admin/ConfirmModal";

interface UserProfile {
    full_name?: string;
    email?: string;
    role?: string;
}

export default function Navbar() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [newName, setNewName] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    // Calculate the user's initial for the avatar
    const userInitial = profile?.full_name
        ? profile.full_name.charAt(0).toUpperCase()
        : (profile?.email?.charAt(0).toUpperCase() || "A");

    // Fetch the user's profile data
    useEffect(() => {
        let isMounted = true;
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && isMounted) {
                const { data } = await supabase
                    .from('profiles')
                    .select('full_name, role, email')
                    .eq('id', user.id)
                    .single();
                if (data) setProfile(data);
            }
        };
        getProfile();
        return () => { isMounted = false; };
    }, []);

    const handleUpdateName = async () => {
        if (!newName.trim()) return toast.error("Name cannot be empty");
        setIsUpdating(true);

        const { error } = await supabase
            .from('profiles')
            .update({ full_name: newName })
            .eq('id', profile.id);

        if (error) {
            toast.error("Failed to update profile");
        } else {
            setProfile({ ...profile, full_name: newName });
            toast.success("Profile updated!");
            setIsProfileOpen(false);
        }
        setIsUpdating(false);
    };

    // Handle the logout action
    const handleSignOut = async () => {
        setIsLoggingOut(true);
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error("Logout Failed");
            setIsLoggingOut(false);
        } else {
            toast.success('Logout Successful! Redirecting to Login Page...');
            setTimeout(() => {
                router.push("/login");
                router.refresh();
            }, 2500);
        }
    };

    return (
        <>
            <nav className="sticky top-0 z-[50] bg-white/90 backdrop-blur-md border-b border-brand-accent px-4 md:px-6">
                <div className="max-w-7xl mx-auto h-16 md:h-20 flex items-center justify-between">

                    <Link href="/admin" className="flex items-center gap-3 md:gap-4 group">
                        <div className="h-12 w-12 md:h-11 bg-brand-primary md:rounded-xl flex items-center justify-center text-white font-serif font-bold text-base md:text-lg shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform">
                            M&H
                        </div>
                        <div className="hidden sm:block">
                            <h2 className="text-brand-primary font-serif font-bold leading-none text-sm md:text-lg">Milk & Honey</h2>
                            <p className="text-[8px] md:text-[9px] uppercase tracking-widest font-black text-brand-secondary mt-0.5 md:mt-1">Admin Portal</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2 md:gap-4">

                        {profile?.role === 'super-admin' && (
                            <Link
                                href="/admin/profiles"
                                className="flex items-center gap-2 px-3 py-2 bg-brand-primary/5 text-brand-primary rounded-full hover:bg-brand-primary hover:text-white transition-all group border border-brand-primary/10 shadow-sm"
                            >
                                <Users size={16} className="shrink-0" />
                                <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest">Manage Access</span>
                            </Link>
                        )}

                        <button
                            onClick={() => setIsProfileOpen(true)}
                            className='flex items-center gap-2 md:gap-3 bg-brand-surface border border-brand-accent p-1 md:pl-2 md:pr-4 md:py-1.5 rounded-full hover:border-brand-primary transition-all min-w-max'
                        >
                            <div className="h-7 w-7 md:h-8 bg-brand-secondary text-white rounded-full flex items-center justify-center font-bold text-xs md:text-sm">
                                {userInitial}
                            </div>
                            <div className="hidden md:flex flex-col text-left">
                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-tighter">
                                {profile?.role?.replace('-', ' ')}
                            </span>
                                <span className="text-[11px] text-brand-secondary font-medium">
                                {profile?.full_name || "Profile"}
                            </span>
                            </div>
                        </button>

                        <div className="w-px h-6 bg-gray-100 mx-1 hidden sm:block" />

                        <Link
                            href="/admin"
                            className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-surface rounded-lg md:rounded-xl transition-all"
                            title="Dashboard Home"
                        >
                            <Home size={18} className="md:w-5 md:h-5" />
                        </Link>

                        <button
                            onClick={() => setIsLogoutOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 border border-red-100 text-red-600 rounded-full text-xs md:text-sm font-bold hover:bg-red-50 transition-all active:scale-95 cursor-pointer"
                        >
                            <LogOut size={14} strokeWidth={2.5} />
                            <span className="hidden xs:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            <ConfirmModal
                isOpen={isLogoutOpen}
                title="End Admin Session?"
                message="Are you sure you want to sign out?"
                confirmText={isLoggingOut ? "Signing out..." : "Sign Out"}
                onClose={() => setIsLogoutOpen(false)}
                onConfirm={handleSignOut}
            />

            {isProfileOpen && (
                <div className="fixed inset-0 bg-brand-primary/20 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-brand-accent max-w-sm w-full animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-serif font-bold text-brand-primary">Your Identity</h3>
                            <button onClick={() => setIsProfileOpen(false)} className=" hover:bg-gray-100 p-1 rounded-full">
                                <X size={20} color='green' />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-brand-surface rounded-2xl">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Current Level</p>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-brand-primary capitalize">{profile?.role?.replace('-', ' ')}</p>
                                    {profile?.role === 'super-admin' && <ShieldCheck size={14} className="text-brand-secondary" />}
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Full Name</label>
                                <input
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder='Your Display Name'
                                    className="w-full p-3 mt-1 bg-white border border-brand-accent rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none text-brand-primary font-medium"
                                />
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Email Address</label>
                                {profile?.role === 'super-admin' ? (
                                    <input
                                        defaultValue={profile?.email}
                                        disabled // Keep disabled unless you create a specific API for self-email-updates
                                        className="w-full p-3 mt-1 bg-gray-50 border border-brand-accent rounded-xl text-gray-400 text-sm cursor-not-allowed"
                                    />
                                ) : (
                                    <div
                                        className="w-full p-3 mt-1 bg-brand-surface/50 border border-dashed border-brand-accent rounded-xl text-brand-secondary text-sm font-medium">
                                        {profile?.email}
                                    </div>
                                )}
                            </div>

                            {profile?.role !== 'super-admin' ? (
                                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                    <p className="text-[9px] text-amber-700 leading-tight">
                                        To change your <strong>email</strong> or <strong>security key</strong>, please contact the lead administrator.
                                    </p>
                                </div>
                            ) : (
                                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                    <p className="text-[9px] text-blue-700 leading-tight">
                                        As a <strong>Super Admin</strong>, you can manage your full security credentials in the
                                        <Link
                                            href="/admin/profiles"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="underline ml-1 font-bold"
                                        >
                                            Access Portal
                                        </Link>.
                                    </p>
                                </div>
                            )}

                            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
                                <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                                    <strong>Note:</strong> Security keys (passwords) and email addresses can only be modified by a <strong>Super Admin</strong>.
                                </p>
                            </div>

                            <button
                                onClick={handleUpdateName}
                                disabled={isUpdating || newName === profile?.full_name}
                                className="w-full py-4 bg-brand-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {isUpdating ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}