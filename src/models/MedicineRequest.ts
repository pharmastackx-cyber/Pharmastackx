
import mongoose, { Schema, Document, models } from 'mongoose';

export interface IMedicineRequest extends Document {
  rawMedicineName: string;
  userName: string;
  contact: string;
  notes?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'archived';
  
  // AI-Enriched Fields
  aiStandardizedName?: string;
  aiSuggestedIngredients?: string[];
  aiRequestCategory?: 'specific_product' | 'symptom_based' | 'general_inquiry' | 'unknown';
  aiUrgency?: 'low' | 'medium' | 'high';
  aiSuggestedAlternatives?: string[]; // e.g., in-stock items
  createdAt: Date;
}

const MedicineRequestSchema: Schema = new Schema({
  rawMedicineName: { type: String, required: true },
  userName: { type: String, required: true },
  contact: { type: String, required: true },
  notes: { type: String },
  status: { type: String, default: 'pending', enum: ['pending', 'reviewed', 'resolved', 'archived'] },
  
  // AI-Enriched Fields
  aiStandardizedName: { type: String },
  aiSuggestedIngredients: [{ type: String }],
  aiRequestCategory: { type: String, enum: ['specific_product', 'symptom_based', 'general_inquiry', 'unknown'] },
  aiUrgency: { type: String, enum: ['low', 'medium', 'high'] },
  aiSuggestedAlternatives: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export default models.MedicineRequest || mongoose.model<IMedicineRequest>('MedicineRequest', MedicineRequestSchema);
