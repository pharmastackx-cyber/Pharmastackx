import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProduct extends Document {
  itemName: string;
  activeIngredient: string;
  category: string;
  amount: number;
  imageUrl: string;
  businessName: string;
  coordinates: string;
  bulkUploadId?: mongoose.Types.ObjectId;
}

const productSchema: Schema<IProduct> = new mongoose.Schema({
  itemName: { type: String, required: true },
  activeIngredient: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  imageUrl: { type: String, default: '' },
  businessName: { type: String, required: true },
  coordinates: { type: String, default: '' },
  bulkUploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'BulkUpload', default: null },
});

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
export default Product;
