import mongoose, { Document, Schema } from 'mongoose';

export interface IFile extends Document {
  name: string;
  path: string;
  content: string;
  roomId: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IFile>({
  name:    { type: String, required: true },
  path:    { type: String, required: true },
  content: { type: String, default: '' },
  roomId:  { type: String, required: true },
  ownerId: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<IFile>('File', FileSchema);