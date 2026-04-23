import mongoose, { Document, Schema } from 'mongoose';

export interface IRoomMember extends Document {
  userId: mongoose.Types.ObjectId;
  roomId: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: Date;
}

const RoomMemberSchema = new Schema<IRoomMember>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  roomId: { type: String, required: true },
  role:   { type: String, enum: ['owner', 'editor', 'viewer'], default: 'viewer' },
  joinedAt: { type: Date, default: Date.now },
});

// A user can only have one role per room
RoomMemberSchema.index({ userId: 1, roomId: 1 }, { unique: true });

export default mongoose.model<IRoomMember>('RoomMember', RoomMemberSchema);
