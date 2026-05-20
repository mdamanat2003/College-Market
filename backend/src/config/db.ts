import mongoose from "mongoose";
import process from "process";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB Connection Error:');
    console.error(error);

    const uri = process.env.MONGODB_URI ?? '';
    if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
      console.error('Local MongoDB is not reachable. Start the MongoDB service or update MONGODB_URI to a live database URL.');
      console.error('Windows hint: open PowerShell as Administrator and run: Start-Service MongoDB');
    }

    process.exit(1);
  }
};

export default connectDB;