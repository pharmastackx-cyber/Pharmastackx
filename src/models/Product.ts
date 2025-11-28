
import mongoose, { Document, Model, Schema } from 'mongoose';


export interface IProduct extends Document {
  itemName: string;
  activeIngredient: string;
  category: string;
  amount: number;
  imageUrl: string;
  businessName: string;
  coordinates: string;
  info: string;
  POM: boolean;
  slug: string;
  isPublished: boolean;
  bulkUploadId?: mongoose.Types.ObjectId;
  itemNameVector?: number[]; // Stores the vector representation of the item name
  enrichmentStatus: 'pending' | 'processing' | 'completed'; // New field for AI workflow
}

const productSchema: Schema<IProduct> = new mongoose.Schema({
  itemName: { type: String, required: true },
  itemNameVector: { type: [Number], required: false }, // Added for vector search
  activeIngredient: { type: String, required: false, default: 'N/A' },
  category: { type: String, required: false, default: 'N/A' },
  amount: { type: Number, required: false, default: 0 },
  imageUrl: { type: String, default: '' },
  businessName: { type: String, required: true },
  coordinates: { type: String, default: '' },
  info: { type: String, default: '' },
  POM: { type: Boolean, default: false },
  slug: { type: String, required: false },
  isPublished: { type: Boolean, default: false },
  bulkUploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'BulkUpload', default: null },
  enrichmentStatus: { // New field for AI workflow
    type: String,
    enum: ['pending', 'processing', 'completed'],
    default: 'pending',
  },
});

// Add an index on enrichmentStatus for faster querying
productSchema.index({ enrichmentStatus: 1 });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
export default Product;
