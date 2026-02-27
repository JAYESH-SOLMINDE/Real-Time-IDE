import mongoose from 'mongoose';
import logger from '../utils/logger';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || '';
    if (!mongoURI) {
      logger.warn('No MONGODB_URI found, skipping DB connection');
      return;
    }
    await mongoose.connect(mongoURI);
    logger.info('✅ MongoDB connected successfully');
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error}`);
  }
};

export default connectDB;