import {NextResponse} from 'next/server';
import {supabase} from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        // MailerLite webhooks can arrive as a single object or an array of events
        const events = payload.events || [payload];

        for (const event of events) {
            const eventType = event.type;
            const email = event.data?.subscriber?.email;

            if (!email) continue;

            // If a user leaves the list, bounces, or reports spam, scrub them from Supabase
            if (
                eventType === 'subscriber.unsubscribed' ||
                eventType === 'subscriber.bounced' ||
                eventType === 'subscriber.deleted' ||
                eventType === 'subscriber.spam_reported'
            ) {
                const {error} = await supabase
                    .from('newsletter_subscribers')
                    .delete()
                    .eq('email', email);

                if (error) {
                    console.error(`❌ Webhook Failed to remove ${email}:`, error.message);
                } else {
                    console.log(`🧹 Webhook Auto-Cleaned: Removed ${email} due to ${eventType}`);
                }
            }
        }

        return NextResponse.json({success: true});

    } catch (error) {
        console.error('Webhook Endpoint Error:', error);
        return NextResponse.json({error: 'Failed to process webhook'}, {status: 500});
    }
}