import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  roomId: string;
  name: string;
  creatorId: mongoose.Types.ObjectId;
  files: string[];
  language: string;
  theme: string;
  createdAt: Date;
}

const RoomSchema = new Schema<IRoom>({
  roomId:      { type: String, required: true, unique: true },
  name:        { type: String, default: 'Untitled Room' },
  creatorId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  files:       [{ type: String }],
  language:    { type: String, default: 'javascript' },
  theme:       { type: String, default: 'vs-dark' },
  createdAt:   { type: Date, default: Date.now, expires: 86400 },
});

export default mongoose.model<IRoom>('Room', RoomSchema);