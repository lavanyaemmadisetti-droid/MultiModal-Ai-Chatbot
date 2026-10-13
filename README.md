# 🎓 Multimodal AI StudyMate

> **An intelligent, multimodal academic companion powered by Google Gemini AI, React, Vite, Tailwind CSS, Node.js + Express, and Supabase.**
> Transform complex textbook PDFs, lecture slides, mathematical equations, and handwritten notes into interactive Q&A discussions, structured revision summaries, adaptive practice quizzes, and active recall flashcards.

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v8-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-orange.svg)](https://aistudio.google.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Storage-3ECF8E.svg)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Problem Statement

In today's academic landscape, students and researchers are inundated with multimodal study materials:
- **Dense textbooks & lecture slides** laden with charts, architectural diagrams, and intricate flowcharts.
- **Complex mathematical formulas & scientific equations** that traditional text-only AI models fail to parse or explain contextually.
- **Handwritten lecture notes & annotated slides** where vital conceptual clues are embedded in visual layouts rather than plain text.

### The Core Challenges:
1. **Passive Reading Inefficiency**: Students spend hours reading without retention or active self-testing.
2. **Fragmented Workflows**: Learners juggle separate tools for reading PDFs, drafting flashcards, searching definitions, and taking quizzes.
3. **Lack of True Multimodal Comprehension**: Traditional study tools treat documents as flat text strings, stripping out crucial diagrams, mathematical proofs, and visual context.

---

## 💡 The Solution: Multimodal AI StudyMate

**Multimodal AI StudyMate** bridges this gap by unifying multimodal computer vision, document parsing, and generative AI into a cohesive, high-retention learning dashboard.

By leveraging **Google Gemini 2.5 Flash**, StudyMate simultaneously analyzes textual passages and visual diagram structures, giving students an interactive academic assistant that thinks like a private tutor:

```
[ Upload Material ] (PDF / Slide / Image / Notes)
        │
        ├──> [ Supabase Cloud Storage ] (study-materials bucket)
        │
        ├──> [ Google Gemini Multimodal Engine ]
        │         │
        │         ├──> 💬 Multimodal Q&A Tutor (Step-by-step logic & arrows)
        │         ├──> 📑 Smart Summarizer (4 tailored styles + Markdown export)
        │         ├──> 🏆 Adaptive Quiz Engine (MCQs + Scoring + Confetti)
        │         └──> 🗂️ Active Recall Flashcards (3D interactive flip deck)
        │
        └──> [ Supabase PostgreSQL ] (documents, chat_history, summaries, quiz_results)
```

---

## ✨ Key Features

### 1. 📄 Multimodal Document Ingestion
- Upload textbook chapters, lecture slide decks, charts, and handwritten notes (`.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`).
- **Dual-Storage Engine**: Supports direct upload to **Supabase Storage** for large textbooks (bypassing serverless request size limits) as well as fast in-memory parsing.
- Includes pre-loaded sample study materials (*"Introduction to Neural Networks"*) for immediate one-click testing.

### 2. 💬 Multimodal AI Tutor (Interactive Q&A)
- Conversational tutor with contextual memory of the uploaded document.
- **Directional Arrow & Point-Wise Formatting**: Responses are formatted cleanly using directional arrows (`->`), bullet points, and bold conceptual anchors for optimal readability.
- **Citations & References**: Mentions relevant pages, figures, and sections from the source document.
- **Suggested Follow-up Prompts**: Generates 3 intelligent, clickable follow-up questions to promote deeper inquiry.

### 3. 📑 Smart Multi-Style Summarizer
Synthesizes dense study material into 4 distinct learning formats:
- **⚡ Quick TL;DR**: 3-paragraph executive overview for rapid skimming.
- **📖 Detailed Study Guide**: Deep structured breakdown with core definitions, formulas, and real-world analogies.
- **📌 Key Takeaways & Bullets**: High-yield bullet points prioritizing core concepts.
- **📝 Exam Cheat Sheet**: Formulas, definitions, theorems, and cram points.
- **One-Click Markdown Export**: Download generated summaries as clean `.md` files for Notion, Obsidian, or local note-taking.

### 4. 🏆 Adaptive Practice Quiz Engine
- Customizable quiz generation by question count (3, 5, 10) and difficulty (*Easy*, *Medium*, *Hard*).
- Multiple-choice questions (MCQs) with comprehensive conceptual explanations for each option.
- Interactive score tracking and celebratory confetti animations upon completion.
- Quiz results and mastery records saved to Supabase PostgreSQL.

### 5. 🗂️ Active Recall Flashcards
- 3D interactive flip cards with smooth animations.
- Front: Key terms, questions, or conceptual prompts.
- Back: Concise definitions, equations, and memory mnemonics.
- Track mastered cards and shuffle decks for randomized spaced repetition.

### 6. 🔐 Supabase Authentication & Zero-Leak Security
- Secure student authentication (Sign In / Sign Up) powered by **Supabase Auth (JWT)**.
- **Zero Client-Side Secret Exposure**: All Google Gemini API keys and Supabase Service Role keys remain strictly within backend environment variables (`backend/.env`).
- In-memory buffer processing prevents unencrypted file artifacts from persisting on server disk.

---

## 🏗️ Project Architecture & Tech Stack

```
Multimodel-AI-studymate/
├── backend/                       # Node.js & Express REST API
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js             # Environment variable loader
│   │   │   ├── gemini.js          # Google Gemini SDK client & model validation
│   │   │   └── supabase.js        # Supabase Server Client (Service Role & Anon)
│   │   ├── controllers/
│   │   │   ├── chatController.js      # Multimodal Q&A controller & chat history
│   │   │   ├── quizController.js      # Quiz generation, scoring & flashcards
│   │   │   ├── summaryController.js   # Multi-style summarizer & note export
│   │   │   └── uploadController.js    # File ingestion (Multer & Supabase Storage)
│   │   ├── middleware/
│   │   │   ├── errorHandler.js        # Standardized JSON error response handler
│   │   │   └── uploadMiddleware.js    # Multer configuration (PDFs/Images up to 25MB)
│   │   ├── routes/
│   │   │   ├── chatRoutes.js          # POST /api/chat & GET /api/chat/history/:id
│   │   │   ├── quizRoutes.js          # POST /api/quiz/generate, /save-result, /flashcards
│   │   │   ├── summaryRoutes.js       # POST /api/summarize & GET /api/summarize/history/:id
│   │   │   ├── uploadRoutes.js        # POST /upload, POST /upload/supabase, GET /saved
│   │   │   └── index.js               # Main API router & GET /health
│   │   └── server.js                  # Express server entry point & CORS configuration
│   ├── supabase-schema.sql            # Supabase PostgreSQL schema & storage policy
│   ├── vercel.json                    # Backend Vercel Serverless configuration
│   ├── .env.example                   # Backend environment template
│   └── package.json
│
├── frontend/                      # React 19 + Vite + Tailwind CSS v4 SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   └── ChatInterface.jsx   # Interactive Q&A with Markdown & LaTeX
│   │   │   ├── common/
│   │   │   │   ├── AuthModal.jsx       # Student Sign In / Sign Up modal
│   │   │   │   └── ConfigModal.jsx     # Safe setup guide & status inspector
│   │   │   ├── layout/
│   │   │   │   └── Navbar.jsx          # Live connection badges & auth control
│   │   │   ├── quiz/
│   │   │   │   ├── FlashcardDeck.jsx   # 3D interactive flip card deck
│   │   │   │   └── QuizGenerator.jsx   # MCQ quiz engine with confetti
│   │   │   ├── summary/
│   │   │   │   └── SummaryView.jsx     # 4-style summary engine & MD export
│   │   │   └── upload/
│   │   │       └── FileUploadZone.jsx  # Drag & drop upload with preview & samples
│   │   ├── context/
│   │   │   └── StudyContext.jsx        # Global document, auth, and state manager
│   │   ├── services/
│   │   │   ├── api.js                  # REST API client connecting to backend
│   │   │   └── supabase.js             # Client-side Supabase auth & direct upload
│   │   ├── App.jsx                     # Main dashboard layout with React Router
│   │   ├── index.css                   # Tailwind styles, glassmorphism, 3D flip
│   │   └── main.jsx                    # React entry point
│   ├── vercel.json                    # Frontend Vercel SPA routing configuration
│   ├── index.html
│   ├── package.json
│   └── vite.config.js                  # Vite configuration with proxy
│
├── render.yaml                        # 1-Click Render Deployment Blueprint
├── package.json                       # Unified root scripts
└── README.md
```

### Technology Matrix:
| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router DOM v7, Tailwind CSS v4, Lucide React, Canvas Confetti |
| **Backend** | Node.js (v18+), Express.js, Multer, `pdf-parse`, `@google/genai` (Gemini 2.5 Flash) |
| **Database & Cloud Storage** | Supabase (PostgreSQL with RLS), Supabase Storage (`study-materials`) |
| **Authentication** | Supabase Auth (JWT) |
| **Hosting & Deployment** | Frontend on **Vercel**, Backend on **Render** (or Vercel Serverless) |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js** v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** or **pnpm**
- **Google Gemini API Key** ([Get free key at Google AI Studio](https://aistudio.google.com/app/apikey))
- **Supabase Account** ([Sign up at Supabase](https://supabase.com/))

### 2. Clone the Repository
```bash
git clone https://github.com/lavanyaemmadisetti-droid/MultiModal-Ai-Chatbot.git
cd MultiModal-Ai-Chatbot
git checkout deploy
```

### 3. Configure Backend Environment
Navigate to `backend/` and copy `.env.example`:
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env` with your API keys:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
GEMINI_MODEL=gemini-2.5-flash

# Supabase (Optional for local testing, required for cloud persistence)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh...your_service_role_key
SUPABASE_ANON_KEY=eyJh...your_anon_key
SUPABASE_BUCKET=study-materials
```

### 4. Configure Frontend Environment
Navigate to `frontend/` and copy `.env.example`:
```bash
cd ../frontend
cp .env.example .env
```
Edit `frontend/.env`:
```env
VITE_API_BASE_URL=/api
VITE_BACKEND_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...your_anon_key
```

### 5. Install & Run
From the root folder, run:
```bash
# Install dependencies for both projects
npm run install:all

# Start backend server (http://localhost:5000)
npm run dev:backend

# In a separate terminal, start frontend (http://localhost:5173)
npm run dev:frontend
```

---

## 🗄️ Supabase Database & Storage Setup

1. Open your project at [Supabase](https://supabase.com/).
2. Navigate to the **SQL Editor** tab.
3. Copy the entire contents of [`backend/supabase-schema.sql`](backend/supabase-schema.sql) and paste them into the SQL editor.
4. Click **Run**.
   - This automatically creates the tables: `documents`, `chat_history`, `summaries`, and `quiz_results`.
   - Creates the storage bucket `study-materials` with permissive read/write policies for authenticated and anon users.
5. In **Project Settings > API**, copy:
   - **Project URL** -> `SUPABASE_URL` / `VITE_SUPABASE_URL`
   - **anon public key** -> `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`
   - **service_role secret key** -> `SUPABASE_SERVICE_ROLE_KEY` (Backend only)

---

## 🌐 Production Deployment Guide

### Option A: Backend on Render (Recommended for Long Requests & Large Files)

Render provides persistent containers with no 4.5MB serverless limits, making it the ideal host for the Express backend.

#### Method 1: 1-Click Blueprint with `render.yaml`
1. Push your code to GitHub on the `deploy` branch.
2. In the [Render Dashboard](https://dashboard.render.com/), click **New +** -> **Blueprint**.
3. Connect your repository. Render will automatically detect [`render.yaml`](render.yaml).
4. Fill in the secret environment variables (`GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLIENT_URL`).
5. Click **Apply**.

#### Method 2: Manual Web Service
1. In Render, select **New +** -> **Web Service**.
2. Connect your repository:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
3. Add Environment Variables:
   - `PORT`: `5000`
   - `GEMINI_API_KEY`: `your_gemini_api_key`
   - `GEMINI_MODEL`: `gemini-2.5-flash`
   - `SUPABASE_URL`: `https://your-project.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your_service_role_key`
   - `SUPABASE_ANON_KEY`: `your_anon_key`
   - `SUPABASE_BUCKET`: `study-materials`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`

---

### Option B: Backend on Vercel (Serverless Function)

1. In the Vercel Dashboard, click **Add New...** -> **Project**.
2. Select your repository.
3. Set **Root Directory** to `backend`.
4. The included [`backend/vercel.json`](backend/vercel.json) automatically directs all routes to `src/server.js` with edge-level CORS headers.
5. Add Environment Variables in Vercel:
   - `GEMINI_API_KEY`: `your_gemini_api_key`
   - `GEMINI_MODEL`: `gemini-2.5-flash`
   - `SUPABASE_URL`: `https://your-project.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your_service_role_key`
   - `SUPABASE_ANON_KEY`: `your_anon_key`
   - `SUPABASE_BUCKET`: `study-materials`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
6. Click **Deploy**.

> **Note on Large Files on Vercel**: Vercel Serverless has a 4.5MB inbound body limit. StudyMate handles this automatically: files > 4MB are uploaded directly from the browser to Supabase Storage, and the storage path is forwarded to `/upload/supabase`, bypassing the serverless size barrier completely.

---

### Frontend Deployment on Vercel

1. In the Vercel Dashboard, click **Add New...** -> **Project**.
2. Select your repository.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-backend.onrender.com` (or your backend Vercel URL)
   - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your_anon_key`
5. Click **Deploy**.
6. The [`frontend/vercel.json`](frontend/vercel.json) file automatically handles client-side routing rewrites (`/(.*) -> /index.html`) so refreshing deep links like `/quiz` or `/summary` works seamlessly.

---

## 🔌 API Reference

| Method | Endpoint | Description | Payload / Query |
|---|---|---|---|
| `GET` | `/health` or `/api/health` | Health check, Gemini & Supabase live status | None |
| `POST` | `/upload` or `/api/upload` | Upload PDF or image file (up to 25MB) | `multipart/form-data` (`file`) |
| `POST` | `/upload/supabase` | Register file uploaded directly to Supabase Storage | `{ documentId, filename, mimetype, size, storagePath, publicUrl }` |
| `GET` | `/upload/samples` | List preloaded sample study documents | None |
| `GET` | `/upload/saved` | List persisted study documents from Supabase | None |
| `GET` | `/upload/:id` | Retrieve metadata for an uploaded document | None |
| `POST` | `/chat` or `/api/chat` | Multimodal Q&A with conversational context | `{ documentId, question, chatHistory }` |
| `GET` | `/chat/history/:id` | Fetch chat history for document from Supabase | None |
| `POST` | `/summarize` or `/api/summarize`| Generate document summary & persist to DB | `{ documentId, style, focusTopic }` |
| `GET` | `/summarize/history/:id` | Fetch saved summaries from Supabase | None |
| `POST` | `/quiz/generate` | Generate multiple-choice quiz questions | `{ documentId, count, difficulty, focusTopic }` |
| `POST` | `/quiz/save-result` | Save student score and quiz answers to DB | `{ documentId, difficulty, score, totalQuestions, questions }` |
| `GET` | `/quiz/history/:id` | Fetch past quiz scores from Supabase | None |
| `POST` | `/quiz/flashcards` | Generate active recall flashcards | `{ documentId, count, focusTopic }` |

---

## 🎬 3–5 Minute Demo Video Walkthrough Script

Use this structured script when recording your demonstration video:

| Time | Scene | Visuals & Actions | Narration Script |
|---|---|---|---|
| **0:00 - 0:45** | **Introduction & Problem Statement** | Open StudyMate homepage showing light theme UI, "Gemini Active" & "Supabase Live" badges in the navbar. | *"Hello everyone! Welcome to Multimodal AI StudyMate. Students today face a massive challenge: textbooks, slides, and notes are packed with charts, formulas, and visual diagrams that standard text-only study tools can't interpret. StudyMate solves this by pairing Google Gemini 2.5 Flash's multimodal vision engine with a persistent Supabase backend, giving learners an active academic tutor."* |
| **0:45 - 1:30** | **Multimodal Ingestion & Storage** | Click the upload zone. Select a lecture PDF or click the pre-loaded *"Introduction to Neural Networks"* sample. Show document chip appearing with page count and file size. | *"Let's upload our study material. Here, we can upload textbook PDFs, lecture slide decks, or handwritten notes up to 25 megabytes. The document is stored securely in Supabase Storage, and its metadata is indexed into our PostgreSQL database. Notice how seamlessly the document loads into the workspace."* |
| **1:30 - 2:15** | **Multimodal Q&A with Arrows & Logic** | Switch to the **Multimodal Q&A** tab. Type a question: *"Explain how backpropagation works step by step."* Show the generated response with directional arrows (`->`), bullet points, and source citations. Click one of the suggested follow-up prompts. | *"Now let's ask our AI Tutor an in-depth question. Notice the response format: instead of cluttered walls of text, Gemini structures the explanation into clear, sequential steps connected with directional arrows and bold conceptual anchors. It even cites the exact concepts from the document and provides clickable follow-up questions to guide our study session."* |
| **2:15 - 2:45** | **Smart Summarizer & Markdown Export** | Switch to the **Smart Summarizer** tab. Toggle between *Detailed Study Guide* and *Exam Cheat Sheet*. Click **Export Markdown**. | *"Next is the Smart Summarizer. Depending on our goal, we can generate a 3-paragraph Quick TL;DR, an in-depth study guide, high-yield bullet points, or an Exam Cheat Sheet packed with definitions and formulas. With a single click on 'Export Markdown', we can save these notes directly into Notion or Obsidian."* |
| **2:45 - 3:30** | **Adaptive Practice Quiz Engine** | Switch to the **Quiz Generator** tab. Choose 5 questions and Medium difficulty. Click **Generate Practice Quiz**. Answer questions, demonstrate instant feedback with explanations, and view the confetti score screen. | *"To test our retention, let's open the Quiz Generator. We can configure the question count and difficulty. Each question tests conceptual understanding directly from our uploaded materials. When we select an answer, we get immediate feedback explaining why each option is correct or incorrect. Finishing the quiz records our score in Supabase and triggers a celebratory confetti animation."* |
| **3:30 - 4:00** | **Active Recall Flashcards & Architecture Wrap-Up** | Switch to the **Flashcards** tab. Click a card to flip it in 3D. Click "Mastered" to track progress. Show the Sign In modal and GitHub repository. | *"Finally, our Active Recall Flashcards give students interactive 3D flip cards for spaced repetition. Everything is backed by Supabase Auth and database tables, with our Gemini API key safely secured on the backend. Thank you for watching!"* |

---

## 🔒 Security Best Practices

- **Zero Client-Side Secrets**: Your Google Gemini API Key and Supabase Service Role Key are maintained strictly in the Node.js backend environment and never shipped to the client browser.
- **Row Level Security (RLS)**: Database tables utilize Supabase RLS policies to safeguard document and quiz records.
- **In-Memory Buffer Processing**: Uploaded documents are parsed directly from memory buffers, preventing unencrypted temporary files on disk.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
