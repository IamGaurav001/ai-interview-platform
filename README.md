<p align="center">
  <img src="https://img.shields.io/badge/Status-Live%20in%20Production-brightgreen?style=for-the-badge" alt="Production Status" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Backend" />
  <img src="https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="Frontend" />
  <img src="https://img.shields.io/badge/AI-Google%20Gemini%203.0%20Pro-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="AI Engine" />
  <img src="https://img.shields.io/badge/Database-MongoDB%20%7C%20Redis-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="Database" />
  <img src="https://img.shields.io/badge/Deployed%20On-AWS%20EC2%20%7C%20Vercel-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" alt="Deployment" />
</p>

# 🎯 PrepHire — AI-Powered Interview Preparation Platform

> A production-grade, full-stack SaaS application that conducts **real-time, voice-enabled AI mock interviews** powered by Google Gemini 3.0 Pro. Users upload their resume, and the AI generates personalized interview questions, evaluates answers with multi-dimensional scoring, and provides actionable feedback — simulating a real-world interview experience.

🔗 **Live Demo**: [prephire.co](https://prephire.co)  
🔗 **API Endpoint**: [api.prephire.co](https://api.prephire.co)

---

## 📋 Table of Contents

- [Key Highlights](#-key-highlights)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Core Features](#-core-features)
- [Backend Deep Dive](#-backend-deep-dive)
- [Frontend Deep Dive](#-frontend-deep-dive)
- [AI & ML Pipeline](#-ai--ml-pipeline)
- [Security Implementation (OWASP)](#-security-implementation-owasp)
- [Database Design](#-database-design)
- [Caching Strategy](#-caching-strategy)
- [API Architecture](#-api-architecture)
- [DevOps & CI/CD](#-devops--cicd)
- [Monetization & Payments](#-monetization--payments)
- [Performance Optimizations](#-performance-optimizations)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Future Roadmap](#-future-roadmap)

---

## 🏆 Key Highlights

| Metric | Detail |
|--------|--------|
| **Architecture** | Decoupled monolith with RESTful API, session-based state via Redis |
| **AI Engine** | Google Gemini 3.0 Pro with multi-model fallback chain & API key rotation |
| **Security** | OWASP-compliant — input sanitization, rate limiting, HMAC signature verification |
| **Deployment** | CI/CD via GitHub Actions → AWS EC2 (Backend) + Vercel (Frontend) |
| **Caching** | Redis-backed session management, resume caching, and evaluation memoization |
| **Payments** | Razorpay integration with cryptographic signature verification |
| **Auth** | Firebase Authentication with JWT token verification & disposable email blocking |
| **Validation** | Zod schema validation on every API endpoint |
| **Scalability** | Multi-key API load balancing, exponential backoff, graceful degradation |

---

## 🏗 System Architecture

```
┌─────────────────────────┐       ┌──────────────────────────────────────────┐
│                         │       │           BACKEND (Node.js/Express)      │
│   FRONTEND (React/Vite) │       │                                          │
│                         │  API  │  ┌──────────┐  ┌────────────────────┐    │
│  • Landing Page         │◄─────►│  │  Routes   │──│   Controllers      │    │
│  • Dashboard            │ REST  │  │          │  │                    │    │
│  • Interview Flow       │       │  │ /auth    │  │ • interviewCtrl    │    │
│  • Resume Upload        │       │  │ /user    │  │ • resumeCtrl       │    │
│  • History & Analytics  │       │  │ /interview│ │ • authCtrl         │    │
│  • Settings             │       │  │ /resume  │  │ • monetizationCtrl │    │
│  • Pricing & Payments   │       │  │ /monetize│  │ • userCtrl         │    │
│  • Admin Dashboard      │       │  │ /admin   │  │ • adminCtrl        │    │
│                         │       │  └──────────┘  └────────┬───────────┘    │
│  Auth: Firebase         │       │                         │                │
│  Payments: Razorpay     │       │  ┌──────────────────────┴──────────┐     │
│  Animations: Framer     │       │  │       MIDDLEWARE LAYER          │     │
│  3D: React Three Fiber  │       │  │                                 │     │
│  Charts: Recharts       │       │  │ • Firebase Auth Verification    │     │
│  i18n: react-i18next    │       │  │ • OWASP Input Sanitization      │     │
│                         │       │  │ • Rate Limiting (IP + User)     │     │
└─────────┬───────────────┘       │  │ • Helmet Security Headers       │     │
          │                       │  │ • CORS Policy Enforcement       │     │
          │                       │  │ • Zod Schema Validation         │     │
          │                       │  │ • Eligibility Checks            │     │
     ┌────▼────┐                  │  └─────────────────────────────────┘     │
     │ Vercel  │                  │                                          │
     │  CDN    │                  └──────┬───────────────┬──────────────────┘
     └─────────┘                         │               │
                                         │               │
                                ┌────────▼──┐     ┌──────▼──────┐
                                │  MongoDB   │     │    Redis     │
                                │  Atlas     │     │   (Cache)    │
                                │            │     │              │
                                │ • Users    │     │ • Sessions   │
                                │ • Sessions │     │ • Resumes    │
                                │ • Payments │     │ • Rate Limits│
                                └────────────┘     │ • Eval Cache │
                                                   └──────────────┘
                                         │
                                ┌────────▼──────────┐
                                │  Google Gemini AI  │
                                │                    │
                                │ • gemini-3.0-pro   │
                                │ • gemini-2.0-flash  │
                                │ • gemini-1.5-flash  │
                                │   (fallback chain)  │
                                └────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | Component-based UI with hooks & context API |
| **Vite 7** | Next-gen build tool with HMR for fast development |
| **Tailwind CSS 4** | Utility-first styling with custom design system |
| **Framer Motion** | Production-grade animations & page transitions |
| **React Three Fiber + Three.js** | 3D speaking avatar for immersive interview UX |
| **Recharts** | Interactive data visualizations for performance analytics |
| **React Router v6** | Client-side routing with protected routes |
| **Firebase SDK** | Google/Email auth, email verification |
| **Razorpay SDK** | Client-side payment integration |
| **react-i18next** | Internationalization (multi-language support) |
| **Lucide React** | Modern icon library |
| **react-joyride** | Guided onboarding tours |
| **react-helmet-async** | Dynamic SEO meta tags |
| **Amplitude Analytics** | User behavior tracking |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express 5** | RESTful API server |
| **MongoDB + Mongoose** | Primary database with ODM |
| **Redis** | Session store, caching layer, rate limit tracking |
| **Google Generative AI SDK** | Gemini 3.0 Pro API integration |
| **Firebase Admin SDK** | Server-side token verification |
| **Razorpay SDK** | Server-side payment processing |
| **Zod** | Runtime schema validation |
| **Helmet** | HTTP security headers |
| **express-rate-limit** | IP-based rate limiting |
| **Multer** | File upload handling (resume PDFs) |
| **pdf-parse v2** | PDF text extraction |
| **Cheerio** | HTML parsing for job description URL scraping |
| **Nodemailer** | Transactional emails |
| **bcryptjs** | Password hashing |
| **jsonwebtoken** | JWT token generation & verification |
| **compression** | Response gzip compression |

### DevOps & Infrastructure
| Technology | Purpose |
|-----------|---------|
| **AWS EC2** | Backend hosting with PM2 process manager |
| **Vercel** | Frontend hosting with edge CDN |
| **GitHub Actions** | CI/CD pipeline for automated deployment |
| **PM2** | Process manager with auto-restart & log management |
| **MongoDB Atlas** | Managed database cluster |

---

## ✨ Core Features

### 1. 🎙️ Real-Time Voice-Enabled AI Interviews
- **Voice-first experience** — speak your answers naturally, just like a real interview
- AI-powered **Speech-to-Text** using Gemini 2.0 Flash for real-time transcription
- **3D Speaking Avatar** built with React Three Fiber that lip-syncs and reacts
- **Audio visualizer** provides real-time waveform feedback while speaking
- Supports up to **25 adaptive questions** per session with contextual follow-ups

### 2. 📄 Intelligent Resume Analysis
- Upload PDF resumes → AI extracts and analyzes content
- Generates **5 personalized interview questions** tailored to the candidate's experience
- **Resume history management** — stores up to 3 recent resumes per user
- Redis-cached resume text for fast session creation (1-hour TTL)

### 3. 🧠 Adaptive Interview Engine
- **Multi-level difficulty**: Junior → Mid-Level → Senior → Lead (or Auto-detect)
- **Job Description aware** — paste a JD or provide a URL for targeted questions
- **Cheerio-based JD scraping** — automatically extracts text from job listing URLs
- Covers 7 assessment dimensions: Role Knowledge, Problem-Solving, Strategic Thinking, Best Practices, Experience, Behavioral, and Scenario Analysis
- Contextual follow-up questions based on conversation history stored in Redis

### 4. 📊 Multi-Dimensional Answer Evaluation
- Each answer scored on three axes: **Correctness (0–10)**, **Clarity (0–10)**, **Confidence (0–10)**
- Strict evaluation rubric (default 4–6/10 unless clearly excellent)
- Self-healing evaluation — if AI output is malformed, a repair prompt auto-corrects it
- **Evaluation caching** via Redis (10-minute TTL) to avoid redundant API calls

### 5. 📈 Performance Analytics & History
- **Domain-grouped history** with confidence levels (Strong/Average/Weak)
- **Weak area analysis** via MongoDB aggregation pipelines
- Score trends and formatted timestamps for each session
- Exportable interview history

### 6. 💳 Freemium Monetization Model
- **3 free interviews/month** with automatic monthly reset
- Credit-based system for paid users (1 or 3 interview packs)
- Razorpay payment gateway with **HMAC-SHA256 signature verification**
- **Idempotent payment processing** — prevents double-credit issues
- Full transaction history tracking

### 7. 🛡️ Admin Dashboard
- User management and analytics
- System monitoring and health checks
- Role-based access control (user/admin)

---

## 🔧 Backend Deep Dive

### Server Architecture (`app.js`)
```
Express App
├── Trust Proxy (for reverse proxy/load balancer)
├── CORS (Production-grade with dynamic origin matching)
├── Helmet (Security headers)
├── Compression (gzip responses)
├── Global Rate Limiter (1000 req/15 min)
├── Body Parser (10MB limit)
├── Input Sanitization (OWASP)
├── Parameter Pollution Prevention
├── Static File Serving (/audio)
├── Health Check Endpoint (/health)
│   └── Reports: MongoDB status, Redis status, Uptime
├── API Routes
│   ├── /api/auth      → Registration, Login, Password Reset
│   ├── /api/user      → Profile, Settings, Preferences
│   ├── /api/interview → Start, Next Step, Evaluate, History
│   ├── /api/resume    → Upload, Analyze, Delete, Use Existing
│   ├── /api/monetization → Orders, Payments, Transactions
│   └── /api/admin     → User Management, Analytics
├── Error Handler (Global)
└── Graceful Shutdown (SIGTERM/SIGINT)
    ├── Close HTTP server
    ├── Close MongoDB connection
    └── Close Redis connection
```

### Middleware Pipeline
```
Request → CORS → Helmet → Compression → Rate Limit → Body Parse
       → Sanitization → Parameter Pollution Prevention
       → Firebase Auth (per route) → Zod Validation → Controller → Response
```

### Key Engineering Decisions

#### Multi-Key API Load Balancing
The Gemini API helper implements an enterprise-grade key rotation system:
- **Health tracking** per API key (failure count, cooldown periods, success tracking)
- **Round-robin selection** across healthy keys
- **Exponential backoff** with jitter (30s → 60s → 120s → max 300s cooldown)
- **Auto-recovery** — keys marked unhealthy are restored after 3 consecutive successes
- **Concurrency control** — max 5 concurrent requests to prevent overwhelming the API
- **45-second timeout** wrapper to prevent hanging requests

#### Multi-Model Fallback Chain
```
gemini-3.0-pro-exp (primary)
    ↓ (rate limit / 404)
gemini-2.0-flash (fallback)
    ↓ (rate limit / 404)
gemini-1.5-flash (last resort)
```

#### Interview Session State Machine (Redis)
```
Session Lifecycle:
  START → Redis Hash (session:{userId})
    ├── stage: "started"
    ├── currentQuestion: string
    ├── resumeText: string
    ├── history: JSON array
    ├── questionCount: number
    ├── level: string
    ├── jobRole: string
    └── TTL: 48 hours

  NEXT_STEP → Update history, increment questionCount
  COMPLETE → questionCount >= 12 && INTERVIEW_COMPLETE signal
  FORCED_END → questionCount >= 25
```

---

## 🎨 Frontend Deep Dive

### Page Architecture (22 Pages)
```
src/pages/
├── Landing.jsx          → Marketing landing page
├── Login.jsx            → Firebase Auth (Google + Email/Password)
├── Register.jsx         → User registration with email verification
├── ForgotPassword.jsx   → Password recovery flow
├── VerifyEmail.jsx      → Email verification handler
├── Dashboard.jsx        → User home with stats & quick actions
├── InterviewFlow.jsx    → Main AI interview interface (voice + text)
├── SequentialInterview.jsx → Step-by-step interview mode
├── ResumeUpload.jsx     → PDF upload with drag-and-drop
├── AnswerEvaluation.jsx → Real-time answer scoring display
├── History.jsx          → Domain-grouped interview history
├── Settings.jsx         → User preferences & account management
├── Features.jsx         → Feature showcase page
├── Pricing.jsx          → Subscription plans & payment
├── About.jsx            → Team & mission page
├── Contact.jsx          → Contact form
├── WatchDemo.jsx        → Product demo video
├── AdminDashboard.jsx   → Admin panel (role-restricted)
├── PrivacyPolicy.jsx    → Legal: Privacy policy
├── TermsOfService.jsx   → Legal: Terms of service
├── Refund.jsx           → Legal: Refund policy
└── Shipping.jsx         → Legal: Shipping policy
```

### Component Architecture (19+ Components)
```
src/components/
├── Navbar.jsx              → Responsive navigation with auth state
├── SpeakingAvatar.jsx      → 3D avatar with lip-sync (Three.js)
├── AudioVisualizer.jsx     → Real-time audio waveform
├── AnswerArea.jsx          → Voice recording + text input hybrid
├── QuestionCard.jsx        → Animated question display
├── InterviewSetupModal.jsx → Interview config (role, level, JD)
├── VoiceSettingsModal.jsx  → Voice/audio preferences
├── PricingModal.jsx        → In-app purchase flow
├── ConfirmModal.jsx        → Confirmation dialogs
├── CreditGuard.jsx         → Credit check wrapper
├── ProtectedRoute.jsx      → Auth-gated route wrapper
├── ErrorBoundary.jsx       → React error boundary
├── InterviewTour.jsx       → Onboarding walkthrough
├── SEO.jsx                 → Dynamic meta tags
├── Toast.jsx               → Notification system
├── PageLayout.jsx          → Consistent page wrapper
├── ScrollToTop.jsx         → Route change scroll handler
├── SkipLink.jsx            → Accessibility skip navigation
└── landing/                → Landing page sections
    ├── Hero.jsx            → Animated hero with CTA
    ├── Features.jsx        → Feature grid
    ├── Testimonials.jsx    → User testimonials carousel
    ├── DemoVideo.jsx       → Embedded product demo
    ├── SocialProof.jsx     → Trust signals
    ├── CTA.jsx             → Call-to-action section
    ├── Footer.jsx          → Site footer
    └── ProductHuntBadge.jsx
```

---

## 🤖 AI & ML Pipeline

### Models Used

| Feature | Model | Why This Model |
|---------|-------|----------------|
| Interview Question Generation | `gemini-3.0-pro-exp` | Superior reasoning for context-aware, resume-specific questions |
| Answer Evaluation | `gemini-3.0-pro-exp` | Deep understanding for multi-dimensional scoring |
| Follow-up Question Generation | `gemini-3.0-pro-exp` | Long-context conversation tracking (up to 25 turns) |
| Resume Analysis | `gemini-3.0-pro-exp` | Complex document understanding and skill extraction |
| Speech-to-Text | `gemini-2.0-flash-exp` | Fastest model for real-time audio transcription |

### Prompt Engineering Techniques
- **Structured output enforcement** — JSON-only responses with schema specification
- **Self-healing prompts** — malformed AI output triggers a repair prompt automatically
- **Strict evaluation rubrics** — prevents score inflation with explicit scoring guidelines
- **Context windowing** — full conversation history passed through Redis for coherent follow-ups
- **Level-adaptive prompting** — different system prompts for Junior/Mid/Senior/Lead levels
- **Guard rails** — output validation filters non-evaluation text (e.g., "I understand", "you are")

---

## 🔒 Security Implementation (OWASP)

### Input Sanitization (`middleware/sanitization.js`)
- **Recursive object sanitization** — cleans nested body, query, and params
- **Null byte removal** — prevents C-based system exploits
- **Control character stripping** — removes non-printable characters
- **Prototype pollution prevention** — blocks `__proto__`, `constructor`, `prototype` keys
- **HTML/Script injection defense** — strips `<script>`, `<iframe>`, event handlers, `javascript:` protocol
- **MongoDB ObjectId validation** — regex-based 24-char hex validation
- **Email sanitization** — format validation and normalization
- **URL sanitization** — protocol whitelist (http/https only)
- **Payload size validation** — configurable max request body size

### Rate Limiting (`middleware/rateLimiters.js`)
| Limiter | Scope | Limit | Window |
|---------|-------|-------|--------|
| **Global** | All endpoints | 1,000 requests | 15 minutes |
| **IP-based** | Public endpoints | 100 requests | 15 minutes |
| **User-based** | Authenticated (Redis-backed) | 10 requests | 60 seconds |
| **Strict** | Auth endpoints | 5 requests | 15 minutes |
| **Payment** | Payment creation | 10 requests | 1 hour |
| **Verification** | Payment verification | 20 requests | 15 minutes |
| **Upload** | File uploads | 20 requests | 1 hour |

### Authentication (`middleware/firebaseAuthMiddleware.js`)
- **Firebase Admin SDK** server-side token verification
- **Disposable email blocking** — maintains a blocklist of throwaway email domains
- **Auto user provisioning** — creates MongoDB user on first Firebase login
- **Race condition handling** — catches duplicate key errors from concurrent auth requests
- **Account linking** — links existing email accounts to new Firebase UIDs
- **Token-specific error responses** — distinguishes expired, invalid, and missing tokens

### Payment Security (`controllers/monetizationController.js`)
- **Razorpay HMAC-SHA256** signature verification using `crypto.timingSafeEqual` (prevents timing attacks)
- **Idempotent processing** — checks for existing successful transactions before crediting
- **Whitelist-based plan selection** — prevents price manipulation
- **Zod validation** on all payment request bodies
- **No internal error exposure** in production responses

---

## 💾 Database Design

### MongoDB Collections

#### Users
```javascript
{
  firebaseUid: String (unique, indexed),
  name: String,
  email: String (unique),
  resumeUrl: String,
  resumes: [{                    // Last 3 resumes stored
    text: String,
    fileName: String,
    uploadedAt: Date
  }],
  skills: [String],
  lastLoginAt: Date (indexed),
  usage: {
    freeInterviewsLeft: Number,  // Default: 3, monthly reset
    lastMonthlyReset: Date,
    purchasedCredits: Number     // From Razorpay purchases
  },
  notifications: {
    email: Boolean,
    push: Boolean,
    marketing: Boolean
  },
  hasCompletedOnboarding: Boolean,
  role: Enum["user", "admin"]
}
```

#### InterviewSessions
```javascript
{
  userId: ObjectId (ref: User, indexed),
  domain: String,
  questions: [String],
  answers: [String],
  feedback: Object,              // Multi-dimensional scores
  score: Number (validated),     // Pre-save hook ensures valid number
  timestamps: { createdAt, updatedAt }
}
```

#### Transactions
```javascript
{
  userId: ObjectId (ref: User),
  orderId: String (unique),
  paymentId: String,
  amount: Number,
  currency: String (default: "INR"),
  status: Enum["pending", "success", "failed"],
  creditsAdded: Number,
  planId: String,
  timestamps: { createdAt, updatedAt }
}
```

---

## ⚡ Caching Strategy

### Redis Usage Map

| Key Pattern | Data | TTL | Purpose |
|-------------|------|-----|---------|
| `session:{userId}` | Hash (interview state) | 48 hours | Active interview session |
| `resume:{userId}` | String (resume text) | 1 hour | Fast resume retrieval |
| `eval:{userId}:{domain}:{qHash}:{aHash}` | JSON (feedback + score) | 10 minutes | Avoid re-evaluating same Q&A |
| `ratelimit:user:{userId}:{path}` | Counter | 60 seconds | Per-user rate limiting |

### Cache Hit Optimization
- **Resume caching** eliminates repeated DB reads during multi-question interviews
- **Evaluation memoization** prevents redundant Gemini API calls for identical Q&A pairs
- **Session resumption** — if a user refreshes mid-interview, they resume from Redis state
- **Fail-open design** — if Redis is down, requests continue processing (graceful degradation)

---

## 📡 API Architecture

### RESTful Endpoints

#### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Create new user account |
| POST | `/login` | ❌ | Firebase token login |
| POST | `/forgot-password` | ❌ | Password reset email |

#### Interview (`/api/interview`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/start` | ✅ Firebase | Start new AI interview session |
| POST | `/next` | ✅ Firebase | Submit answer, get follow-up |
| POST | `/evaluate` | ✅ Firebase | Evaluate a single answer |
| POST | `/save-session` | ✅ Firebase | Save complete interview to DB |
| GET | `/history` | ✅ Firebase | Get interview history |
| GET | `/weak-areas` | ✅ Firebase | Get weak area analysis |

#### Resume (`/api/resume`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/upload` | ✅ Firebase | Upload & analyze PDF resume |
| POST | `/use-existing` | ✅ Firebase | Use previously uploaded resume |
| DELETE | `/:id` | ✅ Firebase | Delete a saved resume |

#### Monetization (`/api/monetization`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/create-order` | ✅ Firebase | Create Razorpay order |
| POST | `/verify-payment` | ✅ Firebase | Verify and credit payment |
| GET | `/transactions` | ✅ Firebase | Get payment history |

---

## 🚀 DevOps & CI/CD

### GitHub Actions Pipeline (`.github/workflows/main.yml`)
```yaml
Trigger: Push to main branch
  → Checkout code
  → SSH into AWS EC2 (api.prephire.co)
  → git pull origin main
  → npm install --production
  → PM2 restart (or start if first deploy)
```

### Production Deployment Script (`deploy-backend.sh`)
```
Step 1: Git commit & push to main
Step 2: SSH into EC2
Step 3: Pull latest code
Step 4: Install production dependencies
Step 5: PM2 restart with config save
Step 6: Display app status & recent logs
```

### Infrastructure
- **Backend**: AWS EC2 instance running Ubuntu, managed by PM2
- **Frontend**: Vercel with automatic deployments from Git
- **Database**: MongoDB Atlas (cloud-managed cluster)
- **Cache**: Redis instance

### Health Monitoring
```
GET /health → {
  status: "OK",
  mongo: "Connected",
  redis: "Connected",
  uptime: "1234s",
  timestamp: "2026-03-12T08:00:00Z"
}
```

---

## 💰 Monetization & Payments

### Pricing Model
| Plan | Price | Credits | Implementation |
|------|-------|---------|----------------|
| Free Tier | ₹0 | 3 interviews/month | `usage.freeInterviewsLeft` with monthly auto-reset |
| Starter | ₹19 | 1 interview | Razorpay one-time payment |
| Value Pack | ₹49 | 3 interviews | Razorpay one-time payment |

### Payment Flow
```
Client → Create Order (POST /api/monetization/create-order)
       → Razorpay Checkout Opens
       → User Completes Payment
       → Verify Signature (POST /api/monetization/verify-payment)
           ├── HMAC-SHA256 verification (timing-safe)
           ├── Idempotency check (prevent double-credit)
           ├── Fetch order from Razorpay
           ├── Credit user account
           └── Record transaction
```

---

## ⚡ Performance Optimizations

| Optimization | Implementation | Impact |
|-------------|---------------|--------|
| **Response Compression** | `compression` middleware (gzip) | ~70% reduction in payload size |
| **Redis Evaluation Cache** | 10-min TTL on eval results | Eliminates duplicate AI calls |
| **Resume Caching** | 1-hour Redis cache | Sub-ms resume retrieval |
| **Session Persistence** | Redis Hash with 48h TTL | Instant session resumption |
| **API Key Rotation** | Round-robin with health tracking | 3x effective API throughput |
| **Exponential Backoff** | Up to 10 retries with jitter | Handles API rate limiting gracefully |
| **Request Timeout** | 45-second Promise.race wrapper | Prevents indefinite hangs |
| **Lazy Loading** | React component-level code splitting | Faster initial page load |
| **Static Asset CDN** | Vercel Edge Network | Global low-latency delivery |
| **Graceful Shutdown** | SIGTERM/SIGINT handlers | Zero-downtime deployments |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Redis (local or cloud)
- Google Cloud Project with Gemini API access
- Firebase project (for authentication)
- Razorpay account (for payments, optional)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/IamGaurav001/ai-interview-platform.git
   cd ai-interview-platform
   ```

2. **Backend Setup**
   ```bash
   cd ai-interview-platform-backend
   npm install

   # Configure environment
   cp .env.example .env
   # Edit .env with your credentials (see Environment Variables section)

   npm run dev    # Development (with nodemon hot-reload)
   npm start      # Production
   ```

3. **Frontend Setup**
   ```bash
   cd ai-interview-platform-frontend
   npm install

   cp .env.example .env
   # Edit .env with your Firebase & API config

   npm run dev    # Development server (localhost:5173)
   npm run build  # Production build
   ```

---

## 🔐 Environment Variables

### Backend (`.env`)
```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://...

# Cache
REDIS_URL=redis://...

# AI Engine
GEMINI_API_KEY=key1,key2,key3    # Comma-separated for load balancing

# Authentication
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
JWT_SECRET=...

# Payments
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

# CORS
ALLOWED_ORIGINS=https://prephire.co,https://www.prephire.co
FRONTEND_URL=https://prephire.co

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

---

## 📁 Project Structure

```
ai-interview-platform/
├── .github/
│   └── workflows/
│       └── main.yml                 # CI/CD: Auto-deploy to EC2
├── ai-interview-platform-backend/
│   ├── app.js                       # Express server entry point
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   ├── redis.js                 # Redis client setup
│   │   └── firebaseAdmin.js         # Firebase Admin SDK init
│   ├── controllers/
│   │   ├── interviewController.js   # Core AI interview logic (1650+ lines)
│   │   ├── resumeController.js      # Resume upload & analysis
│   │   ├── authController.js        # Authentication flows
│   │   ├── monetizationController.js# Payment processing
│   │   ├── userController.js        # User profile management
│   │   └── adminController.js       # Admin operations
│   ├── middleware/
│   │   ├── firebaseAuthMiddleware.js# Token verification
│   │   ├── sanitization.js          # OWASP input sanitization
│   │   ├── rateLimiters.js          # Multi-tier rate limiting
│   │   ├── rateLimiter.js           # Base rate limiter
│   │   ├── checkEligibility.js      # Credit verification
│   │   ├── authMiddleware.js        # JWT auth
│   │   ├── adminMiddleware.js       # Admin role check
│   │   └── errorMiddleware.js       # Global error handler
│   ├── models/
│   │   ├── User.js                  # User schema with usage tracking
│   │   ├── InterviewSession.js      # Interview data schema
│   │   └── Transaction.js           # Payment transaction schema
│   ├── routes/
│   │   ├── interviewRoutes.js       # Interview API routes
│   │   ├── resumeRoutes.js          # Resume API routes
│   │   ├── authRoutes.js            # Auth API routes
│   │   ├── monetizationRoutes.js    # Payment API routes
│   │   ├── userRoutes.js            # User API routes
│   │   └── adminRoutes.js           # Admin API routes
│   ├── utils/
│   │   ├── geminiHelper.js          # Multi-key AI engine with fallbacks
│   │   ├── geminiSTT.js            # Speech-to-text service
│   │   ├── aiHelper.js              # Feedback parsing utilities
│   │   ├── parseFeedback.js         # JSON extraction from AI output
│   │   ├── emailTransporter.js      # SMTP email client
│   │   └── disposableDomains.js     # Throwaway email blocklist
│   ├── validators/
│   │   ├── interviewValidators.js   # Zod schemas for interview API
│   │   ├── resumeValidators.js      # Zod schemas for resume API
│   │   ├── monetizationValidators.js# Zod schemas for payment API
│   │   ├── authValidators.js        # Zod schemas for auth API
│   │   └── userValidators.js        # Zod schemas for user API
│   └── workers/                     # Background job processors
├── ai-interview-platform-frontend/
│   ├── src/
│   │   ├── App.jsx                  # Root component with routing
│   │   ├── main.jsx                 # React DOM entry point
│   │   ├── index.css                # Global styles
│   │   ├── pages/                   # 22 page components
│   │   ├── components/              # 19+ reusable components
│   │   ├── api/                     # API service layer
│   │   ├── context/                 # React Context providers
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── config/                  # App configuration
│   │   ├── utils/                   # Utility functions
│   │   ├── styles/                  # Component-specific styles
│   │   └── assets/                  # Static assets
│   ├── index.html                   # HTML template with SEO
│   ├── vite.config.js               # Vite configuration
│   └── firebase.json                # Firebase hosting config
├── deploy-backend.sh                # Production deployment script
└── README.md                        # This file
```

---

## 🗺 Future Roadmap

- [ ] **WebSocket-based real-time interview** — replace polling with persistent connections
- [ ] **Video interview mode** — webcam-based body language analysis
- [ ] **AI Mentor module** — personalized study plans based on weak areas
- [ ] **Mock interview marketplace** — connect with human interviewers
- [ ] **Company-specific question banks** — FAANG, startup-specific preparation
- [ ] **Multi-language support** — expand i18n beyond English
- [ ] **Mobile app** — React Native cross-platform build
- [ ] **Interview recording & playback** — review past sessions with AI commentary

---

## 👨‍💻 Author

**Gaurav Kumar Dubey**

- GitHub: [@IamGaurav001](https://github.com/IamGaurav001)
- Live Project: [prephire.co](https://prephire.co)

---

## 📜 License

Distributed under the **CC BY 4.0** License. See `LICENSE` for more information.

---

<p align="center">
  <b>Built with ❤️ — Designed, developed, and deployed as a production SaaS application</b>
</p>

