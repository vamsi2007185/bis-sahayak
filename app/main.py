"""
================================================================================
BIS Sahayak - FastAPI Backend Server
================================================================================
Core API Server for the Indian Standards Intelligent Assistant.
Endpoints:
  - POST /chat             : Multilingual conversational query router with RAG
  - POST /verify_isi       : CM/L license number & ISI mark authenticity verification
  - POST /upload_standard  : BIS Standard PDF upload, clause chunking & vector indexing
  - GET  /webhook/whatsapp : Meta WhatsApp Cloud API verification handshake
  - POST /webhook/whatsapp : WhatsApp inbound message processor & auto-responder
  - GET  /health           : System health check & vector store status
================================================================================
"""

import os
import re
import shutil
import logging
from typing import List, Dict, Any, Optional
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Request, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel, Field

# Internal RAG Engine imports
from app.rag.rag_engine import (
    query_router,
    faiss_manager,
    semantic_chunker,
    BISClauseChunk,
    RAGResult
)

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s - %(message)s")
logger = logging.getLogger("BIS_Sahayak_API")

# Environment & Settings
WHATSAPP_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "bis_sahayak_webhook_token_2026")
WHATSAPP_API_TOKEN = os.getenv("WHATSAPP_API_TOKEN", "")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
RAW_STANDARDS_DIR = os.getenv("RAW_STANDARDS_DIR", "data/raw_standards")


# ------------------------------------------------------------------------------
# 1. PYDANTIC REQUEST & RESPONSE SCHEMAS
# ------------------------------------------------------------------------------

class ChatRequest(BaseModel):
    query: str = Field(..., description="User query in English or any Indic language (Hindi, Tamil, etc.)", example="पीने के पानी में टीडीएस की लिमिट क्या है?")
    language: Optional[str] = Field(None, description="Optional ISO language code (e.g., 'hi', 'ta', 'en'). Auto-detected if omitted.")
    session_id: Optional[str] = Field(None, description="Client session ID for stateful tracking")


class CitationItem(BaseModel):
    type: str = Field(..., example="Standard")
    citation: str = Field(..., example="IS 10500:2012")


class ChatResponse(BaseModel):
    original_query: str
    detected_language: str
    response_english: str
    response_localized: Optional[str] = None
    citations: List[CitationItem]
    guardrail_passed: bool
    guardrail_notes: List[str]
    retrieved_sources: List[Dict[str, Any]]


class ISIVerifyRequest(BaseModel):
    cml_number: str = Field(..., description="BIS Certification Marks / License (CM/L) number (7-10 digits)", example="CM/L-8400123456")


class ISIVerifyResponse(BaseModel):
    cml_number: str
    is_valid: bool
    status: str  # "OPERATIVE", "EXPIRED", "SUSPENDED", "INVALID_FORMAT", "NOT_FOUND"
    manufacturer_name: Optional[str] = None
    brand_name: Optional[str] = None
    standard_number: Optional[str] = None
    standard_title: Optional[str] = None
    valid_up_to: Optional[str] = None
    factory_address: Optional[str] = None
    advisory_notice: str


class StandardUploadResponse(BaseModel):
    message: str
    standard_id: str
    standard_title: str
    total_clauses_indexed: int
    saved_path: str


# ------------------------------------------------------------------------------
# 2. SEEDING SAMPLE BIS STANDARDS FOR IMMEDIATE OUT-OF-THE-BOX USE
# ------------------------------------------------------------------------------

def seed_sample_bis_knowledge():
    """
    Seeds essential BIS standards into local FAISS if empty,
    guaranteeing that the system is testable immediately without waiting for huge PDF uploads.
    """
    if faiss_manager.vector_store is None:
        logger.info("Initializing vector store with sample BIS Standards (IS 10500:2012 Drinking Water)...")
        sample_chunks = [
            BISClauseChunk(
                standard_id="IS 10500:2012",
                standard_title="Drinking Water - Specification",
                clause_number="Clause 4.1",
                clause_title="General Requirements & Organoleptic Parameters",
                content="[IS 10500:2012] Clause 4.1 - General Requirements: Drinking water shall not contain any organism, chemical or other substance in concentration that is injurious to health. Table 1 specifies the acceptable limit for Total Dissolved Solids (TDS) as 500 mg/l Max, with permissible limit in the absence of alternate source as 2000 mg/l Max. pH range must be 6.5 to 8.5.",
                page_number=2,
                chunk_id="IS10500_4.1_seed"
            ),
            BISClauseChunk(
                standard_id="IS 10500:2012",
                standard_title="Drinking Water - Specification",
                clause_number="Clause 4.2",
                clause_title="Bacteriological Quality",
                content="[IS 10500:2012] Clause 4.2 - Bacteriological Parameters: All water intended for drinking should be free from E. coli or thermotolerant coliform bacteria in any 100 ml sample (Clause 4.2.1). Total coliform bacteria must also not be detectable in 100 ml.",
                page_number=3,
                chunk_id="IS10500_4.2_seed"
            ),
            BISClauseChunk(
                standard_id="IS 10500:2012",
                standard_title="Drinking Water - Specification",
                clause_number="Clause 5.1",
                clause_title="Packaging and Labeling",
                content="[IS 10500:2012] Clause 5.1 - Packaging & ISI Marking: Packaged drinking water shall conform to IS 14543 or IS 10500 for municipal tap supply. Products bearing the ISI Standard Mark must clearly display the BIS CM/L license number and manufacturer license code.",
                page_number=5,
                chunk_id="IS10500_5.1_seed"
            ),
            BISClauseChunk(
                standard_id="IS 15652:2006",
                standard_title="Electrical Insulation Mats for Electrical Works",
                clause_number="Clause 3.1",
                clause_title="Dielectric & Breakdown Voltage",
                content="[IS 15652:2006] Clause 3.1 - Electrical Insulation Mats: Elastomeric mats for working with live electrical apparatus must withstand voltage ratings: Class A up to 3.3 kV, Class B up to 11 kV, and Class C up to 33 kV. Proof voltage testing is mandatory every 12 months under Clause 6.4.",
                page_number=2,
                chunk_id="IS15652_3.1_seed"
            )
        ]
        faiss_manager.add_chunks(sample_chunks)
        logger.info("Sample BIS knowledge seeded successfully.")


# ------------------------------------------------------------------------------
# 3. FASTAPI LIFESPAN & APPLICATION SETUP
# ------------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup initialization
    os.makedirs(RAW_STANDARDS_DIR, exist_ok=True)
    seed_sample_bis_knowledge()
    yield
    logger.info("BIS Sahayak API shutdown complete.")


app = FastAPI(
    title="BIS Sahayak API",
    description="AI-Powered Multilingual Assistant for Bureau of Indian Standards (BIS) - MSME Compliance & Consumer Safety",
    version="1.0.0",
    lifespan=lifespan
)

# Cross-Origin Resource Sharing (CORS) for React Web and Flutter clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------------------
# 4. ENDPOINT: /chat (MULTILINGUAL RAG WITH CITATIONS)
# ------------------------------------------------------------------------------

@app.post("/chat", response_model=ChatResponse, summary="Query BIS standards in natural language")
async def chat_endpoint(request: ChatRequest):
    """
    Conversational RAG endpoint:
    - Accepts queries in Hindi, Tamil, Telugu, English, etc.
    - Routes through Bhashini for IndicTrans2 translation.
    - Retrieves verified clauses from FAISS vector store.
    - Synthesizes answer and verifies citations via Guardrails.
    - Returns localized response to user.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        rag_result: RAGResult = await query_router.query(
            user_query=request.query,
            source_lang=request.language
        )

        formatted_citations = [
            CitationItem(type=c.get("type", "Standard"), citation=c.get("citation", ""))
            for c in rag_result.citations
        ]

        return ChatResponse(
            original_query=rag_result.query,
            detected_language=rag_result.detected_language,
            response_english=rag_result.answer,
            response_localized=rag_result.translated_answer,
            citations=formatted_citations,
            guardrail_passed=rag_result.guardrail_passed,
            guardrail_notes=rag_result.guardrail_notes,
            retrieved_sources=rag_result.retrieved_sources
        )

    except Exception as e:
        logger.error(f"Error in /chat endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal error processing BIS compliance query: {str(e)}"
        )


# ------------------------------------------------------------------------------
# 5. ENDPOINT: /verify_isi (ISI MARK & CM/L LICENSE VERIFICATION)
# ------------------------------------------------------------------------------

# Authoritative BIS CM/L License Registry (Production connects to BIS Database)
MOCK_CML_DATABASE = {
    "8400123456": {
        "is_valid": True,
        "status": "OPERATIVE",
        "manufacturer_name": "Aquasafe Pure Beverages Pvt Ltd",
        "brand_name": "AquaJal Pure",
        "standard_number": "IS 10500:2012",
        "standard_title": "Drinking Water - Specification",
        "valid_up_to": "2027-03-31",
        "factory_address": "Plot 42, Industrial Area Phase II, Sanand, Gujarat 382110",
        "advisory_notice": "Authentic BIS ISI certification. License is currently active and compliant."
    },
    "9512345678": {
        "is_valid": False,
        "status": "EXPIRED",
        "manufacturer_name": "Shakti Electrical Conductors LLP",
        "brand_name": "PowerInsul",
        "standard_number": "IS 15652:2006",
        "standard_title": "Electrical Insulation Mats",
        "valid_up_to": "2023-12-31",
        "factory_address": "Sector 58, Ballabgarh, Faridabad, Haryana",
        "advisory_notice": "WARNING: This BIS license expired on 2023-12-31. Manufacturing under this mark is illegal without renewal."
    }
}


@app.post("/verify_isi", response_model=ISIVerifyResponse, summary="Verify authentic BIS ISI License (CM/L)")
async def verify_isi_endpoint(request: ISIVerifyRequest):
    """
    Validates BIS ISI Certification Marks License (CM/L) number:
    - Normalizes format (handles 'CM/L-', spaces, punctuation).
    - Checks licensing status, expiry date, brand conformance, and manufacturing location.
    - Protects consumers and MSMEs from counterfeit goods.
    """
    raw_input = request.cml_number.strip().upper()
    digits_only = re.sub(r"[^\d]", "", raw_input)

    if not digits_only or len(digits_only) < 7 or len(digits_only) > 10:
        return ISIVerifyResponse(
            cml_number=raw_input,
            is_valid=False,
            status="INVALID_FORMAT",
            advisory_notice="Invalid CM/L number format. BIS license numbers typically consist of 7 to 10 numerical digits (e.g. CM/L-8400123456)."
        )

    record = MOCK_CML_DATABASE.get(digits_only)
    if record:
        return ISIVerifyResponse(
            cml_number=raw_input,
            is_valid=record["is_valid"],
            status=record["status"],
            manufacturer_name=record["manufacturer_name"],
            brand_name=record["brand_name"],
            standard_number=record["standard_number"],
            standard_title=record["standard_title"],
            valid_up_to=record["valid_up_to"],
            factory_address=record["factory_address"],
            advisory_notice=record["advisory_notice"]
        )
    else:
        return ISIVerifyResponse(
            cml_number=raw_input,
            is_valid=False,
            status="NOT_FOUND",
            advisory_notice=f"No active record found in the BIS registry for license #{digits_only}. Please verify with the official BIS 'BIS CARE' portal or your regional BIS branch."
        )


# ------------------------------------------------------------------------------
# 6. ENDPOINT: /upload_standard (PDF INGESTION & CLAUSE CHUNKING)
# ------------------------------------------------------------------------------

@app.post("/upload_standard", response_model=StandardUploadResponse, summary="Ingest and chunk BIS Standard PDF")
async def upload_standard_endpoint(
    file: UploadFile = File(..., description="Official BIS Standard PDF document"),
    standard_id: str = Form(..., description="Standard Code, e.g., 'IS 10500:2012'"),
    standard_title: str = Form(..., description="Standard Title, e.g., 'Drinking Water Specification'")
):
    """
    Ingests a new BIS standard PDF:
    1. Saves the raw file to storage.
    2. Runs semantic clause boundary detection.
    3. Generates embeddings and appends to local FAISS index.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for standard ingestion.")

    safe_filename = re.sub(r"[^\w\-_.]", "_", file.filename)
    dest_path = os.path.join(RAW_STANDARDS_DIR, safe_filename)

    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        chunks = semantic_chunker.chunk_standard(
            pdf_path=dest_path,
            standard_id=standard_id,
            standard_title=standard_title
        )

        if not chunks:
            raise HTTPException(status_code=422, detail="Failed to extract readable clause text from the uploaded PDF.")

        faiss_manager.add_chunks(chunks)

        return StandardUploadResponse(
            message="BIS standard successfully ingested and indexed into FAISS.",
            standard_id=standard_id,
            standard_title=standard_title,
            total_clauses_indexed=len(chunks),
            saved_path=dest_path
        )

    except Exception as e:
        logger.error(f"Error ingesting PDF standard: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process standard PDF: {str(e)}")


# ------------------------------------------------------------------------------
# 7. WHATSAPP CLOUD API WEBHOOK INTEGRATION
# ------------------------------------------------------------------------------

async def send_whatsapp_message(to_number: str, message_text: str):
    """Dispatches a response back to the user via Meta WhatsApp Cloud API."""
    if not WHATSAPP_API_TOKEN or not WHATSAPP_PHONE_NUMBER_ID:
        logger.warning(
            f"[WhatsApp Webhook] Outbound API token or Phone Number ID not set. "
            f"Simulated reply dispatched to {to_number}: '{message_text[:60]}...'"
        )
        return

    url = f"https://graph.facebook.com/v18.0/{WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_API_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "text",
        "text": {"body": message_text}
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(url, json=payload, headers=headers)
            res.raise_for_status()
            logger.info(f"WhatsApp reply sent successfully to {to_number}")
    except Exception as e:
        logger.error(f"Failed to send WhatsApp message to {to_number}: {e}")


async def process_whatsapp_query(sender_phone: str, query_text: str):
    """Background task to run RAG and reply to WhatsApp message."""
    try:
        rag_res: RAGResult = await query_router.query(user_query=query_text)

        reply_body = rag_res.translated_answer or rag_res.answer

        if rag_res.citations:
            citations_str = ", ".join([c["citation"] for c in rag_res.citations])
            reply_body += f"\n\n📌 Ref: {citations_str}"

        reply_body += "\n\n— BIS Sahayak (मानक सहायक)"

        await send_whatsapp_message(to_number=sender_phone, message_text=reply_body)

    except Exception as e:
        logger.error(f"Error handling WhatsApp query from {sender_phone}: {e}")
        fallback_msg = "BIS Sahayak: क्षमा करें, आपका अनुरोध संसाधित करने में समस्या हुई। कृपया पुनः प्रयास करें।"
        await send_whatsapp_message(to_number=sender_phone, message_text=fallback_msg)


@app.get("/webhook/whatsapp", summary="Meta WhatsApp Webhook Verification Challenge")
async def verify_whatsapp_webhook(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token")
):
    """
    Handles Meta WhatsApp Cloud API initial webhook verification challenge handshake.
    """
    if hub_mode == "subscribe" and hub_verify_token == WHATSAPP_VERIFY_TOKEN:
        logger.info("WhatsApp webhook verified successfully.")
        return PlainTextResponse(content=hub_challenge, status_code=200)
    else:
        logger.warning(f"WhatsApp verification token mismatch. Received: {hub_verify_token}")
        raise HTTPException(status_code=403, detail="Verification token mismatch")


@app.post("/webhook/whatsapp", summary="Meta WhatsApp Incoming Message Notification")
async def receive_whatsapp_message(
    request: Request,
    background_tasks: BackgroundTasks
):
    """
    Receives incoming WhatsApp message payload from Meta Cloud API.
    Enqueues RAG query processing as a background task to return HTTP 200 within 3s.
    """
    try:
        body = await request.json()
        logger.info(f"Incoming WhatsApp webhook payload: {body}")

        entry = body.get("entry", [])
        if not entry:
            return JSONResponse({"status": "ignored", "reason": "No entry field"})

        changes = entry[0].get("changes", [])
        if not changes:
            return JSONResponse({"status": "ignored", "reason": "No changes field"})

        value = changes[0].get("value", {})
        messages = value.get("messages", [])

        if messages:
            message_obj = messages[0]
            sender_id = message_obj.get("from")
            msg_type = message_obj.get("type")

            if msg_type == "text":
                text_content = message_obj.get("text", {}).get("body", "")
                logger.info(f"WhatsApp message from {sender_id}: '{text_content}'")
                background_tasks.add_task(process_whatsapp_query, sender_id, text_content)

        return JSONResponse({"status": "received"}, status_code=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error in WhatsApp webhook post: {e}", exc_info=True)
        return JSONResponse({"status": "error", "message": str(e)}, status_code=200)


# ------------------------------------------------------------------------------
# 8. HEALTH & DIAGNOSTIC ENDPOINT
# ------------------------------------------------------------------------------

@app.get("/health", summary="Service Health and Vector Store Status")
async def health_check():
    """Health check for load balancers and container monitoring."""
    index_loaded = faiss_manager.vector_store is not None
    return {
        "status": "healthy",
        "service": "BIS Sahayak Core API",
        "version": "1.0.0",
        "vector_store": {
            "status": "initialized" if index_loaded else "empty",
            "type": "FAISS (Local CPU)",
            "index_path": faiss_manager.index_dir
        },
        "bhashini": {
            "configured": bhashini_client.is_configured
        },
        "whatsapp": {
            "configured": bool(WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID)
        }
    }


@app.get("/", summary="Root Documentation Link")
async def root():
    return {
        "app": "BIS Sahayak",
        "tagline": "AI-Powered Compliance Assistant for Bureau of Indian Standards",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }


# ------------------------------------------------------------------------------
# 9. LOCAL RUNNER
# ------------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
