# 🎓 Multimodal AI StudyMate

> An intelligent, multimodal academic companion powered by **Google Gemini AI**, **React + Vite**, **Tailwind CSS**, and **Node.js + Express**. Upload PDFs and images, ask complex questions, synthesize study notes, and generate interactive quizzes and flashcards.

---

## ✨ Features

- 📄 **Multimodal Document Ingestion**: Upload lecture PDFs, textbook chapters, diagrams, slides, and handwritten notes (PDF, PNG, JPG, WEBP).
- 💬 **Multimodal AI Tutor (Q&A)**: Ask in-depth questions about charts, tables, equations, and text. Gemini provides step-by-step explanations, citations, and clickable suggested follow-up questions.
- 📑 **Smart Document Summarizer**:
  - **⚡ Quick TL;DR**: 3-paragraph executive summary for fast review.
  - **📖 Detailed Study Guide**: Deep structured breakdown with core definitions, formulas, and real-world analogies.
  - **📌 Key Takeaways & Bullets**: High-yield bulleted points.
  - **📝 Exam Cheat Sheet**: Formulas, definitions, and cram points.
  - **Export to Markdown**: Download summaries as `.md` notes with a single click.
- 🏆 **Interactive Practice Quiz**:
  - Configurable question counts (3, 5, 10) and difficulty levels (*Easy*, *Medium*, *Hard*).
  - Immediate visual feedback on answers with detailed conceptual explanations.
  - Scorecard with celebratory confetti animation upon completion.
- 🗂️ **Active Recall Flashcards**:
  - Interactive 3D flip cards for spaced repetition.
  - Track mastered terms and shuffle cards for randomized practice.
- 🛡️ **Zero-Leak Security Architecture**: API keys are stored strictly in the Node.js backend environment (`backend/.env`) and are **never exposed to client-side code**.
- 🚀 **Instant Demo Mode**: Includes pre-loaded study guides (*"Introduction to Neural Networks"*) so you can test all features immediately even before uploading your own documents.

---

## 🏗️ Project Architecture

```
Multimodel-AI-studymate/
├── backend/                  # Node.js & Express REST API
│   ├── src/
│   │   ├── config/
│   │   │   └── gemini.js     # Google Gemini SDK setup & key validation
│   │   ├── controllers/
│   │   │   ├── chatController.js      # Multimodal Q&A controller
│   │   │   ├── quizController.js      # Quiz & Flashcard generator
│   │   │   ├── summaryController.js   # Document summarizer
│   │   │   └── uploadController.js    # File uploads & sample doc provider
│   │   ├── middleware/
│   │   │   ├── errorHandler.js        # Centralized JSON error formatting
│   │   │   └── uploadMiddleware.js    # Multer configuration (PDFs/Images)
│   │   ├── routes/
│   │   │   ├── chatRoutes.js          # POST /api/chat
│   │   │   ├── quizRoutes.js          # POST /api/quiz/generate & /flashcards
│   │   │   ├── summaryRoutes.js       # POST /api/summarize
│   │   │   ├── uploadRoutes.js        # POST /api/upload & GET /api/upload/samples
│   │   │   └── index.js               # Main API router & GET /api/health
│   │   ├── services/
│   │   │   ├── fileService.js         # PDF parsing & memory storage
│   │   │   └── geminiService.js       # Gemini 2.5 Flash API calls & JSON schemas
│   │   └── server.js                  # Express app entry point
│   ├── .env.example                   # Template for backend secrets
│   └── package.json
│
├── frontend/                 # React 19 + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   └── ChatInterface.jsx   # Interactive chat tutor with Markdown
│   │   │   ├── common/
│   │   │   │   └── ConfigModal.jsx     # Safe API key configuration modal
│   │   │   ├── layout/
│   │   │   │   └── Navbar.jsx          # Header with model & connection badges
│   │   │   ├── quiz/
│   │   │   │   ├── FlashcardDeck.jsx   # 3D interactive flip card deck
│   │   │   │   └── QuizGenerator.jsx   # MCQ quiz engine with confetti
│   │   │   ├── summary/
│   │   │   │   └── SummaryView.jsx     # 4-style summary view & export
│   │   │   └── upload/
│   │   │       └── FileUploadZone.jsx  # Drag & drop uploader with previews
│   │   ├── context/
│   │   │   └── StudyContext.jsx        # Global document & active session state
│   │   ├── services/
│   │   │   └── api.js                  # REST API client connecting to backend
│   │   ├── App.jsx                     # Main dashboard layout
│   │   ├── index.css                   # Tailwind styles, glassmorphism, 3D flip
│   │   └── main.jsx                    # React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js                  # Vite config with Tailwind & /api proxy
│
├── .gitignore
├── package.json                        # Root helper scripts
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** or **pnpm** / **yarn**
- **Google Gemini API Key**: [Get a free API key at Google AI Studio](https://aistudio.google.com/app/apikey)

---

## 🚀 Quick Start Guide

### Step 1: Clone or Navigate to the Workspace
```bash
cd Multimodel-AI-studymate
```

### Step 2: Configure Backend Environment Variables
1. Navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *(On Windows PowerShell: `Copy-Item .env.example .env`)*
3. Open `backend/.env` and insert your Gemini API Key:
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
   GEMINI_MODEL=gemini-2.5-flash
   ```

### Step 3: Install Dependencies
Open two terminal windows (or run root helper scripts):

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm run dev
```
*Backend server will start at:* `http://localhost:5000`

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```
*Frontend dev server will start at:* `http://localhost:5173`

---

## 🛠️ Unified Root Scripts

For convenience, you can also run commands from the project root:

```bash
# Install dependencies for both frontend and backend
npm run install:all

# Start backend dev server
npm run dev:backend

# Start frontend dev server
npm run dev:frontend

# Build frontend for production
npm run build:frontend
```

---

## 🗄️ Supabase Cloud Database & Storage Setup

Multimodal AI StudyMate comes with full **Supabase** integration for:
- 📁 **Cloud Storage**: Persistent storage of uploaded PDFs and lecture images in the `study-materials` bucket.
- 🗃️ **PostgreSQL Database**: Persistent document metadata (`documents`), conversational history (`chat_history`), generated notes (`summaries`), and student scores (`quiz_results`).
- ⚡ **Graceful Fallback**: If Supabase credentials are not supplied, the application automatically runs in high-speed in-memory mode without errors.

### 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create or open a project.
2. Under **Project Settings > API**, copy your **Project URL** and **anon public key**.

### 2. Run Database Migration Script
1. In your Supabase Dashboard, open the **SQL Editor**.
2. Open [`backend/supabase-schema.sql`](file:///c:/Users/dell/OneDrive/Documents/Multimodel-AI-studymate/backend/supabase-schema.sql) in your workspace and paste its contents into the Supabase SQL Editor.
3. Click **Run**. This automatically creates all required tables, security policies, and the `study-materials` storage bucket.

### 3. Add Supabase Keys to Environment
In [`backend/.env`](file:///c:/Users/dell/OneDrive/Documents/Multimodel-AI-studymate/backend/.env):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJh...your_anon_key_here
SUPABASE_BUCKET=study-materials
```

*(Optional)* For direct client-side features in [`frontend/.env`](file:///c:/Users/dell/OneDrive/Documents/Multimodel-AI-studymate/frontend/.env):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...your_anon_key_here
```

4. Restart your backend server (`npm run dev:backend`). The Navbar will display **Supabase Live** in green!

---

## 🔌 API Reference

| Method | Endpoint | Description | Payload |
|---|---|---|---|
| `GET` | `/api/health` | Service health, Gemini & Supabase status | None |
| `POST` | `/api/upload` | Upload PDF or image file (25MB max) to Supabase Storage / Memory | `multipart/form-data` (`file`) |
| `GET` | `/api/upload/samples` | List preloaded sample study documents | None |
| `GET` | `/api/upload/saved` | List persisted study documents from Supabase | None |
| `GET` | `/api/upload/:id` | Retrieve metadata for an uploaded document | None |
| `POST` | `/api/chat` | Ask questions with multimodal context & persist chat | `{ documentId, question, chatHistory }` |
| `GET` | `/api/chat/history/:documentId` | Fetch stored chat messages from Supabase | None |
| `POST` | `/api/summarize` | Generate document summary & persist to DB | `{ documentId, style, focusTopic }` |
| `GET` | `/api/summarize/history/:documentId` | Fetch stored summaries from Supabase | None |
| `POST` | `/api/quiz/generate` | Generate MCQs with explanations | `{ documentId, count, difficulty, focusTopic }` |
| `POST` | `/api/quiz/save-result` | Save student quiz score and answers to Supabase | `{ documentId, difficulty, score, totalQuestions, questions }` |
| `GET` | `/api/quiz/history/:documentId` | Fetch past quiz results from Supabase | None |
| `POST` | `/api/quiz/flashcards` | Generate active recall flip cards | `{ documentId, count, focusTopic }` |

### Summary Styles Supported:
- `detailed`: Comprehensive notes, deep explanations, real-world examples.
- `quick`: 3-paragraph executive overview.
- `bullet_points`: High-yield key takeaways and definitions.
- `cheat_sheet`: Formulas, definitions, and cram points.

---

## 🔒 Security Best Practices

- **Zero Client-Side Secrets**: Your Gemini API key and backend service credentials are kept strictly in the Node.js backend environment (`backend/.env`).
- **Standard Supabase Anon Key**: The Supabase anon key uses Row Level Security (RLS) policies and is safe for client applications.
- **Backend Proxy & Validation**: All multimodal files and prompts are validated on the Express server before invoking `@google/genai`.
- **In-Memory Buffer Processing**: Uploaded documents are handled in memory buffers and do not leave orphaned unencrypted files on local disk.

---

## 📄 License
This project is licensed under the MIT License.
