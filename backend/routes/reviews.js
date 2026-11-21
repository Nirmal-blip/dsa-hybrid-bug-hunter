import { Router } from "express";
import Groq from "groq-sdk";
import ReviewTicket from "../models/ReviewTicket.js";

const router = Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/reviews/polish-suggestion
router.post("/polish-suggestion", async (req, res) => {
  try {
    const {
      rawNotes,
      problemTitle = "",
      code = "",
      suggestedCode = "",
      decision = "",
    } = req.body || {};

    if (!rawNotes || !rawNotes.trim()) {
      return res.status(400).json({ error: "rawNotes is required" });
    }

    const prompt = `
You are a senior C++ and DSA mentor polishing a human evaluator's rough feedback for a student.
Preserve the evaluator's exact technical judgment and decision (${decision || "REVIEW"}) without inventing new bugs or changing algorithmic meaning.
Keep it crisp, constructive, and easy to act on:
- **Core Takeaway:** What went wrong or needs attention
- **How to Fix / Improve:** Clear, practical steps
- **Quick Tip:** Short C++ / DSA tip if applicable

Problem: ${problemTitle}
Evaluator Raw Note: ${rawNotes.trim()}
${suggestedCode ? `Suggested Patch:\n${suggestedCode}` : ""}
${code ? `Student Code:\n${code}` : ""}
`.trim();

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Polish technical code-review feedback clearly and concisely while strictly preserving factual and algorithmic meaning.",
        },
        { role: "user", content: prompt },
      ],
    });

    const polishedNotes =
      completion.choices?.[0]?.message?.content?.trim() || rawNotes.trim();

    return res.json({ polishedNotes });
  } catch (err) {
    console.error("POST /api/reviews/polish-suggestion error:", err);
    return res
      .status(500)
      .json({ error: "Failed to polish suggestion with LLM" });
  }
});

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

    const updated = await ReviewTicket.findOneAndUpdate(
      { ticketId },
      {
        $set: {
          status: decision,
          evaluatorNotes: typeof evaluatorNotes === "string" ? evaluatorNotes : "",
          suggestedCode: typeof suggestedCode === "string" ? suggestedCode : "",
          reviewedBy: reviewedBy || "Senior C++ Evaluator",
          resolvedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Review ticket not found" });
    }

    return res.json(updated);
  } catch (err) {
    console.error("POST /api/reviews/:ticketId/resolve error:", err);
    return res.status(500).json({ error: "Failed to resolve review ticket" });
  }
});

export default router;