import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http"; 
import path from "path";
import { Server } from "socket.io"; 

import offerRoutes from "./routes/offerRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import chatRoutes from "./routes/chatRoutes"; 
import { errorHandler } from "./middleware/errorHandler";
import { setupSocket } from "./socket"; 
import orderRoutes from "./routes/orderRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import requestRoutes from "./routes/requestRoutes";
import { seedAdmin } from "./utils/seedAdmin"; // ✅ Imported properly
import { seedTransactions } from "./utils/seedTransactions";
import adminRoutes from "./routes/adminRoutes";
import fs from 'fs';

dotenv.config();

// ... (apke baki imports)

const startServer = async () => {
  try {
    await connectDB();
    await seedAdmin();
    await seedTransactions();

    const app = express();
    
    // 1. Middleware order sahi rakhein: pehle CORS aur JSON, phir Routes
    app.use(cors());
    app.use(express.json());

    const httpServer = http.createServer(app);
    
    const io = new Server(httpServer, {
      cors: { origin: "*", methods: ["GET", "POST"] }
    });

    // Ensure uploads directory exists and serve it statically
    const uploadsDir = path.resolve(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    app.use('/uploads', express.static(uploadsDir));

    // 2. Socket.io ko globally share karein
    app.set('io', io); 
    setupSocket(io);

    io.on('connection', (socket) => {
      console.log('🔌 Socket connected:', socket.id);
    });

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/products", productRoutes);
    app.use("/api/chat", chatRoutes);
    app.use("/api/offers", offerRoutes); 
    app.use("/api/orders", orderRoutes);
    app.use("/api/reviews", reviewRoutes);
    app.use("/api/requests", requestRoutes);
    app.use("/api/notifications", notificationRoutes);
    app.use("/api/admin", adminRoutes);

    // Serve frontend static files in production
    const frontendDist = path.join(__dirname, "../../frontend/dist");
    app.use(express.static(frontendDist));
    app.get("/{*path}", (_, res) => {
      res.sendFile(path.join(frontendDist, "index.html"));
    });
    
    app.use(errorHandler);

    const PORT = process.env.PORT || 3001;
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("🔥 Server Startup Failed", error);
    process.exit(1);
  }
};

startServer();