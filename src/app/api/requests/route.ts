
import { NextResponse, NextRequest } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import RequestModel from '@/models/Request';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Helper to get session from the request cookies
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

export async function POST(req: NextRequest) {
  console.log('\n--- [API /api/requests POST] ---');
  await dbConnect();
  console.log('[LOG] Database connected.');

  const session = await getSession(req);
  if (!session?.userId) {
    console.error('[ERROR] Session validation failed. Session:', session);
    return NextResponse.json({ message: 'Unauthorized: Session is invalid or missing user ID' }, { status: 401 });
  }

  console.log(`[LOG] Session validated for userId: ${session.userId}`);

  try {
    const body = await req.json();
    console.log('[LOG] Request body parsed:', body);

    if (body.requestType === 'text') {
      console.log("[LOG] Correction: Converted requestType from 'text' to 'drug-list'.");
      body.requestType = 'drug-list';
    }

    const { requestType, items } = body;

    if (!requestType) {
      console.error('[ERROR] Validation failed: requestType is missing.');
      return NextResponse.json({ message: 'Request type is required' }, { status: 400 });
    }

    const requestData = {
      user: session.userId,
      requestType,
      items: items || [],
      status: 'pending',
    };

    console.log('[LOG] Data prepared for database model:', requestData);
    const newRequest = new RequestModel(requestData);

    console.log('[LOG] Mongoose model created. About to save...');
    await newRequest.save();

    console.log('[LOG] Save successful! Document ID:', newRequest._id);
    return NextResponse.json(newRequest, { status: 201 });

  } catch (error) {
    console.error('[FATAL] Error creating request in database:', error);
    return NextResponse.json({ message: 'Internal Server Error while creating request.' }, { status: 500 });
  }
}


// --- FIX STARTS HERE ---
export async function GET(req: NextRequest) {
    await dbConnect();
    const session = await getSession(req);
  
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized: No valid session found' }, { status: 401 });
    }
  
    try {
      // Corrected Role-based authorization as requested.
      // A user with one of these roles sees ALL requests.
      // Any other authenticated user will only see their OWN requests.
      const adminRoles = ['admin', 'pharmacist', 'pharmacy'];
      const query = adminRoles.includes(session.role) 
        ? {} // An empty query matches all documents
        : { user: session.userId }; // Otherwise, filter by the user's ID

      const requests = await RequestModel.find(query).populate('user', 'name email').sort({ createdAt: -1 });
  
      return NextResponse.json(requests, { status: 200 });

    } catch (error) {
      console.error('Error fetching requests:', error);
      return NextResponse.json({ message: 'Internal Server Error while fetching requests.' }, { status: 500 });
    }
  }
// --- FIX ENDS HERE ---