import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http"; // HTTP module import
import { Server } from "socket.io"; // Socket.IO import
import offerRoutes from "./routes/offerRoutes";
import notificationRoutes from "./routes/notificationRoutes";


import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import chatRoutes from "./routes/chatRoutes"; // Chat routes import
import { errorHandler } from "./middleware/errorHandler";
import { setupSocket } from "./socket"; // Socket logic import
import orderRoutes from "./routes/orderRoutes";

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();

    const app = express();
    
    // Express ko HTTP server me wrap karein
    const httpServer = http.createServer(app);
    
    // HTTP server par Socket.IO attach karein
    // 2. IO instance banne ke turant baad usko app me set karein
    const io = new Server(httpServer, {
      cors: {
        origin: "*", 
        methods: ["GET", "POST"]
      }
    });

    app.set('io', io); // <-- attach io instance to app

    // Setup Socket Logic (once)
    setupSocket(io);

    // Helpful debug log when a client connects
    io.on('connection', (socket) => {
      console.log('🔌 Socket connected:', socket.id);
    });

    app.use(cors());
    app.use(express.json());

    app.get("/", (_, res) => {
      res.send("Marketplace API is Running");
    });

    app.use("/api/auth", authRoutes);
    app.use("/api/products", productRoutes);
    app.use("/api/chat", chatRoutes);
    app.use("/api/offers", offerRoutes); // Chat API mount kari
    app.use("/api/orders", orderRoutes);
    app.use("/api/notifications", notificationRoutes);
    
    app.use(errorHandler);

    const PORT = process.env.PORT || 3001;
    
    // app.listen ki jagah httpServer.listen use karein
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("🔥 Server Startup Failed");
    console.error(error);
    process.exit(1);
  }
};

startServer();