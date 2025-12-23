
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import User from '@/models/User';
import { transporter, mailOptions } from '@/lib/nodemailer';
import { dbConnect } from '@/lib/mongoConnect';

// --- Function to send email asynchronously ---
async function sendPasswordResetEmail(email: string, resetToken: string) {
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
      to: email,
      subject: 'PharmaStackX - Password Reset Link',
      html: emailBody,
    });
    console.log(`Password reset email sent to: ${email}`);
  } catch (emailError) {
    console.error('Failed to send password reset email:', emailError);
    // In a real-world scenario, you'd have more robust error handling/logging here
    // For example, you could add this to a retry queue.
  }
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

    if (user) {
      // --- Generate Token and Update User (as before) ---
      const resetToken = crypto.randomBytes(32).toString('hex');
      const passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

      user.passwordResetToken = passwordResetToken;
      user.passwordResetExpires = passwordResetExpires;
      await user.save();

      // --- Send Email Asynchronously ---
      sendPasswordResetEmail(user.email, resetToken);
    }
    
    // --- Return Immediate Response ---
    // For security, we always return the same message, whether the user exists or not.
    return NextResponse.json({ message: 'If an account with that email exists, a password reset link has been sent.' }, { status: 200 });

  } catch (error) {
    console.error('Forgot Password API Error:', error);
    // Even in case of a DB error, we don't want to leak information.
    // We will still return a generic success message.
    // In a real production environment, you should have detailed logs to debug this.
    return NextResponse.json({ message: 'If an account with that email exists, a password reset link has been sent.' }, { status: 200 });
  }
}
