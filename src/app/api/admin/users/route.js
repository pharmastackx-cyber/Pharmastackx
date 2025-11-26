import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET(req) {
    await dbConnect();
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ message: 'Server error while fetching users' }, { status: 500 });
    }
}

export async function POST(req) {
    await dbConnect();
    try {
        const { email, password, role } = await req.json();

        if (!email || !password || !role) {
            return NextResponse.json({ message: 'Email, password, and role are required' }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'User with this email already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username: email.split('@')[0], // FIX: Set username from email
            email,
            password: hashedPassword,
            role,
        });

        await newUser.save();

        // Exclude password from the returned object
        const userObject = newUser.toObject();
        delete userObject.password;

        return NextResponse.json({ message: 'User created successfully', user: userObject }, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ message: `Server error while creating user: ${error.message}` }, { status: 500 });
    }
}
