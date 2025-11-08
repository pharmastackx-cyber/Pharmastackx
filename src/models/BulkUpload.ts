import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBulkUpload extends Document {
  csvName: string;
  uploadedAt: Date;
}

const bulkUploadSchema: Schema<IBulkUpload> = new mongoose.Schema({
  csvName: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const BulkUpload: Model<IBulkUpload> = mongoose.models.BulkUpload || mongoose.model<IBulkUpload>('BulkUpload', bulkUploadSchema);
export default BulkUpload;
