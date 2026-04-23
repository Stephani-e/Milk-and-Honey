"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, ShieldAlert } from "lucide-react";
import ProfilesManagement from "@/app/(admin)/admin/profiles/ProfileManagement";

export default function SuperAdminPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        let isMounted = true;

        const verifyClearance = async () => {
            // Add a 100ms delay to prevent the "Lock Stolen" race condition
            // This allows the AdminLayout to finish its auth check first
            await new Promise(resolve => setTimeout(resolve, 100));

            try {
                // Use getSession() instead of getUser() here to avoid the lock conflict
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    router.replace("/login");
                    return;
                }

                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (error) throw error;

                if (isMounted) {
                    if (data?.role === 'super-admin') {
                        setIsAuthorized(true);
                    } else {
                        setIsAuthorized(false);
                        setTimeout(() => router.push("/admin"), 2000);
                    }
                }
            } catch (error) {
                console.error("Clearance check failed:", error);
                if (isMounted) setIsAuthorized(false);
            }
        };

        verifyClearance();
        return () => { isMounted = false; };
    }, [router]);

    if (isAuthorized === null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
                <p className="text-sm font-bold text-brand-secondary animate-pulse uppercase tracking-widest">
                    Verifying Security...
                </p>
            </div>
        );
    }

    if (isAuthorized === false) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
                <ShieldAlert size={40} className="text-red-500 mb-2" />
                <h2 className="text-2xl font-serif font-bold text-brand-primary">Access Denied</h2>
                <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </div>
        );
    }

    return <ProfilesManagement />;
}