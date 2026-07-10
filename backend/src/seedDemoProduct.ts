import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db";
import User from "./models/User";
import Product from "./models/Product";

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    
    // Find or create testseller
    let seller = await User.findOne({ email: "testseller@ooplabdh.com" });
    if (!seller) {
      seller = await User.create({
        name: "Test Seller",
        email: "testseller@ooplabdh.com",
        username: "testseller",
        password: "password123",
        phone: "9999990001",
        college: "Demo College",
        role: "student",
      });
    }

    // Add a demo product
    await Product.deleteMany({ title: "Demo iPhone 15 Pro" });
    const product = await Product.create({
      seller: seller._id,
      title: "Demo iPhone 15 Pro",
      description: "Excellent condition, with bill and box, 128GB variant. Dual Sim.",
      price: 75000,
      marketPrice: 120000,
      category: "Electronics",
      condition: "Like New",
      status: "Available",
      college: "Demo College",
      images: ["https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=1000&auto=format&fit=crop"],
    });

    console.log("✅ Demo product seeded successfully:", product.title);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

run();
