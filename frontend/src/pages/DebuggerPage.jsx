import { useState, useEffect, useRef } from "react";
import Editor, { DiffEditor } from "@monaco-editor/react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";
const STUDENT_SESSION_KEY = "logicguard_student_auth";

const normalizeCode = (s = "") => s.replace(/\s+/g, " ").trim();

const decodeJwtPayload = (token = "") => {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const readStudentSession = (propUser = null) => {
  try {
    const raw =
      sessionStorage.getItem(STUDENT_SESSION_KEY) ||
      localStorage.getItem(STUDENT_SESSION_KEY) ||
      sessionStorage.getItem("user") ||
      localStorage.getItem("user");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed || propUser || null;
  } catch {
    return propUser || null;
  }
};

const getStoredUserId = (propUser = null) => {
  try {
    const session = readStudentSession(propUser);
    const fromSession =
      session?._id ||
      session?.id ||
      session?.userId ||
      session?.user?._id ||
      session?.user?.id;
    if (fromSession && String(fromSession) !== "anonymous") {
      return String(fromSession);
    }

    const directKeys = ["userId", "studentId", "uid", "id"];
    for (const k of directKeys) {
      const val = localStorage.getItem(k) || sessionStorage.getItem(k);
      if (val && val !== "anonymous" && val !== "undefined" && val !== "null") {
        return val.replace(/^"|"$/g, "");
      }
    }

    const objKeys = ["currentUser", "authUser", "student", "profile"];
    for (const k of objKeys) {
      const raw = localStorage.getItem(k) || sessionStorage.getItem(k);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const id =
        parsed?._id ||
        parsed?.id ||
        parsed?.userId ||
        parsed?.user?._id ||
        parsed?.user?.id;
      if (id && String(id) !== "anonymous") return String(id);
    }

    const token = session?.token || "";
    const tokenKeys = ["token", "accessToken", "authToken", "jwt"];
    const candidateTokens = [
      token,
      ...tokenKeys.map((k) => localStorage.getItem(k) || sessionStorage.getItem(k) || ""),
    ].filter(Boolean);

    for (const rawToken of candidateTokens) {
      const payload = decodeJwtPayload(String(rawToken).replace(/^"|"$/g, ""));
      const id = payload?.userId || payload?.id || payload?._id || payload?.sub;
      if (id && String(id) !== "anonymous") return String(id);
    }

    return "";
  } catch {
    return "";
  }
};

const getAuthHeaders = (propUser = null) => {
  const session = readStudentSession(propUser);
  const token =
    session?.token ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("token") ||
    "";
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function DebuggerPage({ initialProblem, studentUser = null, onBack }) {
  const [problem, setProblem] = useState(initialProblem.problem);
  const [code, setCode] = useState(initialProblem.starterCode || initialProblem.code);
  const [testCases, setTestCases] = useState(initialProblem.testCases || []);
  const [report, setReport] = useState(null);
  const [humanTicket, setHumanTicket] = useState(null);
  const [checkingTicket, setCheckingTicket] = useState(false);
  const [history, setHistory] = useState([]);

  // actionType: null | "run" | "ai" | "submit"
  const [runningAction, setRunningAction] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [diffFixCode, setDiffFixCode] = useState(null);

  const [revealedHiddenCases, setRevealedHiddenCases] = useState({});

  const [leftTab, setLeftTab] = useState("problem");
  const [rightTab, setRightTab] = useState("output");
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const [fontSize, setFontSize] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 640 ? 13 : 14
  );
  const [copied, setCopied] = useState(false);

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );
  const [mobilePane, setMobilePane] = useState("code");

  const [leftWidth, setLeftWidth] = useState(27);
  const [rightWidth, setRightWidth] = useState(34);
  const draggingPane = useRef(null);

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  const isBusy = Boolean(runningAction);
  const publicTestCases = testCases.filter((tc) => !tc.hidden);
  const hiddenTestCount = testCases.length - publicTestCases.length;

  useEffect(() => {
    setProblem(initialProblem.problem);
    setCode(initialProblem.starterCode || initialProblem.code);
    setTestCases(initialProblem.testCases || []);
    setReport(null);
    setHumanTicket(null);
    setDiffFixCode(null);
    setRevealedHiddenCases({});
    setActiveCaseIdx(0);
  }, [initialProblem]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const markProblemSolved = () => {
    try {
      const session = readStudentSession(studentUser);
      const scopedKey = `cpp_dbg_solved_${session?.email || "guest"}`;
      const prevScoped = JSON.parse(localStorage.getItem(scopedKey) || "[]");
      if (!prevScoped.includes(initialProblem.id)) {
        localStorage.setItem(scopedKey, JSON.stringify([...prevScoped, initialProblem.id]));
      }

      const prevGlobal = JSON.parse(localStorage.getItem("cpp_dbg_solved") || "[]");
      if (!prevGlobal.includes(initialProblem.id)) {
        localStorage.setItem("cpp_dbg_solved", JSON.stringify([...prevGlobal, initialProblem.id]));
      }
    } catch {
      // ignore
    }

    const headers = getAuthHeaders(studentUser);
    if (headers.Authorization && initialProblem?.id) {
      axios
        .post(
          `${API_BASE}/auth/progress/solve`,
          { problemId: initialProblem.id },
          { headers }
        )
        .catch(() => {});
    }
  };

  const fetchHistory = () => {
    const userId = getStoredUserId(studentUser);
    const headers = getAuthHeaders(studentUser);

    axios
      .get(`${API_BASE}/history`, {
        headers,
        params: {
          problemId: initialProblem.id,
          ...(userId ? { userId } : {}),
        },
      })
      .then((res) => {
        const all = Array.isArray(res.data) ? res.data : [];
        const forThisProblem = all.filter((h) => {
          if (h.problemId && initialProblem.id) {
            return h.problemId === initialProblem.id;
          }
          return (
            (h.problemTitle || "").trim() === (initialProblem.title || "").trim() ||
            (h.problem || "").trim() === (initialProblem.problem || "").trim()
          );
        });
        setHistory(forThisProblem);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchHistory();
  }, [initialProblem.id, studentUser?.id, studentUser?.token]);

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API_BASE}/reviews`, { headers: getAuthHeaders(studentUser) })
      .then((res) => {
        if (cancelled) return;
        const matchedTicket = (res.data || []).find(
          (t) =>
            t.problemId === initialProblem.id &&
            normalizeCode(t.code) === normalizeCode(code)
        );
        setHumanTicket(matchedTicket || null);
        if (matchedTicket?.status === "ACCEPTED") {
          markProblemSolved();
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [initialProblem.id, code]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!draggingPane.current) return;
      const totalW = window.innerWidth;
      if (draggingPane.current === "left") {
        const next = Math.min(42, Math.max(18, (e.clientX / totalW) * 100));
        setLeftWidth(next);
      } else if (draggingPane.current === "right") {
        const next = Math.min(50, Math.max(24, ((totalW - e.clientX) / totalW) * 100));
        setRightWidth(next);
      }
    };
    const onMouseUp = () => {
      draggingPane.current = null;
      document.body.style.cursor = "default";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  useEffect(() => {
    if (!isBusy) {
      setLoadingStep(0);
      return;
    }
    const t1 = setTimeout(() => setLoadingStep(1), 450);
    const t2 = setTimeout(() => setLoadingStep(2), 1100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isBusy]);

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || diffFixCode) return;
    const newDecorations = (report?.bugs || []).map((bug) => ({
      range: new monacoRef.current.Range(bug.startLine, 1, bug.endLine, 1),
      options: {
        isWholeLine: true,
        className: bug.status === "CONFIRMED" ? "line-confirmed" : "line-suspected",
      },
    }));
    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );
  }, [report, diffFixCode]);

  const jumpToLine = (line) => {
    setDiffFixCode(null);
    if (isMobile) setMobilePane("code");
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.revealLineInCenter(line);
        editorRef.current.setPosition({ lineNumber: line, column: 1 });
        editorRef.current.focus();
      }
    }, 80);
  };

  /**
   * actionType:
   * - "run"    -> compile + execute tests only (no AI audit / no solved mark)
   * - "ai"     -> run AI verification & dual-LLM audit
   * - "submit" -> full judge + AI verification + save history + mark solved if passed
   */
  const executeAction = async (actionType = "submit") => {
    if (isBusy) return;
    setRunningAction(actionType);
    setDiffFixCode(null);
    if (actionType !== "run") {
      setHumanTicket(null);
    }
    setActiveCaseIdx(0);
    setRevealedHiddenCases({});
    setRightTab(actionType === "ai" ? "bugs" : "output");
    if (isMobile) setMobilePane("output");

    const userId = getStoredUserId(studentUser);
    const headers = getAuthHeaders(studentUser);
    const includeAiVerification = actionType === "ai" || actionType === "submit";
    const saveHistory = actionType === "submit";

    try {
      const { data } = await axios.post(
        `${API_BASE}/analyze`,
        {
          ...(userId ? { userId } : {}),
          mode: actionType,
          includeAiVerification,
          saveHistory,
          problem,
          problemId: initialProblem.id,
          problemTitle: initialProblem.title,
          code,
          testCases,
          driverCode: initialProblem.driverCode || "",
        },
        { headers }
      );

      setReport((prev) => ({
        ...(actionType === "ai" ? prev || {} : {}),
        ...data,
        actionType,
        bugs: data.bugs ?? (actionType === "ai" ? prev?.bugs || [] : []),
        dualAudit: data.dualAudit ?? (actionType === "ai" ? prev?.dualAudit || null : null),
      }));

      if (saveHistory) {
        fetchHistory();
      }

      const confirmed = data?.bugs?.filter((b) => b.status === "CONFIRMED").length || 0;
      const needsHuman = Boolean(data?.dualAudit?.needsHumanReview);
      if (
        actionType === "submit" &&
        data?.compiled &&
        data?.allUserTestsPassed &&
        confirmed === 0 &&
        !needsHuman
      ) {
        markProblemSolved();
      }
    } catch (err) {
      alert("Execution Error: " + (err.response?.data?.error || err.message));
    } finally {
      setRunningAction(null);
    }
  };

  const activeTicketId = report?.reviewTicketId || humanTicket?.ticketId;

  const handleRefreshHumanTicket = async () => {
    if (!activeTicketId || checkingTicket) return;
    setCheckingTicket(true);
    try {
      const { data } = await axios.get(`${API_BASE}/reviews/${activeTicketId}`, {
        headers: getAuthHeaders(studentUser),
      });
      if (normalizeCode(data.code) === normalizeCode(code)) {
        setHumanTicket(data);
        if (data.status === "ACCEPTED") {
          markProblemSolved();
          fetchHistory();
        }
      } else {
        setHumanTicket(null);
      }
    } catch (err) {
      alert("Could not fetch review status: " + err.message);
    } finally {
      setCheckingTicket(false);
    }
  };

  useEffect(() => {
    if (!activeTicketId) return;
    if (humanTicket?.status === "ACCEPTED" || humanTicket?.status === "REJECTED") return;

    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/reviews/${activeTicketId}`, {
          headers: getAuthHeaders(studentUser),
        });
        if (normalizeCode(data.code) === normalizeCode(code)) {
          setHumanTicket(data);
          if (data.status === "ACCEPTED") {
            markProblemSolved();
            fetchHistory();
          }
        }
      } catch {
        // ignore
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeTicketId, humanTicket?.status, code]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "enter") {
        e.preventDefault();
        executeAction("submit");
      } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        executeAction("run");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const confirmedCount = report?.bugs?.filter((b) => b.status === "CONFIRMED").length || 0;
  const userTestResults = report?.testResults?.filter((t) => t.bugId === null) || [];
  const isTicketForCurrentCode =
    Boolean(humanTicket) && normalizeCode(humanTicket.code) === normalizeCode(code);
  const needsHumanReview = Boolean(report?.dualAudit?.needsHumanReview || isTicketForCurrentCode);
  const humanStatus = isTicketForCurrentCode ? humanTicket.status : "PENDING";
  const isAccepted =
    humanStatus === "ACCEPTED" ||
    (report?.compiled && report?.allUserTestsPassed && confirmedCount === 0 && !needsHumanReview);
  const centerWidth = 100 - leftWidth - rightWidth;

  return (
    <div className="flex flex-col h-[100dvh] bg-[#eef3f9] text-slate-900 overflow-hidden select-none relative">
      <div className="pointer-events-none fixed -top-24 left-1/4 w-96 h-96 rounded-full bg-sky-300/25 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-1/4 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl" />

      {/* FROSTED TOP IDE HEADER */}
      <header className="min-h-14 px-2.5 sm:px-4 py-1.5 sm:py-0 glass-nav flex items-center justify-between shrink-0 gap-2 sm:gap-3 z-20">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/80 hover:bg-white text-slate-700 border border-slate-200/90 shadow-2xs transition cursor-pointer shrink-0"
          >
            <span>←</span>
            <span className="hidden xs:inline sm:inline">Problems</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-200 shrink-0" />

          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="text-[11px] sm:text-xs font-mono font-semibold text-slate-400 shrink-0">
              #{initialProblem.number}
            </span>
            <h1 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
              {initialProblem.title}
            </h1>
            <span className="hidden xl:inline-block text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/12 text-sky-700 border border-sky-500/25">
              {initialProblem.topic}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {initialProblem.starterCode && (
            <button
              onClick={() => {
                setCode(initialProblem.starterCode);
                setDiffFixCode(null);
                setReport(null);
                setHumanTicket(null);
              }}
              className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-xl bg-white/80 hover:bg-white text-slate-600 border border-slate-200/90 shadow-2xs transition cursor-pointer"
            >
              Reset
            </button>
          )}

          {initialProblem.code && (
            <button
              onClick={() => {
                setCode(initialProblem.code);
                setDiffFixCode(null);
                setReport(null);
                setHumanTicket(null);
                if (isMobile) setMobilePane("code");
              }}
              className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-xl bg-amber-500/12 hover:bg-amber-500/20 text-amber-800 border border-amber-500/30 transition cursor-pointer"
            >
              <span className="sm:hidden">Buggy</span>
              <span className="hidden sm:inline">Seed Buggy</span>
            </button>
          )}

          {/* 1. RUN BUTTON (TESTS ONLY) */}
          <button
            onClick={() => executeAction("run")}
            disabled={isBusy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-xl bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-800 border border-slate-300 shadow-2xs transition cursor-pointer"
          >
            <span>{runningAction === "run" ? "Running..." : "▶ Run"}</span>
            <kbd className="hidden xl:inline text-[10px] font-mono px-1.5 rounded bg-slate-100 text-slate-500">
              ⌘↵
            </kbd>
          </button>

          {/* 2. AI VERIFICATION BUTTON */}
          <button
            onClick={() => executeAction("ai")}
            disabled={isBusy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-xl bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 text-indigo-700 border border-indigo-200 transition cursor-pointer"
          >
            <span>{runningAction === "ai" ? "Auditing..." : "✦ AI Verify"}</span>
          </button>

          {/* 3. SUBMIT BUTTON (FULL VERIFY + SAVE HISTORY) */}
          <button
            onClick={() => executeAction("submit")}
            disabled={isBusy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] sm:text-xs font-bold rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:brightness-110 disabled:opacity-50 text-white transition shadow-md shadow-sky-600/25 cursor-pointer"
          >
            <span>{runningAction === "submit" ? "Submitting..." : "↑ Submit"}</span>
            <kbd className="hidden xl:inline text-[10px] font-mono px-1.5 rounded bg-white/20 text-white">
              ⇧⌘↵
            </kbd>
          </button>
        </div>
      </header>

      {/* MOBILE PANE NAVIGATION BAR (< 1024px) */}
      <div className="lg:hidden px-2.5 pt-2 shrink-0 z-20">
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-white/75 backdrop-blur-md border border-slate-200/80 shadow-2xs">
          <button
            onClick={() => setMobilePane("problem")}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              mobilePane === "problem"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Problem
          </button>
          <button
            onClick={() => setMobilePane("code")}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              mobilePane === "code"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {diffFixCode ? "Diff View" : "Code (C++)"}
          </button>
          <button
            onClick={() => setMobilePane("output")}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mobilePane === "output"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Output</span>
            {(report || isTicketForCurrentCode || isBusy) && (
              <span
                className={`w-2 h-2 rounded-full ${
                  isBusy
                    ? "bg-sky-400 animate-ping"
                    : report && !report.compiled
                    ? "bg-rose-500"
                    : needsHumanReview && humanStatus === "PENDING"
                    ? "bg-amber-400"
                    : isAccepted
                    ? "bg-emerald-400"
                    : "bg-rose-500"
                }`}
              />
            )}
          </button>
        </div>
      </div>

      {/* 3-PANE FROSTED WORKSPACE */}
      <div className="flex flex-1 overflow-hidden p-2 sm:p-2.5 gap-1.5 z-10">
        {/* LEFT PANE */}
        <aside
          style={!isMobile ? { width: `${leftWidth}%` } : undefined}
          className={`${
            isMobile && mobilePane !== "problem" ? "hidden" : "flex"
          } w-full lg:w-auto glass-panel rounded-2xl flex-col overflow-hidden shrink-0 select-text`}
        >
          <div className="h-10 px-2.5 bg-white/60 border-b border-slate-200/70 flex items-center gap-1 shrink-0 overflow-x-auto">
            {[
              { id: "problem", label: "Description" },
              {
                id: "tests",
                label: `Tests (${publicTestCases.length} + ${hiddenTestCount} Hidden)`,
              },
              { id: "history", label: "History" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLeftTab(tab.id)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  leftTab === tab.id
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-4">
            {leftTab === "problem" && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono bg-amber-500/12 text-amber-800 ring-1 ring-amber-500/30">
                    {initialProblem.difficulty}
                  </span>
                  <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80">
                    {initialProblem.topic}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Problem Statement
                  </label>
                  <textarea
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    rows={6}
                    className="w-full bg-white/85 border border-slate-200/90 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none rounded-xl p-3 text-xs text-slate-700 leading-relaxed resize-none shadow-2xs"
                  />
                </div>

                <div className="space-y-2.5 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Sample Examples ({publicTestCases.length})
                    </span>
                    {hiddenTestCount > 0 && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                        🔒 {hiddenTestCount} Hidden Judge Cases
                      </span>
                    )}
                  </div>
                  {publicTestCases.map((tc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/80 border border-slate-200/80 space-y-2 font-mono text-xs shadow-2xs"
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Example {idx + 1}
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Input:</span>
                        <pre className="mt-1 p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-800 whitespace-pre-wrap break-all">
                          {tc.input}
                        </pre>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Output:</span>
                        <pre className="mt-1 p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/70 text-emerald-800 whitespace-pre-wrap break-all">
                          {tc.expectedOutput}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {leftTab === "tests" && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/25 text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                  <span className="text-sm shrink-0">🧪</span>
                  <span>
                    <strong>{publicTestCases.length} visible test cases</strong> and{" "}
                    <strong>{hiddenTestCount} hidden judge cases</strong> run on{" "}
                    <strong>Run</strong> or <strong>Submit</strong>. Use{" "}
                    <strong>AI Verify</strong> for Dual-LLM bug/consensus audit.
                  </span>
                </div>

                {publicTestCases.map((tc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/80 border border-slate-200/80 space-y-2 font-mono text-xs shadow-2xs"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Test Case {idx + 1} (Visible)
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Input:</span>
                      <pre className="mt-1 p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-800 whitespace-pre-wrap break-all">
                        {tc.input}
                      </pre>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Expected Output:</span>
                      <pre className="mt-1 p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/70 text-emerald-800 whitespace-pre-wrap break-all">
                        {tc.expectedOutput}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {leftTab === "history" && (
              <div className="space-y-2">
                {history.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No saved submissions yet.</p>
                )}
                {history.map((h) => (
                  <button
                    key={h._id}
                    onClick={() => {
                      setDiffFixCode(null);
                      setHumanTicket(null);
                      setProblem(h.problem);
                      setCode(h.code);
                      if (h.testCases?.length) setTestCases(h.testCases);
                      setReport(h.report);
                      if (isMobile) setMobilePane("code");
                    }}
                    className="w-full text-left p-3 rounded-xl bg-white/80 hover:bg-white border border-slate-200/80 flex items-center justify-between gap-2 text-xs transition cursor-pointer shadow-2xs"
                  >
                    <span className="truncate font-medium text-slate-700">
                      {h.problem}
                    </span>
                    {h.solved ? (
                      <span className="shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700">
                        ✓ Solved
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-sky-500/12 text-sky-700">
                        {h.report?.bugs?.length || 0} bugs
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* RESIZE HANDLE 1 */}
        <div
          onMouseDown={() => {
            draggingPane.current = "left";
            document.body.style.cursor = "col-resize";
          }}
          className="hidden lg:block w-1.5 rounded-full hover:bg-sky-400/60 transition cursor-col-resize shrink-0"
        />

        {/* CENTER PANE: MONACO EDITOR */}
        <main
          style={!isMobile ? { width: `${centerWidth}%` } : undefined}
          className={`${
            isMobile && mobilePane !== "code" ? "hidden" : "flex"
          } w-full lg:w-auto glass-panel rounded-2xl flex-col overflow-hidden select-text`}
        >
          <div className="h-10 px-2.5 sm:px-3.5 bg-white/60 border-b border-slate-200/70 flex items-center justify-between gap-2 text-xs font-mono shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded-md bg-sky-500/12 text-sky-700 text-[10px] sm:text-[11px] font-bold shrink-0">
                {diffFixCode ? "DIFF" : "C++20"}
              </span>
              <span className="text-slate-600 font-medium truncate text-[11px] sm:text-xs">
                {diffFixCode ? "Original vs Suggested Patch" : `${initialProblem.id}.cpp`}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {diffFixCode && (
                <button
                  onClick={() => setDiffFixCode(null)}
                  className="px-2 py-1 rounded-md bg-rose-500/15 text-rose-700 font-semibold text-[11px] hover:bg-rose-500/25 cursor-pointer"
                >
                  Exit Diff
                </button>
              )}
              <button
                onClick={() => setFontSize((f) => Math.max(11, f - 1))}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-[11px] cursor-pointer"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize((f) => Math.min(20, f + 1))}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-[11px] cursor-pointer"
              >
                A+
              </button>
              <button
                onClick={handleCopyCode}
                className="px-2 sm:px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] cursor-pointer"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white min-h-0">
            {diffFixCode ? (
              <DiffEditor
                height="100%"
                language="cpp"
                theme="vs"
                original={code}
                modified={diffFixCode}
                options={{
                  minimap: { enabled: false },
                  renderSideBySide: !isMobile,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontLigatures: true,
                  fontSize,
                  lineHeight: 22,
                  padding: { top: 12 },
                  readOnly: true,
                }}
              />
            ) : (
              <Editor
                height="100%"
                defaultLanguage="cpp"
                theme="vs"
                value={code}
                onChange={(val) => setCode(val || "")}
                options={{
                  minimap: { enabled: false },
                  lineNumbersMinChars: isMobile ? 3 : 4,
                  glyphMargin: !isMobile,
                  folding: !isMobile,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontLigatures: true,
                  fontSize,
                  lineHeight: 22,
                  padding: { top: 12 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  renderLineHighlight: "all",
                }}
                onMount={(editor, monaco) => {
                  editorRef.current = editor;
                  monacoRef.current = monaco;
                }}
              />
            )}
          </div>
        </main>

        {/* RESIZE HANDLE 2 */}
        <div
          onMouseDown={() => {
            draggingPane.current = "right";
            document.body.style.cursor = "col-resize";
          }}
          className="hidden lg:block w-1.5 rounded-full hover:bg-sky-400/60 transition cursor-col-resize shrink-0"
        />

        {/* RIGHT PANE: CONSOLE & AI AUDIT */}
        <section
          style={!isMobile ? { width: `${rightWidth}%` } : undefined}
          className={`${
            isMobile && mobilePane !== "output" ? "hidden" : "flex"
          } w-full lg:w-auto glass-panel rounded-2xl flex-col overflow-hidden shrink-0 select-text`}
        >
          <div className="h-10 px-2.5 sm:px-3 bg-white/60 border-b border-slate-200/70 flex items-center justify-between gap-1.5 shrink-0 overflow-x-auto">
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setRightTab("output")}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  rightTab === "output"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Console
              </button>
              <button
                onClick={() => setRightTab("bugs")}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  rightTab === "bugs"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span>AI Bugs</span>
                {report?.bugs?.length > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 rounded-full ${
                      confirmedCount > 0
                        ? "bg-rose-600 text-white"
                        : "bg-sky-500/15 text-sky-700"
                    }`}
                  >
                    {report.bugs.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setRightTab("consensus")}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  rightTab === "consensus"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                AI Audit
              </button>
            </div>

            {(report || isTicketForCurrentCode) && (
              <span
                className={`shrink-0 text-[10px] font-mono font-bold px-2 sm:px-2.5 py-0.5 rounded-full ${
                  report && !report.compiled
                    ? "bg-rose-500/15 text-rose-700"
                    : needsHumanReview && humanStatus === "PENDING"
                    ? "bg-amber-500/15 text-amber-800 ring-1 ring-amber-500/30"
                    : isAccepted
                    ? "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30"
                    : "bg-rose-500/15 text-rose-700 ring-1 ring-rose-500/30"
                }`}
              >
                {report && !report.compiled
                  ? "COMPILE ERROR"
                  : needsHumanReview && humanStatus === "PENDING"
                  ? "HUMAN REVIEW"
                  : isAccepted
                  ? "✓ ACCEPTED"
                  : humanStatus === "REJECTED" || confirmedCount > 0
                  ? "BUG FOUND"
                  : "WRONG ANSWER"}
              </span>
            )}
          </div>

          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-4">
            {isBusy && (
              <div className="p-4 rounded-2xl bg-white/85 border border-sky-200 space-y-3 shadow-xs">
                <div className="text-xs font-bold text-sky-700">
                  {runningAction === "run"
                    ? "Compiling & Running Test Suite..."
                    : runningAction === "ai"
                    ? "Running Dual-LLM AI Verification..."
                    : "Submitting & Running Hybrid Verification..."}
                </div>
                {[
                  "Compiling with g++ -std=c++20 -O2",
                  runningAction === "ai"
                    ? "Analyzing logic & edge cases with Dual-LLM"
                    : `Running ${publicTestCases.length} public & ${hiddenTestCount} hidden judge tests`,
                  runningAction === "run"
                    ? "Collecting test case outputs"
                    : "Dual-LLM cross-checking (25% escalation threshold)",
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs font-mono">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        loadingStep > i
                          ? "bg-emerald-500"
                          : loadingStep === i
                          ? "bg-sky-500 animate-ping"
                          : "bg-slate-300"
                      }`}
                    />
                    <span className={loadingStep >= i ? "text-slate-800" : "text-slate-400"}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* HUMAN EVALUATOR ESCALATION CARD */}
            {!isBusy && needsHumanReview && (
              <div
                className={`p-3.5 sm:p-4 rounded-2xl border space-y-3 shadow-xs ${
                  humanStatus === "ACCEPTED"
                    ? "bg-emerald-50/95 border-emerald-300"
                    : humanStatus === "REJECTED"
                    ? "bg-rose-50/95 border-rose-300"
                    : "bg-amber-50/95 border-amber-300"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-slate-900">
                    {humanStatus === "ACCEPTED"
                      ? "✓ Human Evaluator Approved"
                      : humanStatus === "REJECTED"
                      ? "✕ Human Evaluator Suggestion"
                      : `⏳ Sent to Human Evaluator (Δ ${
                          report?.dualAudit?.confidenceDiff ??
                          humanTicket?.dualAudit?.confidenceDiff ??
                          0
                        }% > 25%)`}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      humanStatus === "ACCEPTED"
                        ? "bg-emerald-500/20 text-emerald-900"
                        : humanStatus === "REJECTED"
                        ? "bg-rose-500/20 text-rose-900"
                        : "bg-amber-500/20 text-amber-900"
                    }`}
                  >
                    {humanStatus}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {humanStatus === "PENDING" ? (
                    <>
                      AI confidence disagreement exceeded 25% (Ticket{" "}
                      <strong className="font-mono">{activeTicketId}</strong>). Escalated to a
                      human evaluator.
                    </>
                  ) : (
                    <>
                      Reviewed by{" "}
                      <strong>{humanTicket?.reviewedBy || "Senior C++ Evaluator"}</strong> (Ticket{" "}
                      <strong className="font-mono">{activeTicketId}</strong>).
                    </>
                  )}
                </p>

                {isTicketForCurrentCode && humanStatus !== "PENDING" && (
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2 text-xs text-slate-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Evaluator Feedback &amp; Suggestion
                      </span>
                      <p className="leading-relaxed">
                        {humanTicket.evaluatorNotes || "No written notes provided."}
                      </p>
                    </div>

                    {humanTicket.suggestedCode && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            setDiffFixCode(humanTicket.suggestedCode);
                            if (isMobile) setMobilePane("code");
                          }}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        >
                          Compare Suggested Patch
                        </button>
                        <button
                          onClick={() => {
                            setCode(humanTicket.suggestedCode);
                            setDiffFixCode(null);
                            if (isMobile) setMobilePane("code");
                          }}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
                        >
                          Apply Evaluator Fix
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTicketId && (
                  <button
                    onClick={handleRefreshHumanTicket}
                    disabled={checkingTicket}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition"
                  >
                    {checkingTicket ? "Checking..." : "Refresh Evaluator Status"}
                  </button>
                )}
              </div>
            )}

            {!report && !isBusy && !isTicketForCurrentCode && (
              <div className="h-64 rounded-2xl border-2 border-dashed border-slate-200/90 bg-white/40 flex flex-col items-center justify-center text-center p-6 space-y-2">
                <div className="w-10 h-10 rounded-full bg-sky-500/12 text-sky-600 flex items-center justify-center font-mono font-bold text-sm">
                  ▶
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Run Tests, AI Verify, or Submit Solution
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                  Click <strong className="text-slate-800">Run</strong> to test cases,{" "}
                  <strong className="text-indigo-700">AI Verify</strong> for Dual-LLM audit, or{" "}
                  <strong className="text-slate-800">Submit</strong> to record your submission.
                </p>
              </div>
            )}

            {/* TAB 1: CONSOLE */}
            {report && !isBusy && rightTab === "output" && (
              <div className="space-y-4">
                {!report.compiled ? (
                  <div className="p-3.5 sm:p-4 rounded-xl bg-rose-50/90 border border-rose-200 space-y-2">
                    <div className="text-xs font-bold text-rose-700">Compilation Error</div>
                    <pre className="whitespace-pre-wrap break-words font-mono text-[11px] text-rose-800 overflow-x-auto leading-relaxed">
                      {report.compileError}
                    </pre>
                  </div>
                ) : (
                  <>
                    <div
                      className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 ${
                        needsHumanReview && humanStatus === "PENDING"
                          ? "bg-amber-50/80 border-amber-200"
                          : isAccepted
                          ? "bg-emerald-50/90 border-emerald-200"
                          : "bg-rose-50/90 border-rose-200"
                      }`}
                    >
                      <div>
                        <div
                          className={`text-sm font-extrabold ${
                            needsHumanReview && humanStatus === "PENDING"
                              ? "text-amber-800"
                              : isAccepted
                              ? "text-emerald-700"
                              : "text-rose-700"
                          }`}
                        >
                          {report.actionType === "run"
                            ? report.allUserTestsPassed
                              ? "Test Suite Passed (Run Only)"
                              : "Test Suite Failed (Run Only)"
                            : needsHumanReview && humanStatus === "PENDING"
                            ? "Pending Human Evaluation"
                            : isAccepted
                            ? "Accepted"
                            : confirmedCount > 0
                            ? `${confirmedCount} Logical Bug Confirmed`
                            : "Wrong Answer"}
                        </div>
                        <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                          {userTestResults.filter((t) => t.passed).length}/{userTestResults.length}{" "}
                          sample &amp; hidden judge cases passed
                        </div>
                      </div>
                      {report.bugs?.length > 0 && (
                        <button
                          onClick={() => setRightTab("bugs")}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-xs font-bold text-sky-700 border border-slate-200 shadow-2xs cursor-pointer"
                        >
                          Inspect Bugs →
                        </button>
                      )}
                    </div>

                    {userTestResults.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1.5">
                          {userTestResults.map((t, idx) => {
                            const isHidden = Boolean(testCases[idx]?.hidden);
                            return (
                              <button
                                key={idx}
                                onClick={() => setActiveCaseIdx(idx)}
                                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer border ${
                                  activeCaseIdx === idx
                                    ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                                    : "bg-white/80 text-slate-600 border-slate-200 hover:bg-white"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    t.passed ? "bg-emerald-400" : "bg-rose-500"
                                  }`}
                                />
                                <span>{isHidden ? `🔒 #${idx + 1}` : `Case ${idx + 1}`}</span>
                              </button>
                            );
                          })}
                        </div>

                        {userTestResults[activeCaseIdx] && (() => {
                          const t = userTestResults[activeCaseIdx];
                          const isHidden = Boolean(testCases[activeCaseIdx]?.hidden);
                          return (
                            <div className="p-3.5 rounded-xl bg-white/85 border border-slate-200/80 space-y-3 font-mono text-xs shadow-2xs">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-slate-500">
                                  {isHidden
                                    ? `Hidden Judge Case #${activeCaseIdx + 1}`
                                    : t.name}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    t.passed
                                      ? "bg-emerald-500/15 text-emerald-700"
                                      : "bg-rose-500/15 text-rose-700"
                                  }`}
                                >
                                  {t.tle ? "TLE" : t.passed ? "PASSED" : "FAILED"}
                                </span>
                              </div>

                              {isHidden && !revealedHiddenCases[activeCaseIdx] ? (
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2.5">
                                  <div className="text-xs font-bold text-slate-700">
                                    🔒 Hidden Test Case #{activeCaseIdx + 1}
                                  </div>
                                  <p className="text-[11px] font-sans text-slate-500 leading-relaxed">
                                    Status:{" "}
                                    <strong
                                      className={
                                        t.passed
                                          ? "text-emerald-700"
                                          : t.tle
                                          ? "text-amber-700"
                                          : "text-rose-700"
                                      }
                                    >
                                      {t.tle
                                        ? "Time Limit Exceeded"
                                        : t.passed
                                        ? "Passed"
                                        : "Wrong Answer"}
                                    </strong>
                                    {!t.passed && !t.tle
                                      ? " — reveal this failing test case to debug your logic."
                                      : " — hidden test details stay locked unless you get a Wrong Answer."}
                                  </p>

                                  {!t.passed && !t.tle && (
                                    <button
                                      onClick={() =>
                                        setRevealedHiddenCases((prev) => ({
                                          ...prev,
                                          [activeCaseIdx]: true,
                                        }))
                                      }
                                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-sans text-xs font-bold shadow-2xs transition cursor-pointer"
                                    >
                                      👁 Reveal Failed Test Case
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <>
                                  {isHidden && (
                                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-sans text-amber-900">
                                      <span>🔓 Unlocked failed hidden case #{activeCaseIdx + 1}</span>
                                      <button
                                        onClick={() =>
                                          setRevealedHiddenCases((prev) => ({
                                            ...prev,
                                            [activeCaseIdx]: false,
                                          }))
                                        }
                                        className="font-semibold underline hover:text-amber-700 cursor-pointer"
                                      >
                                        Hide
                                      </button>
                                    </div>
                                  )}

                                  <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                      Input
                                    </span>
                                    <pre className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-800 whitespace-pre-wrap break-all">
                                      {t.input || "(empty)"}
                                    </pre>
                                  </div>

                                  <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                      Your Output
                                    </span>
                                    <pre
                                      className={`p-2.5 rounded-lg border whitespace-pre-wrap break-all ${
                                        t.passed
                                          ? "bg-emerald-50/70 border-emerald-200/70 text-emerald-800"
                                          : "bg-rose-50/70 border-rose-200/70 text-rose-800"
                                      }`}
                                    >
                                      {t.tle
                                        ? "Time Limit Exceeded (3.0s)"
                                        : t.actual || "(no output)"}
                                    </pre>
                                  </div>

                                  <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                      Expected
                                    </span>
                                    <pre className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/70 text-emerald-800 whitespace-pre-wrap break-all">
                                      {t.expected}
                                    </pre>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {report.staticWarnings && (
                      <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 space-y-1">
                        <div className="text-[11px] font-bold text-amber-800">
                          Compiler Warnings
                        </div>
                        <pre className="whitespace-pre-wrap break-words font-mono text-[11px] text-amber-900 overflow-x-auto">
                          {report.staticWarnings}
                        </pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TAB 2: AI BUGS */}
            {report && !isBusy && rightTab === "bugs" && (
              <div className="space-y-3">
                {!report.bugs ? (
                  <div className="p-6 rounded-xl bg-white/85 border border-slate-200/80 text-center space-y-2 shadow-2xs">
                    <p className="text-xs text-slate-500">
                      AI verification hasn&apos;t run on this code yet.
                    </p>
                    <button
                      onClick={() => executeAction("ai")}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                    >
                      ✦ Run AI Verification
                    </button>
                  </div>
                ) : report.bugs.length === 0 ? (
                  <div className="p-6 rounded-xl bg-white/85 border border-slate-200/80 text-center space-y-1 shadow-2xs">
                    <div className="text-emerald-600 font-bold text-sm">
                      ✓ Clean Logic Verified
                    </div>
                    <p className="text-xs text-slate-500">
                      No edge-case or algorithmic bugs detected.
                    </p>
                  </div>
                ) : (
                  report.bugs.map((bug) => {
                    const isConfirmed = bug.status === "CONFIRMED";
                    return (
                      <div
                        key={bug.id}
                        className={`p-3.5 sm:p-4 rounded-xl border bg-white/90 space-y-3 shadow-2xs ${
                          isConfirmed ? "border-rose-300" : "border-sky-300"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                isConfirmed
                                  ? "bg-rose-600 text-white"
                                  : "bg-sky-500/15 text-sky-700"
                              }`}
                            >
                              {bug.status}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-medium">
                              {bug.category}
                            </span>
                          </div>
                          <button
                            onClick={() => jumpToLine(bug.startLine)}
                            className="text-xs font-mono font-semibold text-sky-600 hover:underline cursor-pointer"
                          >
                            Line {bug.startLine}
                          </button>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900">{bug.title}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">{bug.explanation}</p>

                        {bug.evidence && (
                          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] font-mono text-rose-800 break-words">
                            <strong className="text-rose-700">Counterexample:</strong>{" "}
                            {bug.evidence}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            onClick={() => {
                              setDiffFixCode(bug.suggestedFix);
                              if (isMobile) setMobilePane("code");
                            }}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          >
                            Compare Diff
                          </button>
                          <button
                            onClick={() => {
                              setCode(bug.suggestedFix);
                              setDiffFixCode(null);
                              if (isMobile) setMobilePane("code");
                            }}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-2xs cursor-pointer"
                          >
                            Apply Fix
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 3: AI AUDIT / DUAL LLM */}
            {report && !isBusy && rightTab === "consensus" && (
              report.dualAudit ? (
                <div className="p-3.5 sm:p-4 rounded-xl bg-white/85 border border-slate-200/80 space-y-4 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800">Dual-LLM Consensus</span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono ${
                        report.dualAudit.needsHumanReview
                          ? "bg-amber-500 text-white"
                          : "bg-emerald-500/15 text-emerald-700"
                      }`}
                    >
                      {report.dualAudit.needsHumanReview
                        ? `⚠ ESCALATED (Δ ${report.dualAudit.confidenceDiff}% > 25%)`
                        : `✓ ALIGNED (Δ ${report.dualAudit.confidenceDiff}%)`}
                    </span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-500 font-medium">Primary Judge (120B)</span>
                        <span className="text-sky-600 font-bold">
                          {report.dualAudit.primaryConfidence}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full"
                          style={{ width: `${report.dualAudit.primaryConfidence}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-500 font-medium">Verifier Judge (20B)</span>
                        <span className="text-indigo-600 font-bold">
                          {report.dualAudit.verifierConfidence}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${report.dualAudit.verifierConfidence}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
                    {report.dualAudit.verifierNotes}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-white/85 border border-slate-200/80 text-center space-y-2 shadow-2xs">
                  <p className="text-xs text-slate-500">
                    Run <strong>AI Verify</strong> or <strong>Submit</strong> to generate Dual-LLM
                    consensus metrics.
                  </p>
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </div>
  );
}