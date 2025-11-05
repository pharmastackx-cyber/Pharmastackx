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
  timeAccepted: String,
  timeDispatched: String,
  deliveryAgent: {
    name: String,
    phone: String,
    email: String,
  },
  timePickup: String,
  timeDelivered: String,
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
