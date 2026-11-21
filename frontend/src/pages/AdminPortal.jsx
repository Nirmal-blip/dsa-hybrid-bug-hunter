import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FiTerminal,
  FiLogOut,
  FiUsers,
  FiShield,
  FiSearch,
  FiUserPlus,
  FiCheckCircle,
  FiClock,
  FiArrowLeft,
  FiRefreshCw,
} from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";
const ADMIN_API = `${API_BASE}/admin`;
export const ADMIN_SESSION_KEY = "logicguard_admin_session";

function readAdminSession() {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function AdminPortal({ adminUser, onLogin, onLogout, onBack }) {
  const [session, setSession] = useState(() => adminUser || readAdminSession());

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState("students");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    studentsCount: 0,
    evaluatorsCount: 0,
    totalSolvedSubmissions: 0,
  });
  const [students, setStudents] = useState([]);
  const [evaluators, setEvaluators] = useState([]);

  const [evalName, setEvalName] = useState("");
  const [evalEmail, setEvalEmail] = useState("");
  const [evalPassword, setEvalPassword] = useState("");
  const [creatingEval, setCreatingEval] = useState(false);
  const [evalNotice, setEvalNotice] = useState({ type: "", text: "" });

  useEffect(() => {
    if (adminUser?.token) {
      setSession(adminUser);
    }
  }, [adminUser]);

  const fetchOverview = async (activeSession = session) => {
    if (!activeSession?.token) return;
    setLoadingData(true);
    setDataError("");
    try {
      const { data } = await axios.get(`${ADMIN_API}/overview`, {
        headers: { Authorization: `Bearer ${activeSession.token}` },
      });
      setStats(
        data.stats || {
          totalUsers: 0,
          studentsCount: 0,
          evaluatorsCount: 0,
          totalSolvedSubmissions: 0,
        }
      );
      setStudents(Array.isArray(data.students) ? data.students : []);
      setEvaluators(Array.isArray(data.evaluators) ? data.evaluators : []);
    } catch (err) {
      setDataError(err.response?.data?.error || "Failed to load admin data.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (session?.token) {
      fetchOverview(session);
    }
  }, [session?.token]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setLoggingIn(true);
    try {
      const { data } = await axios.post(`${API_BASE}/auth/login`, {
        email: email.trim(),
        password,
        role: "admin",
      });
      const nextSession = {
        token: data.token,
        ...data.user,
      };
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      onLogin?.(nextSession);
    } catch (err) {
      setAuthError(err.response?.data?.error || "Admin login failed.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setSession(null);
    setStudents([]);
    setEvaluators([]);
    onLogout?.();
  };

  const handleCreateEvaluator = async (e) => {
    e.preventDefault();
    if (!session?.token) return;
    setCreatingEval(true);
    setEvalNotice({ type: "", text: "" });
    try {
      const { data } = await axios.post(
        `${ADMIN_API}/evaluators`,
        {
          name: evalName.trim(),
          email: evalEmail.trim(),
          password: evalPassword,
        },
        {
          headers: { Authorization: `Bearer ${session.token}` },
        }
      );
      if (data.evaluator) {
        setEvaluators((prev) => [data.evaluator, ...prev]);
        setStats((prev) => ({
          ...prev,
          totalUsers: prev.totalUsers + 1,
          evaluatorsCount: prev.evaluatorsCount + 1,
        }));
      }
      setEvalName("");
      setEvalEmail("");
      setEvalPassword("");
      setEvalNotice({ type: "success", text: "Evaluator account created." });
    } catch (err) {
      setEvalNotice({
        type: "error",
        text: err.response?.data?.error || "Failed to create evaluator.",
      });
    } finally {
      setCreatingEval(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q) ||
        (s.rollNo || "").toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  const filteredEvaluators = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return evaluators;
    return evaluators.filter(
      (ev) =>
        (ev.name || "").toLowerCase().includes(q) ||
        (ev.email || "").toLowerCase().includes(q)
    );
  }, [evaluators, searchQuery]);

  const formatDate = (val) => {
    if (!val) return "Never";
    try {
      return new Date(val).toLocaleString();
    } catch {
      return String(val);
    }
  };

  if (!session?.token) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col antialiased">
        <header className="h-14 px-6 bg-white/90 backdrop-blur-md border-b border-slate-200/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <FiTerminal className="w-4 h-4 text-sky-400" />
            </div>
            <span className="font-extrabold text-[15px] tracking-[-0.025em] text-slate-950">
              LogicGuard
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              ADMIN
            </span>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition cursor-pointer"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_14px_36px_-14px_rgba(15,23,42,0.08)] space-y-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-sky-700">
                <FiShield className="w-3.5 h-3.5" />
                <span>RESTRICTED ACCESS</span>
              </div>
              <h1 className="text-xl font-extrabold tracking-[-0.025em] text-slate-950">
                Admin Sign In
              </h1>
              <p className="text-xs text-slate-500">
                Sign in to inspect student &amp; evaluator records and manage evaluator accounts.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {authError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[11px] font-mono font-semibold text-slate-600">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@logicguard.dev"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:outline-none text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono font-semibold text-slate-600">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:outline-none text-xs font-mono text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer"
              >
                {loggingIn ? "Authenticating..." : "Sign In"}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col antialiased">
      <header className="sticky top-0 z-30 h-14 px-6 bg-white/90 backdrop-blur-md border-b border-slate-200/90 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <FiTerminal className="w-4 h-4 text-sky-400" />
          </div>
          <span className="font-extrabold text-[15px] tracking-[-0.025em] text-slate-950 truncate">
            LogicGuard
          </span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
            ADMIN
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="hidden md:inline text-xs font-mono text-slate-600">
            {session.email}
          </span>
          <button
            type="button"
            onClick={handleAdminLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-200 transition cursor-pointer"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
          <div className="rounded-xl bg-white border border-slate-200/90 p-4 shadow-2xs">
            <div className="text-[11px] font-mono text-slate-500">STUDENTS</div>
            <div className="text-2xl font-extrabold text-slate-950 mt-1">
              {stats.studentsCount}
            </div>
          </div>
          <div className="rounded-xl bg-white border border-slate-200/90 p-4 shadow-2xs">
            <div className="text-[11px] font-mono text-slate-500">EVALUATORS</div>
            <div className="text-2xl font-extrabold text-sky-700 mt-1">
              {stats.evaluatorsCount}
            </div>
          </div>
          <div className="rounded-xl bg-white border border-slate-200/90 p-4 shadow-2xs">
            <div className="text-[11px] font-mono text-slate-500">SOLVED SUBMISSIONS</div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">
              {stats.totalSolvedSubmissions}
            </div>
          </div>
          <div className="rounded-xl bg-white border border-slate-200/90 p-4 shadow-2xs">
            <div className="text-[11px] font-mono text-slate-500">TOTAL ACCOUNTS</div>
            <div className="text-2xl font-extrabold text-slate-950 mt-1">
              {stats.totalUsers}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-slate-200/90 p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("students")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "students"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:text-slate-950"
              }`}
            >
              <FiUsers className="w-3.5 h-3.5" />
              <span>Students ({students.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("evaluators")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "evaluators"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:text-slate-950"
              }`}
            >
              <FiShield className="w-3.5 h-3.5" />
              <span>Evaluators ({evaluators.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-60">
              <FiSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, roll no..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:outline-none text-xs text-slate-900"
              />
            </div>

            <button
              type="button"
              onClick={() => fetchOverview(session)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition cursor-pointer shrink-0"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {dataError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {dataError}
          </div>
        )}

        {activeTab === "students" ? (
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-mono text-slate-500">
                    <th className="py-3 px-4 font-semibold">Student</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Roll No</th>
                    <th className="py-3 px-4 font-semibold">Solved</th>
                    <th className="py-3 px-4 font-semibold">Registered</th>
                    <th className="py-3 px-4 font-semibold">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/75">
                  {loadingData ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500">
                        Loading student records...
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500">
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => {
                      const solvedArr = Array.isArray(st.solvedProblems)
                        ? st.solvedProblems
                        : [];
                      return (
                        <tr key={st._id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-950">{st.name}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">{st.email}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {st.rollNo || "—"}
                          </td>
                          <td className="py-3.5 px-4 font-mono tabular-nums">
                            <span
                              title={solvedArr.join(", ") || "None"}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]"
                            >
                              <FiCheckCircle className="w-3 h-3" />
                              <span>{solvedArr.length}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                            {formatDate(st.createdAt)}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <FiClock className="w-3 h-3 text-slate-400" />
                              <span>{formatDate(st.lastLoginAt)}</span>
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
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-8 rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-mono text-slate-500">
                      <th className="py-3 px-4 font-semibold">Evaluator</th>
                      <th className="py-3 px-4 font-semibold">Email</th>
                      <th className="py-3 px-4 font-semibold">Created</th>
                      <th className="py-3 px-4 font-semibold">Last Login</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/75">
                    {filteredEvaluators.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-slate-500">
                          No evaluators registered yet.
                        </td>
                      </tr>
                    ) : (
                      filteredEvaluators.map((ev) => (
                        <tr key={ev._id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-950">{ev.name}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">{ev.email}</td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                            {formatDate(ev.createdAt)}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                            {formatDate(ev.lastLoginAt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-950">
                <FiUserPlus className="w-4 h-4 text-sky-600" />
                <span>Add New Evaluator</span>
              </div>

              {evalNotice.text && (
                <div
                  className={`p-2.5 rounded-lg border text-xs font-medium ${
                    evalNotice.type === "error"
                      ? "bg-rose-50 border-rose-200 text-rose-700"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  }`}
                >
                  {evalNotice.text}
                </div>
              )}

              <form onSubmit={handleCreateEvaluator} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono font-semibold text-slate-600">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={evalName}
                    onChange={(e) => setEvalName(e.target.value)}
                    placeholder="Evaluator Name"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:outline-none text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono font-semibold text-slate-600">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={evalEmail}
                    onChange={(e) => setEvalEmail(e.target.value)}
                    placeholder="evaluator@logicguard.dev"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:outline-none text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono font-semibold text-slate-600">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={evalPassword}
                    onChange={(e) => setEvalPassword(e.target.value)}
                    placeholder="Minimum 4 characters"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:outline-none text-xs font-mono text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingEval}
                  className="w-full py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer"
                >
                  {creatingEval ? "Creating..." : "Create Evaluator"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}