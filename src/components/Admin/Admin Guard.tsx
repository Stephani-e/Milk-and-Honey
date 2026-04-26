"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";

// 1. Create a Global Context so any page can ask "What is my role?" instantly
type AuthContextType = {
    role: string;
    user: any;
};
export const AuthContext = createContext<AuthContextType | null>(null);

// 2. Custom Hook for easy access in your pages
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AdminGuard");
    return context;
};

// 3. The Main Guard Component
export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname(); // Gets the current URL (e.g., "/events/new")

    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [authData, setAuthData] = useState<AuthContextType | null>(null);

    useEffect(() => {
        let isMounted = true;

        const verifyAccess = async () => {
            // Slight delay to prevent race conditions (like you did in SuperAdminPage!)
            await new Promise(resolve => setTimeout(resolve, 100));

            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    router.replace("/login");
                    return;
                }

                // Fetch the user's role from the profiles table
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (profileError || !profile) throw new Error("Profile not found");

                const userRole = profile.role;

                if (isMounted) {
                    // --- THE GLOBAL ROUTE BOUNCER LOGIC ---
                    // If they are a viewer, check if they are trying to access forbidden URLs
                    if (userRole === 'viewer') {
                        const isForbiddenRoute =
                            pathname.includes('/new') ||
                            pathname.includes('/edit') ||
                            pathname.includes('/admin/profiles'); // Block super-admin area

                        if (isForbiddenRoute) {
                            setIsAuthorized(false); // Trigger the "Access Denied" screen
                            setTimeout(() => router.push("/events"), 2500); // Send them back to dashboard
                            return;
                        }
                    }

                    // If they are an editor, make sure they don't access the super-admin profile page
                    if (userRole === 'editor' && pathname.includes('/admin/profiles')) {
                        setIsAuthorized(false);
                        setTimeout(() => router.push("/admin"), 2500);
                        return;
                    }

                    // If they pass all checks, let them in!
                    setAuthData({ role: userRole, user: session.user });
                    setIsAuthorized(true);
                }
            } catch (error) {
                console.error("Auth Guard failed:", error);
                router.replace("/login");
            }
        };

        verifyAccess();

        return () => { isMounted = false; };
    }, [pathname, router]); // Re-run the bouncer check if the URL changes

    // STATE 1: Still checking the database
    if (isAuthorized === null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-brand-surface gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
                <p className="text-sm font-bold text-brand-secondary animate-pulse uppercase tracking-widest">
                    Verifying Clearance...
                </p>
            </div>
        );
    }

    // STATE 2: Access Denied (They tried to sneak into a restricted URL)
    if (isAuthorized === false) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-brand-surface gap-4 text-center px-4">
                <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-2">
                    <ShieldAlert size={40} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-brand-primary">Access Denied</h2>
                <p className="text-sm text-gray-500 max-w-md">
                    Your current security clearance does not allow you to access or edit this page.
                </p>
                <p className="text-xs font-bold text-brand-secondary uppercase tracking-widest mt-4 animate-pulse">
                    Redirecting to safety...
                </p>
            </div>
        );
    }

    // STATE 3: Access Granted! Render the page and pass down the context.
    return (
        <AuthContext.Provider value={authData!}>
            {children}
        </AuthContext.Provider>
    );
}