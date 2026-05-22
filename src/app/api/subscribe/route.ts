import {NextResponse} from 'next/server';

export async function POST(req: Request) {
    try {
        const {email} = await req.json();

        if (!email) {
            return NextResponse.json({error: 'Email is required'}, {status: 400});
        }

        // Send the email to MailerLite API v3
        const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`
            },
            body: JSON.stringify({
                email: email,
                // Optional: You can tag them so you know they came from the website
                groups: []
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('MailerLite API Error:', errorData);
            return NextResponse.json({error: 'Failed to add to MailerLite'}, {status: response.status});
        }

        return NextResponse.json({success: true});

    } catch (error) {
        console.error('Subscription Endpoint Error:', error);
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
    }
}