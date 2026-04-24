"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase"; // <-- Make sure this path is correct!
import { toast } from "sonner";
import LoadingState from "@/components/Admin/LoadingPage";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    // Auto-fill email if passed in URL
    useEffect(() => {
        const emailParam = searchParams.get("email");
        if (emailParam) setEmail(emailParam);
    }, [searchParams]);

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) return toast.error("Keys do not match");
        if (password.length < 6) return toast.error("Key must be at least 6 characters");

        setIsUpdating(true);

        try {
            // 1. Send the 6-digit code to Supabase to verify
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'recovery',
            });

            if (verifyError) throw new Error("Invalid or expired 6-digit code.");

            // 2. If the code is right, Supabase temporarily logs them in. Now update the password!
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) throw new Error("Failed to secure account. Try again.");

            // 3. Success! Send them to login.
            toast.success("Security key updated successfully!");
            setTimeout(() => router.push("/login"), 2000);

        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F9FAFB] items-center justify-center p-6">
            {isUpdating && <LoadingState variant="full" message="Securing Account..." />}

            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <h1 className="text-2xl font-bold text-[#11222E] text-center mb-2">Reset Security Key</h1>
                <p className="text-sm text-gray-500 text-center mb-6">Enter the 6-digit code sent to your email.</p>

                <form onSubmit={handlePasswordReset} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Your Email"
                        className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#11222E]"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="security Code"
                        className="w-full p-3 border border-gray-300 rounded-lg font-mono text-center text-xl tracking-widest outline-none focus:ring-2 focus:ring-[#11222E]"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        required
                    />
                    <hr className="my-4" />
                    <input
                        type="password"
                        placeholder="New Security Key"
                        className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#11222E]"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Key"
                        className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#11222E]"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="w-full bg-[#11222E] text-white p-4 rounded-lg font-bold hover:bg-slate-800 transition-all active:scale-[0.98]">
                        Update & Sign In
                    </button>
                </form>
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