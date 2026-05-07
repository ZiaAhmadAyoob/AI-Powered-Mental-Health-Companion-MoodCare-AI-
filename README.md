# MoodCare AI 🧠💙
### Intelligent Multi-Agent Mental Health Companion

<div align="center">

![MoodCare AI Banner](https://img.shields.io/badge/MoodCare-AI%20Powered-blue?style=for-the-badge&logo=brain&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Gemini](https://img.shields.io/badge/Gemini-3.0%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![HuggingFace](https://img.shields.io/badge/HuggingFace-Transformers-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A fully AI-powered mental health companion system built on a multi-agent architecture.**
**Every response, recommendation, prediction, and insight is generated dynamically by real AI — personalized to each user.**

[Features](#-features) • [Architecture](#-system-architecture) • [AI Agents](#-ai-agent-system) • [Installation](#-installation) • [API Docs](#-api-reference) • [Screenshots](#-screenshots) • [Team](#-team)

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [AI Agent System](#-ai-agent-system)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Frontend Pages](#-frontend-pages)
- [AI Models Used](#-ai-models-used)
- [Screenshots](#-screenshots)
- [Testing](#-testing)
- [Known Issues & Fixes](#-known-issues--fixes)
- [Future Roadmap](#-future-roadmap)
- [Team](#-team)
- [License](#-license)

---

## 🌟 Overview

**MoodCare AI** is an advanced, full-stack mental health companion application that goes far beyond a simple chatbot. It is built on a **6-agent artificial intelligence pipeline** where specialized agents work together autonomously — understanding user emotions, remembering past conversations, predicting future mood states, detecting crisis signals, generating behavioral insights, and responding through both text and emotion-aware voice.

Unlike traditional mental health apps that show hardcoded suggestions and generic responses, every single piece of content in MoodCare AI is **generated in real time by AI**, personalized to the specific user based on their emotional history, behavioral patterns, and current state.

The system also features **live facial emotion detection** through the webcam using DeepFace, **voice input and output** using the Web Speech API, **Cognitive Behavioral Therapy (CBT)** thought reframing, and a **trained LSTM neural network** that predicts tomorrow's emotional state from the user's mood history.

> **This project was built as a Final Project for an AI Mega Course**, demonstrating practical, production-level application of large language models, multi-agent systems, machine learning model training, vector databases, real-time emotion detection, and full-stack web development.

---

## 🚨 Problem Statement

Mental health is one of the most underserved areas in healthcare globally. The core barriers are:

- **Cost** — professional therapy is expensive and inaccessible for most
- **Stigma** — many people avoid seeking help due to social pressure
- **Availability** — therapists are not available at 2am when anxiety peaks
- **Personalization** — generic apps offer the same advice to everyone
- **Continuity** — no app remembers what you said last week

**MoodCare AI addresses all five barriers** by providing an intelligent, private, always-available companion that genuinely learns about the user over time and responds with real understanding — not scripted replies.

---

## ✨ Key Features

### 🤖 Core AI Features
| Feature | Description |
|---|---|
| Multi-Agent Orchestration | 6 specialized AI agents work together on every request |
| Real-time Emotion Detection | HuggingFace transformer model detects 7 emotions from text |
| Vector Memory System | FAISS semantic search remembers past conversations |
| LSTM Mood Prediction | Trained neural network predicts tomorrow's emotional state |
| Behavioral Insight Engine | Discovers patterns like "you feel better after journaling" |
| Multi-Level Crisis Detection | 3-signal system with 4 escalation levels |
| CBT Thought Reframing | Detects cognitive distortions and reframes negative thoughts |
| Gemini 3 Integration | Context-aware, personalized AI responses |

### 📸 Multimodal Features
| Feature | Description |
|---|---|
| Live Webcam Emotion Detection | DeepFace analyzes face every 3 seconds in Journal page |
| Voice Input (STT) | Web Speech API transcribes speech in real time |
| Emotion-Aware Voice Output (TTS) | AI speaks back with tone matched to detected emotion |
| Voice Auto-Send | Finalizes and sends message automatically when user stops speaking |

### 📊 Analytics & Tracking
| Feature | Description |
|---|---|
| Mood Analytics Dashboard | Real AI-generated insights and predictions |
| Emotion Calendar | 28-day visual mood history with color coding |
| Stress Level Tracker | Multi-signal weighted stress score (0-100) |
| Week-over-Week Progress | Percentage improvement tracking |
| AI Weekly Summary | Gemini-written personalized weekly emotional recap |

### 🎯 User Experience
| Feature | Description |
|---|---|
| AI Journaling Assistant | Saves entries, detects emotion, generates reflection |
| Guided Breathing Exercise | 4-4-4-4 box breathing with animated UI |
| Gratitude Journal | Dedicated gratitude prompts inside journal |
| Daily Motivation | AI-generated personalized motivational messages |
| Gamification | Streaks, badges, and daily logging rewards |
| Smart Notifications | Contextual reminders based on usage patterns |
| Anonymous Mode | Hides identity from AI interactions for privacy |
| Multi-Language Support | Full English and Urdu translation support |
| Dark / Light Mode | System-aware theme with smooth transitions |
| Mobile Responsive | Hybrid sidebar — full sidebar desktop, hamburger mobile |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                    │
│  Dashboard │ Chat │ Journal │ Mood │ Insights │ Profile │
│   Tailwind CSS │ Axios │ React Router                   │
│    Web Speech API │ WebRTC Webcam │ Recharts            │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP / REST API
┌──────────────────────────▼──────────────────────────────┐
│                   BACKEND (FastAPI)                     │
│  JWT Auth │ CORS │ Pydantic Schemas │ SQLAlchemy ORM    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │              ORCHESTRATOR AGENT                 │    │
│  │   Routes requests → coordinates all agents      │    │
│  └───┬───────┬──────────┬──────────┬───────────────┘    │
│      │       │          │          │                    │
│  ┌───▼──┐ ┌──▼───┐  ┌───▼──┐  ┌────▼──┐  ┌──────────┐   │
│  │Emot. │ │Mem.  │  │Crisis│  │Pred.  │  │ Insight  │   │
│  │Agent │ │Agent │  │Agent │  │Agent  │  │ Agent    │   │
│  └───┬──┘ └──┬───┘  └───┬──┘  └────┬──┘  └────┬─────┘   │
│      │       │          │          │          │         │
│  ┌───▼───────▼──────────▼──────────▼──────────▼────┐    │
│  │                   AI LAYER                      │    │
│  │     Gemini 3.1   │ HuggingFace │ LSTM │ DeepFace│    │
│  └────────────────────────────────────────────────-┘    │
│                                                         │
│  ┌──────────────────┐   ┌───────────────────────────┐   │
│  │  MySQL Database  │   │  FAISS Vector Store       │   │
│  │  Users/Moods/    │   │  Per-user semantic memory │   │
│  │  Chat/Journal/   │   │  embeddings (384-dim)     │   │
│  │  Crisis logs     │   └───────────────────────────┘   │
│  └──────────────────┘                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Agent System

MoodCare AI is built on **6 specialized agents** coordinated by an Orchestrator. Each agent has a single responsibility and communicates its output back to the Orchestrator, which combines everything into one final intelligent response.

### 1. 🎯 Orchestrator Agent
**File:** `backend/services/orchestrator.py`

The central brain of the system. Every user action — chat message, mood log, or journal entry — passes through the Orchestrator first. It determines which agents to activate, passes context between them, builds the Gemini prompt, and assembles the final response.

```
User Input → Orchestrator → [Emotion + Memory + Crisis] → Gemini → Response
                         ↘ [Prediction + Insight] → Dashboard data
```

### 2. 😊 Emotion Agent
**File:** `backend/services/emotion_service.py`
**Model:** `j-hartmann/emotion-english-distilroberta-base` (HuggingFace)

Detects 7 emotions from text in real time: joy, sadness, anger, fear, surprise, disgust, neutral. Returns primary emotion, confidence score, intensity level (low/medium/high), and all 7 emotion scores. For journal entries, analyzes sentence-by-sentence and aggregates for higher accuracy. Also calculates a weighted stress score (0-100) combining fear, anger, sadness, and disgust signals.

### 3. 🧠 Memory Agent
**File:** `backend/services/memory_service.py`
**Model:** `all-MiniLM-L6-v2` (Sentence Transformers) + FAISS

Embeds every message, mood, and journal entry as a 384-dimensional vector and stores it in a per-user FAISS index. On each new message, performs semantic similarity search to retrieve the top 5 most contextually relevant past memories and injects them into the Gemini prompt. This is what enables the AI to say: *"You mentioned work stress last week — how are things now?"*

**Storage:**
- FAISS index: `memory_store/user_{id}.index`
- Metadata: `memory_store/user_{id}.meta`

### 4. 🚨 Crisis Agent
**File:** `backend/services/crisis_service.py`

Uses a 3-signal weighted detection system:

| Signal | Weight | Method |
|---|---|---|
| Keyword patterns | 50% | Regex matching across 3 severity tiers |
| Emotion intensity | 30% | Fear/sadness/anger scores from Emotion Agent |
| Historical pattern | 20% | Count of negative messages in last 7 days |

**4 escalation levels:**

| Level | Score | Frontend Action |
|---|---|---|
| none | 0-39 | Normal response |
| medium | 40-69 | Empathy banner shown |
| high | 70-89 | Banner + breathing suggestion + helpline |
| critical | 90-100 | Crisis modal + disable normal chat + emergency resources |

All crisis events are logged to the `crisis_logs` MySQL table with timestamp, score, and level.

### 5. 🔮 Prediction Agent
**File:** `backend/services/prediction_service.py`
**Model:** Custom LSTM (PyTorch) trained per user

Trains a lightweight 3-layer LSTM neural network on each user's own mood history. Uses a sliding window of 5 days to predict the next day's emotional state. Input features: encoded mood score, stress proxy from chat emotions, daily chat frequency.

- **Trains automatically** every 5th mood log
- **Minimum data required:** 7 mood log entries
- **Output:** predicted mood label + confidence % + stress risk level + Gemini-formatted insight
- **Model stored:** `ml_models/lstm_user_{id}.pt`

### 6. 💡 Insight Agent
**File:** `backend/services/insight_service.py`

Runs 4 pattern analyzers on 30 days of historical data:

| Analyzer | What it finds |
|---|---|
| Time patterns | Best/worst days of week, morning vs evening mood |
| Behavior links | Mood improvement % on journaling days |
| Trigger finder | Peak stress weekday, late-night negative sessions |
| Progress tracker | Week-over-week mood score change % |

Raw statistical findings are passed to Gemini which rewrites them as warm, personal insight statements. Also generates chart data for the frontend mood timeline.

### 7. 📸 Face Emotion Agent
**File:** `backend/services/face_emotion_service.py`
**Model:** DeepFace (pretrained, opencv backend)

Receives a base64 JPEG frame from the frontend webcam every 3 seconds. Decodes it using OpenCV, runs DeepFace emotion analysis, and returns the dominant emotion with confidence score. Used exclusively in the Journal page to enrich context with facial emotion data.

### 8. 🧬 CBT Module
**File:** `backend/services/cbt_service.py`

Detects cognitive distortions in user messages using pattern matching across 4 distortion categories: all-or-nothing thinking, catastrophizing, mind reading, and self-blame. When a distortion is detected, passes the original thought to Gemini with a structured CBT prompt that produces a 3-part response: validation, challenge question, and balanced reframe.

---

## 🛠 Technology Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.10+ | Core language |
| FastAPI | 0.100+ | REST API framework |
| SQLAlchemy | 2.0+ | ORM and database management |
| PyMySQL | Latest | MySQL database connector |
| Pydantic | 2.0+ | Request/response validation |
| python-jose | Latest | JWT token generation and validation |
| passlib[bcrypt] | Latest | Password hashing |
| python-dotenv | Latest | Environment variable management |
| Uvicorn | Latest | ASGI server |

### AI & Machine Learning
| Technology | Version | Purpose |
|---|---|---|
| google-genai | Latest | Gemini 2.0 Flash LLM |
| transformers | 4.30+ | HuggingFace emotion detection model |
| torch | 2.0+ | PyTorch for LSTM model |
| sentence-transformers | Latest | Text embeddings for memory |
| faiss-cpu | Latest | Vector similarity search |
| deepface | Latest | Facial emotion recognition |
| tf-keras | Latest | DeepFace dependency |
| opencv-python | Latest | Image processing for webcam frames |
| scikit-learn | Latest | ML utilities and preprocessing |
| numpy | Latest | Numerical computations |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18+ | UI framework |
| Vite | 5+ | Build tool and dev server |
| Tailwind CSS | 4.0+ | Utility-first styling |
| Axios | Latest | HTTP client |
| React Router | 6+ | Client-side routing |
| Lucide React | Latest | Icon library |
| Recharts | Latest | Chart components |
| Web Speech API | Browser | Voice input and output |
| WebRTC / MediaDevices | Browser | Webcam access |

### Database
| Technology | Purpose |
|---|---|
| MySQL 8.0+ | Primary structured database |
| FAISS | Vector index for semantic memory |
| File system | LSTM model weights (.pt files) |

---

## 📁 Project Structure

```
MoodCare AI/
│
├── Backend/
│   ├── main.py                        # FastAPI app entry point
│   ├── config.py                      # Configuration settings
│   ├── database.py                    # SQLAlchemy engine and session
│   ├── models.py                      # All database models
│   ├── schemas.py                     # Pydantic request/response schemas
│   ├── auth.py                        # JWT authentication dependency
│   ├── requirements.txt               # Python dependencies
│   ├── test_system.py                 # End-to-end agent test suite
│   ├── .env                           # Environment variables (not in git)
│   │
│   ├── routers/
│   │   ├── auth_router.py             # POST /auth/signup, /auth/login
│   │   ├── chat_router.py             # POST /api/chat, GET /api/chat/history
│   │   ├── mood_router.py             # POST /api/mood, GET /api/mood/history
│   │   ├── journal_router.py          # POST /api/journal, GET /api/journal/history
│   │   ├── insights_router.py         # GET /api/insights, GET /api/predict
│   │   ├── user_router.py             # GET/PUT /api/profile
│   │   └── face_router.py             # POST /api/analyze-face
│   │
│   ├── services/
│   │   ├── orchestrator.py            # Central agent coordinator
│   │   ├── emotion_service.py         # HuggingFace emotion detection
│   │   ├── memory_service.py          # FAISS vector memory
│   │   ├── crisis_service.py          # Multi-level crisis detection
│   │   ├── prediction_service.py      # LSTM mood forecasting
│   │   ├── insight_service.py         # Pattern discovery engine
│   │   ├── face_emotion_service.py    # DeepFace webcam analysis
│   │   └── cbt_service.py             # CBT thought reframing
│   │
│   ├── memory_store/                  # FAISS indexes (per user)
│   │   ├── user_1.index
│   │   └── user_1.meta
│   │
│   └── ml_models/                     # Trained LSTM weights (per user)
│       └── lstm_user_1.pt
│
└── Frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── .gitignore
    │
    └── src/
        ├── App.jsx                    # Root router
        ├── main.jsx                   # React entry point
        ├── index.css                  # Global styles + Tailwind
        ├── translations.js            # English / Urdu translations
        │
        ├── context/
        │   └── AppContext.jsx         # Global state (auth, mood, AI state)
        │
        ├── services/
        │   ├── api.js                 # Axios API layer (all endpoints)
        │   └── voiceService.js        # STT + TTS classes
        │
        ├── components/
        │   ├── Layout.jsx             # Main app shell + header
        │   ├── Sidebar.jsx            # Navigation sidebar
        │   ├── ProtectedRoute.jsx     # Auth guard
        │   ├── BreathingExercise.jsx  # Guided breathing modal
        │   ├── FloatingAIActions.jsx  # FAB quick actions
        │   └── WebcamEmotion.jsx      # Live face emotion detector
        │
        └── pages/
            ├── Login.jsx              # Auth page (login + signup)
            ├── Dashboard.jsx          # AI-powered home page
            ├── Chat.jsx               # Voice + text AI chat
            ├── MoodTracker.jsx        # Mood logging with AI feedback
            ├── Journal.jsx            # AI journal + webcam emotion
            ├── Insights.jsx           # Charts + predictions + insights
            ├── Profile.jsx            # User profile management
            └── Settings.jsx           # App preferences
```

---

## ⚙️ Installation & Setup

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- MySQL 8.0 or higher
- Git

### Step 1 — Clone the repository

```bash
git clone https://github.com/ZiaAhmadAyoob/AI-mental-Healthcare-Companion.git
cd AI-mental-Healthcare-Companion
```

### Step 2 — Backend setup

```bash
cd Backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Mac / Linux
source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt
```

### Step 3 — Create MySQL database

```sql
CREATE DATABASE mental_health_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 4 — Configure environment variables

Create a `.env` file in the `Backend/` folder:

```env
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost/mental_health_db
GEMINI_API_KEY=your_gemini_api_key_here
HF_TOKEN=your_huggingface_token_here
SECRET_KEY=your_jwt_secret_key_change_this_in_production
ALGORITHM=HS256
```

### Step 5 — Create database tables

```bash
python -c "from database import engine, Base; import models; Base.metadata.create_all(bind=engine); print('Tables created')"
```

### Step 6 — Run the backend

```bash
uvicorn main:app --reload --port 8000
```

Backend is now running at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### Step 7 — Frontend setup

```bash
cd ../Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend is now running at `http://localhost:5173`

### Step 8 — Run the test suite (optional but recommended)

```bash
cd Backend
python test_system.py
```

Expected output:
```
--------------------------------------------------
TESTING ALL AI AGENTS
--------------------------------------------------
[1] Emotion Agent      PASSED OK
[2] Memory Agent       PASSED OK
[3] Crisis Agent       PASSED OK
[4] Prediction Agent   PASSED OK
[5] Insight Agent      PASSED OK
[6] Orchestrator Chat  PASSED OK
[7] Orchestrator Mood  PASSED OK
[8] Orchestrator Journal PASSED OK
--------------------------------------------------
ALL TESTS PASSED
--------------------------------------------------
```

---

## 🔐 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | MySQL connection string |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `HF_TOKEN` | Yes | HuggingFace API token (for higher rate limits) |
| `SECRET_KEY` | Yes | JWT signing secret (use a long random string) |
| `ALGORITHM` | Yes | JWT algorithm (use HS256) |

**Where to get API keys:**
- Gemini API Key: [Google AI Studio](https://aistudio.google.com/app/apikey)
- HuggingFace Token: [HuggingFace Settings](https://huggingface.co/settings/tokens)

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/auth/signup` | `{name, email, password}` | Register new user |
| POST | `/auth/login` | `{email, password}` | Login, returns JWT token |

### Chat

| Method | Endpoint | Body / Params | Description |
|---|---|---|---|
| POST | `/api/chat` | `{message}` | Send message, runs all agents |
| GET | `/api/chat/history` | `?limit=50` | Get past chat messages |

**Chat response schema:**
```json
{
  "response":       "AI response text",
  "emotion":        "sadness",
  "stress":         72,
  "crisis_level":   "medium",
  "crisis_message": "I'm here with you...",
  "actions":        ["show_empathy_banner"],
  "cbt": {
    "has_distortion": true,
    "distortions":    ["all_or_nothing"],
    "reframe":        "Let's look at this differently..."
  }
}
```

### Mood

| Method | Endpoint | Body / Params | Description |
|---|---|---|---|
| POST | `/api/mood` | `{mood, note}` | Log mood, triggers prediction |
| GET | `/api/mood/history` | `?limit=30` | Get mood history |

### Journal

| Method | Endpoint | Body / Params | Description |
|---|---|---|---|
| POST | `/api/journal` | `{text}` | Save journal, runs emotion + CBT |
| GET | `/api/journal/history` | `?limit=20` | Get past journal entries |

### Insights & Prediction

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/insights` | Get AI insights, patterns, chart data |
| GET | `/api/predict` | Get LSTM mood prediction for tomorrow |

### Face Emotion

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/analyze-face` | `{image: "base64..."}` | Analyze webcam frame with DeepFace |

### Profile

| Method | Endpoint | Body | Description |
|---|---|---|---|
| GET | `/api/profile` | — | Get current user profile |
| PUT | `/api/profile` | `{name, language, ...}` | Update profile |

> All endpoints except `/auth/*` require `Authorization: Bearer <token>` header.

---

## 🗄 Database Schema

```sql
-- Users table
CREATE TABLE users (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    language      VARCHAR(10)  DEFAULT 'en',
    anonymous     TINYINT      DEFAULT 0,
    created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages
CREATE TABLE chat_messages (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    user_id    INT NOT NULL,
    message    TEXT NOT NULL,
    response   TEXT,
    emotion    VARCHAR(50),
    timestamp  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Mood logs
CREATE TABLE mood_logs (
    id      INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    mood    VARCHAR(50) NOT NULL,
    note    TEXT,
    date    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Journal entries
CREATE TABLE journal_entries (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    user_id    INT NOT NULL,
    text       TEXT NOT NULL,
    emotion    VARCHAR(50),
    reflection TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Crisis logs
CREATE TABLE crisis_logs (
    id        INT PRIMARY KEY AUTO_INCREMENT,
    user_id   INT NOT NULL,
    text      VARCHAR(500),
    level     VARCHAR(20),
    score     INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 📱 Frontend Pages

| Page | Route | AI Features |
|---|---|---|
| Login / Signup | `/login` | JWT auth, profile fetch on login |
| Dashboard | `/dashboard` | Real mood from DB, AI insights, LSTM prediction, weekly summary |
| AI Chat | `/chat` | Voice input/output, 6 agents, CBT reframing, crisis detection |
| Mood Tracker | `/mood-tracker` | AI suggestion after logging, prediction trigger |
| Journal | `/journal` | Webcam face emotion, AI reflection, CBT reframe, emotion detection |
| Insights | `/insights` | Mood timeline chart, emotion calendar, pattern insights, prediction card |
| Profile | `/profile` | Avatar upload, AI tone preference, reminder time |
| Settings | `/settings` | Dark mode, language (EN/UR), anonymous mode, notifications |

---

## 🤗 AI Models Used

| Model | Source | Task | When Used |
|---|---|---|---|
| `gemini-3.0-flash` | Google AI | LLM reasoning and generation | Every chat, journal, mood, insight |
| `j-hartmann/emotion-english-distilroberta-base` | HuggingFace | Text emotion classification (7 classes) | Every message and journal entry |
| `all-MiniLM-L6-v2` | Sentence Transformers | Text embeddings (384-dim) | Memory storage and retrieval |
| Custom LSTM | PyTorch (trained per user) | Mood sequence prediction | After 7+ mood logs |
| DeepFace (opencv backend) | DeepFace library | Facial emotion recognition | Journal page webcam |

---

## 📸 Screenshots

```
Dashboard          → Shows AI greeting, real stress score, prediction, insights
Chat               → Full voice conversation with emotion-aware AI responses  
Journal            → Live webcam emotion + text analysis + CBT reframe
Mood Tracker       → Emoji mood selector + AI suggestion after logging
Insights           → Bar chart + calendar + prediction card + weekly summary
```

> Screenshots available in the `/screenshots` folder of this repository.

---

## 🧪 Testing

### Run full agent test suite

```bash
cd Backend
python test_system.py
```

### Test individual endpoints with Swagger UI

```
http://localhost:8000/docs
```

### Verify memory is working

```bash
# After sending a few chat messages, check this folder:
ls Backend/memory_store/
# Should show: user_1.index  user_1.meta
```

### Verify LSTM training

```bash
# After logging mood 7+ times:
ls Backend/ml_models/
# Should show: lstm_user_1.pt
```

### Verify database is receiving data

```sql
SELECT * FROM chat_messages ORDER BY timestamp DESC LIMIT 5;
SELECT * FROM mood_logs ORDER BY date DESC LIMIT 5;
SELECT * FROM crisis_logs ORDER BY timestamp DESC LIMIT 5;
```

---

## 🐛 Known Issues & Fixes

### `UnicodeEncodeError` on Windows terminal
**Cause:** Windows CP1252 encoding cannot print UTF-8 symbols like ✓
**Fix:** Replace `✓` with plain text in `test_system.py`, or run:
```bash
set PYTHONIOENCODING=utf-8
python test_system.py
```

### `google.generativeai` deprecation warning
**Cause:** Old Gemini SDK is deprecated
**Fix:**
```bash
pip uninstall google-generativeai -y
pip install google-genai
```
Then update import in all services:
```python
from google import genai
client = genai.Client(api_key="YOUR_KEY")
```

### DeepFace slow on first run
**Cause:** DeepFace downloads pretrained model weights on first use
**Fix:** First run takes 30-60 seconds. Subsequent runs are fast. No action needed.

### Web Speech API not working in Firefox
**Cause:** Firefox has limited Web Speech API support
**Fix:** Use Chrome or Edge for voice features.

### LSTM prediction returns "no data"
**Cause:** Not enough mood logs yet (minimum 7 required)
**Fix:** Log your mood daily for at least 7 days, then the LSTM will train and predict automatically.

### CORS error on frontend
**Cause:** Backend not running or wrong port
**Fix:** Ensure backend is running on port 8000 and `api.js` has `baseURL: 'http://localhost:8000'`

---

## 🚀 Future Roadmap

- [ ] **Mobile App** — React Native version for iOS and Android
- [ ] **ElevenLabs Integration** — Premium voice synthesis for more natural AI speech
- [ ] **Wearable Integration** — Heart rate and sleep data from smartwatch APIs
- [ ] **Community Feature** — Anonymous peer support with AI moderation
- [ ] **Therapist Dashboard** — Professional view of anonymized patient patterns
- [ ] **Offline Mode** — Local LLM support using Ollama for privacy-first usage
- [ ] **Custom Model Fine-tuning** — Fine-tune emotion model on mental health datasets
- [ ] **Report Generation** — PDF weekly emotional health report
- [ ] **Calendar Integration** — Sync reminders with Google Calendar
- [ ] **Push Notifications** — Smart nudges based on usage patterns

---

## 👥 Team

| Role | Responsibility |
|---|---|
| AI Engineer | Multi-agent system, ML models, Gemini integration |
| Backend Developer | FastAPI, database design, REST API |
| Frontend Developer | React UI, voice features, webcam integration |

> **Built as a Final Project for an AI Mega Course**
> Demonstrating: LLM integration, multi-agent systems, ML model training, vector databases, real-time emotion detection, full-stack development

---

## 📄 License

```
MIT License

Copyright (c) 2026 MoodCare AI Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## ⚠️ Disclaimer

MoodCare AI is an educational and experimental project. It is **not a substitute for professional mental health care**. If you or someone you know is experiencing a mental health crisis, please contact a licensed professional or a crisis helpline immediately.

---

<div align="center">

**Made with 💙 by the MoodCare AI Team**

*"Technology in service of human well-being"*

⭐ Star this repository if it helped you | 🐛 Report issues | 🍴 Fork and contribute

</div># AI-mental-Healthcare-Companion
