"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import LoadingState from "@/components/Admin/LoadingPage";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        if (password.length < 6) {
            return toast.error("Security key must be at least 6 characters");
        }

        setIsUpdating(true);

        try {
            // 1. Get the current user from the session Supabase created via the email link
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error("Session expired. Please request a new link.");

            // 2. Call your update.ts API route
            const response = await fetch('/api/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.id,
                    email: user.email,
                    password: password, // The new password
                    full_name: user.user_metadata?.full_name || ""
                }),
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.error || "Update failed");

            toast.success("Security key updated successfully!");

            // 3. Redirect to login
            setTimeout(() => {
                router.push("/login");
            }, 1500);

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
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[#11222E]">Create New Security Key</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Enter your new password below to regain access to the M&H Admin Portal.
                    </p>
                </div>

                <form onSubmit={handlePasswordReset} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-[#11222E]">New Security Key</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full p-3 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#11222E] outline-none"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-[#11222E]">Confirm Security Key</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="w-full p-3 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#11222E] outline-none"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="show"
                            className="rounded border-gray-300"
                            onChange={() => setShowPassword(!showPassword)}
                        />
                        <label htmlFor="show" className="text-xs text-gray-600 cursor-pointer">Show Passwords</label>
                    </div>

                    <button
                        type="submit"
                        disabled={isUpdating}
                        className="w-full bg-[#11222E] text-white p-4 rounded-lg font-bold hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        Update Key & Sign In
                    </button>

                </form>
            </div>
        </div>
    );
}