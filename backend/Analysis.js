import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    problem: { type: String, required: true },
    code: { type: String, required: true },
    testCases: [{ input: String, expectedOutput: String }],
    report: { type: Object, required: true }, // compiled, staticWarnings, bugs, testResults
  },
  { timestamps: true }
);

export default mongoose.model("Analysis", analysisSchema);