import mongoose, { Mongoose } from 'mongoose'; // Keep the Mongoose type import

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

// 1. Declare the global cache structure
declare global {
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

// 2. Initialize or retrieve the global cache
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect(): Promise<Mongoose> {
  // 3. Return cached connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // 4. Create connection promise if it doesn't exist (simplified .then)
  if (!cached.promise) {
    // Optional: Add configuration options here
    cached.promise = mongoose.connect(MONGO_URI); 
  }

  // 5. Await and store the resolved connection
  cached.conn = await cached.promise;
  
  return cached.conn;
}