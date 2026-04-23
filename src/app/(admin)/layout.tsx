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
        let isMounted = true;

        const getProfile = async () => {
            try {
                // 1. Get the current user session
                const { data: { user }, error: authError } = await supabase.auth.getUser();

                if (authError) throw authError;

                if (user && isMounted) {
                    // 2. Fetch the profile
                    const { data, error: profileError } = await supabase
                        .from('profiles')
                        .select('full_name, role, email')
                        .eq('id', user.id)
                        .single();

                    if (profileError) {
                        console.error("Supabase Profile Error:", profileError.message);
                        return;
                    }

                    if (data && isMounted) {
                        console.log("Success! Profile Data:", data);
                        setProfile(data);
                    }
                }
            } catch (err) {
                console.error("AdminLayout Auth Error:", err);
            }
        };

        getProfile();

        return () => { isMounted = false; };
    }, []);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
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

        <main>
          {children}
        </main>

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