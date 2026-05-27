import mongoose from "mongoose";
import dotenv from "dotenv";
import process from "process";
import path from "path";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });

const connectDB = async () => {
  const localUri = "mongodb://127.0.0.1:27017/campuscart";

  try {
    const uri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      localUri;

    if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
      console.warn(
        "MONGODB_URI/MONGO_URI not found. Falling back to local MongoDB: mongodb://127.0.0.1:27017/campuscart"
      );
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB Connection Error:');
    console.error(error);

    const uri = process.env.MONGODB_URI ?? process.env.MONGO_URI ?? "";

    const errAny: any = error;
    const isAuthError = Boolean(
      errAny?.code === 8000 ||
      (errAny?.errorResponse?.errmsg && /auth|authentication failed|bad auth/i.test(String(errAny.errorResponse.errmsg))) ||
      /authentication failed|bad auth/i.test(String(errAny?.message || errAny))
    );

    if (isAuthError && !uri.includes('127.0.0.1') && !uri.includes('localhost')) {
      console.warn('Authentication to configured MongoDB failed. Falling back to local MongoDB.');
      try {
        const localConn = await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB Connected (local fallback): ${localConn.connection.host}`);
        return;
      } catch (localError) {
        console.error("Local MongoDB fallback failed:");
        console.error(localError);
      }
    }

    if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
      console.error('Local MongoDB is not reachable. Start the MongoDB service or update MONGODB_URI to a live database URL.');
      console.error('Windows hint: open PowerShell as Administrator and run: Start-Service MongoDB');
    }

    process.exit(1);
  }
};

export default connectDB;