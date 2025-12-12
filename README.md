# 🚀 PrepHire - Vibe Code Edition

![Project Banner](https://via.placeholder.com/1200x600?text=AI+Interview+Platform+Powered+by+Gemini+3.0+Pro)

> **Winner of the "Vibe Code" Challenge? You decide!**
> Built with ❤️ using Google's **Gemini 3.0 Pro (Experimental)**.

## 🌟 Overview

The **PrepHire** is a next-generation interview preparation tool that goes beyond simple text chat. It creates an **immersive, voice-first interview experience** that feels real.

**Key Features:**
- 🗣️ **Real-Time Voice Interviews**: Talk to the AI just like a real human interviewer.
- 🤖 **Speaking Avatar**: A visual avatar that lip-syncs and reacts to your answers.
- 🧠 **Powered by Gemini 3.0 Pro**: Uses Google's latest reasoning model for deep, context-aware evaluations.
- 📄 **Resume Intelligence**: Upload your PDF resume, and the AI generates custom questions tailored to your experience.
- 🎓 **AI Mentor**: A personalized learning assistant that creates custom study plans.
- 📊 **Detailed Feedback**: Get scored on Clarity, Confidence, and Technical Correctness.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion (for that "Vibe" ✨)
- **Backend**: Node.js, Express
- **AI Engine**: **Google Gemini 3.0 Pro (`gemini-3.0-pro-exp`)**
- **Database**: MongoDB (User data), Redis (Caching & Session Management)
- **Services**: Firebase Auth, Razorpay (Payments)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB
- Redis
- A Google Cloud Project with Gemini API Access

### Installation

1. **Clone the Repo**
   ```bash
   git clone https://github.com/yourusername/ai-interview-platform.git
   cd ai-interview-platform
   ```

2. **Backend Setup**
   ```bash
   cd ai-interview-platform-backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Add your GEMINI_API_KEY and other secrets
   
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../ai-interview-platform-frontend
   npm install
   npm run dev
   ```

4. **Open in Browser**
   - Visit `http://localhost:5173` to start vibing! 🎧

---

## 🤖 AI Models Used

We explicitly leverage the cutting-edge capabilities of **Gemini 3.0 Pro**:

| Feature | Model ID | Why? |
|---------|----------|------|
| **Interview Conductor** | `gemini-3.0-pro-exp` | Superior reasoning for follow-up questions |
| **Resume Analysis** | `gemini-3.0-pro-exp` | Complex document understanding |
| **Speech-to-Text** | `gemini-3.0-pro-exp` | High-accuracy transcription |
| **AI Mentor** | `gemini-3.0-pro-exp` | Long-context planning capabilities |

*Fallback models (`gemini-2.0-flash`, `gemini-1.5-flash`) are implemented for robustness.*

---

## ✨ The "Vibe" Factor

We focused heavily on **User Experience**:
- **Glassmorphism UI**: Modern, sleek interface.
- **Micro-interactions**: Subtle animations using Framer Motion.
- **Audio Visualizers**: Real-time feedback when you speak.
- **Latency Optimization**: Redis caching ensures the AI feels responsive.

---

## 📜 License

Distributed under the **CC BY 4.0** License. See `LICENSE` for more information.

---

*Verified for Google DeepMind "Vibe Code" Competition 2025.*
