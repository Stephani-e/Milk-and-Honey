import {NextResponse} from 'next/server';
import {createClient} from "@supabase/supabase-js";

// Initialize the Master Client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const subscription = await req.json();

        // Save to Supabase using the ADMIN client to bypass RLS
        const {error} = await supabaseAdmin
            .from('push_subscriptions')
            .upsert({
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth
            }, {onConflict: 'endpoint'});

        if (error) {
            console.error('Supabase DB Error:', error);
            return NextResponse.json({error: 'Failed to save subscription to database'}, {status: 500});
        }

        return NextResponse.json({success: true});
    } catch (error) {
        console.error('Subscription error:', error);
        return NextResponse.json({error: 'Failed to subscribe'}, {status: 500});
    }
}