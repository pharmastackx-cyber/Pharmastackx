
import { NextRequest, NextResponse } from 'next/server';
import { Db } from 'mongodb';
import { dbConnect } from '@/lib/mongoConnect';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import UserModel from '@/models/User';

async function getPharmacistTokens(): Promise<string[]> {
    await dbConnect();
    const users = await UserModel.find(
        { role: 'pharmacist', fcmTokens: { $nin: [null, []] } },
        { fcmTokens: 1, _id: 0 }
    ).lean();
    return users.flatMap(user => user.fcmTokens).filter(Boolean) as string[];
}

// Helper function to generate a dynamic notification title
function createDynamicTitle(drugNames: string[]): string {
    if (!drugNames || drugNames.length === 0) {
        return 'New Dispatch Request';
    }

    const count = drugNames.length;
    let title = 'Request for ';

    if (count === 1) {
        title += `${drugNames[0]}`;
    } else if (count === 2) {
        title += `${drugNames[0]} and ${drugNames[1]}`;
    } else if (count === 3) {
        title += `${drugNames[0]}, ${drugNames[1]}, and ${drugNames[2]}`;
    } else {
        title += `${drugNames[0]}, ${drugNames[1]}, ${drugNames[2]}, and ${count - 3} other items`;
    }

    return title;
}

export async function POST(req: NextRequest) {
    try {
        // Now expecting requestId and drugNames from the frontend
        const { requestId, drugNames } = await req.json();

        if (!requestId) {
            return NextResponse.json({ message: 'Request ID is required' }, { status: 400 });
        }

        const tokens = await getPharmacistTokens();

        if (tokens.length === 0) {
            return NextResponse.json({ message: 'No pharmacists to notify' }, { status: 200 });
        }

        const admin = getFirebaseAdmin();
        const notificationUrl = `/dispatch/manage-request/${requestId}`;

        // Create the dynamic title and body
        const notificationTitle = createDynamicTitle(drugNames);
        const notificationBody = 'A new dispatch request is available for you to quote.';

        const message = {
            notification: {
                title: notificationTitle,
                body: notificationBody,
            },
            data: {
                url: notificationUrl
            },
            webpush: {
                fcmOptions: {
                    link: notificationUrl
                }
            },
            tokens: tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message as any);
        console.log('Successfully sent message:', response);

        return NextResponse.json({ success: true, message: `Notified ${response.successCount} pharmacists.` });

    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
