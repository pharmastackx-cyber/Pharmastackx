
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken'; 

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function POST(req) {
  await dbConnect();
  const body = await req.json();

  // Definitive Fix: Prioritize 'role' from the form, with 'userType' as a fallback.
  const { username, email, password, role: formRole, businessName, businessAddress, state, city, phoneNumber } = body;
  let role = formRole;

  let formattedPhoneNumber = phoneNumber;
  const serviceProviderRoles = ['pharmacy', 'clinic', 'vendor', 'agent', 'admin'];
  // Only format the number if it's for a service provider and a number is provided
  if (serviceProviderRoles.includes(role) && phoneNumber) {
    const trimmedNumber = phoneNumber.trim();
    // If the number starts with a '0', replace it with the international code '+234'
    if (trimmedNumber.startsWith('0')) {
      formattedPhoneNumber = `+234${trimmedNumber.substring(1)}`;
    }
  }

  // Definitive safeguard: Correct 'delivery_agent' to 'agent'.
  if (role === 'delivery_agent') {
    role = 'agent';
  }

  if (!username || !email || !password) {
    return NextResponse.json({ error: 'Username, email, and password are required.' }, { status: 400 });
  }

  // Default to 'customer' only if absolutely no role is provided.
  if (!role) {
    role = 'customer';
  }

  // Force admin role for the specific email, overriding any role from the form.
  if (email.toLowerCase() === 'pharmastackx@gmail.com') {
    role = 'admin';
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ error: 'Email already in use.' }, { status: 409 });
  }

  let slug = undefined;
  if (['pharmacy', 'clinic', 'vendor', 'agent'].includes(role) && businessName) {
    slug = businessName.trim().split(' ')[0].toLowerCase();
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
    role, 
    businessName,
    businessAddress,
    state,
    city,
    phoneNumber: formattedPhoneNumber,
    slug
  });
  await user.save();


  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role, businessName: user.businessName },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return NextResponse.json({ message: 'User registered successfully.', token }, { status: 201 });
  
}
