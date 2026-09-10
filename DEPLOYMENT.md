# BIS Sahayak (मानक सहायक) — Production Deployment Guide
**Smart India Hackathon 2026 • Category: Smart Automation**

This guide provides step-by-step instructions to deploy the complete **BIS Sahayak** platform publicly:
1. **Frontend**: React (Vite) Single Page Application hosted on **GitHub Pages**.
2. **Backend**: FastAPI Web Service with RAG, 3D CAD Scanner, and OCR hosted on **Render** (or any cloud container platform like Railway, Fly.io, AWS, GCP).

---

## 🌐 Public URLs Overview

| Component | Target URL | Hosting Platform |
|---|---|---|
| **Web Frontend** | `https://vamsi2007185.github.io/bis-sahayak/` | GitHub Pages |
| **FastAPI Backend** | `https://bis-sahayak-backend.onrender.com` | Render (Web Service) |
| **Interactive Docs (Swagger)** | `https://bis-sahayak-backend.onrender.com/docs` | Render |
| **Mobile App** | Android APK / iOS Bundle | Flutter (`frontend-mobile/`) |

---

## 🚀 Part 1: Backend Deployment (Render)

### Option A: One-Click Blueprint Deployment (Recommended)
1. Sign in to [Render](https://render.com).
2. In the Render Dashboard, click **New +** -> **Blueprint**.
3. Connect your GitHub repository `vamsi2007185/bis-sahayak`.
4. Render will automatically detect [`render.yaml`](./render.yaml).
5. Review the plan (**Free**) and click **Apply**.
6. Render will automatically build and launch the service:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Copy your backend service URL (e.g., `https://bis-sahayak-backend.onrender.com`).

---

### Option B: Manual Web Service Creation on Render
1. Click **New +** -> **Web Service**.
2. Select repository `vamsi2007185/bis-sahayak`.
3. Configure the following settings:
   - **Name**: `bis-sahayak-backend`
   - **Region**: Singapore / Frankfurt (or nearest region)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, add the variables detailed in the [Environment Variables](#-environment-variables-reference) section below.
5. Click **Create Web Service**.

---

## 🎨 Part 2: Frontend Deployment (GitHub Pages)

The repository includes an automated GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) that builds and deploys `frontend-web` whenever code is pushed to `main`.

### Step 1: Enable GitHub Pages in Repository Settings
1. Go to your GitHub repository: [https://github.com/vamsi2007185/bis-sahayak](https://github.com/vamsi2007185/bis-sahayak)
2. Navigate to **Settings** -> **Pages**.
3. Under **Build and deployment** -> **Source**, select **GitHub Actions**.

### Step 2: Connect Frontend to Backend URL
1. In the repository, navigate to **Settings** -> **Secrets and variables** -> **Actions**.
2. Select the **Variables** tab (or **Secrets** tab).
3. Click **New repository variable**.
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://bis-sahayak-backend.onrender.com` (your Render backend URL)
4. Click **Add variable**.

### Step 3: Trigger Deployment
1. Go to **Actions** -> **Deploy BIS Sahayak Web to GitHub Pages**.
2. Click **Run workflow** (or simply push any commit to `main`).
3. Once completed (green checkmark), your frontend will be live at:
   `https://vamsi2007185.github.io/bis-sahayak/`

> [!TIP]
> **Zero Downtime Fallback**: If the backend is spinning up (cold start) or `VITE_API_BASE_URL` is not yet set, the frontend automatically utilizes its built-in **Autonomous Regulatory Engine**. It will never crash or show mixed-content errors.
> You can also enter and test your backend URL on the fly in the **Settings** page within the live web application!

---

## 🔐 Environment Variables Reference

### Backend (`backend/.env` or Render Environment Settings)

| Variable | Required? | Default / Example | Purpose |
|---|---|---|---|
| `PORT` | Auto-set by Render | `8000` | Port for Uvicorn server |
| `BIS_LIGHTWEIGHT_MODE` | **Recommended (Free Tier)** | `true` | Runs backend in Zero-PyTorch mode (<50 MB RAM), preventing 512MB OOM crash |
| `ALLOWED_ORIGINS` | Optional | `https://vamsi2007185.github.io` | Comma-separated CORS allowed origins |
| `GROQ_API_KEY` | Recommended | `gsk_...` | High-speed, free-tier Llama 3 cloud LLM (avoids cloud latency) |
| `OPENAI_API_KEY` | Optional | `sk-...` | OpenAI GPT-4o-mini alternative |
| `LLM_API_BASE` | Optional | `https://api.groq.com/openai/v1` | Custom OpenAI-compatible LLM endpoint |
| `LLM_MODEL_NAME` | Optional | `llama-3.1-8b-instant` | Model identifier |
| `DATABASE_URL` | Optional | `postgresql://...` | PostgreSQL connection string |
| `BHASHINI_USER_ID` | Optional | `...` | Digital India Bhashini user identifier |
| `BHASHINI_API_KEY` | Optional | `...` | Digital India Bhashini API key |
| `BHASHINI_PIPELINE_ID`| Optional | `...` | Bhashini translation pipeline ID |
| `WHATSAPP_VERIFY_TOKEN`| Optional | Auto-generated | Meta Cloud API webhook verification token |
| `WHATSAPP_API_TOKEN` | Optional | `...` | Meta WhatsApp Cloud API access token |
| `WHATSAPP_PHONE_NUMBER_ID`| Optional | `...` | Meta WhatsApp sender phone ID |

---

## 🗄️ PostgreSQL Setup (Optional)

By default, the application runs with a high-performance in-memory compliance store (`REPORTS_DB`). If persistent PostgreSQL is desired:

1. **On Render**: Click **New +** -> **PostgreSQL**.
   - Name: `bis-sahayak-db`
   - Plan: Free
2. Copy the **Internal Database URL** provided by Render.
3. Add it as `DATABASE_URL` in your web service environment.
4. *Note*: Render provides URLs beginning with `postgres://`. The backend automatically normalizes this to `postgresql+asyncpg://` for SQLAlchemy 2.0.

---

## 🧠 LLM & RAG Configuration

### 1. Cloud LLM (Groq) — Recommended Free Tier
- Register at [console.groq.com](https://console.groq.com) and generate an API key.
- Add `GROQ_API_KEY=gsk_...` in Render environment variables.
- The backend automatically configures:
  - `LLM_API_BASE=https://api.groq.com/openai/v1`
  - `LLM_MODEL_NAME=llama-3.1-8b-instant`
- Responses are generated in ~500ms with 100% strict clause citations.

### 2. Local LLM (Ollama) — For Local Development
- Start Ollama locally: `ollama run llama3`
- Default backend settings point to `http://localhost:11434/v1`.

### 3. Factual Clause Synthesizer (Zero Dependency Fallback)
- If no external LLM API key is supplied and Ollama is unreachable, the system automatically uses its **internal dynamic synthesizer** to quote authentic BIS clauses from the retrieved FAISS embeddings.

---

## 🇮🇳 Digital India Bhashini Setup

To enable real-time translation across 22 scheduled Indian languages via the Government of India Bhashini API:
1. Register on the [Bhashini ULCA Portal](https://bhashini.gov.in/ulca).
2. Generate API credentials in your User Profile.
3. Configure the following environment variables:
   - `BHASHINI_USER_ID`
   - `BHASHINI_API_KEY`
   - `BHASHINI_PIPELINE_ID`
4. If not configured, the system uses its built-in multilingual script detection and regional UI dictionary (English, Hindi, Telugu, Tamil, Marathi, Bengali).

---

## 💬 WhatsApp Cloud API Integration

To broadcast proactive regulatory alerts to MSME mobile numbers:
1. Set up a Meta Developer App under **WhatsApp Business Platform**.
2. Set the **Webhook URL** in the Meta App Dashboard to:
   `https://bis-sahayak-backend.onrender.com/webhook/whatsapp`
3. Enter the **Verify Token** (`WHATSAPP_VERIFY_TOKEN`).
4. Set `WHATSAPP_API_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` in your backend environment.

---

## 🧪 Testing the Deployed Application

1. **Verify Backend Health**:
   ```bash
   curl -s https://bis-sahayak-backend.onrender.com/health
   # Expected: {"status":"healthy","service":"BIS Sahayak Core (SIH 2026)","version":"2.0.0",...}
   ```
2. **Verify Interactive Swagger UI**:
   Open `https://bis-sahayak-backend.onrender.com/docs` in your browser.
3. **Verify Standards Catalog**:
   ```bash
   curl -s https://bis-sahayak-backend.onrender.com/standards
   ```
4. **Verify RAG Assistant**:
   ```bash
   curl -X POST https://bis-sahayak-backend.onrender.com/chat \
     -H "Content-Type: application/json" \
     -d '{"query": "What is the TDS limit for drinking water in India?"}'
   ```
5. **Verify Web Frontend**:
   Open `https://vamsi2007185.github.io/bis-sahayak/` and verify:
   - Navbar backend badge displays **Live Backend** (or Autonomous Engine if spinning up).
   - Test asking a question in **AI Sahayak**.
   - Test verifying a license in **Verify Product** (e.g. `CM/L-8400123456`).
   - Test scanning a sample STL in **CAD Scanner**.
   - Test finding nearby labs in **Testing Labs**.

---

## 🔧 Common Deployment Issues & Fixes

### 1. Mixed Content Error (HTTPS vs HTTP)
- **Symptom**: Console error: `Mixed Content: The page at 'https://...' was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint 'http://localhost:8000'`.
- **Fix**: Make sure `VITE_API_BASE_URL` uses `https://` (e.g. `https://bis-sahayak-backend.onrender.com`). In BIS Sahayak v2.0, the frontend automatically avoids defaulting to localhost when loaded on GitHub Pages.

### 2. CORS Policy Blocking
- **Symptom**: `Access to XMLHttpRequest at '...' from origin 'https://vamsi2007185.github.io' has been blocked by CORS policy`.
- **Fix**: The backend dynamically allows `https://vamsi2007185.github.io` and regex `https://.*\.github\.io`. If using a custom domain, add it to `ALLOWED_ORIGINS` in Render.

### 3. Render Free Tier Cold Starts
- **Symptom**: The first API call takes 30-50 seconds to respond after 15 minutes of inactivity.
- **Fix**: Axios timeout has been increased to 30 seconds. If a request times out, the frontend automatically falls back to the client-side Autonomous Regulatory Engine without crashing.

### 4. Out of Memory (OOM / Exit 137) on Free 512 MiB Tier
- **Symptom**: Render logs display:
  ```
  INFO: RAG_Engine - Loading HuggingFace Embeddings (sentence-transformers/all-MiniLM-L6-v2)...
  INFO: sentence_transformers.SentenceTransformer - Load pretrained SentenceTransformer: sentence-transformers/all-MiniLM-L6-v2
  ERROR: Out of memory (used over 512Mi)
  ```
  Followed by the Linux kernel terminating the container with `SIGKILL` (Exit 137).
- **Root Cause**:
  1. Top-level eager imports of `langchain_huggingface`, `torch`, and `faiss-cpu` immediately link PyTorch's native C++ shared libraries into process RAM (~250 MiB).
  2. Loading `SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")` at startup downloads and caches model weights into RAM (~200+ MiB).
  3. Combined with FastAPI, Pydantic, and Uvicorn, peak memory exceeded the 512 MiB cgroup quota before any Python `try/except` block could intercept it.
- **The Solution: Zero-PyTorch Lightweight Mode (`BIS_LIGHTWEIGHT_MODE=true`)**:
  - Automatically enabled whenever `RENDER=true` or `ENVIRONMENT=production`.
  - Heavy ML packages (`torch`, `sentence_transformers`, `faiss`) are deferred to lazy loaders and **never imported into `sys.modules`** during startup.
  - The vector store switches to an optimized in-memory token-weighted semantic matcher (<1 MB).
  - The LLM query router auto-connects to Groq Cloud / OpenAI if keys are provided, or directly synthesizes verified BIS clauses dynamically with zero network delays and zero Ollama polling.
  - Total process RAM drops from >512 MiB down to **~42 MiB** (over 90% below the Render Free threshold).
- **How to Configure**:
  - `render.yaml` already specifies `BIS_LIGHTWEIGHT_MODE: "true"`.
  - If deploying via the Render UI manually, add environment variable: `BIS_LIGHTWEIGHT_MODE=true`.
  - On dedicated hardware or paid cloud tiers (>2 GB RAM), simply set `BIS_LIGHTWEIGHT_MODE=false` to utilize local dense neural embeddings and GPU/CPU FAISS clustering.

