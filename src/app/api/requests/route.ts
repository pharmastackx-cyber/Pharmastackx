
import { NextResponse, NextRequest } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import RequestModel from '@/models/Request';
import UserModel from '@/models/User';
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
  let userId;

  try {
    if (session?.userId) {
      console.log(`[LOG] Session found for userId: ${session.userId}`);
      userId = session.userId;
    } else {
      console.log('[LOG] No session found. Creating placeholder user.');
      const uniqueId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      const newUser = new UserModel({
        username: uniqueId,
        email: `${uniqueId}@placeholder.com`,
        password: `GuestPassword_${uniqueId}`, // This should be securely generated and handled
        role: 'customer',
      });
      await newUser.save();
      userId = newUser._id;
      console.log(`[LOG] Placeholder user created with ID: ${userId}`);
    }

    const body = await req.json();
    console.log('[LOG] Request body parsed:', body);

    if (body.requestType === 'text') {
      console.log("[LOG] Correction: Converted requestType from 'text' to 'drug-list'.");
      body.requestType = 'drug-list';
    }

    const { requestType, items, phoneNumber, state } = body; // Added state

    if (!requestType) {
      console.error('[ERROR] Validation failed: requestType is missing.');
      return NextResponse.json({ message: 'Request type is required' }, { status: 400 });
    }

    const requestData: any = {
      user: userId,
      requestType,
      items: items || [],
      status: 'pending',
      phoneNumber: phoneNumber,
      state: state, // Added state
    };

    console.log('[LOG] Data prepared for database model:', requestData);
    const newRequest = new RequestModel(requestData);

    console.log('[LOG] Mongoose model created. About to save...');
    await newRequest.save();

    console.log('[LOG] Save successful! Document ID:', newRequest._id);
    return NextResponse.json(newRequest, { status: 201 });

  } catch (error: any) {
    console.error('[FATAL] Error creating request in database:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error while creating request.', error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    await dbConnect();
    const { searchParams } = new URL(req.url, `http://${req.headers.get('host')}`);
    const userId = searchParams.get('userId');
    const source = searchParams.get('source');
  
    // For the dispatch form, we ONLY want to fetch by the provided userId.
    if (source === 'dispatch' && userId) {
      try {
        const requests = await RequestModel.find({ user: userId })
          .populate('user', 'name email')
          .sort({ createdAt: -1 });
        return NextResponse.json(requests, { status: 200 });
      } catch (error) {
        console.error('Error fetching requests for user:', error);
        return NextResponse.json({ message: 'Internal Server Error while fetching user requests.' }, { status: 500 });
      }
    }
  
    // Fallback to existing session-based logic for other parts of the application
    const session = await getSession(req);
    if (!session?.userId) {
      // If there's no session and it's not a dispatch request, return unauthorized.
      return NextResponse.json({ message: 'Unauthorized: No valid session found' }, { status: 401 });
    }
  
    try {
        let query: any = {};
        const pharmacistRoles = ['pharmacist', 'pharmacy'];

        if (pharmacistRoles.includes(session.role)) {
            // Pharmacists see open requests or requests where their quote was accepted.
            query = {
                $or: [
                    { status: { $in: ['pending', 'quoted'] } },
                    { 'quotes': { $elemMatch: { pharmacy: session.userId, status: 'accepted' } } }
                ]
            };
        } else if (session.role === 'admin') {
            // Admins see all requests.
            query = {};
        } else {
            // Regular users see their own requests.
            query = { user: session.userId };
        }

        const requests = await RequestModel.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
  
        return NextResponse.json(requests, { status: 200 });

    } catch (error) {
      console.error('Error fetching requests:', error);
      return NextResponse.json({ message: 'Internal Server Error while fetching requests.' }, { status: 500 });
    }
}
