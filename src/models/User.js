import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: {
    type: String,
    enum: ['admin', 'customer', 'pharmacy', 'clinic', 'vendor', 'agent'],
    required: true
  },
  businessName: { type: String },
  slug: { type: String, unique: true, sparse: true },
  businessAddress: { type: String },
  state: { type: String },
  city: { type: String },
  phoneNumber: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', userSchema);
