import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FiTerminal,
  FiLogOut,
  FiShield,
  FiUsers,
  FiUserPlus,
  FiTrash2,
  FiSearch,
  FiRefreshCw,
  FiArrowLeft,
  FiKey,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";

const API_BASE = "http://localhost:8000/api";
const MAIN_ADMIN_API = `${API_BASE}/main-admin`;
export const MAIN_ADMIN_SESSION_KEY = "logicguard_main_admin_session";

function readMainAdminSession() {
  try {
    const raw = sessionStorage.getItem(MAIN_ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function MainAdminPortal({
  mainAdminUser,
  onLogin,
  onLogout,
  onBack,
}) {
  const [session, setSession] = useState(
    () => mainAdminUser || readMainAdminSession()
  );

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState("admins"); // "admins" | "evaluators" | "students"
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [students, setStudents] = useState([]);

  // Create Admin form state
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  useEffect(() => {
    if (mainAdminUser?.token) setSession(mainAdminUser);
  }, [mainAdminUser]);

  const fetchOverview = async (active = session) => {
    if (!active?.token) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${MAIN_ADMIN_API}/overview`, {
        headers: { Authorization: `Bearer ${active.token}` },
      });
      setAdmins(Array.isArray(data.admins) ? data.admins : []);
      setEvaluators(Array.isArray(data.evaluators) ? data.evaluators : []);
      setStudents(Array.isArray(data.students) ? data.students : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.token) fetchOverview(session);
  }, [session?.token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    try {
      const { data } = await axios.post(`${API_BASE}/auth/login`, {
        email: email.trim(),
        password,
        role: "main_admin",
      });
      const next = { token: data.token, ...data.user };
      sessionStorage.setItem(MAIN_ADMIN_SESSION_KEY, JSON.stringify(next));
      setSession(next);
      onLogin?.(next);
    } catch (err) {
      setLoginError(
        err.response?.data?.error || "Invalid Main Admin credentials."
      );
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(MAIN_ADMIN_SESSION_KEY);
    setSession(null);
    setAdmins([]);
    setEvaluators([]);
    setStudents([]);
    onLogout?.();
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!session?.token) return;
    setCreatingAdmin(true);
    setNotice({ type: "", text: "" });
    try {
      const { data } = await axios.post(
        `${MAIN_ADMIN_API}/admins`,
        {
          name: adminName.trim(),
          email: adminEmail.trim(),
          password: adminPassword,
        },
        { headers: { Authorization: `Bearer ${session.token}` } }
      );
      if (data.admin) {
        setAdmins((prev) => [data.admin, ...prev]);
      }
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("");
      setNotice({ type: "ok", text: "New Admin account created." });
    } catch (err) {
      setNotice({
        type: "err",
        text: err.response?.data?.error || "Failed to create Admin.",
      });
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!session?.token) return;
    try {
      await axios.delete(`${MAIN_ADMIN_API}/admins/${id}`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      setAdmins((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setNotice({
        type: "err",
        text: err.response?.data?.error || "Failed to remove Admin.",
      });
    }
  };

  const filteredAdmins = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter(
      (a) =>
        (a.name || "").toLowerCase().includes(q) ||
        (a.email || "").toLowerCase().includes(q)
    );
  }, [admins, searchQuery]);

  const filteredEvaluators = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return evaluators;
    return evaluators.filter(
      (ev) =>
        (ev.name || "").toLowerCase().includes(q) ||
        (ev.email || "").toLowerCase().includes(q)
    );
  }, [evaluators, searchQuery]);

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

  const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "Never");

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
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              MAIN ADMIN
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
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-700">
                <FiKey className="w-3.5 h-3.5" />
                <span>ROOT CONTROL</span>
              </div>
              <h1 className="text-xl font-extrabold tracking-[-0.025em] text-slate-950">
                Main Admin Sign In
              </h1>
              <p className="text-xs text-slate-500">
                Authenticate as the root administrator to provision and manage Admin accounts.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[11px] font-mono font-semibold text-slate-600">
                  Main Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mainadmin@logicguard.dev"
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
                {loggingIn ? "Signing In..." : "Sign In as Main Admin"}
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
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            MAIN ADMIN
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="hidden md:inline text-xs font-mono text-slate-600">
            {session.email}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-200 transition cursor-pointer"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-6">
        {/* SUMMARY COUNTS */}
        <div className="grid grid-cols-3 gap-4 tabular-nums">
          <div className="rounded-xl bg-white border border-slate-200/90 p-4 shadow-2xs">
            <div className="text-[11px] font-mono text-slate-500">ADMINS</div>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">
              {admins.length}
            </div>
          </div>
          <div className="rounded-xl bg-white border border-slate-200/90 p-4 shadow-2xs">
            <div className="text-[11px] font-mono text-slate-500">EVALUATORS</div>
            <div className="text-2xl font-extrabold text-sky-700 mt-1">
              {evaluators.length}
            </div>
          </div>
          <div className="rounded-xl bg-white border border-slate-200/90 p-4 shadow-2xs">
            <div className="text-[11px] font-mono text-slate-500">STUDENTS</div>
            <div className="text-2xl font-extrabold text-slate-950 mt-1">
              {students.length}
            </div>
          </div>
        </div>

        {/* TABS + SEARCH + REFRESH */}
        <div className="rounded-xl bg-white border border-slate-200/90 p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("admins")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "admins"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:text-slate-950"
              }`}
            >
              <FiKey className="w-3.5 h-3.5" />
              <span>Admins ({admins.length})</span>
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

        {/* TAB 1: ADMINS + CREATE MULTIPLE ADMINS */}
        {activeTab === "admins" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-8 rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-mono text-slate-500">
                      <th className="py-3 px-4 font-semibold">Admin Name</th>
                      <th className="py-3 px-4 font-semibold">Email</th>
                      <th className="py-3 px-4 font-semibold">Last Login</th>
                      <th className="py-3 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/75">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-slate-500">
                          Loading admins...
                        </td>
                      </tr>
                    ) : filteredAdmins.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-slate-500">
                          No admins created yet.
                        </td>
                      </tr>
                    ) : (
                      filteredAdmins.map((adm) => (
                        <tr key={adm._id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-950">
                            {adm.name}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {adm.email}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <FiClock className="w-3 h-3 text-slate-400" />
                              <span>{fmtDate(adm.lastLoginAt || adm.createdAt)}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteAdmin(adm._id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-semibold transition cursor-pointer"
                            >
                              <FiTrash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CREATE ADMIN FORM */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-950">
                <FiUserPlus className="w-4 h-4 text-amber-600" />
                <span>Create New Admin</span>
              </div>

              {notice.text && (
                <div
                  className={`p-2.5 rounded-lg border text-xs font-medium ${
                    notice.type === "err"
                      ? "bg-rose-50 border-rose-200 text-rose-700"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  }`}
                >
                  {notice.text}
                </div>
              )}

              <form onSubmit={handleCreateAdmin} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono font-semibold text-slate-600">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Admin Name"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:outline-none text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono font-semibold text-slate-600">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
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
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Minimum 4 characters"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:outline-none text-xs font-mono text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingAdmin}
                  className="w-full py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer"
                >
                  {creatingAdmin ? "Creating..." : "Create Admin"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: EVALUATORS */}
        {activeTab === "evaluators" && (
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
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
                        No evaluators found.
                      </td>
                    </tr>
                  ) : (
                    filteredEvaluators.map((ev) => (
                      <tr key={ev._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-950">{ev.name}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{ev.email}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {fmtDate(ev.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {fmtDate(ev.lastLoginAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: STUDENTS */}
        {activeTab === "students" && (
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-mono text-slate-500">
                    <th className="py-3 px-4 font-semibold">Student</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Roll No</th>
                    <th className="py-3 px-4 font-semibold">Solved</th>
                    <th className="py-3 px-4 font-semibold">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/75">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => {
                      const solved = Array.isArray(st.solvedProblems)
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
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                              <FiCheckCircle className="w-3 h-3" />
                              <span>{solved.length}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                            {fmtDate(st.lastLoginAt || st.createdAt)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}