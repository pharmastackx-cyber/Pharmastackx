
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import User from '@/models/User';
import { transporter, mailOptions } from '@/lib/nodemailer';
import { dbConnect } from '@/lib/mongoConnect';

async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password/${resetToken}`;
  const emailBody = `
    <h1>Password Reset Request</h1>
    <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
    <p>Please click on the following link, or paste it into your browser to complete the process within one hour of receiving it:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
  `;

  await transporter.sendMail({
    ...mailOptions,
    to: email,
    subject: 'PharmaStackX - Password Reset Link',
    html: emailBody,
  });
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email: originalEmail } = await request.json();

    if (!originalEmail) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }

    const email = originalEmail.toLowerCase();
    const user = await User.findOne({ email });

    // For security, even if the user is not found, we don't reveal it.
    // The email sending process will only trigger if the user exists.
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

      user.passwordResetToken = passwordResetToken;
      user.passwordResetExpires = passwordResetExpires;
      await user.save();
      
      // Directly call the email sending function. If it fails, the catch block below will handle it.
      await sendPasswordResetEmail(user.email, resetToken);
    }

    // Return a generic success message to prevent email enumeration.
    return NextResponse.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    }, { status: 200 });

  } catch (error) {
    console.error('Forgot Password API Error:', error);
    // This will now catch errors from dbConnect, User.findOne, user.save, AND sendPasswordResetEmail.
    return NextResponse.json({ message: 'An internal server error occurred. Please try again later.' }, { status: 500 });
  }
}
