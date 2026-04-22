"use client";
import React, {useEffect, useState} from "react";
import Navbar from "@/app/(admin)/NavBar";
import ConfirmModal from "@/components/Admin/ConfirmModal";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminLayout({
                                      children,
                                    }: {
  children: React.ReactNode;
}) {
  const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);


    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('full_name, role, email')
                    .eq('id', user.id)
                    .single();

                if (!error && data) {
                    console.log("Profile Data Loaded:", data);
                    setProfile(data);
                }
            }
        };
        getProfile();
    }, []);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Logout failed");
        setIsLoggingOut(false);
      } else {
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      setIsLoggingOut(false);
    }
  };

  return (
      <div className="min-h-screen bg-brand-surface">

        <Navbar
            profile={profile}
            onLogout={() => setIsLogoutOpen(true)}
        />

        {/* PAGE CONTENT */}
        <main>
          {children}
        </main>

        {/* GLOBAL LOGOUT MODAL */}
        <ConfirmModal
            isOpen={isLogoutOpen}
            title="End Admin Session?"
            message="Are you sure you want to sign out?"
            confirmText={isLoggingOut ? "Signing out..." : "Sign Out"}
            onClose={() => setIsLogoutOpen(false)}
            onConfirm={handleSignOut}
        />
      </div>
  );
}