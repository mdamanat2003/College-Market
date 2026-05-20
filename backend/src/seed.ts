import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "./config/db";
import { seedAdmin } from "./utils/seedAdmin";

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    await seedAdmin();
  } catch (error) {
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

run();