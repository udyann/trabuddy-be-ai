# 🧠 AI Travel Buddy Backend

This is the backend server for the AI Travel Buddy App. It powers user authentication, session-based chat, AI responses (via Gemini API), and audio transcription using Google Cloud Speech-to-Text.

## 🛠 Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL + TypeORM
- **AI Service**: Gemini API (Google)
- **STT**: Google Cloud Speech-to-Text
- **Containerization**: Docker
- **Deployment**: AWS EC2

---

## 📁 Project Structure

```
src/
│
├── auth/             # Signup/Login with JWT
├── chat/             # Chat sessions and message storage
├── ai/               # Gemini API integration
├── speech/           # Google STT processing
├── user/             # User entity & logic
└── app.module.ts     # Main app module
```

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/udyann/trabuddy.git
cd trabuddy
```

### 2. Environment Setup

Create a `.env` file:

```
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
JWT_SECRET=your_jwt_secret
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/google-credentials.json
PORT=3000
```

### 3. Build with Docker

```bash
docker-compose up --build
```

> This starts both the NestJS backend and PostgreSQL container.

---

## 📡 API Overview

| Endpoint              | Method | Description                     | Auth Required |
|-----------------------|--------|----------------------------------|---------------|
| `/auth/signup`        | POST   | Register new user                | ❌            |
| `/auth/login`         | POST   | Login & get JWT                  | ❌            |
| `/auth/checkduplicate`| POST   | Check for username duplicates    | ❌            |
| `/chat/session`       | POST   | Create a new chat session        | ✅            |
| `/chat/:id`           | POST   | Send message, receive AI reply   | ✅            |
| `/chat/history`       | GET    | Fetch all chat sessions by user  | ✅            |
| `/speech/transcribe`  | POST   | Upload audio & get STT result    | ✅            |

---

## 🔐 Authentication

Uses JWT-based guards. Include the token in headers:

```
Authorization: Bearer <your-token>
```

---

## 📦 Deployment Notes

- Be sure to set proper CORS headers on frontend
- Store Google Cloud credentials safely (not in repo)
- Use `.env.production` for production configs

---


