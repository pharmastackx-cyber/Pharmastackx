
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { sendOrderNotification } from '@/lib/whatsapp';


const Order = require('../../../../backend/models/Order');
const User = require('../../../../backend/models/User');
// The Product model is likely a JS file, but it mirrors the TS interface.
const Product = require('../../../../backend/models/Product');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// --- Authorization Helper ---
async function authorize() {

  // THE FIX: await the cookies() call to get the actual cookie store.
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token');

  if (!sessionToken || !sessionToken.value) {
    return { error: 'Not authenticated: No session token', status: 401 };
  }

  try {

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


    if (user.role !== 'admin' && user.role !== 'deliveryAgent' && user.role !== 'pharmacy' && user.role !== 'vendor') {
      return { error: `Forbidden: User role '${user.role}' is not authorized`, status: 403 };
    }

    return { user };

  } catch (error) {
    console.error("Authorization error:", error);
    return { error: 'Authentication failed: Invalid token', status: 401 };
  }
}

export async function GET(request) {

  const auth = await authorize();
  if (auth.error) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    await dbConnect();
    const { user } = auth;
    const { searchParams } = new URL(request.url);
    const deliveryOption = searchParams.get('deliveryOption');
    const businessName = searchParams.get('businessName');

    const query = {};
    if (user.role !== 'admin' && deliveryOption) {
      query.deliveryOption = deliveryOption;
    }

    if (user.role !== 'admin') {
      if (!user.businessName) {
        return NextResponse.json([]); 
      }
      query['businesses.name'] = user.businessName; }


    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
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

    // 1. Destructure all expected data from the client
    const { 
      patientName, 
      deliveryPhone, 
      deliveryEmail, 
      items: itemsFromClient, 
      businesses,
      orderType,
      deliveryOption,
      coupon 
    } = body;
    if (!itemsFromClient || itemsFromClient.length === 0) {
      return NextResponse.json({ message: 'No items in order' }, { status: 400 });
    }
    // 2. Prepare for server-side calculation
    let serverCalculatedTotal = 0;
    const finalOrderItems = [];
    // 3. Loop through client items and get authoritative data from the DB
    for (const clientItem of itemsFromClient) {
      // Find the product in the database using the ID provided by the client
      const product = await Product.findById(clientItem.productId).lean();
      
      if (!product) {
        return NextResponse.json({ message: `Product with ID ${clientItem.productId} not found` }, { status: 404 });
      }
      // CORRECTED: Use the correct field names from the Product model
      finalOrderItems.push({
        name: product.itemName,   
        qty: clientItem.qty,
        amount: product.amount,   
        image: product.imageUrl,
      });
      // CORRECTED: Use product.amount for calculation
      serverCalculatedTotal += product.amount * clientItem.qty;
    }

    
    
    let finalAmount = serverCalculatedTotal;

    // 4. Validate coupon and apply discount on the server-calculated total
    if (coupon && coupon === 'ALLFREE') {
      finalAmount = 0; 
    }

    const newOrderData = {
      user: {
        name: patientName,
        phone: deliveryPhone,
        email: deliveryEmail
      },
      orderType,
      deliveryOption,
      items: finalOrderItems,
      businesses: businesses.map(name => ({ name })),
      totalAmount: finalAmount,
      coupon: coupon || null,
      status: 'Pending',
    };

    const order = await Order.create(newOrderData);
    await sendOrderNotification(order);

    if (order.businesses && order.businesses.length > 0) {
      const businessPhoneNumbers = new Set();
      for (const business of order.businesses) {
        // Find the user (pharmacy/vendor) associated with the business name
        const businessUser = await User.findOne({ businessName: business.name }).lean();
        // If the user and their phone number exist, add it to our set
        if (businessUser && businessUser.phoneNumber) {
          businessPhoneNumbers.add(businessUser.phoneNumber);
        } else {
          console.log(`Could not find phone number for business: ${business.name}`);
        }
      }
      // Send a notification to each unique business phone number
      for (const phoneNumber of businessPhoneNumbers) {
        // Avoid re-notifying the admin if their number is also a business number
        if (phoneNumber !== process.env.RECIPIENT_PHONE_NUMBER) {
             await sendOrderNotification(order, phoneNumber);
        }
      }
    }

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

    const validStatuses = ['processing', 'completed', 'cancelled', 'failed'];
    if (!validStatuses.includes(status)) {
        return NextResponse.json({ message: `Invalid status: ${status}` }, { status: 400 });
    }

    await dbConnect();

    // If the frontend sends 'failed', we'll store it as 'Cancelled' in the DB.
    const finalStatus = status === 'failed' ? 'cancelled' : status;

    // **THE FIX**: Capitalize the status to match the database schema (e.g., 'processing' -> 'Processing')
    const capitalizedStatus = finalStatus.charAt(0).toUpperCase() + finalStatus.slice(1);
    
    const update = { status: capitalizedStatus };
    const now = new Date();

    // Add timestamps based on the new status
    if (finalStatus === 'processing') {
      update.acceptedAt = now;
    } else if (finalStatus === 'completed') {
      update.completedAt = now;
    }
    // Note: We are not adding a 'cancelledAt' timestamp to avoid potential schema errors.

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
    return NextResponse.json({ message: "Failed to update order", error: message }, { status: 500 });
  }
}

