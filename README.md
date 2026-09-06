# BIS Sahayak  — SIH 2026 Production Monorepo
### Multilingual AI Compliance Assistant, 3D CAD Scanner & Citizen Safety Platform for Indian Standards (BIS)
**Smart India Hackathon 2026 • Category: Smart Automation • Ministry of Consumer Affairs, Food & Public Distribution**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg?logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF.svg?logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.11-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)
[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B.svg?logo=flutter)](https://flutter.dev)

---

## 🌟 Executive Summary

**BIS Sahayak ** is an intelligent, dual-persona (Consumer & MSME) compliance ecosystem engineered for the **Smart India Hackathon 2026**. It simplifies, validates, and democratizes Indian Standards (Bureau of Indian Standards — BIS) by combining:
1. **Regulated RAG Architecture**: Strict clause citation guardrails with zero hallucination guarantee.
2. **Automated 3D CAD Scanner**: Instant geometric tolerance verification against published Indian Standards.
3. **Photo & CM/L Number Verification**: Computer vision and OCR to combat counterfeit ISI marks.
4. **Hyper-Local Testing Lab Router**: Haversine distance-based discovery of BIS recognized and NABL accredited labs.
5. **Gazette Amendment Watcher**: Proactive notification of standard revisions with automated delta impact summaries.
6. **Statutory Reports Archive**: Client-side persisted technical audit and safety reports with PDF/JSON export.
7. **True Multilingual Access**: Native translation layer supporting 22 official Indian languages powered by the Bhashini API.

---

## 🚀 System Architecture

```
bis_sahayak/
├── backend/                        # High-Performance FastAPI Backend & AI/RAG Engine
│   ├── app/
│   │   ├── main.py                 # Unified API Gateway (13 REST Endpoints)
│   │   ├── cad/cad_scanner.py      # Automated 3D CAD (.stl/.step) Dimensional Compliance Scanner
│   │   ├── labs/lab_router.py      # Hyper-Local BIS Testing Lab Router (Haversine Geo)
│   │   ├── vision/ocr_verifier.py  # Photo-to-Standard Image OCR & ISI Authenticator
│   │   ├── cron/gazette_watcher.py # Proactive Gazette Amendment Watcher & WhatsApp Alerts
│   │   ├── rag/rag_engine.py       # Semantic Clause Chunker, FAISS VectorStore, Dynamic Synthesizer
│   │   ├── core/config.py          # Pydantic Settings & Environment Configurations
│   │   └── db/models.py            # PostgreSQL SQLAlchemy Relational Schema
│   ├── data/
│   │   ├── raw_standards/          # Ingested BIS PDF standards
│   │   └── faiss_index/            # Local persistent FAISS vector index
│   └── requirements.txt            # Production Python dependencies
├── frontend-web/                   # Enterprise React 18 Web Dashboard (Vite + TailwindCSS)
│   ├── index.html                  # Responsive Single Page Application Entry
│   ├── vite.config.js              # Vite bundler configuration with backend proxy
│   ├── tailwind.config.js          # BIS Tricolor Theme & Typography tokens
│   ├── src/
│   │   ├── main.jsx                # React root application mount
│   │   ├── App.jsx                 # Master router & layout container (8 dedicated views)
│   │   ├── components/             # Reusable UI component library
│   │   │   ├── Navbar.jsx          # Header with language picker & user mode toggle
│   │   │   ├── Sidebar.jsx         # Desktop navigation drawer
│   │   │   ├── BottomNav.jsx       # Mobile bottom navigation bar
│   │   │   ├── StatusBadge.jsx     # Compliance status pill
│   │   │   ├── CitationCard.jsx    # Mandatory BIS clause citation badge
│   │   │   ├── VerificationResult.jsx # Visual verification card
│   │   │   ├── ReportSuspiciousModal.jsx # Citizen complaint filing modal
│   │   │   ├── CADMeasurementTable.jsx # Dimensional comparison table
│   │   │   ├── LabCard.jsx         # Testing lab details & direct directions
│   │   │   ├── ImpactSummaryModal.jsx  # Amendment delta impact modal
│   │   │   └── ReportViewModal.jsx # Full-screen technical audit report viewer
│   │   ├── context/
│   │   │   ├── LanguageContext.jsx # 22 Indic Languages + English state
│   │   │   └── UserModeContext.jsx # Consumer vs. MSME mode toggle
│   │   ├── pages/                  # 8 Dedicated Application Views
│   │   │   ├── Dashboard.jsx       # Real-time compliance metrics & quick actions
│   │   │   ├── Chat.jsx            # Dual-persona conversational AI assistant
│   │   │   ├── VerifyProduct.jsx   # Photo OCR & CM/L license authenticator
│   │   │   ├── CADScanner.jsx      # 3D mesh tolerance validator
│   │   │   ├── Labs.jsx            # Interactive geospatial lab finder
│   │   │   ├── Updates.jsx         # Gazette amendments & revision impacts
│   │   │   ├── Reports.jsx         # Persistent audit report archive
│   │   │   └── Settings.jsx        # Language, mode, offline cache & diagnostics
│   │   ├── services/
│   │   │   └── api.js              # Centralized API service for all 13 backend endpoints
│   │   └── utils/
│   │       └── translations.js     # Multilingual UI dictionary (English, Hindi, Telugu, Tamil, Marathi, Bengali)
├── frontend-mobile/                # Cross-Platform Flutter Mobile Application
│   ├── pubspec.yaml                # Mobile dependencies
│   └── lib/main.dart               # Complete 5-tab Material 3 Mobile Experience
└── README.md                       # Master Documentation
```

---

## 💎 Features & Capabilities

### 1. Dual User Modes (Consumer vs. MSME)
- **Consumer Mode (नागरिक)**: Simplified, plain-language guidance, direct safety checks, counterfeit alerts, and instant citizen complaint submission.
- **MSME Mode (उद्योग)**: Industrial engineering focus, clause-by-clause specifications, CAD dimensional tolerance tables, NABL lab routing, and compliance impact analyses.

### 2. 🤖 Grounded RAG Assistant (`/chat`)
- Clause citation guardrail: Every response must cite an authentic BIS standard (e.g., `IS 10500:2012 Clause 4.2`).
- Dynamic synthesizer fallback: When an external LLM API key is not configured, extracts and formats matching clauses directly from retrieved FAISS vector embeddings without hallucination.

### 3. 🔍 Product Authenticator (`/verify_isi`, `/verify_isi/photo`)
- Dual-mode validation: Manual 7-digit CM/L license entry or instant photo upload.
- OCR text extraction extracts license codes and cross-references active licenses in the BIS registry.
- Citizen complaint escalation modal (`POST /reports/suspicious`) sends reports directly to enforcement authorities.

### 4. 📐 3D CAD Compliance Scanner (`/cad/scan`)
- Parses binary/ASCII STL 3D models directly in memory.
- Calculates exact bounding dimensions ($X \times Y \times Z$), surface area, and volume.
- Compares against standard parameters for:
  - **IS 15652:2006**: Electrical Insulation Mats
  - **IS 1363:2002**: Hexagon Head Bolts (M6-M36)
  - **IS 4984:2016**: HDPE Pipes
- Returns detailed compliance status, dimensional tolerance deviations, and actionable recommendations.

### 5. 📍 Testing Lab Finder (`/labs/nearest`)
- Searches NABL-accredited and BIS Recognized labs across India using the Great-Circle Haversine formula.
- Filters by product category and test capability (Chemical, Mechanical, Electrical, Biological).
- One-click Google Maps navigation and direct contact information.

### 6. 📢 Gazette Amendment Watcher (`/updates/check`, `/updates/impact`)
- Tracks regulatory amendments and draft revisions published in the official Gazette.
- Generates automated plain-language delta impact summaries highlighting what changed, who is affected, and grace periods.

### 7. 📄 Comprehensive Reports Archive (`/reports`)
- Saves every CAD validation, product verification, and compliance audit into an active searchable archive.
- Generates downloadable audit reports with complete metadata and JSON export.
- **Statutory Disclaimer**: Clearly marks all generated artifacts as *"BIS Sahayak Technical Analysis — for reference only, not an official BIS certificate"*.

---

## 📡 Complete API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status and active modules |
| `POST` | `/chat` | Conversational RAG assistant with clause citations |
| `GET` | `/standards` | List ingested standards catalog |
| `POST` | `/verify_isi` | Validate 7-digit CM/L license number |
| `POST` | `/verify_isi/photo` | OCR-based photo validation of ISI marks |
| `POST` | `/cad/scan` | 3D CAD (.stl) geometric compliance audit |
| `GET` | `/labs/nearest` | Geospatial lookup for accredited testing labs |
| `GET` | `/updates/check` | Fetch latest gazette amendments and notifications |
| `POST` | `/updates/impact` | Generate delta impact summary for a standard amendment |
| `GET` | `/reports` | Retrieve saved audit and verification reports |
| `POST` | `/reports` | Save new compliance or verification report |
| `DELETE`| `/reports/{id}` | Delete report by ID |
| `POST` | `/reports/suspicious` | File citizen complaint regarding fake/counterfeit products |

---

## 🛠️ Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- (Optional) Flutter SDK 3.x for mobile testing

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Swagger UI will be available at: `http://localhost:8000/docs`

### 2. Frontend Web Setup
```bash
cd frontend-web
npm install
npm run dev
```
The React web application will start at: `http://localhost:5173`

### 3. Frontend Mobile Setup
```bash
cd frontend-mobile
flutter pub get
flutter run
```

---

## ⚙️ Environment Configuration

Create a `.env` file in `backend/`:
```env
# Optional external LLM API (Groq / OpenAI / HuggingFace)
# If left empty, BIS Sahayak automatically uses its internal dynamic FAISS synthesizer
GROQ_API_KEY=your_groq_api_key_here

# Optional Bhashini API for 22 Indic Languages
BHASHINI_API_KEY=your_bhashini_api_key_here
BHASHINI_USER_ID=your_bhashini_user_id_here
BHASHINI_PIPELINE_ID=your_pipeline_id_here

# Meta Cloud WhatsApp API (for MSME proactive notifications)
WHATSAPP_API_TOKEN=your_whatsapp_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_id_here

# Database (Optional PostgreSQL, falls back to in-memory)
DATABASE_URL=postgresql://user:password@localhost:5432/bis_sahayak
```

---

## 🧪 Verification & Testing Commands

```bash
# Verify backend syntax
python -m py_compile backend/app/main.py backend/app/rag/rag_engine.py backend/app/cad/cad_scanner.py backend/app/labs/lab_router.py backend/app/vision/ocr_verifier.py

# Build frontend for production
cd frontend-web
npm run build

# Run end-to-end endpoint tests
python -c "import urllib.request, json; print('Testing endpoints...')"
```

---

## ⚖️ Statutory Disclaimer

*BIS Sahayak is an automated technical assistance tool developed for the Smart India Hackathon 2026. The dimensional checks, RAG citations, and verification statuses provided are for informational and compliance pre-screening purposes only and do not constitute an official legal certificate or endorsement by the Bureau of Indian Standards (BIS).*
