
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const Order = require('../../../../backend/models/Order');
const User = require('../../../../backend/models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// --- Authorization Helper ---
async function authorize() {
  // Correctly get the cookie store
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('session_token');

  if (!sessionToken || !sessionToken.value) {
    return { error: 'Not authenticated: No session token', status: 401 };
  }

  try {
    // Verify the token
    const payload = jwt.verify(sessionToken.value, JWT_SECRET);
    const userId = payload.userId;
    
    if (!userId) {
      return { error: 'Invalid token: No user ID', status: 401 };
    }

    await dbConnect();
    const user = await User.findById(userId).lean();

    if (!user) {
      return { error: 'User not found', status: 404 };
    }

    // Check for authorized roles
    if (user.role !== 'admin' && user.role !== 'deliveryAgent') {
      return { error: `Forbidden: User role '${user.role}' is not authorized`, status: 403 };
    }

    // If all checks pass, return the user
    return { user };

  } catch (error) {
    console.error("Authorization error:", error); // Log the actual JWT error
    return { error: 'Authentication failed: Invalid token', status: 401 };
  }
}


// --- API Endpoints ---

// GET all orders
export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ message: "Failed to fetch orders", error: error.message }, { status: 500 });
  }
}

// POST a new order
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const user = { name: body.patientName, phone: body.deliveryPhone, email: body.deliveryEmail };
    
    
    const items = body.items.map(item => ({ 
    name: item.name, 
    qty: item.quantity, 
    amount: item.amount, 
    image: item.image
}));


    const businesses = body.businesses.map(pharmacyName => ({ name: pharmacyName }));

    const newOrderData = {
      user,
      orderType: body.orderType,
      deliveryOption: body.deliveryOption,
      items,
      businesses,
      totalAmount: body.total,
      status: 'Pending',
    };

    const order = await Order.create(newOrderData);
    return NextResponse.json(order, { status: 201 });

  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ message: "Failed to create order", error: error.message }, { status: 500 });
  }
}

// PUT (update) an existing order's status - NOW SECURED
export async function PUT(request) {
  const auth = await authorize();
  if (auth.error) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ message: "Missing orderId or status" }, { status: 400 });
    }

    await dbConnect();

    const update = { status };
    const now = new Date().toISOString();
    if (status === 'Accepted') update.acceptedAt = now;
    else if (status === 'Dispatched') update.dispatchedAt = now;
    else if (status === 'In Transit') update.pickedUpAt = now;
    else if (status === 'Completed') update.completedAt = now;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: update },
      { new: true }
    ).lean();

    if (!updatedOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder);

  } catch (error) {
    console.error("Error updating order:", error);
    // Check for parsing errors, which can happen if the body is already consumed
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: "Invalid JSON in request body" }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to update order", error: error.message }, { status: 500 });
  }
}
