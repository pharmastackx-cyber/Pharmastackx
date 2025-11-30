
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';

export async function POST(req) {
  try {
    await dbConnect();
    // 1. READ ALL DATA: Capture the entire request body.
    const allData = await req.json();
    const { 
      businessName,
      businessAddress,
      email: originalEmail,
      password, 
      role = 'customer'
    } = allData;

    if (!originalEmail || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const email = originalEmail.toLowerCase();

    // Correctly validate required fields for non-customer roles, excluding pharmacist
    if (role !== 'customer' && role !== 'pharmacist' && (!businessName || !businessAddress)) {
      return NextResponse.json({ error: 'Business name and address are required for this role.' }, { status: 400 });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const errorMessage = `This email is already registered as a ${existingUser.role}. Please log in.`;
      return NextResponse.json({ error: errorMessage }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let finalRole = role;
    if (email === 'pharmastackx@gmail.com') {
      finalRole = 'admin';
    }

     const baseUsername = allData.username || email.split('@')[0].replace(/[^a-z0-9]/gi, '');
     let username = baseUsername;
     let userExists = await User.findOne({ username });
     let count = 1;
     while (userExists) {
         username = `${baseUsername}${count}`;
         userExists = await User.findOne({ username });
         count++;
     }

    let slug = undefined;
    if (['pharmacy', 'clinic', 'vendor', 'agent'].includes(finalRole) && businessName) {
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

    // 2. SAVE ALL DATA: Create the new user with all data from the form.
    const newUser = new User({
      ...allData, // Spread all fields from the request
      username,
      email,
      password: hashedPassword,
      role: finalRole,
      slug,
      isPublished: ['customer', 'pharmacist'].includes(finalRole) // Publish customers and pharmacists by default
    });

    await newUser.save();

    // 3. RETURN NEW USER: Send the complete user object back to the frontend.
    return NextResponse.json({ message: 'User created successfully.', user: newUser }, { status: 201 });

  } catch (error) {
    console.error("Signup API Error:", error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
