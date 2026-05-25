import {NextResponse} from 'next/server';

export async function POST(req: Request) {
    try {
        const {email} = await req.json();

        if (!email) {
            return NextResponse.json({error: 'Email is required'}, {status: 400});
        }

        // Hit the official MailerLite deletion endpoint
        const response = await fetch(`https://connect.mailerlite.com/api/subscribers/${email}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ MailerLite deletion failed:", errorText);
            return NextResponse.json({error: 'Failed to delete from MailerLite'}, {status: response.status});
        }

        console.log(`🧹 Admin UI Sync: Successfully deleted ${email} from MailerLite.`);
        return NextResponse.json({success: true});

    } catch (error) {
        console.error("Delete Subscriber API Error:", error);
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
    }
}
