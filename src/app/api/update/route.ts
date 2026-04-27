import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
    try {
        const { id, email, password, full_name } = await request.json();

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
        );

        // If SUPABASE_SERVICE_ROLE_KEY is missing on Vercel, this is where it crashes!
        const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
        }

        const { data: { user }, error: sessionError } = await supabase.auth.getUser(token);

        if (sessionError || !user) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        // Update Auth (Password/Email)
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
            email,
            password: password || undefined, // Safely ignores empty strings
            user_metadata: { full_name }
        });

        if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

        // Update Profile Table
        await supabaseAdmin.from('profiles').update({ email, full_name }).eq('id', id);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}