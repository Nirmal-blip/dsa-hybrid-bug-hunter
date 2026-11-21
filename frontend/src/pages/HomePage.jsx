import { useState } from "react";
import {
  FiTerminal,
  FiArrowRight,
  FiLock,
  FiCheck,
  FiLogOut,
  FiLayers,
  FiCpu,
  FiUsers,
  FiPlay,
  FiRotateCcw,
  FiShield,
} from "react-icons/fi";
import { PROBLEM_TOPICS } from "../topics";

const SCENARIOS = [
  {
    id: "arr-kadane",
    file: "kadane.cpp",
    topic: "Arrays",
    summary: "Zero-initialized accumulators return 0 instead of the largest negative element.",
    line: 2,
    buggyCode: "int maxSum = 0, currSum = 0;",
    patchedCode: "int maxSum = nums[0], currSum = nums[0];",
    failingCase: 5,
    actualBuggy: "0",
    actualFixed: "-1",
    expected: "-1",
    passedBuggy: 4,
    modelA: 97,
    modelB: 95,
    escalated: false,
  },
  {
    id: "bs-koko-bananas",
    file: "koko_bananas.cpp",
    topic: "Binary Search",
    summary: "Accumulating required hours in a 32-bit int overflows on large pile counts.",
    line: 5,
    buggyCode: "int hours = 0;",
    patchedCode: "long long hours = 0;",
    failingCase: 19,
    actualBuggy: "-1294967296",
    actualFixed: "3",
    expected: "3",
    passedBuggy: 19,
    modelA: 92,
    modelB: 45,
    escalated: true,
  },
  {
    id: "hash-count-subarrays-sum-k",
    file: "subarray_sum_k.cpp",
    topic: "Hashing",
    summary: "Mutating prefix frequency before querying prefixSum - k overcounts k = 0.",
    line: 6,
    buggyCode: "freq[sum]++; count += freq[sum - k];",
    patchedCode: "count += freq[sum - k]; freq[sum]++;",
    failingCase: 4,
    actualBuggy: "9",
    actualFixed: "6",
    expected: "6",
    passedBuggy: 14,
    modelA: 98,
    modelB: 96,
    escalated: false,
  },
];

export default function HomePage({
  studentUser,
  onLogoutStudent,
  onStartBenchmark,
  onTryLiveDemo,
  onOpenEvaluator,
  onOpenAuth,
}) {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [patched, setPatched] = useState(false);

  const totalProblems = PROBLEM_TOPICS.reduce((sum, t) => sum + t.problems.length, 0);
  const totalCases = totalProblems * 25;
  const active = SCENARIOS[scenarioIdx];
  const gap = Math.abs(active.modelA - active.modelB);
  const passed = patched ? 25 : active.passedBuggy;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col antialiased selection:bg-sky-500/15 selection:text-sky-950 relative overflow-x-hidden">
      {/* SUBTLE TOP AMBIENT WASH */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[28rem]"
        style={{
          background:
            "radial-gradient(ellipse 68% 55% at 50% -6%, rgba(2, 132, 199, 0.08), rgba(14, 165, 233, 0.03) 55%, transparent 80%)",
        }}
      />

      {/* TOP NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/90">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-2xs shrink-0">
              <FiTerminal className="w-4 h-4 text-sky-400" />
            </div>
            <span className="font-extrabold text-[15px] tracking-[-0.025em] text-slate-950 truncate">
              LogicGuard
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
              C++20
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-500">
            <a href="#inspector" className="hover:text-slate-950 transition">
              Judge
            </a>
            <a href="#pipeline" className="hover:text-slate-950 transition">
              Pipeline
            </a>
            <a href="#tracks" className="hover:text-slate-950 transition">
              Tracks
            </a>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {studentUser ? (
              <>
                <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-mono text-slate-700 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>{studentUser.name || studentUser.email}</span>
                </span>
                <button
                  type="button"
                  onClick={onLogoutStudent}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-200 transition cursor-pointer"
                >
                  <FiLogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onOpenEvaluator}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 rounded-md hover:bg-slate-100 transition cursor-pointer"
                >
                  Evaluator
                </button>
                {onOpenAuth && (
                  <button
                    type="button"
                    onClick={() => onOpenAuth("student")}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-md shadow-2xs transition cursor-pointer"
                  >
                    Student Login
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              onClick={onStartBenchmark}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-md shadow-2xs transition cursor-pointer"
            >
              <span>Suite</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* HERO + INTERACTIVE JUDGE INSPECTOR */}
        <section id="inspector" className="border-b border-slate-200/90 bg-white/85">
          <div className="max-w-6xl mx-auto px-6 py-14 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-[11px] font-mono font-semibold text-sky-700">
                <FiShield className="w-3.5 h-3.5" />
                <span>g++ -std=c++20 -O2 · 25-Case Judge</span>
              </div>

              <h1 className="text-[2.2rem] sm:text-[2.65rem] font-extrabold tracking-[-0.035em] text-slate-950 leading-[1.08]">
                Verify C++ logic beyond sample test cases.
              </h1>

              <p className="text-sm text-slate-600 leading-[1.68]">
                Compile solutions against 3 public inputs and 22 hidden edge cases, inspect faulty
                lines with Dual-LLM verification, and route confidence gaps above{" "}
                <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/90">
                  &Delta; &gt; 25%
                </code>{" "}
                to a human evaluator.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onStartBenchmark}
                  className="inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm transition cursor-pointer"
                >
                  <span>Explore Problems</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/15 font-mono text-[11px] tabular-nums">
                    {totalProblems}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onTryLiveDemo}
                  className="inline-flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg shadow-2xs transition cursor-pointer"
                >
                  <FiPlay className="w-3.5 h-3.5 text-sky-600" />
                  <span>Open Live IDE</span>
                </button>
              </div>

              <div className="pt-5 border-t border-slate-200/90 grid grid-cols-3 gap-3 tabular-nums">
                <div className="rounded-xl bg-white border border-slate-200/90 px-3.5 py-2.5 shadow-2xs">
                  <div className="font-mono text-lg font-bold text-slate-950">{totalProblems}</div>
                  <div className="text-[11px] font-medium text-slate-500">Problems</div>
                </div>
                <div className="rounded-xl bg-white border border-slate-200/90 px-3.5 py-2.5 shadow-2xs">
                  <div className="font-mono text-lg font-bold text-slate-950">
                    {totalCases.toLocaleString()}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">Judge Cases</div>
                </div>
                <div className="rounded-xl bg-white border border-slate-200/90 px-3.5 py-2.5 shadow-2xs">
                  <div className="font-mono text-lg font-bold text-sky-700">&Delta; &gt; 25%</div>
                  <div className="text-[11px] font-medium text-slate-500">Escalation</div>
                </div>
              </div>
            </div>

            {/* RIGHT INTERACTIVE JUDGE INSPECTOR */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-white border border-slate-200/90 shadow-[0_14px_36px_-14px_rgba(15,23,42,0.08)] overflow-hidden">
                <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {SCENARIOS.map((item, idx) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setScenarioIdx(idx);
                          setPatched(false);
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition cursor-pointer shrink-0 ${
                          idx === scenarioIdx
                            ? "bg-white text-slate-950 font-bold border border-slate-200 shadow-2xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {item.file}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPatched((v) => !v)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono font-bold transition cursor-pointer shrink-0 ${
                      patched
                        ? "bg-slate-200/80 text-slate-800 hover:bg-slate-200"
                        : "bg-sky-600 hover:bg-sky-700 text-white shadow-2xs"
                    }`}
                  >
                    {patched ? (
                      <>
                        <FiRotateCcw className="w-3 h-3" />
                        <span>Revert Bug</span>
                      </>
                    ) : (
                      <>
                        <FiCheck className="w-3 h-3" />
                        <span>Apply Patch</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-700">
                        {active.topic}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-950 mt-0.5">
                        {active.summary}
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border tabular-nums shrink-0 ${
                        patched
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : active.escalated
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {patched && <FiCheck className="w-3 h-3" />}
                      <span>
                        {patched
                          ? "25 / 25 PASSED"
                          : active.escalated
                          ? `Δ ${gap}% · ESCALATED`
                          : `${passed} / 25 PASSED`}
                      </span>
                    </span>
                  </div>

                  {/* CODE LINE */}
                  <div className="rounded-xl bg-slate-950 text-slate-100 p-3.5 font-mono text-xs overflow-x-auto border border-slate-900">
                    <div
                      className={`px-3 py-2 rounded-lg border-l-2 flex items-center justify-between gap-3 ${
                        patched
                          ? "bg-emerald-500/15 border-emerald-400 text-emerald-200"
                          : "bg-rose-500/15 border-rose-500 text-rose-200"
                      }`}
                    >
                      <code className="whitespace-pre">
                        <span className="text-slate-500 mr-3 select-none">{active.line}</span>
                        {patched ? active.patchedCode : active.buggyCode}
                      </code>
                      <span className="text-[10px] font-bold shrink-0">
                        {patched ? "FIXED" : "BUG"}
                      </span>
                    </div>
                  </div>

                  {/* 25-CASE MATRIX */}
                  <div className="rounded-xl bg-slate-50/90 border border-slate-200/80 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
                      <span className="font-semibold">Judge Suite (3 Public · 22 Hidden)</span>
                      <span className="tabular-nums font-bold text-slate-900">{passed}/25</span>
                    </div>

                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 font-mono text-[10px] tabular-nums">
                      {Array.from({ length: 25 }, (_, i) => {
                        const caseNum = i + 1;
                        const isHidden = caseNum > 3;
                        const isPass = patched
                          ? true
                          : caseNum <= 3 ||
                            (caseNum !== active.failingCase && caseNum <= active.passedBuggy + 2);

                        return (
                          <div
                            key={caseNum}
                            className={`h-6 rounded flex items-center justify-center border ${
                              isPass
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : "bg-rose-50 border-rose-200 text-rose-700 font-bold"
                            }`}
                          >
                            {isHidden ? <FiLock className="w-3 h-3" /> : `T${caseNum}`}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* COUNTEREXAMPLE & DUAL-LLM */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-[11px] tabular-nums">
                    <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80">
                      <div className="text-[10px] text-slate-400 uppercase">
                        Case #{active.failingCase} Result
                      </div>
                      <div className="text-slate-800 mt-0.5">
                        Actual:{" "}
                        <strong className={patched ? "text-emerald-700" : "text-rose-700"}>
                          {patched ? active.actualFixed : active.actualBuggy}
                        </strong>{" "}
                        · Expected: <strong className="text-emerald-700">{active.expected}</strong>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80">
                      <div className="text-[10px] text-slate-400 uppercase">Dual-LLM Audit</div>
                      <div className="text-slate-800 mt-0.5">
                        120B:{" "}
                        <strong className="text-sky-700">{patched ? 99 : active.modelA}%</strong> ·
                        20B:{" "}
                        <strong className="text-indigo-700">
                          {patched ? 99 : active.modelB}%
                        </strong>{" "}
                        <span className="text-slate-500">(&Delta; {patched ? 0 : gap}%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PIPELINE */}
        <section id="pipeline" className="max-w-6xl mx-auto px-6 py-14 border-b border-slate-200/90">
          <div className="mb-7">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-700">
              Architecture
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-[-0.025em] text-slate-950 mt-0.5">
              Three-stage verification pipeline
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-white border border-slate-200/90 p-5 shadow-2xs space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 border border-sky-200/80 flex items-center justify-center">
                <FiLayers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-950">25-Case C++20 Judge</h3>
              <p className="text-xs text-slate-600 leading-[1.65]">
                Pairs 3 visible sample inputs with 22 locked hidden cases covering overflow and
                boundary conditions.
              </p>
            </div>

            <div className="rounded-xl bg-white border border-slate-200/90 p-5 shadow-2xs space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center justify-center">
                <FiCpu className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-950">Dual-LLM Fault Audit</h3>
              <p className="text-xs text-slate-600 leading-[1.65]">
                Cross-checks primary and verifier model evaluations to isolate faulty lines and
                produce clean patches.
              </p>
            </div>

            <div className="rounded-xl bg-white border border-slate-200/90 p-5 shadow-2xs space-y-2.5 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center">
                  <FiUsers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-950">
                  Human Escalation (&Delta; &gt; 25%)
                </h3>
                <p className="text-xs text-slate-600 leading-[1.65]">
                  Routes high-disagreement runs to an evaluator workbench for manual review and
                  patch feedback.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenEvaluator}
                className="inline-flex items-center gap-1 text-left text-xs font-bold text-slate-950 hover:text-sky-700 transition cursor-pointer pt-2"
              >
                <span>Open Evaluator Portal</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* TOPIC TRACKS */}
        <section id="tracks" className="max-w-6xl mx-auto px-6 py-14 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-700">
                Curriculum
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-[-0.025em] text-slate-950 mt-0.5">
                Topic tracks
              </h2>
            </div>

            <button
              type="button"
              onClick={onStartBenchmark}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
            >
              <span>View All {totalProblems} Problems</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PROBLEM_TOPICS.map((track, idx) => (
              <button
                key={track.topic}
                type="button"
                onClick={onStartBenchmark}
                className="text-left rounded-xl bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-sky-300 p-5 shadow-2xs hover:shadow-sm transition space-y-3.5 cursor-pointer group"
              >
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="font-bold text-slate-400">TRACK 0{idx + 1}</span>
                  <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/70 font-semibold tabular-nums">
                    {track.problems.length} Problems · {track.problems.length * 25} Cases
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold tracking-[-0.02em] text-slate-950 group-hover:text-sky-700 transition">
                    {track.topic}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {track.problems
                      .slice(0, 3)
                      .map((p) => p.title)
                      .join(" · ")}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-sky-700">
                  <span>Enter Track</span>
                  <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}