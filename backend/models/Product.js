const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  slug: { type: String, index: true },
  activeIngredient: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  imageUrl: { type: String, default: '' },
  businessName: { type: String, required: true },
  coordinates: { type: String, default: '' },
  info: { type: String, default: '' },
  POM: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
  bulkUploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'BulkUpload', default: null },
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
