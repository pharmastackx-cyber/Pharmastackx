import mongoose, { Document, Schema, models } from 'mongoose';

export interface IPost extends Document {
  title: string;
  content: string;
  category: string;
  slug: string;
  imageUrl?: string;
  author: {
    name: string;
    id: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>({
  title: {
    type: String,
    required: [true, 'Post title is required.'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Post content is required.'],
  },
  category: {
    type: String,
    required: [true, 'Post category is required.'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  author: {
    name: { type: String, required: true },
    id: { type: String, required: true },
  },
}, { timestamps: true });

// Check if the model already exists before defining it
const Post = models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
