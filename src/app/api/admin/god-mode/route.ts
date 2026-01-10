import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/mongoConnect';

// TS Models
import User from '@/models/User';
import Product from '@/models/Product';
import Post from '@/models/Post';
import Message from '@/models/Message';
import MedicineRequest from '@/models/MedicineRequest';
import BulkUpload from '@/models/BulkUpload';
import DraftStock from '@/models/DraftStock';
import EnrichmentLock from '@/models/EnrichmentLock';
import Log from '@/models/Log';
import UploadLog from '@/models/UploadLog';
import Request from '@/models/Request.js';

// JS Models
const Order = require('../../../../../backend/models/Order');
const DispatchHistory = require('../../../../../backend/models/DispatchHistory');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

const models: { [key: string]: any } = {
    'users': User,
    'products': Product,
    'posts': Post,
    'messages': Message,
    'medicine-requests': MedicineRequest,
    'bulk-uploads': BulkUpload,
    'draft-stocks': DraftStock,
    'enrichment-locks': EnrichmentLock,
    'logs': Log,
    'upload-logs': UploadLog,
    'orders': Order,
    'dispatch-histories': DispatchHistory,
    'requests': Request
};

export async function GET(req: NextRequest) {
    await dbConnect();
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token');

    if (!sessionToken) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const payload = jwt.verify(sessionToken.value, JWT_SECRET) as { userId: string };
        const user = await User.findById(payload.userId).lean();

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const collectionName = searchParams.get('collection');

        if (!collectionName) {
            const collectionNames = Object.keys(models);
            return NextResponse.json(collectionNames, { status: 200 });
        }

        if (!models[collectionName]) {
            return NextResponse.json({ message: 'Invalid collection' }, { status: 400 });
        }

        const Model = models[collectionName];
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = 100;
        const skip = (page - 1) * limit;

        const data = await Model.find({}).skip(skip).limit(limit).lean();
        const total = await Model.countDocuments({});

        return NextResponse.json({ data, total, page, limit }, { status: 200 });

    } catch (error: any) {
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }
        console.error(`Error in god-mode API:`, error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
