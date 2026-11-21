import express from "express";
import crypto from "crypto";
import User from "../models/User.js";

const router = express.Router();
const AUTH_SECRET =
  process.env.AUTH_SECRET || "logicguard-dev-secret-change-in-prod";

export function hashPassword(
  password,
  salt = crypto.randomBytes(16).toString("hex")
) {
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password, stored) {
  const [salt, key] = (stored || "").split(":");
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  const keyBuf = Buffer.from(key, "hex");
  const derivedBuf = Buffer.from(derived, "hex");
  if (keyBuf.length !== derivedBuf.length) return false;
  return crypto.timingSafeEqual(keyBuf, derivedBuf);
}

export function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken(token) {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(body)
    .digest("base64url");
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)))
    return null;
  return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
}

export async function attachUser(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : "";
    const decoded = verifyToken(token);
    if (decoded?.userId) {
      const user = await User.findById(decoded.userId).select("-passwordHash");
      if (user) req.user = user;
    }
  } catch {
    // Continue unauthenticated
  }
  next();
}

export async function requireAdmin(req, res, next) {
  await attachUser(req, res, async () => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (req.user.role !== "admin" && req.user.role !== "main_admin") {
      return res.status(403).json({ error: "Admin privileges required." });
    }
    return next();
  });
}

export async function requireMainAdmin(req, res, next) {
  await attachUser(req, res, async () => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (req.user.role !== "main_admin") {
      return res.status(403).json({ error: "Main Admin privileges required." });
    }
    return next();
  });
}

// POST /api/auth/register — Student registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, rollNo = "" } = req.body || {};
    if (!name?.trim() || !email?.trim() || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash: hashPassword(password),
      role: "student",
      rollNo: String(rollNo || "").trim(),
      lastLoginAt: new Date(),
    });

    const token = signToken({ userId: user._id.toString(), role: user.role });

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNo: user.rollNo,
        solvedProblems: user.solvedProblems,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Registration failed." });
  }
});

// POST /api/auth/login — Student, Evaluator, Admin, or Main Admin login
router.post("/login", async (req, res) => {
  try {
    const { email, password, role = "student" } = req.body || {};
    if (!email?.trim() || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (role === "evaluator" && user.role !== "evaluator") {
      return res
        .status(403)
        .json({ error: "This account does not have evaluator privileges." });
    }

    if (
      role === "admin" &&
      user.role !== "admin" &&
      user.role !== "main_admin"
    ) {
      return res
        .status(403)
        .json({ error: "This account does not have admin privileges." });
    }

    if (role === "main_admin" && user.role !== "main_admin") {
      return res
        .status(403)
        .json({ error: "This account does not have Main Admin privileges." });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken({ userId: user._id.toString(), role: user.role });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNo: user.rollNo,
        solvedProblems: user.solvedProblems,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Login failed." });
  }
});

// GET /api/auth/me
router.get("/me", attachUser, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      rollNo: req.user.rollNo,
      solvedProblems: req.user.solvedProblems,
      lastLoginAt: req.user.lastLoginAt,
    },
  });
});

// POST /api/auth/progress/solve
router.post("/progress/solve", attachUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { problemId } = req.body || {};
    if (!problemId) {
      return res.status(400).json({ error: "problemId is required." });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { solvedProblems: String(problemId) } },
      { new: true }
    ).select("-passwordHash");

    return res.json({ solvedProblems: updated.solvedProblems });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to update progress." });
  }
});

export default router;