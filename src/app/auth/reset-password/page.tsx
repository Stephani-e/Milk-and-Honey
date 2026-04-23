"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import LoadingState from "@/components/Admin/LoadingPage";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        setIsUpdating(true);

        try {
            // 1. Verify the 6-digit token manually
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'recovery',
            });

            if (verifyError) throw verifyError;

            // 2. Now that the session is active, get the user ID
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Verification failed.");

            // 3. Call your secure API to update the password & profile
            const response = await fetch('/api/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.id,
                    email: user.email,
                    password: password,
                    full_name: user.user_metadata?.full_name || ""
                }),
            });

            if (!response.ok) throw new Error("Update failed");

            toast.success("Security key updated! Logging out...");
            await supabase.auth.signOut();
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
                <h1 className="text-2xl font-bold text-[#11222E] text-center mb-6">Reset Security Key</h1>

                <form onSubmit={handlePasswordReset} className="space-y-6">
                    <div>
                        <input
                            type="email"
                            placeholder="Your Email"
                            className="w-full p-3 border rounded-lg"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="6-Digit Code from Email"
                            maxLength={6}
                            className="w-full p-3 border rounded-lg font-mono text-center text-xl tracking-widest"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            required
                        />
                    </div>
                    <hr className="my-4" />
                    <div>
                        <input
                            type="password"
                            placeholder="New Security Key"
                            className="w-full p-3 border rounded-lg"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder="Confirm New Key"
                            className="w-full p-3 border rounded-lg"
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

                    <button type="submit" className="w-full bg-[#11222E] text-white p-4 rounded-lg font-bold">
                        Update & Verify
                    </button>
                </form>
            </div>
        </div>
    );
}