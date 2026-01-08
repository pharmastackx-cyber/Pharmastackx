
import { NextResponse, NextRequest } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { businessName, email, password } = await req.json();

    if (!businessName || !email || !password) {
      return NextResponse.json({ error: 'Business name, email, and password are required.' }, { status: 400 });
    }

    const existingPharmacy = await User.findOne({ businessName, role: 'pharmacy' });

    if (!existingPharmacy) {
      return NextResponse.json({ error: 'Pharmacy not found.' }, { status: 404 });
    }

    if (existingPharmacy.email !== '1767503591446@pharmacy.placeholder') {
        return NextResponse.json({ error: 'This pharmacy has already been claimed.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    existingPharmacy.email = email;
    existingPharmacy.password = hashedPassword;
    existingPharmacy.emailVerified = false; 
    
    await existingPharmacy.save();

    return NextResponse.json({ message: 'Pharmacy claimed successfully. Please verify your email to activate your account.' }, { status: 200 });

  } catch (error) {
    console.error("Claim Pharmacy API Error:", error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
