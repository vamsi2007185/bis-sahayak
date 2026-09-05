# BIS Sahayak (मानक सहायक) — SIH 2026 Production Monorepo
### AI-Powered Compliance, 3D CAD Validation, and Citizen Safety Platform for Indian Standards (BIS)
**Smart India Hackathon 2026 • Category: Smart Automation**

---

## 🚀 Architecture Overview

```
bis_sahayak/
├── backend/                        # FastAPI Backend & AI/RAG Engine
│   ├── app/
│   │   ├── main.py                 # Master Unified API Gateway
│   │   ├── cad/cad_scanner.py      # Automated 3D CAD (.stl/.step) Dimensional Compliance Scanner
│   │   ├── labs/lab_router.py      # Hyper-Local BIS Testing Lab Router (Haversine Geo)
│   │   ├── vision/ocr_verifier.py  # Photo-to-Standard Image OCR & ISI Authenticator
│   │   ├── cron/gazette_watcher.py # Proactive Gazette Amendment Watcher & WhatsApp Alerts
│   │   ├── rag/rag_engine.py       # Semantic Clause Chunker, FAISS VectorStore, Citation Guardrail
│   │   ├── core/config.py          # Pydantic Settings & Environment
│   │   └── db/models.py            # PostgreSQL SQLAlchemy Models
│   ├── data/
│   │   ├── raw_standards/          # Ingested BIS PDF standards
│   │   └── faiss_index/            # Local persistent FAISS vector index
│   └── requirements.txt            # Production dependencies
├── frontend-web/                   # React 18 Web Dashboard (Vite + TailwindCSS + Lucide)
│   ├── package.json
│   └── src/App.jsx
├── frontend-mobile/                # Flutter Cross-Platform Mobile Application
│   ├── pubspec.yaml
│   └── lib/main.dart
└── README.md
```

---

## 🌟 Advanced Technical Innovations (Smart Automation)

### 1. 📐 Automated 3D CAD Compliance Scanner (`/cad/scan`)
- Allows MSMEs to upload standard 3D CAD meshes (`.stl`).
- Parses geometric properties (bounding box $X 	imes Y 	imes Z$ in mm, volume, surface area, and mesh manifoldness).
- Cross-references dimensions against Indian Standards:
  - **IS 15652:2006**: Electrical Insulation Mats (Thickness tolerances)
  - **IS 1363:2002**: Hexagon Head Bolts (Metric sizes M6 to M36)
  - **IS 4984:2016**: HDPE Pipes for Water Supply
- Flags compliance deviations and manufacturing safety margins before physical production.

### 2. 📍 Hyper-Local Lab Verification Router (`/labs/nearest`)
- Instant geospatial lookup using the Great-Circle Haversine formula.
- Searches active BIS Recognized and NABL-accredited testing laboratories across India from the CARE database.
- Provides accredited categories, testing scopes, contact officers, and direct Google Maps navigation links.

### 3. 📸 "Photo-to-Standard" Verification (`/verify_isi/photo`)
- Ingests photographs of ISI marks, product packaging, or industrial labels.
- Preprocesses images with contrast enhancement and runs OCR to extract CM/L registration numbers and standard codes.
- Verifies active status against the BIS registry to combat counterfeit goods.

### 4. 📢 Proactive Gazette Amendment Webhooks
- Background daemon monitoring mock official BIS Gazette Notification feeds.
- Automatically generates delta impact summaries when standards are amended (e.g. `IS 10500:2012 Amendment 3`).
- Pushes localized WhatsApp alerts via Meta Cloud API directly to registered MSME mobile numbers.

---

## 🛠️ Quick Start

### 1. Backend
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger Documentation: `http://localhost:8000/docs`

### 2. Frontend Web
```bash
cd frontend-web
npm install
npm run dev
```

### 3. Frontend Mobile
```bash
cd frontend-mobile
flutter pub get
flutter run
```
