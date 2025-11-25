
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import User from '@/models/User';
import { dbConnect } from '@/lib/mongoConnect';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ message: 'Token and password are required.' }, { status: 400 });
    }

    // Hash the incoming token to match the one stored in the DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find the user with the matching token and ensure it has not expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // $gt ensures the expiration date is in the future
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired password reset token.' }, { status: 400 });
    }

    // --- Hash New Password ---
    if (password.length < 6) {
        return NextResponse.json({ message: 'Password must be at least 6 characters long.' }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    // --- Update User in Database ---
    user.password = hashedPassword;
    user.passwordResetToken = undefined; // Clear the token
    user.passwordResetExpires = undefined; // Clear the expiration
    await user.save();

    return NextResponse.json({ message: 'Password has been successfully reset. You can now log in with your new password.' }, { status: 200 });

  } catch (error) {
    console.error('Reset Password API Error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
