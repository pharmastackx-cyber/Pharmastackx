
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import User from '@/models/User';
import { transporter, mailOptions } from '@/lib/nodemailer';
import { dbConnect } from '@/lib/mongoConnect';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email: originalEmail } = await request.json();

    if (!originalEmail) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }

    const email = originalEmail.toLowerCase(); 
    
    const user = await User.findOne({ email });
    if (!user) {
      // For security, we don't reveal if the user exists or not.
      // We send a success-like message, but no email is actually sent.
      console.log(`Password reset attempt for non-existent user: ${email}`);
      return NextResponse.json({ message: 'If an account with that email exists, a password reset link has been sent.' }, { status: 200 });
    }

    // --- Generate Token ---
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Hash the token before storing it in the database for security
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiration to 1 hour from now
    const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

    // --- Update User in Database ---
    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = passwordResetExpires;
    await user.save();

    // --- Send Email ---
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password/${resetToken}`;
    const emailBody = `
      <h1>Password Reset Request</h1>
      <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
      <p>Please click on the following link, or paste it into your browser to complete the process within one hour of receiving it:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `;

    try {
      await transporter.sendMail({
        ...mailOptions,
        to: user.email,
        subject: 'PharmaStackX - Password Reset Link',
        html: emailBody,
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Even if the email fails, we don't want to leak information.
      // The user record is already updated, so they can try again later.
      // In a real-world scenario, you'd have more robust error logging here.
       return NextResponse.json({ message: 'Error sending email. Please try again later.' }, { status: 500 });
    }
    
    console.log(`Password reset email sent to: ${email}`);
    return NextResponse.json({ message: 'If an account with that email exists, a password reset link has been sent.' }, { status: 200 });

  } catch (error) {
    console.error('Forgot Password API Error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
