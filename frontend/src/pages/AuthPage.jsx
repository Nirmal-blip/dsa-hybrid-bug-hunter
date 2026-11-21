import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000/api";

export const STUDENT_SESSION_KEY = "logicguard_student_auth";
export const EVALUATOR_SESSION_KEY = "logicguard_evaluator_auth";

export default function AuthPage({ initialRole = "student", onAuthSuccess, onBackHome }) {
  const [role, setRole] = useState(initialRole === "evaluator" ? "evaluator" : "student");
  const [mode, setMode] = useState("login"); // "login" | "register"

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const nextRole = initialRole === "evaluator" ? "evaluator" : "student";
    setRole(nextRole);
    if (nextRole === "evaluator") {
      setMode("login");
    }
    setError("");
  }, [initialRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isRegister = role === "student" && mode === "register";
      const url = isRegister ? `${API_BASE}/auth/register` : `${API_BASE}/auth/login`;

      const payload = isRegister
        ? {
            name: name.trim(),
            email: email.trim(),
            password,
            rollNo: rollNo.trim(),
          }
        : {
            email: email.trim(),
            password,
            role,
          };

      const { data } = await axios.post(url, payload);
      const session = {
        token: data.token,
        ...data.user,
      };

      const storageKey = role === "evaluator" ? EVALUATOR_SESSION_KEY : STUDENT_SESSION_KEY;
      sessionStorage.setItem(storageKey, JSON.stringify(session));
      onAuthSuccess?.(session);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const isEval = role === "evaluator";

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans flex flex-col antialiased selection:bg-zinc-900 selection:text-white">
      {/* TOP BAR */}
      <header className="h-14 px-6 bg-[#fafafa]/95 border-b border-zinc-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackHome}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 transition cursor-pointer"
          >
            ← Home
          </button>
          <div className="h-4 w-[1px] bg-zinc-200" />
          <span className="font-bold text-[15px] tracking-[-0.02em] text-zinc-950">
            LogicGuard
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-400">
            / {isEval ? "evaluator-access" : "student-workspace"}
          </span>
        </div>

        <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">
          C++20 · Dual-LLM · Human-in-the-Loop
        </span>
      </header>

      {/* MAIN SPLIT WORKSPACE */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* LEFT CONTEXT PANE */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono font-medium text-zinc-600 border border-zinc-200 bg-white px-2.5 py-1 rounded">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isEval ? "bg-amber-600" : "bg-emerald-600"
              }`}
            />
            <span>{isEval ? "EVALUATOR AUTHENTICATION" : "PER-STUDENT ISOLATED STATE"}</span>
          </div>

          <h1 className="text-3xl sm:text-[2.25rem] font-extrabold tracking-[-0.03em] text-zinc-950 leading-[1.1]">
            {isEval
              ? "Review escalated submissions with full patch control."
              : "Your code, solved problems, and history—kept strictly yours."}
          </h1>

          <p className="text-sm text-zinc-600 leading-[1.65] max-w-lg">
            {isEval
              ? "Inspect C++ submissions where Dual-LLM confidence diverged by more than 25%, verify edge cases, and return targeted patches or feedback directly to the student debugger."
              : "Signing into your student account scopes your submission history, solved problem progress, and evaluator review tickets to your profile in MongoDB."}
          </p>

          <div className="border border-zinc-200 rounded-lg bg-white divide-y divide-zinc-200 text-xs">
            <div className="p-3.5 flex items-center justify-between">
              <span className="font-mono text-zinc-500">01 / Submissions &amp; History</span>
              <span className="font-semibold text-zinc-900">Scoped by Account</span>
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <span className="font-mono text-zinc-500">02 / Solved Progress</span>
              <span className="font-semibold text-zinc-900">Synced to MongoDB</span>
            </div>
            <div className="p-3.5 flex items-center justify-between">
              <span className="font-mono text-zinc-500">03 / Escalation (&Delta; &gt; 25%)</span>
              <span className="font-semibold text-zinc-900">Evaluator Patch Queue</span>
            </div>
          </div>
        </div>

        {/* RIGHT AUTH CARD */}
        <div className="lg:col-span-6">
          <div className="w-full max-w-md mx-auto rounded-lg border border-zinc-200 bg-white p-6 sm:p-7 shadow-2xs space-y-5">
            {/* ROLE SEGMENTED CONTROL */}
            <div className="grid grid-cols-2 p-1 rounded-md bg-zinc-100 border border-zinc-200 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  setRole("student");
                  setError("");
                }}
                className={`py-2 rounded font-semibold transition cursor-pointer ${
                  !isEval
                    ? "bg-white text-zinc-950 shadow-2xs border border-zinc-200"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("evaluator");
                  setMode("login");
                  setError("");
                }}
                className={`py-2 rounded font-semibold transition cursor-pointer ${
                  isEval
                    ? "bg-white text-zinc-950 shadow-2xs border border-zinc-200"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Evaluator
              </button>
            </div>

            {/* LOGIN / REGISTER TOGGLE FOR STUDENTS */}
            {!isEval && (
              <div className="flex items-center gap-5 border-b border-zinc-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className={`pb-2.5 -mb-[1px] border-b-2 transition cursor-pointer ${
                    mode === "login"
                      ? "border-zinc-950 text-zinc-950"
                      : "border-transparent text-zinc-400 hover:text-zinc-700"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className={`pb-2.5 -mb-[1px] border-b-2 transition cursor-pointer ${
                    mode === "register"
                      ? "border-zinc-950 text-zinc-950"
                      : "border-transparent text-zinc-400 hover:text-zinc-700"
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            <div className="space-y-1">
              <h2 className="text-lg font-extrabold tracking-[-0.02em] text-zinc-950">
                {isEval
                  ? "Evaluator Sign In"
                  : mode === "register"
                  ? "Create Student Account"
                  : "Student Sign In"}
              </h2>
              <p className="text-xs text-zinc-500">
                {isEval
                  ? "Use your registered evaluator account credentials."
                  : mode === "register"
                  ? "Register once to track your personal C++ problem progress."
                  : "Enter your email and password to access your workspace."}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isEval && mode === "register" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono font-semibold text-zinc-600">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full px-3 py-2 rounded-md bg-white border border-zinc-300 focus:border-zinc-950 focus:outline-none text-xs text-zinc-900 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono font-semibold text-zinc-600">
                      Roll / ID
                    </label>
                    <input
                      type="text"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      placeholder="CSE-2026"
                      className="w-full px-3 py-2 rounded-md bg-white border border-zinc-300 focus:border-zinc-950 focus:outline-none text-xs font-mono text-zinc-900 transition"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono font-semibold text-zinc-600">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isEval ? "evaluator@logicguard.dev" : "Your Email"}
                  className="w-full px-3 py-2 rounded-md bg-white border border-zinc-300 focus:border-zinc-950 focus:outline-none text-xs text-zinc-900 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono font-semibold text-zinc-600">
                  Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-md bg-white border border-zinc-300 focus:border-zinc-950 focus:outline-none text-xs font-mono text-zinc-900 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-md bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-semibold tracking-[-0.01em] transition cursor-pointer"
              >
                {loading
                  ? "Authenticating..."
                  : isEval
                  ? "Sign In to Evaluator Queue →"
                  : mode === "register"
                  ? "Create Account & Launch →"
                  : "Sign In to Benchmark →"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}