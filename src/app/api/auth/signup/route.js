import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  const { username, email, password, userType, businessName, businessAddress, state, city, phoneNumber } = body;

  if (!username || !email || !password || !userType) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ error: 'Email already in use.' }, { status: 409 });
  }

  // Generate slug for service providers
  let slug = undefined;
  if (["pharmacy", "clinic", "vendor", "agent", "delivery_agent"].includes(userType) && businessName) {
    slug = businessName.trim().split(" ")[0].toLowerCase();
    // Ensure slug is unique
    let slugExists = await User.findOne({ slug });
    let count = 1;
    let baseSlug = slug;
    while (slugExists) {
      slug = `${baseSlug}${count}`;
      slugExists = await User.findOne({ slug });
      count++;
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    username,
    email,
    password: hashedPassword,
    userType,
    businessName,
    businessAddress,
    state,
    city,
    phoneNumber,
    slug
  });
  await user.save();

  return NextResponse.json({ message: 'User registered successfully.' }, { status: 201 });
}
