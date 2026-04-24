import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Generate a 6-digit code and expiration (15 mins)
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60000).toISOString();

        // 2. Save the code to the user's profile
        const { error: dbError } = await supabaseAdmin
            .from('profiles')
            .update({ reset_token: otpCode, reset_token_expires: expiresAt })
            .eq('email', email);

        if (dbError) throw new Error("Could not find that email in the system.");

        // 3. Send the email using Resend's testing domain
        await resend.emails.send({
            from: 'M&H Admin <onboarding@resend.dev>',
            to: email,
            subject: 'Your M&H Security Code',
            html: `
                <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                    <h2>Password Reset Request</h2>
                    <p>Your one-time security code is:</p>
                    <h1 style="letter-spacing: 5px; color: #11222E;">${otpCode}</h1>
                    <p>Enter this on the reset page to secure your account. Expires in 15 minutes.</p>
                </div>
            `
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}