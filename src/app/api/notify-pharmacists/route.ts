
import { NextRequest, NextResponse } from 'next/server';
import { Db } from 'mongodb';
import { dbConnect } from '@/lib/mongoConnect';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import UserModel from '@/models/User';



async function getPharmacistTokens(): Promise<string[]> {
    await dbConnect(); // Ensure the database connection is established
    
    const users = await UserModel.find(
        { role: 'pharmacist', fcmTokens: { $nin: [null, []] } },

        { fcmTokens: 1, _id: 0 } // Select only the fcmTokens field
    ).lean(); 

    // Use flatMap to flatten the array of token arrays from all users
    return users.flatMap(user => user.fcmTokens).filter(Boolean) as string[];

}




export async function POST(req: NextRequest) {
    try {
        const { requestId } = await req.json();

        if (!requestId) {
            return NextResponse.json({ message: 'Request ID is required' }, { status: 400 });
        }

        const tokens = await getPharmacistTokens();

        if (tokens.length === 0) {
            return NextResponse.json({ message: 'No pharmacists to notify' }, { status: 200 });
        }

        const admin = getFirebaseAdmin();
        const message = {
            notification: {
                title: 'New Dispatch Request',
                body: 'A new dispatch request is available for you to quote.',
            },
            webpush: {
                fcmOptions: {
                    link: `/dispatch?requestId=${requestId}`
                }
            },
            
            tokens: tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        console.log('Successfully sent message:', response);

        return NextResponse.json({ success: true, message: `Notified ${response.successCount} pharmacists.` });

    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
