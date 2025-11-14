import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function POST(req) {
  await dbConnect();
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const user = await User.findOne({ email });

  // ***** START OF NEW DEBUGGING LOG *****
  console.log('[Login API] User found in database:', user);
  // ***** END OF NEW DEBUGGING LOG *****

  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return NextResponse.json({ token, user: { name: user.name, email: user.email, role: user.role } });
}
