
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { sendWhatsAppNotification } from '@/lib/whatsapp';


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

    const { 
      patientName, 
      deliveryPhone, 
      deliveryEmail, 
      items: itemsFromClient, 
      businesses,
      orderType,
      deliveryOption,
      coupon,
      requestId, // Captured for quote-based orders
      quoteId,   // Captured for quote-based orders
    } = body;

    if (!itemsFromClient || itemsFromClient.length === 0) {
      return NextResponse.json({ message: 'No items in order' }, { status: 400 });
    }

    let serverCalculatedTotal = 0;
    const finalOrderItems = [];

    // --- START OF CRITICAL CHANGE ---
    // Loop through client items, handling quote items and standard products differently.
    for (const clientItem of itemsFromClient) {
      if (clientItem.isQuoteItem) {
        // This is a temporary item from a quote. Trust the client data.
        finalOrderItems.push({
          name: clientItem.name,
          qty: clientItem.qty,
          amount: clientItem.price, // Use price from the quote
          image: clientItem.image || '',
        });
        serverCalculatedTotal += clientItem.price * clientItem.qty;
      } else {
        // This is a standard product. Look it up in the database.
        const product = await Product.findById(clientItem.productId).lean();
        
        if (!product) {
          // This was the source of the crash for quote items
          return NextResponse.json({ message: `Order creation failed: Product with ID ${clientItem.productId} not found` }, { status: 404 });
        }
        
        finalOrderItems.push({
          name: product.itemName,
          qty: clientItem.qty,
          amount: product.amount,
          image: product.imageUrl,
        });
        serverCalculatedTotal += product.amount * clientItem.qty;
      }
    }
    // --- END OF CRITICAL CHANGE ---

    let finalAmount = serverCalculatedTotal;

    if (coupon && coupon === 'ALLFREE') {
      finalAmount = 0; 
    }

    const newOrderData = {
      user: { name: patientName, phone: deliveryPhone, email: deliveryEmail },
      orderType,
      deliveryOption,
      items: finalOrderItems,
      businesses: businesses.map(name => ({ name })),
      totalAmount: finalAmount,
      coupon: coupon || null,
      status: 'Pending',
      // Add the quote/request references if they exist
      requestId: requestId || null,
      quoteId: quoteId || null,
    };

    const order = await Order.create(newOrderData);
    await sendWhatsAppNotification(order);

    if (order.businesses && order.businesses.length > 0) {
      const businessPhoneNumbers = new Set();
      for (const business of order.businesses) {
        const businessUser = await User.findOne({ businessName: business.name }).lean();
        if (businessUser && businessUser.phoneNumber) {
          businessPhoneNumbers.add(businessUser.phoneNumber);
        } else {
          console.log(`Could not find phone number for business: ${business.name}`);
        }
      }
      for (const phoneNumber of businessPhoneNumbers) {
        if (phoneNumber !== process.env.RECIPIENT_PHONE_NUMBER) {
             await sendWhatsAppNotification(order, phoneNumber);
        }
      }
    }

    return NextResponse.json(order, { status: 201 });

  } catch (error) {
    console.error("Error creating order:", error);
    // Provide a more specific error message if possible
    const errorMessage = error.message || "An unexpected error occurred.";
    return NextResponse.json({ message: "Failed to create order", error: errorMessage }, { status: 500 });
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
