import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email, full_name, role, password } = await request.json();

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Create the user directly in auth.users and auto-confirm them
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // Bypass email verification
            user_metadata: { full_name, role }
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        // 2. Insert directly into profiles as 'active'
        if (authData?.user) {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    email: email,
                    full_name: full_name,
                    role: role,
                    status: 'active', // They are instantly active!
                    updated_at: new Date().toISOString()
                }, { onConflict: 'email' });

            if (profileError) {
                return NextResponse.json({ error: `Profile Error: ${profileError.message}` }, { status: 400 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}