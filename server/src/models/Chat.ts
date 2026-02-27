import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  roomId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
}

const ChatSchema = new Schema<IChat>({
  roomId:     { type: String, required: true },
  senderId:   { type: String, required: true },
  senderName: { type: String, required: true },
  message:    { type: String, required: true },
  timestamp:  { type: Date, default: Date.now },
});

export default mongoose.model<IChat>('Chat', ChatSchema);