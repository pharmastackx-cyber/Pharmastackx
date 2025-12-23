
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';

export async function POST(req) {
    await dbConnect();

    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const sessionResponse = await fetch(`${protocol}://${host}/api/auth/session`, {
        headers: {
            cookie: req.headers.get('cookie'),
        },
    });

    if (!sessionResponse.ok) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await sessionResponse.json();
    
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { promoCode } = await req.json();

    if (promoCode.toUpperCase() === 'ALLFREE') {
        const now = new Date();
        const oneMonthLater = new Date(now.setMonth(now.getMonth() + 1));

        try {
            await User.findByIdAndUpdate(session.user._id, {
                subscriptionStatus: 'subscribed',
                subscriptionExpiry: oneMonthLater,
                orderCount: 0,
            });
            return NextResponse.json({ message: 'Subscription updated successfully' });
        } catch (error) {
            console.error('Error updating subscription:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

    } else {
        // TODO: Handle Paystack payments
        return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 });
    }
}
