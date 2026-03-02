"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || '';
        if (!mongoURI) {
            logger_1.default.warn('No MONGODB_URI found, skipping DB connection');
            return;
        }
        await mongoose_1.default.connect(mongoURI);
        logger_1.default.info('✅ MongoDB connected successfully');
    }
    catch (error) {
        logger_1.default.error(`❌ MongoDB connection failed: ${error}`);
    }
};
exports.default = connectDB;
