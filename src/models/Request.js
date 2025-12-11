import mongoose from 'mongoose';

const RequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // --- FIX: Add pharmacy field to link to the quoting pharmacy ---
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy' 
  },
  items: [{
    _id: false, 
    name: { type: String, required: true },
    form: { type: String },
    strength: { type: String },
    quantity: { type: Number, required: true },
    notes: { type: String },
    image: { type: String },
    // --- FIELDS FOR PHARMACY --- 
    price: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    pharmacyQuantity: { type: Number }
  }],

  requestType: {
    type: String,
    enum: ['drug-list', 'prescription', 'product-image'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'quoted', 'awaiting-confirmation', 'confirmed', 'dispatched', 'rejected', 'cancelled'], 
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Request = mongoose.models.Request || mongoose.model('Request', RequestSchema);

export default Request;
