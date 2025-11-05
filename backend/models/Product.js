const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  price: { type: Number, default: 0 },
  stockQuantity: { type: Number, default: 0 },
  manufacturer: { type: String },
  dosage: { type: String },
  prescriptionRequired: { type: Boolean, default: false },
  activeIngredients: [{ type: String }],
  sideEffects: [{ type: String }],
  warnings: [{ type: String }],
  expiryDate: { type: Date },
  images: [{ type: String }],
  businessId: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
