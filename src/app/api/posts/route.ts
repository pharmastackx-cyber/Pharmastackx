import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect'; // FIX: Using your project's existing DB connection utility
import Post from '@/models/Post';               // FIX: Using path alias
import User from '@/models/User';                 // FIX: Importing User model for authentication
import { cookies } from 'next/headers';           // For reading cookies
import jwt from 'jsonwebtoken';  

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Helper function to create a URL-friendly slug
const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};

export async function POST(request: Request) {
  const session = await getSession();

  // 1. Authentication: Check if the user is an admin
  if (session?.user?.role !== 'admin') {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await dbConnect();

    const { title, content, category, imageUrl } = await request.json();
    const author = {
        name: session.user.name || 'Admin',
        id: session.user.id,
    };

    // 2. Validation: Check for required fields
    if (!title || !content || !category || !author.id) {
      return new NextResponse(JSON.stringify({ message: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const slug = createSlug(title);

    // 3. Create and Save the Post
    const newPost = new Post({
      title,
      content,
      category,
      imageUrl: imageUrl || '',
      slug,
      author,
    });

    await newPost.save();

    return new NextResponse(JSON.stringify(newPost), {
      status: 201, // 201 Created
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('API_POSTS_ERROR', error);
    return new NextResponse(JSON.stringify({ message: 'Failed to create post', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET() {
    try {
        await dbConnect();

        // Fetch all posts, sorted by most recent
        const posts = await Post.find({}).sort({ createdAt: -1 });

        return new NextResponse(JSON.stringify(posts), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('API_GET_POSTS_ERROR', error);
        return new NextResponse(JSON.stringify({ message: 'Failed to fetch posts' }), {
            status: 500,
        });
    }
}
