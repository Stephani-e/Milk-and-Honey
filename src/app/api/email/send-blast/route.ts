import {NextResponse} from 'next/server';
import {supabase} from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const {newsletterId} = await req.json();

        if (!newsletterId) {
            return NextResponse.json({error: 'Newsletter ID is required'}, {status: 400});
        }

        // 1. Fetch the newsletter content from Supabase
        const {data: newsletter, error: dbError} = await supabase
            .from('newsletters')
            .select('*')
            .eq('id', newsletterId)
            .single();

        if (dbError || !newsletter) {
            return NextResponse.json({error: 'Newsletter not found'}, {status: 404});
        }

        // 2. Wrap the ReactQuill content in a beautiful HTML email template
        const coverImageHTML = newsletter.cover_image_url
            ? `<img src="${newsletter.cover_image_url}" alt="${newsletter.title}" style="width: 100%; max-width: 100%; height: auto; display: block; border-bottom: 1px solid #e5e7eb;" />`
            : '';

        const emailHTML = `
            <div style="background-color: #f8fafc; padding: 40px 15px; width: 100%; box-sizing: border-box;">
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <h2 style="color: #1e293b; margin-bottom: 4px; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Milk & Honey</h2>
                        <p style="color: #64748b; font-size: 12px; margin-top: 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Family Update</p>
                    </div>
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; font-size: 16px; line-height: 1.6; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                        ${coverImageHTML}
                        <div style="padding: 35px 30px;">
                            <h1 style="font-size: 26px; color: #0f172a; margin-top: 0; margin-bottom: 24px; line-height: 1.3; font-weight: 800;">${newsletter.title}</h1>
                            <div style="color: #334155;">
                                ${newsletter.content}
                            </div>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
                            You are receiving this because you subscribed to updates from Milk & Honey.<br>
                            <a href="{$unsubscribe}" style="color: #64748b; text-decoration: underline;">Unsubscribe from this list</a>
                        </p>
                    </div>
                </div>
            </div>
        `;

        // 3. Create the Campaign Draft directly connected to your group
        const response = await fetch('https://connect.mailerlite.com/api/campaigns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`
            },
            body: JSON.stringify({
                name: `Update: ${newsletter.title}`,
                type: 'regular',
                emails: [
                    {
                        subject: newsletter.title,
                        from_name: newsletter.author_name || 'Milk & Honey',
                        from: 'rccgmilkandhoney29@gmail.com',
                        content: emailHTML
                    }
                ],
                groups: ["188197025494337139"]
            })
        });

        const campaignData = await response.json();
        const campaignId = campaignData?.data?.id || campaignData?.id;

        if (!campaignId) {
            console.error("❌ MailerLite Response:", JSON.stringify(campaignData, null, 2));
            return NextResponse.json({error: 'Failed to extract Campaign ID'}, {status: 500});
        }

        console.log("✅ Campaign Draft Created! Waiting for manual send in MailerLite.");

        // 4. Update Supabase to lock the UI toggle so it doesn't get created twice
        await supabase
            .from('newsletters')
            .update({email_sent: true})
            .eq('id', newsletterId);

        return NextResponse.json({success: true, message: "Draft successfully created!"});

    } catch (error) {
        console.error('Email Blast Endpoint Error:', error);
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
    }
}