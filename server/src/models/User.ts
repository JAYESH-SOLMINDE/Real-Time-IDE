import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true },
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  avatar:   { type: String, default: '' },
  createdAt:{ type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);