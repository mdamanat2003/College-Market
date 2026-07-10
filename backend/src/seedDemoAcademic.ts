import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db";
import User from "./models/User";
import Academic from "./models/Academic";

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    
    // Find or create admin or seller to upload
    let uploader = await User.findOne({ role: "admin" });
    if (!uploader) {
      uploader = await User.findOne({});
    }
    if (!uploader) {
      console.error("❌ No user found to set as uploadedBy.");
      return;
    }

    // Add demo academic files
    await Academic.deleteMany({ 
      branch: "EE", 
      semester: "8th Sem",
      title: { $in: ["EE 8th Sem - PSOC PyQ 2024", "EE 8th Sem - Electrical Drives PyQ 2023"] } 
    });

    const doc1 = await Academic.create({
      title: "EE 8th Sem - PSOC PyQ 2024",
      description: "Previous Year Question Paper for Power System Operation & Control (PSOC) - 2024 Exam.",
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      fileType: "pdf",
      branch: "EE",
      semester: "8th Sem",
      subject: "Power System Operation & Control",
      uploadedBy: uploader._id,
    });

    const doc2 = await Academic.create({
      title: "EE 8th Sem - Electrical Drives PyQ 2023",
      description: "Previous Year Question Paper for Electrical Drives - 2023 Exam.",
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      fileType: "pdf",
      branch: "EE",
      semester: "8th Sem",
      subject: "Electrical Drives",
      uploadedBy: uploader._id,
    });

    console.log("✅ Demo Academic materials (PyQs) seeded successfully for EE Sem 8:");
    console.log("1.", doc1.title);
    console.log("2.", doc2.title);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

run();
