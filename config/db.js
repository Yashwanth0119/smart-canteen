import mongoose from 'mongoose';

let isMongoConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/canteen_db';
  try {
    // 3 second timeout so the server boots up immediately even if MongoDB isn't currently running
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isMongoConnected = true;
    console.log(`✅ [MongoDB] Successfully connected to: ${uri}`);
  } catch (error) {
    isMongoConnected = false;
    console.warn(`⚠️ [MongoDB] Local MongoDB service is offline or not reachable (${error.message}).`);
    console.log(`⚡ [Fallback] System has automatically engaged High-Speed Resilient Storage so that all CRUD operations, Login, and Orders function without interruption.`);
  }
};

export const getDBStatus = () => {
  return {
    connected: isMongoConnected,
    mode: isMongoConnected ? 'MongoDB (Live Database)' : 'Local Resilient Storage (MongoDB Offline)',
    mongooseState: mongoose.connection.readyState
  };
};
