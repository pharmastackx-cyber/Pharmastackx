import mongoose, { Document, Model, Schema } from 'mongoose';

// The interface defines the shape of the data
export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  role: 'admin' | 'customer' | 'pharmacy' | 'clinic' | 'vendor' | 'agent';
  businessName?: string;
  slug?: string;
  businessAddress?: string;
  state?: string;
  city?: string;
  phoneNumber?: string;
  createdAt: Date;
  businessCoordinates?: {
    latitude?: number;
    longitude?: number;
  };
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

// The schema defines the blueprint for the database
const userSchema: Schema<IUser> = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'customer', 'pharmacy', 'clinic', 'vendor', 'agent'],
    required: true,
  },
  businessName: { type: String },
  slug: { type: String, unique: true, sparse: true },
  businessAddress: { type: String },
  state: { type: String },
  city: { type: String },
  phoneNumber: { type: String },
  createdAt: { type: Date, default: Date.now },
  businessCoordinates: {
    type: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    required: false,
    _id: false 
  },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },

});

// This line creates the model
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema, 'users');

export default User;
