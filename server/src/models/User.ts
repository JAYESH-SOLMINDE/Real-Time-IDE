import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'host' | 'collaborator' | 'viewer';
  avatar?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role:     { type: String, enum: ['admin','host','collaborator','viewer'], default: 'collaborator' },
  avatar:   { type: String, default: '' },
  createdAt:{ type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);