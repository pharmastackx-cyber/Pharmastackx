
import { NextRequest, NextResponse } from 'next/server';
import { transporter, mailOptions } from '@/lib/nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, mobile, licenseNumber, stateOfPractice, pharmacy } = body;

    // Construct the email with data from the form
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

    // Send the email
    await transporter.sendMail(adminMailOptions);

    return NextResponse.json({ message: 'Notification sent successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Failed to send demo signup notification:', error);
    // This endpoint should not return an error to the client that would block the UI.
    // We log it on the server and return a success response to the form.
    return NextResponse.json({ message: 'Notification processed.' }, { status: 200 });
  }
}
