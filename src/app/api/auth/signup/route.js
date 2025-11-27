
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';

export async function POST(req) {
  try {
    await dbConnect();
    const { 
      businessName,
      businessAddress,
      businessPhone,
      pharmacistLicense,
      pharmacistRegistrationDate,
      superintendentPharmacist,
      superintendentPharmacistLicense,
      superintendentPharmacistRegistrationDate,
      email: originalEmail,
      password, 
      role = 'customer' // Default role to 'customer'
    } = await req.json();

    if (!originalEmail || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const email = originalEmail.toLowerCase();

    // Validate required fields for non-customer roles
    if (role !== 'customer' && (!businessName || !businessAddress)) {
      return NextResponse.json({ error: 'Business name and address are required for this role.' }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Provide a more specific error message
      const errorMessage = `This email is already registered as a ${existingUser.role}. Please log in.`;
      return NextResponse.json({ error: errorMessage }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let finalRole = role;
    // Force admin role for the specific email, which is now lowercase.
    if (email === 'pharmastackx@gmail.com') {
      finalRole = 'admin';
    }

     // Generate a unique username from the email
     const baseUsername = email.split('@')[0].replace(/[^a-z0-9]/gi, '');
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

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: finalRole,
      businessName,
      businessAddress,
      businessPhone,
      pharmacistLicense,
      pharmacistRegistrationDate,
      superintendentPharmacist,
      superintendentPharmacistLicense,
      superintendentPharmacistRegistrationDate,
      slug,
      isPublished: finalRole === 'customer' // Customers are published by default
    });

    await newUser.save();

    return NextResponse.json({ message: 'User created successfully.' }, { status: 201 });

  } catch (error) {
    console.error("Signup API Error:", error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
