import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes, { hashPassword } from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import mainAdminRoutes from "./routes/mainAdmin.js";
import User from "./models/User.js";
import analyzeRoutes from "./routes/analyze.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/logicguard";

app.use(
  cors({
    origin: (_origin, callback) => callback(null, true),
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, dbConnected: mongoose.connection.readyState === 1 });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/main-admin", mainAdminRoutes);
app.use("/api", analyzeRoutes);

async function ensureSingleMainAdmin() {
  const email = (process.env.MAIN_ADMIN_EMAIL || "mainadmin@logicguard.dev")
    .trim()
    .toLowerCase();
  const password = process.env.MAIN_ADMIN_PASSWORD || "MainAdmin@1234";

  // Guarantee only one main_admin exists
  const existingMain = await User.findOne({ role: "main_admin" });
  if (!existingMain) {
    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name: process.env.MAIN_ADMIN_NAME || "Main Admin",
          email,
          passwordHash: hashPassword(password),
          role: "main_admin",
        },
      },
      { upsert: true, new: true }
    );
    console.log(`Main Admin ready: ${email}`);
  }
}

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    await ensureSingleMainAdmin();
    app.listen(PORT, () => {
      console.log(`LogicGuard backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();