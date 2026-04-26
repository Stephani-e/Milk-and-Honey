"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import LoadingState from "@/components/Admin/LoadingPage";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");
    
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [cooldown, setCooldown] = useState(0); // Cooldown for resend button

    useEffect(() => {
        const emailParam = searchParams.get("email");
        if (emailParam) setEmail(emailParam);
    }, [searchParams]);

    // Handle Cooldown Timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const checks = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*]/.test(password),
    };

    const isPasswordStrong = Object.values(checks).every(Boolean);

    // ==========================================
    // ICONS
    // ==========================================
    const EyeIcon = ({ isVisible }: { isVisible: boolean }) => (
        isVisible ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        )
    );

    const WarningIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V14M12 17.5V18M12 3L2 20H22L12 3Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#EF4444" fillOpacity="0.15"/>
        </svg>
    );

    const SuccessIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11.08V12C21.9988 14.1564 21.3001 16.2547 20.0093 17.9818C18.7185 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999M22 4L12 14.01L9 11.01" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

    // ==========================================
    // ACTIONS
    // ==========================================
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!token) {
            return toast.error("Missing Code!", {
                description: "Please enter the security code.",
                icon: <WarningIcon />,
                action: { label: "Got it", onClick: () => document.getElementById("token-input")?.focus() }
            });
        }

        setIsProcessing(true);

        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'recovery',
            });

            if (error) throw new Error("Invalid or expired security code.");

            toast.success("Code verified!", {
                description: "Please create your new key.",
                icon: <SuccessIcon />,
                cancel: { label: "Got It!", onClick: () => console.log("Dismissed") }
            });
            setStep(2);

        } catch (err: any) {
            toast.error("Verification failed!", {
                description: err.message,
                icon: <WarningIcon />,
                action: { label: "Try again", onClick: () => setToken("") }
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleResendCode = async () => {
        if (!email) return;
        if (cooldown > 0) return;

        setIsProcessing(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw new Error(error.message);

            toast.success("New code sent!", {
                description: "Check your inbox for the latest security code.",
                icon: <SuccessIcon />,
                cancel: { label: "Got It!", onClick: () => document.getElementById("token-input")?.focus() }
            });
            
            setCooldown(60); // Start 60-second cooldown
            setToken(""); // Clear the old invalid token
            
        } catch (err: any) {
            toast.error("Couldn't send code", {
                description: err.message,
                icon: <WarningIcon />
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isPasswordStrong) {
            return toast.error("Weak Password!", {
                description: "Please meet all security requirements.",
                icon: <WarningIcon />,
                action: { label: "Review", onClick: () => document.getElementById("new-password")?.focus() }
            });
        }
        
        if (password !== confirmPassword) {
            return toast.error("Keys do not match!", {
                description: "Please make sure your passwords match.",
                icon: <WarningIcon />,
                action: { label: "Fix typo", onClick: () => setConfirmPassword("") }
            });
        }

        setIsProcessing(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error; // Pass the raw error to catch block

            toast.success("Success!", {
                description: "Security key updated successfully.",
                icon: <SuccessIcon />,
                cancel: { label: "Got It!", onClick: () => console.log("Dismissed") }
            });
            setTimeout(() => router.push("/admin"), 2000);

        } catch (err: any) {
            console.error("SUPABASE ERROR DETAILS:", err);
            toast.error("Update failed!", {
                description: err.error_description || err.message || "Password rejected by server.",
                icon: <WarningIcon />,
                action: { label: "Retry", onClick: () => console.log("Retrying") }
            });
            setStep(1); 
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white items-center justify-center p-6 font-sans text-[#111111]">
            {isProcessing && <LoadingState variant="full" message={step === 1 ? "Verifying Code..." : "Securing Account..."} />}

            <div className="w-full max-w-[360px]">
                
                {step === 1 && (
                    <>
                        <h2 className="text-2xl font-semibold text-[#111111] mb-2 tracking-tight">Verify Code</h2>
                        <p className="text-sm text-[#555555] mb-8">
                            Enter the code sent to <span className="font-medium text-[#111111]">{email || "your email"}</span>.
                        </p>

                        <form onSubmit={handleVerifyCode} className="space-y-8">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-[#555555]">Security Code</label>
                                <input
                                    id="token-input"
                                    type="text"
                                    placeholder="••••••••"
                                    className="w-full py-2 bg-transparent border-0 border-b border-[#cccccc] rounded-none font-mono text-xl tracking-[0.2em] uppercase text-[#111111] placeholder-[#cccccc] outline-none focus:border-[#111111] focus:ring-0 transition-colors"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value.trim())}
                                    required
                                />
                            </div>
                            
                            <div className="space-y-4">
                                <button type="submit" className="w-full bg-[#111111] text-white py-3.5 rounded-none text-sm font-medium hover:bg-[#333333] transition-colors active:scale-[0.99]">
                                    Verify Code
                                </button>

                                {/* NEW: Resend Code and Back to Login links grouped together */}
                                <div className="flex flex-col items-center gap-3 mt-4 text-xs font-medium">
                                    <button
                                        type="button"
                                        onClick={handleResendCode}
                                        disabled={cooldown > 0}
                                        className={`transition-colors ${cooldown > 0 ? 'text-[#cccccc] cursor-not-allowed' : 'text-[#555555] hover:text-[#111111]'}`}
                                    >
                                        {cooldown > 0 ? `Resend code in ${cooldown}s` : "Didn't receive a code? Resend"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => router.push('/login')}
                                        className="flex items-center justify-center gap-1.5 text-[#888888] hover:text-[#111111] transition-colors"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="19" y1="12" x2="5" y2="12"></line>
                                            <polyline points="12 19 5 12 12 5"></polyline>
                                        </svg>
                                        Back to login
                                    </button>
                                </div>
                            </div>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2 className="text-2xl font-semibold text-[#111111] mb-8 tracking-tight">Update Password</h2>

                        <form onSubmit={handleUpdatePassword} className="space-y-6">
                            
                            <div className="space-y-2 relative">
                                <label className="block text-sm font-medium text-[#555555]">New password</label>
                                <div className="relative">
                                    <input
                                        id="new-password"
                                        type={showPassword ? "text" : "password"}
                                        className="w-full py-2 pr-8 bg-transparent border-0 border-b border-[#cccccc] rounded-none text-base text-[#111111] outline-none focus:border-[#111111] focus:ring-0 transition-colors"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111] transition-colors pb-1"
                                    >
                                        <EyeIcon isVisible={showPassword} />
                                    </button>
                                </div>
                                
                                <div className="text-xs tracking-wide mt-2 font-medium">
                                    <span className={`transition-colors duration-200 ${checks.length ? 'text-[#111111]' : 'text-[#cccccc]'}`}>8+ chars</span>
                                    <span className="text-[#cccccc]"> &middot; </span>
                                    <span className={`transition-colors duration-200 ${checks.upper && checks.lower ? 'text-[#111111]' : 'text-[#cccccc]'}`}>Upper & Lower</span>
                                    <span className="text-[#cccccc]"> &middot; </span>
                                    <span className={`transition-colors duration-200 ${checks.number ? 'text-[#111111]' : 'text-[#cccccc]'}`}>1 number</span>
                                    <span className="text-[#cccccc]"> &middot; </span>
                                    <span className={`transition-colors duration-200 ${checks.special ? 'text-[#111111]' : 'text-[#cccccc]'}`}>1 symbol</span>
                                </div>
                            </div>
                            
                            <div className="space-y-2 relative">
                                <label className="block text-sm font-medium text-[#555555]">Confirm password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="w-full py-2 pr-8 bg-transparent border-0 border-b border-[#cccccc] rounded-none text-base text-[#111111] outline-none focus:border-[#111111] focus:ring-0 transition-colors"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111] transition-colors pb-1"
                                    >
                                        <EyeIcon isVisible={showConfirmPassword} />
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={!isPasswordStrong}
                                className="w-full mt-8 py-3.5 rounded-none text-sm font-medium transition-all active:scale-[0.99] disabled:active:scale-100 bg-[#111111] text-white hover:bg-[#333333] disabled:bg-[#f5f5f5] disabled:text-[#aaaaaa] disabled:cursor-not-allowed"
                            >
                                Save changes
                            </button>
                        </form>
                    </>
                )}

            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<LoadingState variant="full" message="Loading..." />}>
            <ResetPasswordForm />
        </Suspense>
    );
}