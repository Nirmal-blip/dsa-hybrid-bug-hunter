import { useState, useEffect, useMemo } from "react";
import HomePage from "./pages/HomePage.jsx";
import ProblemsPage from "./pages/ProblemsPage.jsx";
import DebuggerPage from "./pages/DebuggerPage.jsx";
import EvaluatorPortal from "./pages/EvaluatorPortal.jsx";
import AdminPortal, { ADMIN_SESSION_KEY } from "./pages/AdminPortal.jsx";
import MainAdminPortal, {
  MAIN_ADMIN_SESSION_KEY,
} from "./pages/MainAdminPortal.jsx";
import AuthPage, {
  STUDENT_SESSION_KEY,
  EVALUATOR_SESSION_KEY,
} from "./pages/AuthPage.jsx";
import { PROBLEM_TOPICS } from "./topics";

const VIEW_KEY = "logicguard_active_view";
const PROBLEM_KEY = "logicguard_selected_problem_id";

function readSession(key) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getSpecialRoute() {
  const cleanPath = window.location.pathname.replace(/\/+$/, "");
  if (cleanPath.endsWith("/main-admin")) return "main_admin";
  if (cleanPath.endsWith("/admin")) return "admin";
  return null;
}

function findProblemById(problemId) {
  if (!problemId) return null;
  for (const topicBlock of PROBLEM_TOPICS) {
    const match = topicBlock.problems.find((p) => p.id === problemId);
    if (match) return { ...match, topic: topicBlock.topic };
  }
  return null;
}

export default function App() {
  const [studentUser, setStudentUser] = useState(() =>
    readSession(STUDENT_SESSION_KEY)
  );
  const [evaluatorUser, setEvaluatorUser] = useState(() =>
    readSession(EVALUATOR_SESSION_KEY)
  );
  const [adminUser, setAdminUser] = useState(() =>
    readSession(ADMIN_SESSION_KEY)
  );
  const [mainAdminUser, setMainAdminUser] = useState(() =>
    readSession(MAIN_ADMIN_SESSION_KEY)
  );

  const initial = useMemo(() => {
    const special = getSpecialRoute();
    if (special) {
      return {
        view: special,
        authRole: "student",
        pendingTarget: "problems",
        problem: null,
      };
    }

    const savedView = sessionStorage.getItem(VIEW_KEY) || "home";
    const savedProblem = findProblemById(sessionStorage.getItem(PROBLEM_KEY));

    if (
      (savedView === "problems" || savedView === "debugger") &&
      !readSession(STUDENT_SESSION_KEY)
    ) {
      return {
        view: "auth",
        authRole: "student",
        pendingTarget: savedView,
        problem: savedProblem,
      };
    }

    if (savedView === "evaluator" && !readSession(EVALUATOR_SESSION_KEY)) {
      return {
        view: "auth",
        authRole: "evaluator",
        pendingTarget: "evaluator",
        problem: savedProblem,
      };
    }

    if (savedView === "debugger" && !savedProblem) {
      return {
        view: "problems",
        authRole: "student",
        pendingTarget: "problems",
        problem: null,
      };
    }

    return {
      view:
        savedView === "admin" || savedView === "main_admin"
          ? "home"
          : savedView,
      authRole: "student",
      pendingTarget: "problems",
      problem: savedProblem,
    };
  }, []);

  const [view, setView] = useState(initial.view);
  const [authRole, setAuthRole] = useState(initial.authRole);
  const [pendingTarget, setPendingTarget] = useState(initial.pendingTarget);
  const [selectedProblem, setSelectedProblem] = useState(initial.problem);

  useEffect(() => {
    const onPopState = () => {
      const special = getSpecialRoute();
      if (special) {
        setView(special);
      } else if (view === "admin" || view === "main_admin") {
        setView("home");
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [view]);

  useEffect(() => {
    if (getSpecialRoute()) return;
    try {
      sessionStorage.setItem(VIEW_KEY, view);
    } catch {
      // ignore
    }
  }, [view]);

  useEffect(() => {
    try {
      if (selectedProblem?.id) {
        sessionStorage.setItem(PROBLEM_KEY, selectedProblem.id);
      } else {
        sessionStorage.removeItem(PROBLEM_KEY);
      }
    } catch {
      // ignore
    }
  }, [selectedProblem]);

  const exitSpecialRoute = () => {
    const cleanPath = window.location.pathname.replace(/\/+$/, "");
    if (cleanPath.endsWith("/main-admin") || cleanPath.endsWith("/admin")) {
      window.history.replaceState({}, "", "/");
    }
    setView("home");
  };

  const handleStudentLogout = () => {
    sessionStorage.removeItem(STUDENT_SESSION_KEY);
    sessionStorage.removeItem(PROBLEM_KEY);
    setStudentUser(null);
    setSelectedProblem(null);
    setView("home");
  };

  const handleEvaluatorLogout = () => {
    sessionStorage.removeItem(EVALUATOR_SESSION_KEY);
    setEvaluatorUser(null);
    setView("home");
  };

  const openStudentFlow = (problem = null) => {
    if (problem) setSelectedProblem(problem);
    const target = problem ? "debugger" : "problems";
    if (studentUser) {
      setView(target);
    } else {
      setAuthRole("student");
      setPendingTarget(target);
      setView("auth");
    }
  };

  const handleTryLiveDemo = () => {
    const demoProblem =
      PROBLEM_TOPICS[0]?.problems.find((p) => p.id === "arr-kadane") ||
      PROBLEM_TOPICS[0]?.problems[0];
    if (!demoProblem) return;
    openStudentFlow({ ...demoProblem, topic: PROBLEM_TOPICS[0].topic });
  };

  const openEvaluatorFlow = () => {
    if (evaluatorUser) {
      setView("evaluator");
    } else {
      setAuthRole("evaluator");
      setPendingTarget("evaluator");
      setView("auth");
    }
  };

  const activeSpecial = getSpecialRoute();
  if (activeSpecial === "main_admin" || view === "main_admin") {
    return (
      <MainAdminPortal
        mainAdminUser={mainAdminUser}
        onLogin={(session) => setMainAdminUser(session)}
        onLogout={() => {
          setMainAdminUser(null);
          exitSpecialRoute();
        }}
        onBack={exitSpecialRoute}
      />
    );
  }

  if (activeSpecial === "admin" || view === "admin") {
    return (
      <AdminPortal
        adminUser={adminUser}
        onLogin={(session) => setAdminUser(session)}
        onLogout={() => {
          setAdminUser(null);
          exitSpecialRoute();
        }}
        onBack={exitSpecialRoute}
      />
    );
  }

  if (view === "auth") {
    return (
      <AuthPage
        initialRole={authRole}
        onBackHome={() => setView("home")}
        onAuthSuccess={(session) => {
          if (session.role === "evaluator") {
            setEvaluatorUser(session);
            setView("evaluator");
          } else {
            setStudentUser(session);
            setView(
              pendingTarget === "debugger" && selectedProblem
                ? "debugger"
                : "problems"
            );
          }
        }}
      />
    );
  }

  if (view === "home") {
    return (
      <HomePage
        studentUser={studentUser}
        evaluatorUser={evaluatorUser}
        onLogoutStudent={handleStudentLogout}
        onStartBenchmark={() => openStudentFlow()}
        onTryLiveDemo={handleTryLiveDemo}
        onOpenEvaluator={openEvaluatorFlow}
        onOpenAuth={(role) => {
          setAuthRole(role);
          setPendingTarget(role === "evaluator" ? "evaluator" : "problems");
          setView("auth");
        }}
      />
    );
  }

  if (view === "debugger" && selectedProblem) {
    return (
      <DebuggerPage
        initialProblem={selectedProblem}
        studentUser={studentUser}
        onBack={() => setView("problems")}
      />
    );
  }

  if (view === "evaluator") {
    return (
      <EvaluatorPortal
        evaluator={evaluatorUser}
        onLogin={(session) => setEvaluatorUser(session)}
        onLogout={handleEvaluatorLogout}
        onBack={() => setView("problems")}
      />
    );
  }

  return (
    <ProblemsPage
      studentUser={studentUser}
      onLogoutStudent={handleStudentLogout}
      onSelectProblem={(problem) => {
        setSelectedProblem(problem);
        setView("debugger");
      }}
      onOpenEvaluator={openEvaluatorFlow}
      onBackHome={() => setView("home")}
    />
  );
}