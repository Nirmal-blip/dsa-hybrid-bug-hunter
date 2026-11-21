import express from "express";
import { analyzeCpp } from "../analyze.js";
import { History, ReviewTicket } from "../models.js";
import { attachUser } from "./auth.js";

const router = express.Router();

const resolveUserId = (req) => {
  const candidate =
    req.user?._id?.toString() ||
    req.user?.id?.toString() ||
    req.body?.userId ||
    req.query?.userId ||
    req.headers["x-user-id"] ||
    "";
  const cleaned = String(candidate).trim();
  return cleaned && cleaned !== "undefined" && cleaned !== "null" ? cleaned : "anonymous";
};

router.post("/analyze", attachUser, async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const mode = req.body?.mode || "submit";
    const includeAiVerification =
      typeof req.body?.includeAiVerification === "boolean"
        ? req.body.includeAiVerification
        : mode !== "run";
    const saveHistory =
      typeof req.body?.saveHistory === "boolean"
        ? req.body.saveHistory
        : mode === "submit";

    const result = await analyzeCpp({
      ...req.body,
      mode,
      includeAiVerification,
    });

    const responsePayload = {
      ...result,
      mode,
      userId,
      ...(includeAiVerification
        ? {}
        : { bugs: [], dualAudit: null, reviewTicketId: null }),
    };

    const confirmed =
      responsePayload?.bugs?.filter((b) => b.status === "CONFIRMED").length || 0;
    const needsHuman = Boolean(responsePayload?.dualAudit?.needsHumanReview);
    const solved = Boolean(
      saveHistory &&
        responsePayload?.compiled &&
        responsePayload?.allUserTestsPassed &&
        confirmed === 0 &&
        !needsHuman
    );

    if (saveHistory) {
      const saved = await History.create({
        userId,
        problemId: req.body.problemId || "custom",
        problem: req.body.problem || "",
        code: req.body.code,
        testCases: req.body.testCases || [],
        solved,
        report: responsePayload,
      });

      return res.json({
        ...responsePayload,
        historyId: saved._id,
        solved,
      });
    }

    return res.json({ ...responsePayload, solved: false });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.get("/history", attachUser, async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const filter = {};
    if (userId && userId !== "anonymous") {
      filter.userId = userId;
    }
    if (req.query.problemId) {
      filter.problemId = String(req.query.problemId);
    }

    const items = await History.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/reviews", async (_req, res) => {
  try {
    const tickets = await ReviewTicket.find().sort({ createdAt: -1 }).lean();
    return res.json(tickets);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/reviews/:ticketId", async (req, res) => {
  try {
    const ticket = await ReviewTicket.findOne({ ticketId: req.params.ticketId }).lean();
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    return res.json(ticket);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;