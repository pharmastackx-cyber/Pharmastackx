import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBulkUpload extends Document {
  csvName: string;
  itemCount: number;
  uploadedAt: Date;
  businessName: string;
}

const bulkUploadSchema: Schema<IBulkUpload> = new mongoose.Schema({
  csvName: { type: String, required: true },
  itemCount: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
  businessName: { type: String, required: true, index: true },
});

const BulkUpload: Model<IBulkUpload> = mongoose.models.BulkUpload || mongoose.model<IBulkUpload>('BulkUpload', bulkUploadSchema);
export default BulkUpload;
