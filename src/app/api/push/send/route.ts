import {NextResponse} from 'next/server';
import webpush from 'web-push';
import {createClient} from "@supabase/supabase-js";

// 1. Initialize the Master Client to bypass RLS for reading and deleting
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
    try {
        const {title, body, url} = await req.json();

        // 2. Fetch all subscribers using the Admin Client
        const {data: subscribers, error} = await supabaseAdmin
            .from('push_subscriptions')
            .select('*');

        if (error) {
            console.error('Supabase DB Error:', error);
            // Filled in your empty error message here!
            return NextResponse.json({error: 'Failed to fetch subscribers from database'}, {status: 500});
        }

        if (!subscribers || subscribers.length === 0) {
            return NextResponse.json({success: true, message: "No subscribers found."});
        }

        const payload = JSON.stringify({title, body, url});

        // 3. Blast the notification to everyone
        const notifications = subscribers.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {p256dh: sub.p256dh, auth: sub.auth}
            };

            try {
                await webpush.sendNotification(pushSubscription, payload);
            } catch (err: any) {
                // If a user revoked permission or their browser endpoint expired (Status 410 or 404),
                // We delete them from the database using the Admin Client.
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
                }
            }
        });

        await Promise.all(notifications);

        return NextResponse.json({success: true, count: subscribers.length});

    } catch (error) {
        console.error('Push blast error:', error);
        return NextResponse.json({error: 'Failed to send notifications'}, {status: 500});
    }
}