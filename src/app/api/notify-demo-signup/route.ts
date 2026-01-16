
import { NextRequest, NextResponse } from 'next/server';
import { transporter, mailOptions } from '@/lib/nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, mobile, licenseNumber, stateOfPractice, pharmacy } = body;

    // 1. Construct the notification email for the admin
    const adminMailOptions = {
        ...mailOptions,
        to: 'pharmastackx@gmail.com',
        subject: '[PharmaStackX Demo Registration] - New Sign-up',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #006D5B;">New Product Demo Registration</h2>
                <p>A new user has registered for the product demo. Here are their details:</p>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background-color: #f2f2f2;">
                        <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Full Name:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${username || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Email Address:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
                    </tr>
                    <tr style="background-color: #f2f2f2;">
                        <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Mobile Number:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${mobile || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>License Number:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${licenseNumber || 'N/A'}</td>
                    </tr>
                     <tr style="background-color: #f2f2f2;">
                        <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>State of Practice:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${stateOfPractice || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Pharmacy ID:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${pharmacy || 'N/A'}</td>
                    </tr>
                </table>
                <p style="margin-top: 20px; font-size: 0.9em; color: #777;">This is an automated notification from the PharmaStackX signup process.</p>
            </div>
        `,
    };

    // 2. Construct the confirmation email for the user
    const userMailOptions = {
        ...mailOptions,
        to: email, // Send to the user who signed up
        subject: "Confirmation: You're Registered for the PharmaStackX Product Demo!",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #006D5B;">Thank You for Registering, ${username}!</h2>
                <p>This email confirms your registration for the <strong>PharmaStackX product demo.</strong></p>
                <p>We're excited to show you how our platform can revolutionize your pharmacy operations. We will be in touch shortly with more details.</p>
                <p>In the meantime, your PharmaStackX account has been created. You should receive a separate email shortly to verify your email address. Once verified, you can log in and begin to explore the platform.</p>
                <br>
                <p>Best regards,</p>
                <p><strong>The PharmaStackX Team</strong></p>
            </div>
        `,
    };

    // 3. Send both emails in parallel
    await Promise.all([
        transporter.sendMail(adminMailOptions),
        transporter.sendMail(userMailOptions)
    ]);

    return NextResponse.json({ message: 'Notifications sent successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Failed to send demo signup notifications:', error);
    return NextResponse.json({ message: 'Notification processed.' }, { status: 200 });
  }
}
