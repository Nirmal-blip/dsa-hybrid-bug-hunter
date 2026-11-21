// backend/routes/mainAdmin.js
import express from "express";
import User from "../models/User.js";
import { requireMainAdmin, hashPassword } from "./auth.js";

const router = express.Router();

// GET /api/main-admin/overview
router.get("/overview", requireMainAdmin, async (_req, res) => {
  try {
    const users = await User.find({})
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();

    const admins = users.filter((u) => u.role === "admin");
    const evaluators = users.filter((u) => u.role === "evaluator");
    const students = users.filter((u) => u.role === "student");

    return res.json({
      stats: {
        adminsCount: admins.length,
        evaluatorsCount: evaluators.length,
        studentsCount: students.length,
      },
      admins,
      evaluators,
      students,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to load Main Admin overview." });
  }
});

// POST /api/main-admin/admins — Create a new Admin account
router.post("/admins", requireMainAdmin, async (req, res) => {
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
      role: "admin",
    });

    return res.status(201).json({
      admin: {
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
      .json({ error: err.message || "Failed to create admin." });
  }
});

// DELETE /api/main-admin/admins/:id — Remove an Admin account
router.delete("/admins/:id", requireMainAdmin, async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target || target.role !== "admin") {
      return res.status(404).json({ error: "Admin account not found." });
    }
    await User.findByIdAndDelete(req.params.id);
    return res.json({ deletedId: req.params.id });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to remove admin." });
  }
});

export default router;