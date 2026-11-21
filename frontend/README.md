# Hybrid-LLM DSA Debugger (`LogicGuard`)

A full-stack C++ DSA practice, execution, and hybrid AI code verification platform built with **React**, **Monaco Editor**, **Node.js**, **Express**, **MongoDB**, and **Groq SDK**. It pairs deterministic `g++` test execution with Dual-LLM bug detection, confidence-threshold escalation to human evaluators, and per-student submission history.

## Key Features

- **Separate Run, AI Verify & Submit Flows**:
  - **Run (`⌘/Ctrl + Enter`)**: Compiles with `g++ -std=c++20 -O2` and executes visible + hidden test cases for fast feedback without saving a formal submission or marking problems solved.
  - **AI Verify**: Runs Dual-LLM logic and edge-case verification with counterexample evidence and side-by-side `DiffEditor` patch previews.
  - **Submit (`⇧⌘/Ctrl + Shift + Enter`)**: Executes full test judging + Dual-LLM verification, logs attempts to MongoDB `History`, and marks problems solved when all checks pass.
- **Visible & Hidden Test Suites**: Runs public sample test cases and hidden test cases, allowing controlled reveal on failed hidden cases.
- **Dual-LLM Audit & Human Escalation**: Compares primary and verifier LLM confidence scores and escalates to a `ReviewTicket` (`PENDING` / `ACCEPTED` / `REJECTED`) when divergence crosses the threshold.
- **Per-Student Session & History**: Resolves authenticated student `userId` from session storage / Bearer tokens and scopes submission history per student and problem.
- **3-Pane IDE Interface**: Resizable problem, tests, and history sidebar; Monaco C++ editor with diff view; and tabbed output, bugs, and AI audit panels.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Monaco Editor (`@monaco-editor/react`), Axios
- **Backend**: Node.js, Express, Mongoose (MongoDB), Groq SDK
- **Compiler**: `g++` (`C++20`)

## Project Structure

```text
.
├── backend/
│   ├── routes/
│   │   ├── analyze.js          # POST /api/analyze, GET /api/history, GET /api/reviews
│   │   └── auth.js             # Student auth & attachUser middleware
│   ├── analyze.js              # C++ compilation, test runner & Dual-LLM audit
│   ├── models.js               # History & ReviewTicket schemas
│   └── server.js               # Express server & API routes
├── frontend/
│   └── src/
│       └── DebuggerPage.jsx    # 3-pane IDE, Run / AI Verify / Submit & history UI
├── .gitignore
└── README.md
```

## Local Setup

### Prerequisites

Make sure you have the following installed locally:

- **Node.js** (v18+ or v22+ recommended) and **npm**
- **g++** (`C++20` support) for compiling and executing C++ solutions:
  ```bash
  g++ --version
  ```
- **MongoDB** (either a local MongoDB instance or a MongoDB Atlas connection string)
- **Groq API Key** for Dual-LLM bug detection and verification

### 1. Clone the Repository

```bash
git clone https://github.com/Nirmal-blip/hybrid-llm-dsa-debugger.git
cd hybrid-llm-dsa-debugger
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/logicguard
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
```

Start the backend server:

```bash
npm run dev
```

The backend runs at `http://localhost:8000`.

### 3. Frontend Setup

Open a second terminal window:

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_BASE=http://localhost:8000/api
```

Start the frontend development server:

```bash
npm run dev
```

### 4. Verify Local Setup

1. Open the frontend URL shown by Vite (usually `http://localhost:5173`) in your browser.
2. Log in with a student account so `logicguard_student_auth` is active in session/local storage.
3. Open a DSA problem in the debugger, write or seed C++ code, and test **Run**, **AI Verify**, and **Submit** to verify test output, AI audit results, and MongoDB `History` records.

## GitHub Push Setup

Add a `.gitignore` in the root folder before pushing:

```gitignore
node_modules/
dist/
.env
.env.*
*.o
*.out
solution.cpp
temp_exec/
.DS_Store
```

Initialize and push to GitHub:

```bash
git rm -r --cached node_modules backend/node_modules frontend/node_modules .env backend/.env frontend/.env 2>/dev/null || true
git init
git add .
git commit -m "feat: add hybrid-llm-dsa-debugger with run, ai verify, submit, and README"
git branch -M main
git remote add origin https://github.com/Nirmal-blip/hybrid-llm-dsa-debugger.git
git push -u origin main
```

## API Endpoints

- `POST /api/analyze` — Compiles and runs C++ code (`mode: "run" | "ai" | "submit"`), runs AI verification when enabled, and persists `History` when `saveHistory` is true.
- `GET /api/history` — Returns saved `History` records filtered by resolved `userId` and optional `problemId`.
- `GET /api/reviews` & `GET /api/reviews/:ticketId` — Fetches human evaluator review tickets and status updates.