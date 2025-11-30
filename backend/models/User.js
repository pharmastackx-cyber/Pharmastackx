const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'customer', 'pharmacy', 'clinic', 'vendor', 'agent', 'pharmacist'],
    required: true
  },
  businessName: { type: String },
  slug: { type: String, unique: true, sparse: true },
  businessAddress: { type: String },
  state: { type: String },
  city: { type: String },
  phoneNumber: { type: String },
  mobile: { type: String },
  licenseNumber: { type: String },
  stateOfPractice: { type: String },
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
