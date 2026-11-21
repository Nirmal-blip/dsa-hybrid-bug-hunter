import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    userId: { type: String, default: "anonymous", index: true },
    problemId: { type: String, default: "custom" },
    problem: { type: String, required: true },
    code: { type: String, required: true },
    testCases: { type: Array, default: [] },
    solved: { type: Boolean, default: false },
    report: { type: Object, required: true },
  },
  { timestamps: true }
);

const reviewTicketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    problemId: { type: String, default: "custom" },
    problemTitle: { type: String, required: true },
    problem: { type: String, required: true },
    code: { type: String, required: true },
    staticWarnings: { type: String, default: "" },
    bugs: { type: Array, default: [] },
    testResults: { type: Array, default: [] },
    dualAudit: { type: Object, required: true },
    evaluatorNotes: { type: String, default: "" },
    suggestedCode: { type: String, default: "" },
    reviewedBy: { type: String, default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const History = mongoose.model("History", historySchema);
export const ReviewTicket = mongoose.model("ReviewTicket", reviewTicketSchema);