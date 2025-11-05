import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';

const Order = require('../../../../backend/models/Order');

export async function GET() {
  await dbConnect();
  const orders = await Order.find({}).lean();
  return NextResponse.json(orders);
}

export async function POST(request) {
  await dbConnect();
  const data = await request.json();
  const order = await Order.create(data);
  return NextResponse.json(order);
}
