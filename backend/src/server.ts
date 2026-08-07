import dotenv from "dotenv";
dotenv.config();

import dns from "dns";
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

import express from "express";
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
import academicRoutes from "./routes/academicRoutes";
import lostFoundRoutes from "./routes/lostFoundRoutes";
import eventRoutes from "./routes/eventRoutes";
import communityRoutes from "./routes/communityRoutes";
import fs from "fs";
import { rateLimit } from "express-rate-limit";

// Rate Limiting Definitions
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per 15 minutes for auth (Login/Register)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login/register attempts, please try again after 15 minutes",
  },
});

// ... (apke baki imports)

const startServer = async () => {
  try {
    await connectDB();
    await seedAdmin();
    await seedTransactions();

    const app = express();

    // 1. Middleware order sahi rakhein: pehle CORS aur JSON, phir Routes
    app.set("trust proxy", 1);

    // Robust CORS configuration
    app.use(cors({
      origin: true, // Reflects the request origin
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const httpServer = http.createServer(app);

    const io = new Server(httpServer, {
      cors: { origin: "*", methods: ["GET", "POST"] },
    });

    // Ensure uploads directory exists and serve it statically
    const uploadsDir = path.resolve(__dirname, "..", "uploads");
    const academicUploadsDir = path.join(uploadsDir, "academic");
    const lostFoundUploadsDir = path.join(uploadsDir, "lost-found");
    const communityUploadsDir = path.join(uploadsDir, "community");

    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    if (!fs.existsSync(academicUploadsDir)) fs.mkdirSync(academicUploadsDir, { recursive: true });
    if (!fs.existsSync(lostFoundUploadsDir)) fs.mkdirSync(lostFoundUploadsDir, { recursive: true });
    if (!fs.existsSync(communityUploadsDir)) fs.mkdirSync(communityUploadsDir, { recursive: true });

    // Serve APK file with correct headers to prevent parsing error on Android devices
    const handleApkDownload = (req: express.Request, res: express.Response) => {
      const apkPath = path.join(uploadsDir, "app-release.apk");
      const externalApkUrl = process.env.APK_DOWNLOAD_URL?.trim();

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Expose-Headers", "Content-Disposition, Content-Length");

      if (fs.existsSync(apkPath)) {
        try {
          const stat = fs.statSync(apkPath);
          res.setHeader("Content-Type", "application/vnd.android.package-archive");
          res.setHeader("Content-Disposition", 'attachment; filename="app-release.apk"');
          res.setHeader("Content-Length", stat.size.toString());
          res.setHeader("Cache-Control", "public, max-age=3600");

          if (req.method === "HEAD") {
            return res.status(200).end();
          }

          return res.sendFile(apkPath, (err) => {
            if (err && !res.headersSent) {
              console.error("Error during APK download:", err);
              res.status(500).json({ success: false, message: "Error downloading APK file" });
            }
          });
        } catch (statErr) {
          console.error("Error statting APK file:", statErr);
          if (externalApkUrl) {
            return res.redirect(302, externalApkUrl);
          }
          return res.status(500).json({ success: false, message: "Failed to access APK file" });
        }
      } else if (externalApkUrl) {
        return res.redirect(302, externalApkUrl);
      } else {
        return res.status(404).json({
          success: false,
          message: "APK file not found on server. Please ensure app-release.apk exists in uploads directory or set APK_DOWNLOAD_URL in environment.",
        });
      }
    };

    app.get("/uploads/app-release.apk", handleApkDownload);
    app.head("/uploads/app-release.apk", handleApkDownload);
    app.get("/download-apk", handleApkDownload);
    app.get("/download/app", handleApkDownload);


    app.use("/uploads", express.static(uploadsDir));

    // 2. Socket.io ko globally share karein
    app.set("io", io);
    setupSocket(io);

    io.on("connection", (socket) => {
      console.log("🔌 Socket connected:", socket.id);
    });

    // Routes
    app.use("/api/auth", authLimiter, authRoutes);
    app.use("/api/products", apiLimiter, productRoutes);
    app.use("/api/chat", apiLimiter, chatRoutes);
    app.use("/api/offers", apiLimiter, offerRoutes);
    app.use("/api/orders", apiLimiter, orderRoutes);
    app.use("/api/reviews", apiLimiter, reviewRoutes);
    app.use("/api/requests", apiLimiter, requestRoutes);
    app.use("/api/notifications", apiLimiter, notificationRoutes);
    app.use("/api/admin", apiLimiter, adminRoutes);
    app.use("/api/academic", apiLimiter, academicRoutes);
    app.use("/api/lost-found", apiLimiter, lostFoundRoutes);
    app.use("/api/events", apiLimiter, eventRoutes);
    app.use("/api/community", apiLimiter, communityRoutes);

    // Serve frontend static files in production
    // const frontendDist = path.join(__dirname, "../../frontend/dist");
    // app.use(express.static(frontendDist));
    // app.get("/{*path}", (_, res) => {
    //   res.sendFile(path.join(frontendDist, "index.html"));
    // });
    app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "College Market API Running",
      });
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
