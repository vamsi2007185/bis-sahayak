"""
================================================================================
BIS Sahayak - Master FastAPI Server (SIH 2026 Smart Automation)
================================================================================
Endpoints:
  1. POST /chat             : Multilingual RAG with Bhashini (IndicTrans2) & Citations
  2. POST /verify_isi       : CM/L License Number Authenticity Verification
  3. POST /verify_isi/photo : "Photo-to-Standard" Image OCR for ISI Labels
  4. POST /cad/scan         : Automated 3D CAD (.stl/.step) Dimensional Compliance Scanner
  5. GET  /labs/nearest     : Hyper-Local BIS Testing Laboratory Router (Haversine Geo)
  6. POST /upload_standard  : PDF Standard Ingestion, Clause Chunking & FAISS Vector Indexing
  7. GET  /amendments/feed  : BIS Official Gazette Amendment Feed
  8. POST /amendments/broadcast : Proactive WhatsApp Broadcast for Regulatory Updates
  9. GET/POST /webhook/whatsapp : Meta WhatsApp Cloud API Webhook Integration
================================================================================
"""

import os
import re
import shutil
import logging
from typing import List, Dict, Any, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Request, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel, Field

# Core Modules
from app.rag.rag_engine import query_router, faiss_manager, semantic_chunker, BISClauseChunk, RAGResult
from app.cad.cad_scanner import cad_scanner, CADScanResult
from app.labs.lab_router import lab_router, LabInfo
from app.vision.ocr_verifier import photo_verifier, PhotoVerificationResult
from app.cron.gazette_watcher import gazette_watcher, AmendmentNotification

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s - %(message)s")
logger = logging.getLogger("BIS_Sahayak_API")

WHATSAPP_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "bis_sahayak_webhook_token_2026")
RAW_STANDARDS_DIR = os.getenv("RAW_STANDARDS_DIR", "backend/data/raw_standards")


# ------------------------------------------------------------------------------
# 1. REQUEST & RESPONSE SCHEMAS
# ------------------------------------------------------------------------------

class ChatRequest(BaseModel):
    query: str = Field(..., description="Query in English or any of 22 Indic languages", example="पीने के पानी में टीडीएस की लिमिट क्या है?")
    language: Optional[str] = Field(None, description="Optional ISO code (e.g. 'hi', 'ta', 'mr')")
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    original_query: str
    detected_language: str
    response_english: str
    response_localized: Optional[str]
    citations: List[Dict[str, str]]
    guardrail_passed: bool
    guardrail_notes: List[str]
    retrieved_sources: List[Dict[str, Any]]


class ISIVerifyRequest(BaseModel):
    cml_number: str = Field(..., example="CM/L-8400123456")


# ------------------------------------------------------------------------------
# 2. LIFESPAN & SEED KNOWLEDGE
# ------------------------------------------------------------------------------

def seed_sample_data():
    """Initializes sample BIS standards if vector database is fresh."""
    if faiss_manager.vector_store is None:
        logger.info("Initializing vector store with foundational BIS Standards...")
        sample_chunks = [
            BISClauseChunk(
                standard_id="IS 10500:2012",
                standard_title="Drinking Water - Specification",
                clause_number="Clause 4.1",
                clause_title="General & Organoleptic Parameters",
                content="[IS 10500:2012] Clause 4.1: Drinking water acceptable limit for Total Dissolved Solids (TDS) is 500 mg/l Max, with permissible limit of 2000 mg/l in absence of alternate sources. pH range must be 6.5 to 8.5.",
                page_number=2,
                chunk_id="IS10500_4.1"
            ),
            BISClauseChunk(
                standard_id="IS 15652:2006",
                standard_title="Electrical Insulation Mats",
                clause_number="Clause 4.2",
                clause_title="Thickness and Dimensions",
                content="[IS 15652:2006] Clause 4.2: Elastomeric mats shall have minimum thickness: Class A (3.3 kV) 2.0 mm (±0.2mm); Class B (11 kV) 2.5 mm (±0.25mm); Class C (33 kV) 3.0 mm (±0.30mm). Proof voltage test is mandatory as per Clause 6.4.",
                page_number=3,
                chunk_id="IS15652_4.2"
            ),
            BISClauseChunk(
                standard_id="IS 1363 (Part 1): 2002",
                standard_title="Hexagon Head Bolts",
                clause_number="Clause 4.0",
                clause_title="Dimensions & Tolerances",
                content="[IS 1363:2002] Clause 4.0 Table 2: For M12 hexagon bolts, nominal shank diameter is 12mm, head height k is 7.5mm (±0.3mm), width across flats s is 18mm.",
                page_number=4,
                chunk_id="IS1363_4.0"
            )
        ]
        faiss_manager.add_chunks(sample_chunks)
        logger.info("Sample BIS knowledge seeded successfully.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(RAW_STANDARDS_DIR, exist_ok=True)
    seed_sample_data()
    yield
    logger.info("BIS Sahayak API shutdown complete.")


app = FastAPI(
    title="BIS Sahayak API (Smart India Hackathon 2026)",
    description="Intelligent Multilingual Assistant for Indian Standards (BIS) - MSME Smart Automation & Consumer Safety",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------------------
# 3. ROUTE: /chat (MULTILINGUAL RAG & CITATION GUARDRAIL)
# ------------------------------------------------------------------------------

@app.post("/chat", response_model=ChatResponse, summary="Query Indian Standards in 22 Indic languages")
async def chat_endpoint(request: ChatRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    try:
        rag_res: RAGResult = await query_router.query(user_query=request.query, source_lang=request.language)
        return ChatResponse(
            original_query=rag_res.query,
            detected_language=rag_res.detected_language,
            response_english=rag_res.answer,
            response_localized=rag_res.translated_answer,
            citations=rag_res.citations,
            guardrail_passed=rag_res.guardrail_passed,
            guardrail_notes=rag_res.guardrail_notes,
            retrieved_sources=rag_res.retrieved_sources
        )
    except Exception as e:
        logger.error(f"Error in /chat: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------------------------------------------------------------
# 4. ROUTE: /cad/scan (AUTOMATED 3D CAD COMPLIANCE SCANNER)
# ------------------------------------------------------------------------------

@app.post("/cad/scan", response_model=CADScanResult, summary="Upload 3D CAD (.stl) to check dimensional compliance")
async def scan_cad_endpoint(
    file: UploadFile = File(..., description="3D CAD mesh file (.stl)"),
    target_standard: str = Form("IS 15652", description="Target BIS Standard code, e.g. 'IS 15652' or 'IS 1363'"),
    nominal_spec: str = Form("Class A (3.3kV)", description="Nominal specification size, e.g. 'Class A (3.3kV)' or 'M12'")
):
    """
    Parses 3D STL geometry, verifies bounding box, wall thickness, and checks against BIS standard tolerances.
    """
    if not file.filename.lower().endswith(".stl"):
        raise HTTPException(status_code=400, detail="Only .stl 3D mesh files are currently supported for CAD compliance scan.")

    content = await file.read()
    try:
        scan_result = cad_scanner.scan_3d_model(
            file_bytes=content,
            filename=file.filename,
            target_standard=target_standard,
            nominal_spec=nominal_spec
        )
        return scan_result
    except Exception as e:
        logger.error(f"Error scanning CAD model: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to analyze 3D CAD model: {str(e)}")


# ------------------------------------------------------------------------------
# 5. ROUTE: /labs/nearest (HYPER-LOCAL BIS TESTING LAB ROUTER)
# ------------------------------------------------------------------------------

@app.get("/labs/nearest", response_model=List[LabInfo], summary="Find nearest accredited BIS testing labs (Haversine Geo)")
async def nearest_labs_endpoint(
    latitude: float = Query(..., description="User latitude", example=28.6139),
    longitude: float = Query(..., description="User longitude", example=77.2090),
    product_category: Optional[str] = Query(None, description="Filter by category (drinking_water, electrical, mechanical, textile)"),
    limit: int = Query(5, ge=1, le=20)
):
    """
    Locates nearest active BIS testing laboratories from the CARE directory using geospatial proximity.
    """
    return lab_router.find_nearest_labs(
        user_lat=latitude,
        user_lon=longitude,
        product_category=product_category,
        limit=limit
    )


# ------------------------------------------------------------------------------
# 6. ROUTE: /verify_isi/photo ("PHOTO-TO-STANDARD" OCR AUTHENTICATOR)
# ------------------------------------------------------------------------------

@app.post("/verify_isi/photo", response_model=PhotoVerificationResult, summary="Photo-to-Standard: OCR scan of ISI mark label")
async def verify_isi_photo_endpoint(
    file: UploadFile = File(..., description="Photograph of ISI stamp or product packaging")
):
    """
    Applies image preprocessing and OCR to extract CM/L registration numbers and cross-verify with BIS database.
    """
    content = await file.read()
    return photo_verifier.verify_photo(content, file.filename)


# ------------------------------------------------------------------------------
# 7. ROUTE: /verify_isi (TEXT CM/L VERIFICATION)
# ------------------------------------------------------------------------------

@app.post("/verify_isi", summary="Verify text CM/L License Number")
async def verify_isi_text_endpoint(request: ISIVerifyRequest):
    digits = re.sub(r"[^\d]", "", request.cml_number)
    record = photo_verifier.verified_database.get(digits)
    if record:
        return {
            "cml_number": request.cml_number,
            "is_valid": record["status"] == "GENUINE_OPERATIVE",
            "status": record["status"],
            "manufacturer_name": record["manufacturer"],
            "brand_name": record["brand"],
            "standard_number": record["standard"],
            "advisory_notice": record["advisory"]
        }
    return {
        "cml_number": request.cml_number,
        "is_valid": False,
        "status": "NOT_FOUND",
        "advisory_notice": "No active record found in the BIS registry."
    }


# ------------------------------------------------------------------------------
# 8. ROUTE: /upload_standard (PDF INGESTION)
# ------------------------------------------------------------------------------

@app.post("/upload_standard", summary="Ingest official BIS PDF Standard")
async def upload_standard_endpoint(
    file: UploadFile = File(...),
    standard_id: str = Form(...),
    standard_title: str = Form(...)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF standards supported.")

    dest = os.path.join(RAW_STANDARDS_DIR, file.filename)
    with open(dest, "wb") as buf:
        shutil.copyfileobj(file.file, buf)

    chunks = semantic_chunker.chunk_standard(dest, standard_id, standard_title)
    if chunks:
        faiss_manager.add_chunks(chunks)

    return {
        "message": "Standard ingested and indexed successfully.",
        "standard_id": standard_id,
        "total_clauses": len(chunks)
    }


# ------------------------------------------------------------------------------
# 9. ROUTE: /amendments/feed & /amendments/broadcast (PROACTIVE NOTIFICATIONS)
# ------------------------------------------------------------------------------

@app.get("/amendments/feed", response_model=List[AmendmentNotification], summary="Latest BIS Gazette Amendments")
async def amendments_feed_endpoint():
    return gazette_watcher.get_latest_amendments()


@app.post("/amendments/broadcast", summary="Broadcast amendment notification to registered MSMEs")
async def broadcast_amendment_endpoint(amendment_id: str = Query(...)):
    return await gazette_watcher.broadcast_amendment_alert(amendment_id)


# ------------------------------------------------------------------------------
# 10. ROUTE: /webhook/whatsapp (META CLOUD API)
# ------------------------------------------------------------------------------

@app.get("/webhook/whatsapp")
async def whatsapp_verify(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token")
):
    if hub_mode == "subscribe" and hub_verify_token == WHATSAPP_VERIFY_TOKEN:
        return PlainTextResponse(content=hub_challenge, status_code=200)
    raise HTTPException(status_code=403, detail="Verification token mismatch")


@app.post("/webhook/whatsapp")
async def whatsapp_receive(request: Request, background_tasks: BackgroundTasks):
    body = await request.json()
    logger.info(f"Incoming WhatsApp webhook: {body}")
    return JSONResponse({"status": "received"}, status_code=status.HTTP_200_OK)


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "BIS Sahayak Core (SIH 2026)",
        "version": "2.0.0",
        "vector_store": "FAISS (Ready)" if faiss_manager.vector_store else "Empty",
        "cad_engine": "Active",
        "lab_router": f"Active ({len(lab_router.laboratories)} accredited labs)"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
