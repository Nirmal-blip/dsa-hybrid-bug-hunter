import mongoose from "mongoose";

const dualAuditSchema = new mongoose.Schema(
  {
    primaryConfidence: { type: Number, default: 0 },
    verifierConfidence: { type: Number, default: 0 },
    confidenceDiff: { type: Number, default: 0 },
    verifierNotes: { type: String, default: "" },
  },
  { _id: false }
);

const reviewTicketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    problemTitle: { type: String, required: true },
    code: { type: String, default: "" },
    suggestedCode: { type: String, default: "" },
    evaluatorNotes: { type: String, default: "" },
    reviewedBy: { type: String, default: "" },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    dualAudit: { type: dualAuditSchema, default: () => ({}) },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.ReviewTicket ||
  mongoose.model("ReviewTicket", reviewTicketSchema);