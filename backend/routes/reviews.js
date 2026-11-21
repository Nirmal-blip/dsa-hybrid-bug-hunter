import { Router } from "express";
import ReviewTicket from "../models/ReviewTicket.js";

const router = Router();

// GET /api/reviews
router.get("/", async (_req, res) => {
  try {
    const tickets = await ReviewTicket.find().sort({ createdAt: -1 }).lean();
    return res.json(tickets);
  } catch (err) {
    console.error("GET /api/reviews error:", err);
    return res.status(500).json({ error: "Failed to load review queue" });
  }
});

// POST /api/reviews/:ticketId/resolve
router.post("/:ticketId/resolve", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { decision, evaluatorNotes, suggestedCode, reviewedBy } = req.body || {};

    if (!["ACCEPTED", "REJECTED"].includes(decision)) {
      return res.status(400).json({ error: "Invalid decision" });
    }

    const existing = await ReviewTicket.findOne({ ticketId });
    if (!existing) {
      return res.status(404).json({ error: "Review ticket not found" });
    }

    existing.status = decision;
    existing.evaluatorNotes =
      typeof evaluatorNotes === "string" ? evaluatorNotes : existing.evaluatorNotes;
    if (typeof suggestedCode === "string" && suggestedCode.trim() !== "") {
      existing.suggestedCode = suggestedCode;
    }
    existing.reviewedBy = reviewedBy || "Senior C++ Evaluator";
    existing.resolvedAt = new Date();

    await existing.save();
    return res.json(existing);
  } catch (err) {
    console.error("POST /api/reviews/:ticketId/resolve error:", err);
    return res.status(500).json({ error: "Failed to resolve review ticket" });
  }
});

export default router;