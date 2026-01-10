
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import UserModel from '@/models/User';
import RequestModel from '@/models/Request'; // Import RequestModel

async function getRecipientTokens(requestState?: string): Promise<string[]> {
    await dbConnect();

    const query: any = {
        fcmTokens: { $nin: [null, []] },
        $or: [
            { role: 'admin' } 
        ]
    };

    if (requestState) {
        query.$or.push(
            { role: { $in: ['pharmacist', 'pharmacy'] }, state: requestState }
        );
    } else {
        query.$or.push(
            { role: { $in: ['pharmacist', 'pharmacy'] } }
        );
    }

    const users = await UserModel.find(query, { fcmTokens: 1, _id: 0 }).lean();
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
        const { requestId, drugNames } = await req.json();

        if (!requestId) {
            return NextResponse.json({ message: 'Request ID is required' }, { status: 400 });
        }

        const request = await RequestModel.findById(requestId).lean() as { state?: string };

        if (!request) {
            return NextResponse.json({ message: 'Request not found' }, { status: 404 });
        }

        const tokens = await getRecipientTokens(request.state);

        if (tokens.length === 0) {
            return NextResponse.json({ message: 'No recipients to notify' }, { status: 200 });
        }

        const admin = getFirebaseAdmin();
        const notificationUrl = `/review-request/${requestId}`;

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

        return NextResponse.json({ success: true, message: `Notified ${response.successCount} recipients.` });

    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
