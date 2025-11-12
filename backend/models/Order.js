const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    name: String,
    phone: String,
    email: String,
  },
  orderType: String,
  deliveryOption: String,
  items: [
    {
      name: String,
      qty: Number,
      amount: Number,
      image: String,
    }
  ],
  businesses: [
    {
      name: String,
      phone: String,
      email: String,
    }
  ],
  totalAmount: Number,
  status: String,
  
  // Renamed timestamp fields for consistency with the frontend
  acceptedAt: String,
  dispatchedAt: String, 
  pickedUpAt: String,
  completedAt: String,

  deliveryAgent: {
    name: String,
    phone: String,
    email: String,
  },
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
