import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import { hashPassword } from "./routes/auth.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/logicguard";

const MAIN_ADMIN_NAME = process.env.MAIN_ADMIN_NAME || "Main Admin";
const MAIN_ADMIN_EMAIL = (
  process.env.MAIN_ADMIN_EMAIL || "mainadmin@logicguard.dev"
)
  .trim()
  .toLowerCase();
const MAIN_ADMIN_PASSWORD = process.env.MAIN_ADMIN_PASSWORD || "MainAdmin@1234";

async function createSingleMainAdmin() {
  try {
    await mongoose.connect(MONGO_URI);

    // Ensure only a single main_admin exists
    await User.deleteMany({
      role: "main_admin",
      email: { $ne: MAIN_ADMIN_EMAIL },
    });

    const mainAdmin = await User.findOneAndUpdate(
      { email: MAIN_ADMIN_EMAIL },
      {
        $set: {
          name: MAIN_ADMIN_NAME,
          email: MAIN_ADMIN_EMAIL,
          passwordHash: hashPassword(MAIN_ADMIN_PASSWORD),
          role: "main_admin",
        },
      },
      { upsert: true, new: true }
    );

    console.log("Single Main Admin created/updated:");
    console.log({
      id: mainAdmin._id.toString(),
      name: mainAdmin.name,
      email: mainAdmin.email,
      role: mainAdmin.role,
    });
  } catch (err) {
    console.error("Error creating Main Admin:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createSingleMainAdmin();