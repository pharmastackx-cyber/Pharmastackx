
import { NextResponse, NextRequest } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import RequestModel from '@/models/Request';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

async function getSession(req: NextRequest) {
  const token = req.cookies.get('session_token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

// GET a single dispatch request
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getSession(req);
    if (!session?.userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    try {
        const dispatchRequest = await RequestModel.findById(params.id);
        if (!dispatchRequest) {
            return NextResponse.json({ message: 'Request not found' }, { status: 404 });
        }
        return NextResponse.json(dispatchRequest, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch request:', error);
        return NextResponse.json({ message: 'Internal Server Error', error }, { status: 500 });
    }
}


// UPDATE a dispatch request (for pharmacy quotes)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getSession(req);
    if (!session?.userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        const body = await req.json();
        const { items, status, notes } = body;

        const originalRequest = await RequestModel.findById(params.id);
        if (!originalRequest) {
            return NextResponse.json({ message: 'Request not found' }, { status: 404 });
        }

        // --- FIX: Correctly handle quote submissions for all request types ---
        if (originalRequest.requestType === 'image-upload') {
            // When quoting an image-based request, preserve the original URL
            // in a new `prescriptionImage` field before overwriting `items`.
            if (Array.isArray(originalRequest.items) && typeof originalRequest.items[0] === 'string' && !originalRequest.prescriptionImage) {
                originalRequest.prescriptionImage = originalRequest.items[0];
            }
            // Replace the original item (the URL string) with the new quote details.
            originalRequest.items = items;
        } else {
            // For standard drug-list requests, update the existing items.
            originalRequest.items = originalRequest.items.map((originalItem: any) => {
                const updatedItemData = items.find((item: any) => item.name === originalItem.name);
                if (updatedItemData) {
                    return {
                        ...originalItem.toObject(),
                        isAvailable: updatedItemData.isAvailable,
                        price: updatedItemData.price,
                        pharmacyQuantity: updatedItemData.pharmacyQuantity,
                    };
                }
                return originalItem;
            });
        }
        
        if (status) {
            originalRequest.status = status;
        }
        if (notes) {
            originalRequest.notes = notes;
        }

        const savedRequest = await originalRequest.save();

        return NextResponse.json(savedRequest, { status: 200 });

    } catch (error) {
        console.error('Failed to update request:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
    }
}
