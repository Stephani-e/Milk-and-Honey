import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email, full_name, role } = await request.json();

        // 1. Initialize Admin Client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        // 2. SEND THE INVITE FIRST
        // This automatically creates the user in the auth.users table in the background
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${siteUrl}/admin`,
            data: { full_name, role }
        });

        if (authError) {
            console.error("Auth Error:", authError.message);
            return NextResponse.json({ error: `Auth Error: ${authError.message}` }, { status: 400 });
        }

        // 3. INSERT DIRECTLY INTO PROFILES
        // We now have the new Auth ID, so we can save them straight to the profiles table!
        if (authData?.user) {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: authData.user.id,        // Link the newly created Auth ID
                    email: email,
                    full_name: full_name,
                    role: role,
                    status: 'invited',           // Keep them in the "invited" tab
                    updated_at: new Date().toISOString()
                }, { onConflict: 'email' });     // If email exists, just update it

            if (profileError) {
                console.error("Profile Error:", profileError.message);
                return NextResponse.json({ error: `Profile Error: ${profileError.message}` }, { status: 400 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Server Error:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}