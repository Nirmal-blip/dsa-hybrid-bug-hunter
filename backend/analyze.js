import "dotenv/config";
import { execFile } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { promisify } from "util";
import Groq from "groq-sdk";
import { ReviewTicket } from "./models.js";

const execAsync = promisify(execFile);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const CONFIDENCE_GAP_THRESHOLD = 2;

async function runCmd(cmd, args, options = {}) {
  try {
    const { stdout, stderr } = await execAsync(cmd, args, { timeout: 4000, ...options });
    return { ok: true, stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (err) {
    return {
      ok: false,
      stdout: (err.stdout || "").trim(),
      stderr: (err.stderr || err.message).trim(),
      timedOut: err.killed || err.code === "ETIMEDOUT",
    };
  }
}

const STD_HEADERS = `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>
#include <unordered_set>
#include <map>
#include <set>
#include <stack>
#include <queue>
#include <numeric>
#include <climits>
#include <cmath>
#include <iomanip>
using namespace std;

`;

export async function analyzeCpp({
  code,
  problem,
  problemId = "custom",
  problemTitle = "C++ Problem",
  testCases = [],
  driverCode = "",
}) {
  if (!code || !code.trim()) {
    throw new Error("C++ source code is required.");
  }

  const hasMain = /\bint\s+main\s*\(/.test(code);
  const fullSourceCode =
    !hasMain && driverCode
      ? `${STD_HEADERS}#line 1 "solution.cpp"\n${code}\n\n${driverCode}`
      : code;

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "cpp-dbg-"));
  const srcPath = path.join(tmpDir, "main.cpp");
  const binPath = path.join(tmpDir, process.platform === "win32" ? "main.exe" : "main");

  try {
    await fs.writeFile(srcPath, fullSourceCode);

    // 1. Static Analysis via g++ warning flags
    const staticRes = await runCmd("g++", [
      "-std=c++20",
      "-Wall",
      "-Wextra",
      "-Wshadow",
      "-fsyntax-only",
      srcPath,
    ]);
    const staticWarnings = staticRes.stderr;

    // 2A. Model A: Primary Groq AI Reasoning + Multiple Hidden Edge Cases
    let bugs = [];
    let generatedEdgeCases = [];
    try {
      const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        temperature: 0.1,
        max_tokens: 4096,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a C++ competitive programming judge and logical error detector. Analyze userCode against the problem statement, driverCode, and compiler warnings.
Respond ONLY with a valid JSON object matching this exact schema:
{
  "edgeCases": [
    {
      "label": "Corner Case Name",
      "input": "Exact stdin matching driverCode",
      "expectedOutput": "Exact expected stdout"
    }
  ],
  "bugs": [
    {
      "id": "bug-1",
      "title": "Short bug title",
      "category": "boundary",
      "startLine": 1,
      "endLine": 1,
      "explanation": "Why the logical bug occurs",
      "suggestedFix": "Complete corrected userCode only",
      "counterexampleInput": "Minimal stdin input that breaks userCode",
      "expectedOutput": "Exact expected stdout"
    }
  ]
}
Rules:
- ALWAYS generate 3 diverse "edgeCases" formatted strictly according to driverCode's cin parsing.
- Allowed bug categories: "boundary", "overflow", "algorithm", "recursion", "state", "io".
- If userCode has no logical bugs, return "bugs": [] while still returning 3 "edgeCases".`,
          },
          {
            role: "user",
            content: JSON.stringify({
              problem,
              userCode: code,
              driverCode,
              testCases,
              staticWarnings,
            }),
          },
        ],
      });

      const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
      bugs = Array.isArray(parsed.bugs) ? parsed.bugs : [];
      generatedEdgeCases = Array.isArray(parsed.edgeCases) ? parsed.edgeCases : [];
    } catch (aiErr) {
      console.error("Model A fallback triggered:", aiErr.message);
      bugs = [];
      generatedEdgeCases = [];
    }

    // 2B. Model B: Independent Second LLM Judge
    let audit = {
      primaryConfidence: 90,
      verifierConfidence: 90,
      verifierNotes: "Independent audit completed.",
    };
    try {
      const auditCompletion = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        temperature: 0.1,
        max_tokens: 1024,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are an independent second-opinion C++ code auditor. Review userCode, the problem statement, and Primary AI's bug report.
Respond ONLY with a valid JSON object matching this exact structure:
{
  "primaryConfidence": 95,
  "verifierConfidence": 90,
  "verifierNotes": "Concise 1-2 sentence audit summary"
}`,
          },
          {
            role: "user",
            content: JSON.stringify({ problem, userCode: code, primaryBugs: bugs }),
          },
        ],
      });

      const parsedAudit = JSON.parse(auditCompletion.choices[0]?.message?.content || "{}");
      audit = {
        primaryConfidence: Number(parsedAudit.primaryConfidence ?? 90),
        verifierConfidence: Number(parsedAudit.verifierConfidence ?? 90),
        verifierNotes: parsedAudit.verifierNotes || "Independent audit completed.",
      };
    } catch (auditErr) {
      console.error("Model B fallback triggered:", auditErr.message);
    }

    const confidenceDiff = Math.abs(audit.primaryConfidence - audit.verifierConfidence);
    const needsHumanReview = confidenceDiff > CONFIDENCE_GAP_THRESHOLD;
    const dualAudit = {
      ...audit,
      confidenceDiff,
      threshold: CONFIDENCE_GAP_THRESHOLD,
      needsHumanReview,
    };

    // 3. Compile locally
    const compileFlags = ["-std=c++20", "-O2", srcPath, "-o", binPath];
    const compileRes = await runCmd("g++", compileFlags, { timeout: 10000 });
    if (!compileRes.ok) {
      return {
        compiled: false,
        compileError: compileRes.stderr,
        allUserTestsPassed: false,
        staticWarnings,
        bugs: [],
        testResults: [],
        dualAudit,
        reviewTicketId: null,
      };
    }

    // 4. Run Sample Test Cases + AI Hidden Edge Cases + Counterexamples
    const allTests = [
      ...testCases.map((t, idx) => ({
        name: `Sample Test #${idx + 1}`,
        input: t.input || "",
        expected: (t.expectedOutput || "").trim(),
        bugId: null,
      })),
      ...generatedEdgeCases.map((ec, idx) => ({
        name: `Edge Case #${idx + 1}: ${ec.label || "Corner Case"}`,
        input: ec.input || "",
        expected: (ec.expectedOutput || "").trim(),
        bugId: null,
      })),
      ...bugs.map((b) => ({
        name: `AI Counterexample: ${b.title}`,
        input: b.counterexampleInput || "",
        expected: (b.expectedOutput || "").trim(),
        bugId: b.id,
      })),
    ];

    const testResults = [];
    for (const test of allTests) {
      const execResult = await new Promise((resolve) => {
        const child = execFile(binPath, [], { timeout: 3000 }, (err, stdout, stderr) => {
          resolve({
            stdout: (stdout || "").trim(),
            stderr: (stderr || "").trim(),
            crashed: Boolean(err),
            tle: Boolean(err?.killed || err?.code === "ETIMEDOUT"),
          });
        });
        child.stdin.on("error", () => {});
        child.stdin.end((test.input || "") + "\n");
      });

      const passed = !execResult.crashed && execResult.stdout === test.expected;
      testResults.push({
        name: test.name,
        bugId: test.bugId,
        input: test.input,
        expected: test.expected,
        actual: execResult.stdout,
        stderr: execResult.stderr,
        passed,
        tle: execResult.tle,
      });
    }

    // 5. Evidence Reconciliation
    const verifiedBugs = bugs.map((bug) => {
      const failedCounterexample = testResults.find((r) => r.bugId === bug.id && !r.passed);
      const failedUserTest = testResults.find((r) => r.bugId === null && !r.passed);
      const isConfirmed = Boolean(failedCounterexample || failedUserTest);

      let evidence = null;
      if (failedCounterexample) {
        evidence = failedCounterexample.tle
          ? `Time Limit Exceeded on counterexample: "${failedCounterexample.input}"`
          : `Failed counterexample "${failedCounterexample.input}" -> Expected "${failedCounterexample.expected}", got "${failedCounterexample.actual}"`;
      } else if (failedUserTest) {
        evidence = `Failed test "${failedUserTest.input}" -> Expected "${failedUserTest.expected}", got "${failedUserTest.actual}"`;
      }

      return {
        ...bug,
        status: isConfirmed ? "CONFIRMED" : "SUSPECTED",
        evidence,
      };
    });

    const userTests = testResults.filter((r) => r.bugId === null);
    const allUserTestsPassed = userTests.length > 0 && userTests.every((r) => r.passed);

    // 6. Save Escalated Ticket in MongoDB if confidenceDiff > 25%
    let reviewTicketId = null;
    if (needsHumanReview) {
      reviewTicketId = `REV-${Date.now().toString(36).toUpperCase()}`;
      await ReviewTicket.create({
        ticketId: reviewTicketId,
        status: "PENDING",
        problemId,
        problemTitle,
        problem,
        code,
        staticWarnings,
        bugs: verifiedBugs,
        testResults,
        dualAudit,
      });
    }

    return {
      compiled: true,
      compileError: null,
      allUserTestsPassed,
      staticWarnings,
      bugs: verifiedBugs,
      testResults,
      dualAudit,
      reviewTicketId,
    };
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}