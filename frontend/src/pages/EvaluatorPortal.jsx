import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

export default function EvaluatorPortal({ evaluator, onLogout, onBack }) {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [notes, setNotes] = useState("");
  const [suggestedCode, setSuggestedCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectTicket = (t) => {
    setSelectedTicket(t);
    setNotes(t.evaluatorNotes || "");
    setSuggestedCode(t.suggestedCode || t.code || "");
  };

  const loadTickets = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/reviews`);
      setTickets(data);
      if (data.length > 0) {
        setSelectedTicket((prev) => {
          const match = prev ? data.find((t) => t.ticketId === prev.ticketId) : null;
          const next = match || data[0];
          setNotes(next.evaluatorNotes || "");
          setSuggestedCode(next.suggestedCode || next.code || "");
          return next;
        });
      }
    } catch (err) {
      console.error("Failed to load review queue:", err.message);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleResolve = async (decision) => {
    if (!selectedTicket || submitting) return;
    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/reviews/${selectedTicket.ticketId}/resolve`,
        {
          decision,
          evaluatorNotes: notes,
          suggestedCode: suggestedCode !== selectedTicket.code ? suggestedCode : "",
          reviewedBy: evaluator?.name || "Senior C++ Evaluator",
        }
      );
      setSelectedTicket(data);
      setTickets((prev) => prev.map((t) => (t.ticketId === data.ticketId ? data : t)));
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      alert(`Submit failed (${err.response?.status || "Network"}): ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = tickets.filter((t) => t.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900 flex flex-col">
      <header className="h-16 px-6 glass-nav flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/80 hover:bg-white text-slate-700 border border-slate-200 cursor-pointer"
          >
            ← Back to Benchmark
          </button>
          <div className="h-4 w-[1px] bg-slate-200" />
          <span className="font-extrabold text-sm md:text-base text-slate-900">
            Human Evaluator Workbench
          </span>
          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 ring-1 ring-amber-500/30">
            {pendingCount} Pending (Δ &gt; 25%)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 hidden sm:inline">
            Signed in as <strong className="text-slate-800">{evaluator?.email}</strong>
          </span>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 border border-rose-500/25 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl w-full mx-auto p-6 grid grid-cols-12 gap-5 flex-1">
        <aside className="col-span-12 md:col-span-4 glass-panel rounded-2xl p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-7rem)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Escalated Queue ({tickets.length})
            </span>
            <button
              onClick={loadTickets}
              className="text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
            >
              Refresh
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No submissions have exceeded the 25% AI confidence gap yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {tickets.map((t) => (
                <button
                  key={t.ticketId}
                  onClick={() => selectTicket(t)}
                  className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer space-y-1.5 ${
                    selectedTicket?.ticketId === t.ticketId
                      ? "bg-white border-sky-400 shadow-sm"
                      : "bg-white/60 hover:bg-white/90 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-slate-500">
                      {t.ticketId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                        t.status === "PENDING"
                          ? "bg-amber-500/15 text-amber-800"
                          : t.status === "ACCEPTED"
                          ? "bg-emerald-500/15 text-emerald-700"
                          : "bg-rose-500/15 text-rose-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 truncate">
                    {t.problemTitle}
                  </div>
                  <div className="text-[11px] font-mono text-rose-600 font-semibold">
                    Confidence Gap: Δ {t.dualAudit?.confidenceDiff}%
                  </div>
                </button>
              ))}
            </div>
          )}
        </aside>

        <main className="col-span-12 md:col-span-8 glass-panel rounded-2xl p-5 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-7rem)]">
          {!selectedTicket ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              Select an escalated submission from the left queue to review.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                <div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {selectedTicket.ticketId} • {new Date(selectedTicket.createdAt).toLocaleString()}
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900">
                    {selectedTicket.problemTitle}
                  </h2>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-sky-500/12 text-sky-700 font-bold">
                    Model A: {selectedTicket.dualAudit?.primaryConfidence}%
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/12 text-indigo-700 font-bold">
                    Model B: {selectedTicket.dualAudit?.verifierConfidence}%
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-800 font-bold">
                    Δ {selectedTicket.dualAudit?.confidenceDiff}%
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900">
                <strong>AI Audit Disagreement Note:</strong>{" "}
                {selectedTicket.dualAudit?.verifierNotes}
              </div>

              {/* EDITABLE SUGGESTED CODE EDITOR FOR EVALUATOR */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Student Code / Suggested Patch (Edit to send a code suggestion to student)
                  </label>
                  <button
                    type="button"
                    onClick={() => setSuggestedCode(selectedTicket.code)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Reset to Student Original
                  </button>
                </div>
                <div className="h-56 rounded-xl overflow-hidden border border-slate-200 bg-white">
                  <Editor
                    height="100%"
                    defaultLanguage="cpp"
                    theme="vs"
                    value={suggestedCode}
                    onChange={(val) => setSuggestedCode(val || "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  />
                </div>
              </div>

              {/* HUMAN EVALUATOR NOTES & VERDICT */}
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Human Evaluator Suggestion & Feedback
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Write your suggestion or explanation for the student..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                />

                <div className="flex items-center justify-end gap-2.5 pt-1">
                  <button
                    onClick={() => handleResolve("REJECTED")}
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-xs cursor-pointer"
                  >
                    ✕ Reject & Send Suggestion
                  </button>
                  <button
                    onClick={() => handleResolve("ACCEPTED")}
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer"
                  >
                    ✓ Approve & Accept Solution
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}