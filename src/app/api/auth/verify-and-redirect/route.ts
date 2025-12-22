
import { NextResponse, NextRequest } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!token) {
        return NextResponse.redirect(`${appUrl}/auth?error=verification_failed`);
    }

    try {
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationTokenExpires: { $gt: Date.now() },
        });

        if (!user) {
            return NextResponse.redirect(`${appUrl}/auth?error=invalid_token`);
        }

        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpires = undefined;
        await user.save();

        return NextResponse.redirect(`${appUrl}/account`);

    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.redirect(`${appUrl}/auth?error=verification_failed`);
    }
}
