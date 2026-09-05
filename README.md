# BIS Sahayak (मानक सहायक)

AI-Powered Intelligent Compliance & Advisory Assistant for Indian Standards (BIS), tailored for MSMEs and Indian consumers.

---

## 🌟 Key Capabilities (Phase 1)

1. **Multilingual Query Router (Bhashini IndicTrans2)**:
   - Supports 22 scheduled Indian languages (Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, etc.).
   - Converts Indic queries to English, searches standards, and localizes responses.
2. **Semantic Clause-Aware Chunker**:
   - Specialized parser for BIS PDF standards retaining hierarchical clause structure (`Clause 4.1.2`, `Table 1`, `IS 10500:2012`).
3. **Local Vector Search (FAISS)**:
   - High-throughput, offline-capable CPU embeddings with `sentence-transformers/all-MiniLM-L6-v2`.
4. **Strict Citation Guardrail**:
   - Validates generated responses against retrieved BIS text.
   - Prevents hallucinations of standard numbers (`IS xxxx`) and clause numbers.
5. **BIS ISI / CM/L License Authenticator**:
   - Validates 7-to-10 digit CM/L license numbers to combat counterfeit goods.
6. **WhatsApp Cloud API Integration**:
   - Webhook endpoint for citizen and MSME access directly via WhatsApp.

---

## 📂 Project Architecture

```
bis_sahayak/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI server & routing
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py               # Pydantic Settings
│   ├── api/
│   │   └── __init__.py
│   ├── rag/
│   │   ├── __init__.py
│   │   └── rag_engine.py           # Chunker, FAISS, Bhashini & Guardrails
│   ├── db/
│   │   ├── __init__.py
│   │   └── models.py               # SQLAlchemy ORM Models
│   └── services/
│       └── __init__.py
├── data/
│   ├── raw_standards/              # Ingested BIS PDFs
│   └── faiss_index/                # Local FAISS vector index
├── .env.example
├── requirements.txt
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- (Optional) PostgreSQL running locally or via Docker
- (Optional) Ollama / vLLM running a local open-source LLM (e.g. `llama3:8b` or `mistral`)

### 2. Installation
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Environment Setup
```bash
copy .env.example .env
```
Fill in your `BHASHINI_*` and `WHATSAPP_*` credentials if testing live integrations. The engine gracefully falls back to mock modes if keys are absent.

### 4. Running the Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger UI: `http://localhost:8000/docs`

---

## 📡 API Reference

### 1. `/chat` (POST)
Natural language query in Hindi, Tamil, English, etc.
```json
{
  "query": "पीने के पानी में टीडीएस की क्या सीमा है?",
  "language": "hi"
}
```

### 2. `/verify_isi` (POST)
Validates CM/L license code stamped next to the ISI mark.
```json
{
  "cml_number": "CM/L-8400123456"
}
```

### 3. `/upload_standard` (POST)
Uploads an official BIS PDF standard (`multipart/form-data`) with `standard_id` and `standard_title`.

### 4. `/webhook/whatsapp` (GET / POST)
Meta Cloud API verification and incoming message receiver.
