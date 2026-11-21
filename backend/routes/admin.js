import express from "express";
import User from "../models/User.js";
import { requireAdmin, hashPassword } from "./auth.js";

const router = express.Router();

// GET /api/admin/overview — Fetch all students, evaluators, and summary counts
router.get("/overview", requireAdmin, async (_req, res) => {
  try {
    const users = await User.find({})
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();

    const students = users.filter((u) => u.role === "student");
    const evaluators = users.filter((u) => u.role === "evaluator");

    const totalSolvedSubmissions = students.reduce(
      (sum, s) =>
        sum + (Array.isArray(s.solvedProblems) ? s.solvedProblems.length : 0),
      0
    );

    return res.json({
      stats: {
        totalUsers: users.length,
        studentsCount: students.length,
        evaluatorsCount: evaluators.length,
        totalSolvedSubmissions,
      },
      students,
      evaluators,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to load admin overview." });
  }
});

// POST /api/admin/evaluators — Create a new evaluator account
router.post("/evaluators", requireAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name?.trim() || !email?.trim() || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required." });
    }

    if (String(password).length < 4) {
      return res
        .status(400)
        .json({ error: "Password must be at least 4 characters." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    }

    const created = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash: hashPassword(password),
      role: "evaluator",
    });

    return res.status(201).json({
      evaluator: {
        _id: created._id,
        name: created.name,
        email: created.email,
        role: created.role,
        createdAt: created.createdAt,
        lastLoginAt: created.lastLoginAt,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to create evaluator." });
  }
});

export default router;