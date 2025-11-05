
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';

export async function POST(req) {
  await dbConnect();
  const body = await req.json();

  // Definitive Fix: Prioritize 'role' from the form, with 'userType' as a fallback.
  const { username, email, password, role: formRole, userType, businessName, businessAddress, state, city, phoneNumber } = body;
  let role = formRole || userType;

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
    role, // This will now be correct.
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
