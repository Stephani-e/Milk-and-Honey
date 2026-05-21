import {NextResponse} from 'next/server';
import {createClient} from "@supabase/supabase-js";
import webpush from 'web-push';

// 1. Initialize Master Client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function GET(req: Request) {
    // 2. Security Check: Block anyone who doesn't have the secret CRON password
    const authHeader = req.headers.get('authorization');

    console.log("Received Auth Header:", authHeader);

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized Access', {status: 401});
    }

    try {
        // 3. Find scheduled posts that are due NOW but haven't sent a blast yet
        const now = new Date().toISOString();
        const {data: duePosts, error: fetchError} = await supabaseAdmin
            .from('newsletters')
            .select('*')
            .eq('is_published', true)
            .eq('push_notification_sent', false)
            .lte('published_at', now); // "lte" means Less Than or Equal to right now

        if (fetchError) throw fetchError;

        // If nothing is scheduled for right now, just exit quietly.
        if (!duePosts || duePosts.length === 0) {
            return NextResponse.json({message: "No scheduled posts due at this time."});
        }

        // 4. Fetch your subscribers
        const {data: subscribers} = await supabaseAdmin.from('push_subscriptions').select('*');
        if (!subscribers || subscribers.length === 0) {
            return NextResponse.json({message: "Posts are live, but no subscribers to notify."});
        }

        // 5. Blast the notifications for EVERY due post
        for (const post of duePosts) {
            const payload = JSON.stringify({
                title: `New Update: ${post.title}`,
                body: post.excerpt || "Tap to read the latest from Milk & Honey.",
                url: `https://milk-and-honey-rho.vercel.app/newsletters/${post.slug}`
            });

            const notifications = subscribers.map(async (sub) => {
                const pushSubscription = {endpoint: sub.endpoint, keys: {p256dh: sub.p256dh, auth: sub.auth}};
                try {
                    await webpush.sendNotification(pushSubscription, payload);
                } catch (err: any) {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
                    }
                }
            });

            await Promise.all(notifications);

            // 6. Lock the post so it NEVER sends a duplicate notification again
            await supabaseAdmin
                .from('newsletters')
                .update({push_notification_sent: true})
                .eq('id', post.id);
        }

        return NextResponse.json({success: true, postsProcessed: duePosts.length});

    } catch (error: any) {
        console.error('CRON Error:', error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
}