import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
    const { id, email, password, full_name } = await request.json();
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const authHeader = request.headers.get('Authorization');
    const { data: { user }, error: sessionError } = await supabase.auth.getUser(authHeader?.split(' ')[1] || "");

    if (sessionError || !user) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Update Auth (Password/Email)
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
        email,
        password: password || undefined,
        user_metadata: { full_name }
    });

    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

    // Update Profile Table
    await supabaseAdmin.from('profiles').update({ email, full_name }).eq('id', id);

    return NextResponse.json({ success: true });
}