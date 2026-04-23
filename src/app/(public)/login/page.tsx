"use client";
import React, {useEffect, useState} from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import LoadingState from "@/components/Admin/LoadingPage";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    const SUPPORT_EMAIL = "support@mhcprovince56.org";
    const SUPPORT_WHATSAPP = "2348000000000";

    useEffect(() => {
        const verifyRole = async () => {
            if (email.includes('@')) {
                const { data, error } = await supabase.rpc('check_is_super_admin', {
                    email_input: email.toLowerCase()
                });
                if (!error) setIsSuperAdmin(data);
            }
        };

        const timeoutId = setTimeout(verifyRole, 1000);
        return () => clearTimeout(timeoutId);
    }, [email]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Attempting login with:", email); // Debug log
        setIsLoggingIn(true);

        try {
            const {data, error} = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                // console.error("Supabase Error:", error.message);
                toast.error(`Login Failed: ${error.message}`);
                setIsLoggingIn(false)
            } else if (data?.user) {
                toast.success("Login Successful!");

                router.refresh();
                setTimeout(() => {
                    router.refresh();
                    router.push("/admin");
                }, 800);
            }
        } catch (err) {
            // console.error("Unexpected Error:", err);
            toast.error("An unexpected error occurred. Please try again.");
            setIsLoggingIn(false)
        }
    };

    const handleGoogleLogin = async () => {
        toast.info("Redirecting to Google Login...");
        const {error} = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) {
            // console.error("Google Auth Error:", error.message);
            toast.error(`Google Login Failed: ${error.message}`);
        } else {
            toast.success("Google Login Successful!");
        }
    };

    const handleForgotPassword = async () => {
        if (!email) return toast.error("Please enter your email first.");

        setIsResetting(true);
        const {error} = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Password reset link sent to your email!");
        }
        setIsResetting(false);
    };

    return (
        <div className='flex flex-col relative'>

            {isLoggingIn && <LoadingState variant="full" message="Verifying Identity..."/>}

            {/* BODY */}
            <div className="flex flex-col lg:flex-row min-h-screen bg-white">
                {/* LEFT: Form Section */}
                <div
                    className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8 lg:p-20 order-2 lg:order-1">
                    <div className="w-full max-w-md">
                        {/* Centered on mobile (text-center), Left-aligned on Desktop (lg:text-left) */}
                        <div className="text-center lg:text-left">
                            <h1 className="text-3xl font-bold text-[#11222E]">Welcome Home 👋</h1>
                            <p className="text-[#374151] mt-4 mb-8">
                                Access the M&H Admin Portal to manage sermons, media, and departmental updates for Milk
                                and Honey Parish/Province.
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="text-left">
                                <label className="block text-sm font-semibold mb-2 text-[#11222E]">Church Email</label>
                                <input
                                    type="email"
                                    placeholder="pastor@mhcprovince56.org"
                                    className="w-full p-3 border border-[#E5E7EB] rounded-lg focus:outline-none text-[#11222E] focus:ring-2 focus:ring-[#11222E]"
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="text-left relative">
                                <label className="block text-sm font-semibold mb-2 text-[#11222E]">Security Key</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full p-3 pr-12 border border-[#E5E7EB] text-[#11222E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#11222E]"
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />

                                    {/* Toggle Button */}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-950 hover:text-[#11222E] transition-colors p-1"
                                    >
                                        {showPassword ? (
                                            /* Eye Off Icon */
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                 strokeLinejoin="round">
                                                <path
                                                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                <line x1="1" y1="1" x2="23" y2="23"></line>
                                            </svg>
                                        ) : (
                                            /* Eye Icon */
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                 strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {/* Forgot Password Logic */}
                                <div className="mt-2 text-right h-4">
                                    {email && (
                                        isSuperAdmin ? (
                                            <button
                                                type="button"
                                                onClick={handleForgotPassword}
                                                className="text-[11px] font-bold text-brand-primary hover:underline"
                                            >
                                                {isResetting ? "Sending..." : "Forgot Password? Reset Now"}
                                            </button>
                                        ) : (
                                            <p className="text-[11px] font-medium text-gray-400">
                                                Forgot Security Key? <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-secondary font-bold">Contact Admin</a>
                                            </p>
                                        )
                                    )}
                                </div>
                            </div>

                            <button
                                className="w-full bg-[#11222E] text-white p-4 rounded-lg font-bold hover:bg-slate-800 transition-all active:scale-[0.98]">
                                {isLoggingIn ? "Verifying Session..." : "Sign In To Portal"}
                            </button>
                        </form>

                        <div className="relative my-10 text-center">
                            <span className="bg-white px-4 text-sm text-gray-400 relative z-10 font-medium">Or use Admin Google Account</span>
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-200"></div>
                        </div>

                        {/* Google Button with Icon */}
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 p-3 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"/>
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"/>
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    fill="#FBBC05"/>
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"/>
                            </svg>
                            <span className="text-sm font-semibold text-[#374151]">Sign in with Google</span>
                        </button>
                    </div>
                </div>

                {/* RIGHT: Image Section */}
                <div
                    className="w-full lg:w-1/2 h-[350px] lg:h-screen relative order-1 lg:order-2 p-4 lg:p-6 bg-[#F9FAFB]">
                    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                        <Image
                            src="/Screen Saver.jpg"
                            alt="MHC Worship Visual"
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                </div>
            </div>

            {/* FOOTER SECTION */}
            <footer className="w-full py-10 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">

                    {/* Secondary Navigation for Admins */}
                    <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm font-medium text-gray-500">
                        {/* WHATSAPP SUPPORT */}
                        <a
                            href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Hi Support, I'm having trouble logging into the M%26H Admin Portal.`}
                            target="_blank"
                            className="flex items-center gap-2 hover:text-green-600 transition-colors"
                        >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                            </svg>
                            WhatsApp Support
                        </a>

                        {/* EMAIL SUPPORT */}
                        <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-[#11222E] transition-colors">
                            Technical Support
                        </a>

                        <a href="/privacy" className="hover:text-[#11222E] transition-colors">
                            Privacy Policy
                        </a>
                    </div>

                    {/* Official Church Badge/Text */}
                    <div className="text-center space-y-2">
                        <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-[0.2em] font-bold">
                            Official Administrative Portal
                        </p>
                        <p className="text-xs text-gray-500">
                            © 2026 <span className="font-semibold text-gray-700">Milk and Honey Center</span> • RCCG
                            Lagos Province 56
                        </p>
                    </div>

                    {/* Security Badge (Optional Visual) */}
                    <div
                        className="mt-4 flex items-center gap-2 text-[10px] text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                        End-to-End Encrypted Session
                    </div>
                </div>
            </footer>
        </div>
    );
}