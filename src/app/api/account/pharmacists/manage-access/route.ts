
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function PUT(req: NextRequest) {
    console.log('--- [PUT /api/account/pharmacists/manage-access] Received request ---');
    try {
        await dbConnect();
        console.log('Database connected.');

        const cookieStore = await cookies();
        const sessionToken = cookieStore.get('session_token');

        if (!sessionToken) {
            console.log('Authentication failed: No session_token found.');
            return NextResponse.json({ message: 'Authentication failed' }, { status: 401 });
        }
        console.log('session_token found.');

        const payload = jwt.verify(sessionToken.value, JWT_SECRET) as { userId: string };
        const pharmacyUser = await User.findById(payload.userId).lean();

        if (!pharmacyUser || pharmacyUser.role !== 'pharmacy') {
            console.log(`Unauthorized access attempt. User ID: ${payload.userId}, Role: ${pharmacyUser?.role}`);
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        console.log(`Authenticated as pharmacy: ${pharmacyUser.username} (ID: ${pharmacyUser._id})`);

        const { pharmacistId, canManageStore } = await req.json();

        if (!pharmacistId || typeof canManageStore !== 'boolean') {
            return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
        }

        const pharmacist = await User.findById(pharmacistId);

        if (!pharmacist || pharmacist.role !== 'pharmacist' || pharmacist.pharmacy?.toString() !== pharmacyUser._id.toString()) {
            return NextResponse.json({ message: 'Pharmacist not found or not associated with this pharmacy' }, { status: 404 });
        }

        pharmacist.canManageStore = canManageStore;
        await pharmacist.save();

        console.log(`Successfully updated canManageStore for pharmacist ${pharmacistId} to ${canManageStore}`);

        // Return the updated list of pharmacists
        const pharmacists = await User.find({
            role: 'pharmacist',
            pharmacy: pharmacyUser._id.toString(),
        }).select('username email profilePicture canManageStore').lean();

        return NextResponse.json({ pharmacists }, { status: 200 });

    } catch (error: any) {
        console.error('--- [ERROR in /api/account/pharmacists/manage-access] ---');
        console.error(`Error occurred: ${error.message}`);
        console.error(error.stack);
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }
        return NextResponse.json({ 
            message: 'An internal server error occurred.',
            error: error.message
        }, { status: 500 });
    }
}
