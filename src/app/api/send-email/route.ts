import {NextResponse} from 'next/server';
import nodemailer from 'nodemailer';
import {supabase} from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        // 1. Fetch settings securely on the server (No useEffect needed!)
        const {data: settings, error: dbError} = await supabase
            .from('site_settings')
            .select('*')
            .single();

        if (dbError || !settings) {
            console.error("Failed to fetch settings:", dbError);
            // We can still proceed, but we'll have to rely on the fallback emails below
        }

        // 2. Parse the incoming data from the frontend
        const body = await req.json();
        const {name, email, phone, subject, message} = body;

        // 3. Configure the Google SMTP Transporter ("Postman")
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        // 4. Define target email addresses directly from your Supabase settings
        // If a field is empty in the database, it safely falls back to a default
        const adminEmail = settings?.church_admin_email || "admin@milkandhoney.com";
        const mediaEmail = settings?.media_email_support || "rccgmilkandhoneycontact@proton.me";

        const pastoralEmail = settings?.pastoral_email || adminEmail;

        // Keep your brand's hardcoded email for technical support
        const developerEmail = settings?.developer_email_support || "byteandsecurity.support+public@gmail.com";

        // 5. Determine the recipients based on the dropdown subject
        let recipients: string[];

        switch (subject) {
            case 'technical':
                recipients = [mediaEmail, developerEmail];
                break;
            case 'prayer':
            case 'testimony':
                recipients = [pastoralEmail, adminEmail];
                break;
            case 'membership':
            case 'general':
            default:
                recipients = [adminEmail];
                break;
        }

        // 6. Send the email via Gmail
        const mailOptions = {
            from: `"Milk & Honey Contact" <${process.env.GMAIL_USER}>`,
            to: recipients.join(', '),
            replyTo: email,
            subject: `New ${subject.toUpperCase()} Inquiry from ${name}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
                    <h2 style="color: #1e293b;">New Website Submission</h2>
                    <p><strong>Category:</strong> ${subject.toUpperCase()}</p>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                    <hr style="border-color: #f1f5f9; margin: 20px 0;" />
                    <p><strong>Message:</strong></p>
                    <p style="background: #f8fafc; padding: 16px; border-radius: 8px;">
                        ${message.replace(/\n/g, '<br>')}
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({success: true, message: "Email sent successfully"});

    } catch (error) {
        console.error("Nodemailer API Route Error:", error);
        return NextResponse.json(
            {error: "Failed to send email."},
            {status: 500}
        );
    }
}