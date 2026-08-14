# 🚀 ScoutSphere

<div align="center">

### Autonomous Multi-Agent Opportunity Discovery & Matching Platform

*Scout smarter. Apply faster. Never miss an opportunity.*

[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)]()
[![Next.js](https://img.shields.io/badge/Next.js-Frontend-black?logo=next.js)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)]()
[![Redis](https://img.shields.io/badge/Redis-Queue-DC382D?logo=redis)]()
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector%20Store-orange)]()
[![Celery](https://img.shields.io/badge/Celery-Task%20Queue-37814A?logo=celery)]()

</div>

---

## 🌟 Overview

ScoutSphere is an AI-powered opportunity discovery platform that automatically scouts the web for:

- 🏆 Hackathons
- 💼 Internships
- 🎓 Scholarships
- 🚀 Fellowships
- 💰 Grants
- 🌍 Competitions

Instead of manually searching dozens of websites, ScoutSphere continuously discovers opportunities, analyzes them using AI agents, and ranks them according to each user's profile.

---

## 🎯 The Problem

Students and early-career professionals spend countless hours:

- Searching multiple platforms
- Comparing eligibility criteria
- Tracking deadlines
- Finding opportunities relevant to their skills

Most opportunities are discovered too late or missed entirely.

---

## 💡 The Solution

ScoutSphere uses an autonomous multi-agent pipeline that:

### 🔍 Scouts Opportunities

Automatically crawls trusted sources and discovers opportunities.

### 🧠 Understands Requirements

Extracts structured information including:

- Title
- Deadline
- Eligibility
- Requirements
- Application Links

### 🎯 Matches Opportunities

Compares opportunity requirements against user profiles using:

- Vector embeddings
- AI-powered similarity scoring
- Profile intelligence

### 📊 Ranks Opportunities

Generates personalized match scores and explanations.

---

# 🏗 Architecture

```text
┌─────────────────────────────┐
│       User Profile          │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│       ChromaDB Vector       │
│         Embeddings          │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│      Matching Engine        │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│    Discovery Dashboard      │
└─────────────────────────────┘


        ▲
        │
        │
┌─────────────────────────────┐
│       Evaluator Agent       │
└─────────────▲───────────────┘
              │
┌─────────────────────────────┐
│       Browser Agent         │
└─────────────▲───────────────┘
              │
┌─────────────────────────────┐
│       Planner Agent         │
└─────────────▲───────────────┘
              │
┌─────────────────────────────┐
│        Seed URLs            │
└─────────────────────────────┘
```

---

# 🤖 Multi-Agent Pipeline

## Planner Agent

Responsible for:

- Managing Seed URLs
- Selecting crawl targets
- Scheduling scouting runs

---

## Browser Agent

Responsible for:

- Crawling websites
- Rendering SPAs
- DOM extraction
- HTML → Markdown conversion

---

## Evaluator Agent

Responsible for:

- Parsing extracted content
- Identifying opportunities
- Extracting structured data
- Generating clean JSON output

---

## Matcher Agent

Responsible for:

- Opportunity scoring
- Semantic similarity search
- Personalized recommendations

---

# ✨ Features

## Phase 1 — Foundation & Infrastructure

- FastAPI Backend
- PostgreSQL Database
- Alembic Migrations
- JWT Authentication
- Redis
- Celery Setup
- ChromaDB Integration
- Next.js Frontend

---

## Phase 2 — Scouting Engine

- Seed URL Management
- Opportunity Discovery
- Browser Automation
- DOM Extraction
- Structured Opportunity Storage
- Celery Background Jobs

---

## Phase 3 — AI Matching

- User Profile Embeddings
- Opportunity Embeddings
- Similarity Search
- Match Scoring Engine
- Discovery Dashboard
- Match Explanations
- Opportunity Recommendations

---

# 🖥 Discovery Dashboard

ScoutSphere provides a personalized opportunity feed with:

- Match Score Analysis
- Opportunity Details
- AI-generated Recommendations
- Profile-aware Ranking
- Smart Filtering

---

# 🛠 Tech Stack

## Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- Celery
- Redis
- ChromaDB

## Frontend

- Next.js 14
- TypeScript
- Tailwind CSS
- Recharts

## AI / Agents

- Playwright
- Sentence Transformers
- ChromaDB
- OpenAI / Groq Compatible

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/ScoutSphere.git
cd ScoutSphere
```

## Backend Setup

```bash
python -m venv .venv

source .venv/bin/activate
# Windows
.venv\Scripts\activate

pip install -r requirements.txt
```

---

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://scoutsphere:password@localhost:5432/scoutsphere

REDIS_URL=redis://localhost:6379/0

JWT_SECRET_KEY=super_secret_key

OPENAI_API_KEY=your_api_key
```

---

## Start Infrastructure

```bash
docker compose up -d
```

---

## Run Migrations

```bash
alembic -c backend/alembic.ini upgrade head
```

---

## Start Backend

```bash
uvicorn backend.api.main:app --reload
```

Swagger Docs:

```text
http://127.0.0.1:8000/docs
```

---

## Start Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

# 📂 Project Structure

```text
ScoutSphere/
│
├── backend/
│   ├── agents/
│   ├── api/
│   ├── core/
│   ├── models/
│   ├── schemas/
│   ├── tasks/
│   └── alembic/
│
├── frontend/
│   ├── app/
│   ├── components/
│   └── lib/
│
├── docker/
│
├── docs/
│
└── README.md
```

---

# 🗺 Roadmap

### ✅ Phase 1 — Foundation

- Authentication
- Database
- Infrastructure
- CI/CD

### ✅ Phase 2 — Scouting Engine

- Planner Agent
- Browser Agent
- Evaluator Agent

### ✅ Phase 3 — Matching Engine

- Vector Search
- Match Scoring
- Discovery Dashboard

### 🚧 Phase 4 — AI Co-Pilot Workspace

- Application Assistant
- Resume Tailoring
- Cover Letter Generation
- Human-in-the-Loop Review

### 🔮 Future

- Email Notifications
- Auto-Apply Agent
- Interview Preparation
- Opportunity Tracking
- Mobile App

---

# 👨‍💻 Contributors

Built as part of the **Sipher Capstone Project**.

- Anubhav Bharadwaj
- ScoutSphere Team

---

# 📜 License

MIT License

---

<div align="center">

### ⭐ If you like ScoutSphere, give it a star!

*Discover opportunities before everyone else.*

</div>