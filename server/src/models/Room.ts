import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  roomId: string;
  creatorId: string;
  files: string[];
  collaborators: { userId: string; username: string; role: string }[];
  language: string;
  theme: string;
  createdAt: Date;
}

const RoomSchema = new Schema<IRoom>({
  roomId:      { type: String, required: true, unique: true },
  creatorId:   { type: String, required: true },
  files:       [{ type: String }],
  collaborators: [{
    userId:   String,
    username: String,
    role:     { type: String, default: 'collaborator' },
  }],
  language:    { type: String, default: 'javascript' },
  theme:       { type: String, default: 'vs-dark' },
  createdAt:   { type: Date, default: Date.now, expires: 86400 },
});

export default mongoose.model<IRoom>('Room', RoomSchema);