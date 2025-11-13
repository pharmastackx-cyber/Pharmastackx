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
    }
],
totalAmount: {
    type: Number,
    required: true,
    default: 0
},
coupon: {
    type: String,
    default: null
},
status: {
    type: String,
    required: true,
    enum: ['Pending', 'Accepted', 'Processing', 'Dispatched', 'In Transit', 'Completed', 'Cancelled', 'Failed'],
    default: 'Pending'
},
// Timestamps for status changes
acceptedAt: { type: Date },
dispatchedAt: { type: Date },
pickedUpAt: { type: Date }, // For 'In Transit'
completedAt: { type: Date },

}, { timestamps: true }); // This adds createdAt and updatedAt

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
