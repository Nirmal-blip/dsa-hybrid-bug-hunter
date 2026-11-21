import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
  FiTerminal,
  FiArrowRight,
  FiLock,
  FiCheck,
  FiSearch,
  FiLogOut,
  FiLayers,
} from "react-icons/fi";
import { PROBLEM_TOPICS } from "../topics";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

function normalizeDifficulty(raw) {
  const val = String(raw || "").trim().toLowerCase();
  if (val === "basic" || val === "easy") return "Basic";
  if (val === "core" || val === "medium" || val === "med") return "Core";
  if (val === "pro" || val === "hard") return "Pro";
  return "Core";
}

export default function ProblemsPage({
  studentUser,
  onLogoutStudent,
  onSelectProblem,
  onOpenEvaluator,
  onBackHome,
}) {
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [solvedIds, setSolvedIds] = useState([]);

  const solvedStorageKey = `cpp_dbg_solved_${studentUser?.email || "guest"}`;

  useEffect(() => {
    try {
      const localSaved = JSON.parse(localStorage.getItem(solvedStorageKey) || "[]");
      const profileSaved = Array.isArray(studentUser?.solvedProblems)
        ? studentUser.solvedProblems
        : [];
      const merged = Array.from(
        new Set([...(Array.isArray(localSaved) ? localSaved : []), ...profileSaved])
      );
      setSolvedIds(merged);
    } catch {
      setSolvedIds(Array.isArray(studentUser?.solvedProblems) ? studentUser.solvedProblems : []);
    }

    if (studentUser?.token) {
      axios
        .get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${studentUser.token}` },
        })
        .then((res) => {
          const remote = res.data?.user?.solvedProblems;
          if (Array.isArray(remote)) {
            setSolvedIds((prev) => {
              const combined = Array.from(new Set([...prev, ...remote]));
              localStorage.setItem(solvedStorageKey, JSON.stringify(combined));
              return combined;
            });
          }
        })
        .catch(() => {});
    }
  }, [studentUser?.email, studentUser?.token, solvedStorageKey]);

  const allProblems = useMemo(() => {
    return PROBLEM_TOPICS.flatMap((topicBlock) =>
      topicBlock.problems.map((p) => ({
        ...p,
        topic: topicBlock.topic,
        normalizedDifficulty: normalizeDifficulty(p.difficulty ?? p.level ?? p.tier),
      }))
    );
  }, []);

  const difficultyCounts = useMemo(() => {
    const base =
      selectedTopic === "All"
        ? allProblems
        : allProblems.filter((p) => p.topic === selectedTopic);

    return {
      All: base.length,
      Basic: base.filter((p) => p.normalizedDifficulty === "Basic").length,
      Core: base.filter((p) => p.normalizedDifficulty === "Core").length,
      Pro: base.filter((p) => p.normalizedDifficulty === "Pro").length,
    };
  }, [allProblems, selectedTopic]);

  const filteredProblems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allProblems.filter((p) => {
      const matchesTopic = selectedTopic === "All" || p.topic === selectedTopic;
      const matchesDiff =
        difficultyFilter === "All" || p.normalizedDifficulty === difficultyFilter;
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        String(p.number).includes(q) ||
        p.topic.toLowerCase().includes(q);
      return matchesTopic && matchesDiff && matchesQuery;
    });
  }, [allProblems, selectedTopic, difficultyFilter, searchQuery]);

  const totalCases = allProblems.length * 25;
  const solvedCount = solvedIds.length;
  const progressPct = allProblems.length
    ? Math.round((solvedCount / allProblems.length) * 100)
    : 0;

  const difficultyBadge = (diff) => {
    switch (normalizeDifficulty(diff)) {
      case "Basic":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/90";
      case "Core":
        return "bg-amber-50 text-amber-800 border-amber-200/90";
      case "Pro":
        return "bg-rose-50 text-rose-700 border-rose-200/90";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col antialiased selection:bg-sky-500/15 selection:text-sky-950 relative overflow-x-hidden">
      {/* SUBTLE TOP AMBIENT WASH */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[24rem]"
        style={{
          background:
            "radial-gradient(ellipse 68% 55% at 50% -6%, rgba(2, 132, 199, 0.08), rgba(14, 165, 233, 0.03) 55%, transparent 80%)",
        }}
      />

      {/* TOP NAVIGATION */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/90">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onBackHome}
              className="flex items-center gap-2.5 cursor-pointer group shrink-0"
              title="Back to Home"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-2xs">
                <FiTerminal className="w-4 h-4 text-sky-400" />
              </div>
              <span className="font-extrabold text-[15px] tracking-[-0.025em] text-slate-950 group-hover:text-sky-700 transition">
                LogicGuard
              </span>
            </button>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
              C++20
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onBackHome && (
              <button
                type="button"
                onClick={onBackHome}
                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 rounded-md hover:bg-slate-100 transition cursor-pointer"
              >
                Home
              </button>
            )}

            {studentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-mono text-slate-700 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
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
              </div>
            )}

            <button
              type="button"
              onClick={onOpenEvaluator}
              className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-md shadow-2xs transition cursor-pointer"
            >
              Evaluator
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-9 space-y-6 relative z-10">
        {/* HEADER BANNER + PROGRESS CARD */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-[0_10px_30px_-14px_rgba(15,23,42,0.07)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200/80 text-[11px] font-mono font-semibold text-sky-700">
              <FiLayers className="w-3 h-3" />
              <span>{allProblems.length} Problems · 25 Judge Cases Each</span>
            </div>
            <h1 className="text-2xl sm:text-[1.75rem] font-extrabold tracking-[-0.03em] text-slate-950">
              C++20 Algorithmic Debugging Suite
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Diagnose subtle edge-case failures in C++20 and verify fixes against 3 public sample
              cases and 22 hidden test cases.
            </p>
          </div>

          <div className="w-full lg:w-76 rounded-xl bg-slate-50/90 border border-slate-200/90 p-4 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between font-mono text-xs tabular-nums">
              <span className="text-slate-600 font-semibold">Completion</span>
              <span className="font-bold text-emerald-700">
                {solvedCount} / {allProblems.length} ({progressPct}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-200/90 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 pt-0.5 tabular-nums">
              <span>{filteredProblems.length} shown</span>
              <span>{totalCases.toLocaleString()} total cases</span>
            </div>
          </div>
        </div>

        {/* TOPIC TABS, DIFFICULTY PILLS & SEARCH */}
        <div className="rounded-xl bg-white border border-slate-200/90 p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {["All", ...PROBLEM_TOPICS.map((t) => t.topic)].map((topic) => {
              const count =
                topic === "All"
                  ? allProblems.length
                  : PROBLEM_TOPICS.find((t) => t.topic === topic)?.problems.length || 0;
              const active = selectedTopic === topic;
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <span>{topic}</span>
                  <span
                    className={`font-mono text-[10px] tabular-nums ${
                      active ? "text-sky-300" : "text-slate-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/80">
              {["All", "Basic", "Core", "Pro"].map((tier) => {
                const active = difficultyFilter === tier;
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setDifficultyFilter(tier)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition cursor-pointer flex items-center gap-1 ${
                      active
                        ? "bg-white text-slate-950 font-bold shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <span>{tier}</span>
                    <span className="text-[10px] text-slate-400 tabular-nums">
                      {difficultyCounts[tier]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-56">
              <FiSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search #, title, topic..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:outline-none text-xs text-slate-900 placeholder:text-slate-400 transition"
              />
            </div>
          </div>
        </div>

        {/* PROBLEMS TABLE */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-mono text-slate-500">
                  <th className="py-3 px-4 font-semibold w-28">Status</th>
                  <th className="py-3 px-4 font-semibold w-14">#</th>
                  <th className="py-3 px-4 font-semibold">Problem</th>
                  <th className="py-3 px-4 font-semibold hidden sm:table-cell">Topic</th>
                  <th className="py-3 px-4 font-semibold">Tier</th>
                  <th className="py-3 px-4 font-semibold text-right">Suite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/75">
                {filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 px-4 text-center text-xs text-slate-500">
                      No problems match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredProblems.map((p) => {
                    const isSolved = solvedIds.includes(p.id);
                    const publicCnt = (p.testCases || []).filter((tc) => !tc.hidden).length || 3;
                    const hiddenCnt = (p.testCases || []).length - publicCnt;

                    return (
                      <tr
                        key={p.id}
                        onClick={() => onSelectProblem(p)}
                        className="hover:bg-sky-50/35 transition cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 font-mono">
                          {isSolved ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/90 font-bold text-[10px]">
                              <FiCheck className="w-3 h-3" />
                              <span>SOLVED</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              <span>OPEN</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400 tabular-nums">
                          {p.number}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold tracking-[-0.01em] text-slate-950 group-hover:text-sky-700 transition">
                            {p.title}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 sm:hidden mt-0.5">
                            {p.topic}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 hidden sm:table-cell">
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-100/90 border border-slate-200/80 font-mono text-[11px] text-slate-700">
                            {p.topic}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-md border ${difficultyBadge(
                              p.normalizedDifficulty
                            )}`}
                          >
                            {p.normalizedDifficulty}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono">
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 mr-3 hidden lg:inline-flex tabular-nums">
                            <span>
                              {publicCnt} pub · {hiddenCnt}
                            </span>
                            <FiLock className="w-3 h-3 inline" />
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-sky-700 transition">
                            <span>Open</span>
                            <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}