"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import LoadingState from "@/components/Admin/LoadingPage";

export default function ResetPasswordPage() {
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
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, newPassword: password }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Update failed");

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
                        placeholder="6-Digit Code"
                        maxLength={6}
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