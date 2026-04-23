import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email, token, newPassword } = await request.json();

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Get the profile to check the token
        const { data: profile, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('id, reset_token, reset_token_expires')
            .eq('email', email)
            .single();

        if (fetchError || !profile) throw new Error("Invalid request.");

        // 2. Validate the token
        const now = new Date().toISOString();
        if (profile.reset_token !== token) throw new Error("Incorrect 6-digit code.");
        if (profile.reset_token_expires < now) throw new Error("Code has expired.");

        // 3. Update the Auth password using the Admin Key
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(profile.id, {
            password: newPassword
        });

        if (updateError) throw updateError;

        // 4. Wipe the token so it can't be reused
        await supabaseAdmin
            .from('profiles')
            .update({ reset_token: null, reset_token_expires: null })
            .eq('id', profile.id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}