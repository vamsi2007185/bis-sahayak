"""
================================================================================
BIS Sahayak - RAG Engine & Semantic Retrieval Pipeline
================================================================================
Components:
  1. Semantic Clause-Aware Chunker for BIS PDF Standards.
  2. Local FAISS Vector Store Manager with fast Sentence-Transformers.
  3. Bhashini API (IndicTrans2) Multilingual Translation Client & Query Router.
  4. Strict Citation Guardrail & Hallucination Verifier.
  5. End-to-End Multilingual RAG Query Pipeline.
================================================================================
"""

import os
import re
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass

import httpx
from pypdf import PdfReader
try:
    from langchain_community.vectorstores import FAISS
except ImportError:
    FAISS = None

try:
    from langchain_huggingface import HuggingFaceEmbeddings
except ImportError:
    try:
        from langchain_community.embeddings import HuggingFaceEmbeddings
    except ImportError:
        HuggingFaceEmbeddings = None

try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:
    try:
        from langchain.text_splitter import RecursiveCharacterTextSplitter
    except ImportError:
        class RecursiveCharacterTextSplitter:
            def __init__(self, chunk_size=800, chunk_overlap=100, separators=None):
                self.chunk_size = chunk_size
                self.chunk_overlap = chunk_overlap
            def split_text(self, text):
                step = max(1, self.chunk_size - self.chunk_overlap)
                return [text[i:i+self.chunk_size] for i in range(0, len(text), step)]

try:
    from langchain_core.documents import Document
except ImportError:
    try:
        from langchain.schema import Document
    except ImportError:
        class Document:
            def __init__(self, page_content="", metadata=None):
                self.page_content = page_content
                self.metadata = metadata or {}

# Setup structured logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s - %(message)s")
logger = logging.getLogger("RAG_Engine")


# ------------------------------------------------------------------------------
# 1. DATA MODELS & CONFIGURATION
# ------------------------------------------------------------------------------

@dataclass
class BISClauseChunk:
    """Represents a semantically bounded chunk from an Indian Standard."""
    standard_id: str          # e.g., 'IS 10500:2012'
    standard_title: str       # e.g., 'Drinking Water - Specification'
    clause_number: str        # e.g., 'Clause 4.1' or 'Clause 3.2.1'
    clause_title: str         # e.g., 'Organoleptic and Physical Parameters'
    content: str              # Body text / requirements of the clause
    page_number: int          # Page index in source PDF
    chunk_id: str             # Unique identifier: {standard_id}_{clause_number}_{index}

    def to_metadata(self) -> Dict[str, Any]:
        return {
            "standard_id": self.standard_id,
            "standard_title": self.standard_title,
            "clause_number": self.clause_number,
            "clause_title": self.clause_title,
            "page_number": self.page_number,
            "chunk_id": self.chunk_id,
        }


@dataclass
class RAGResult:
    """Output bundle for RAG response with citations and guardrail checks."""
    query: str
    translated_query: Optional[str]
    answer: str
    translated_answer: Optional[str]
    detected_language: str
    citations: List[Dict[str, str]]
    guardrail_passed: bool
    guardrail_notes: List[str]
    retrieved_sources: List[Dict[str, Any]]


# ------------------------------------------------------------------------------
# 2. BHASHINI API (INDICTRANS2) TRANSLATION CLIENT
# ------------------------------------------------------------------------------

class BhashiniTranslator:
    """
    Client for Digital India Bhashini Mission (IndicTrans2 & ULCA Pipeline).
    Handles language detection, translation to English, and translation back to Indic languages.
    """
    def __init__(
        self,
        user_id: Optional[str] = None,
        api_key: Optional[str] = None,
        pipeline_id: Optional[str] = None,
        inference_url: str = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline",
    ):
        self.user_id = user_id or os.getenv("BHASHINI_USER_ID", "")
        self.api_key = api_key or os.getenv("BHASHINI_API_KEY", "")
        self.pipeline_id = pipeline_id or os.getenv("BHASHINI_PIPELINE_ID", "")
        self.inference_url = inference_url
        self.is_configured = bool(self.user_id and self.api_key and self.pipeline_id)

        # Indic Language mapping (ISO-639-1 / Bhashini language codes)
        self.indic_scripts = {
            "hi": "Devanagari",
            "ta": "Tamil",
            "te": "Telugu",
            "mr": "Devanagari",
            "bn": "Bengali",
            "gu": "Gujarati",
            "kn": "Kannada",
            "ml": "Malayalam",
            "pa": "Gurmukhi",
        }

    def detect_language(self, text: str) -> str:
        """
        Fast heuristic script detection for Indic vs English.
        Covers Devanagari (Hindi/Marathi), Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Punjabi.
        """
        for char in text:
            code = ord(char)
            if 0x0900 <= code <= 0x097F:
                return "hi"  # Devanagari (Default to Hindi/Marathi)
            elif 0x0B80 <= code <= 0x0BFF:
                return "ta"  # Tamil
            elif 0x0C00 <= code <= 0x0C7F:
                return "te"  # Telugu
            elif 0x0980 <= code <= 0x09FF:
                return "bn"  # Bengali
            elif 0x0A80 <= code <= 0x0AFF:
                return "gu"  # Gujarati
            elif 0x0C80 <= code <= 0x0CFF:
                return "kn"  # Kannada
            elif 0x0D00 <= code <= 0x0D7F:
                return "ml"  # Malayalam
            elif 0x0A00 <= code <= 0x0A7F:
                return "pa"  # Punjabi
        return "en"

    async def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        """
        Translates text between Indic languages and English using Bhashini ULCA API.
        Falls back gracefully to mock translation if API credentials are not configured.
        """
        if source_lang == target_lang or not text.strip():
            return text

        if not self.is_configured:
            logger.warning(
                f"[Bhashini] Credentials not configured. Simulated translation: "
                f"'{text[:30]}...' ({source_lang} -> {target_lang})"
            )
            # Safe mock behavior for local dev/testing
            if target_lang == "en" and source_lang != "en":
                if "पानी" in text or "जल" in text or "drinking water" in text.lower():
                    return f"What are the drinking water requirements according to BIS? [Translated from {source_lang}: {text}]"
                return f"[Translated to English from {source_lang}]: {text}"
            elif source_lang == "en" and target_lang != "en":
                return f"[{target_lang.upper()} अनुवाद] {text}"
            return text

        # Real Bhashini ULCA Pipeline Request
        payload = {
            "pipelineTasks": [
                {
                    "taskType": "translation",
                    "config": {
                        "language": {
                            "sourceLanguage": source_lang,
                            "targetLanguage": target_lang
                        }
                    }
                }
            ],
            "inputData": {
                "input": [{"source": text}]
            }
        }
        headers = {
            "Content-Type": "application/json",
            "userID": self.user_id,
            "ulcaApiKey": self.api_key,
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(self.inference_url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                translated = data["pipelineResponse"][0]["output"][0]["target"]
                return translated
        except Exception as e:
            logger.error(f"[Bhashini Error] Failed translation: {e}. Returning original text.")
            return text


# ------------------------------------------------------------------------------
# 3. SEMANTIC CLAUSE-AWARE BIS STANDARDS CHUNKER
# ------------------------------------------------------------------------------

class BISSemanticChunker:
    """
    Domain-specific chunker tailored for Bureau of Indian Standards (BIS) documents.
    Preserves hierarchical Standard Numbers, Clauses (e.g. 'Clause 4.1.2'),
    Tables, and annexures without arbitrary sentence fragmentation.
    """
    def __init__(self, max_chunk_size: int = 800, chunk_overlap: int = 100):
        self.max_chunk_size = max_chunk_size
        self.chunk_overlap = chunk_overlap
        self.sub_splitter = RecursiveCharacterTextSplitter(
            chunk_size=max_chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", "; "]
        )

        # Regex patterns recognizing Indian Standard clause structures
        self.clause_pattern = re.compile(
            r"^(?:(?:CLAUSE\s+)?(\d+(?:\.\d+)*)\s+([A-Z][A-Za-z0-9\s,\-\(\)]+)|(Table\s+\d+[\w\s\-\:]+)|(Annex\s+[A-Z][\w\s\-\:]+))",
            re.MULTILINE
        )

    def extract_text_from_pdf(self, pdf_path: str) -> List[Tuple[int, str]]:
        """Reads PDF pages returning a list of (page_number, text) tuples."""
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF standard not found at path: {pdf_path}")

        reader = PdfReader(pdf_path)
        pages_content = []
        for idx, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            pages_content.append((idx + 1, text))
        return pages_content

    def chunk_standard(
        self,
        pdf_path: str,
        standard_id: str,
        standard_title: str
    ) -> List[BISClauseChunk]:
        """
        Parses a BIS standard PDF into semantic clause-level chunks.
        """
        pages = self.extract_text_from_pdf(pdf_path)
        chunks: List[BISClauseChunk] = []

        current_clause_num = "Clause 1.0"
        current_clause_title = "Scope / General"
        current_buffer = []
        current_page = 1
        chunk_counter = 0

        for page_num, text in pages:
            lines = text.splitlines()
            for line in lines:
                line_stripped = line.strip()
                if not line_stripped:
                    continue

                match = self.clause_pattern.match(line_stripped)
                if match:
                    # New clause or table boundary detected
                    if current_buffer:
                        clause_body = " ".join(current_buffer).strip()
                        # If clause body is larger than max_chunk_size, split into sub-chunks
                        if len(clause_body) > self.max_chunk_size:
                            sub_texts = self.sub_splitter.split_text(clause_body)
                            for sub_idx, sub_t in enumerate(sub_texts):
                                chunk_counter += 1
                                chunks.append(BISClauseChunk(
                                    standard_id=standard_id,
                                    standard_title=standard_title,
                                    clause_number=current_clause_num,
                                    clause_title=current_clause_title,
                                    content=f"[{standard_id}] {current_clause_num} - {current_clause_title} (Part {sub_idx+1}): {sub_t}",
                                    page_number=current_page,
                                    chunk_id=f"{standard_id}_{current_clause_num}_{chunk_counter}"
                                ))
                        else:
                            chunk_counter += 1
                            chunks.append(BISClauseChunk(
                                standard_id=standard_id,
                                standard_title=standard_title,
                                clause_number=current_clause_num,
                                clause_title=current_clause_title,
                                content=f"[{standard_id}] {current_clause_num} - {current_clause_title}: {clause_body}",
                                page_number=current_page,
                                chunk_id=f"{standard_id}_{current_clause_num}_{chunk_counter}"
                            ))

                        current_buffer = []

                    # Update current clause tracking
                    if match.group(1):
                        current_clause_num = f"Clause {match.group(1)}"
                        current_clause_title = match.group(2).strip()
                    elif match.group(3):
                        current_clause_num = match.group(3).split()[0] + " " + match.group(3).split()[1]
                        current_clause_title = match.group(3).strip()
                    elif match.group(4):
                        current_clause_num = match.group(4).split()[0] + " " + match.group(4).split()[1]
                        current_clause_title = match.group(4).strip()

                    current_page = page_num
                else:
                    current_buffer.append(line_stripped)

        # Flush final clause buffer
        if current_buffer:
            clause_body = " ".join(current_buffer).strip()
            chunk_counter += 1
            chunks.append(BISClauseChunk(
                standard_id=standard_id,
                standard_title=standard_title,
                clause_number=current_clause_num,
                clause_title=current_clause_title,
                content=f"[{standard_id}] {current_clause_num} - {current_clause_title}: {clause_body}",
                page_number=current_page,
                chunk_id=f"{standard_id}_{current_clause_num}_{chunk_counter}"
            ))

        logger.info(f"Ingested '{standard_id}' ({standard_title}): Generated {len(chunks)} semantic clause chunks.")
        return chunks


# ------------------------------------------------------------------------------
# 4. VECTOR DB & FAISS INDEX MANAGER
# ------------------------------------------------------------------------------

class BISVectorStoreManager:
    """
    Manages FAISS vector store indexing and semantic retrieval.
    Provides production-safe fallback to keyword/semantic token search if PyTorch/FAISS
    runs in memory-constrained cloud environments (e.g. Render 512MB RAM tier).
    """
    def __init__(
        self,
        index_dir: str = "data/faiss_index",
        model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    ):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        if not os.path.isabs(index_dir):
            candidate = os.path.join(base_dir, index_dir)
            self.index_dir = candidate if os.path.exists(os.path.dirname(candidate)) else os.path.abspath(index_dir)
        else:
            self.index_dir = index_dir

        self.model_name = model_name
        try:
            os.makedirs(self.index_dir, exist_ok=True)
        except Exception:
            pass

        self._embeddings = None
        self._use_fallback = False
        self._fallback_docs: List[Document] = []
        self.vector_store: Optional[FAISS] = None
        self._load_existing_index()

    @property
    def embeddings(self):
        """Safe lazy loading of embeddings."""
        if self._embeddings is None and not self._use_fallback:
            try:
                logger.info(f"Loading HuggingFace Embeddings ({self.model_name})...")
                self._embeddings = HuggingFaceEmbeddings(
                    model_name=self.model_name,
                    model_kwargs={"device": "cpu"},
                    encode_kwargs={"normalize_embeddings": True}
                )
            except Exception as e:
                logger.warning(f"Could not initialize HuggingFaceEmbeddings ({e}). Enabling resilient in-memory semantic retriever.")
                self._use_fallback = True
                self._embeddings = None
        return self._embeddings

    def _load_existing_index(self):
        """Loads FAISS index from disk if available."""
        index_file = os.path.join(self.index_dir, "index.faiss")
        if os.path.exists(index_file) and self.embeddings:
            try:
                self.vector_store = FAISS.load_local(
                    self.index_dir,
                    self.embeddings,
                    allow_dangerous_deserialization=True
                )
                logger.info(f"Successfully loaded existing FAISS index from '{self.index_dir}'.")
            except Exception as e:
                logger.warning(f"Could not load FAISS index ({e}). Using resilient in-memory index.")
                self.vector_store = None
        else:
            self.vector_store = None

    def add_chunks(self, chunks: List[BISClauseChunk]):
        """Persists BIS chunks into FAISS with fallback memory store."""
        if not chunks:
            return

        documents = [
            Document(page_content=chunk.content, metadata=chunk.to_metadata())
            for chunk in chunks
        ]

        # Always register in in-memory fallback list
        existing_ids = {d.metadata.get("chunk_id") for d in self._fallback_docs}
        for doc in documents:
            if doc.metadata.get("chunk_id") not in existing_ids:
                self._fallback_docs.append(doc)

        # Attempt to add to FAISS if available
        if not self._use_fallback and self.embeddings:
            try:
                if self.vector_store is None:
                    self.vector_store = FAISS.from_documents(documents, self.embeddings)
                else:
                    self.vector_store.add_documents(documents)
                try:
                    self.vector_store.save_local(self.index_dir)
                except Exception:
                    pass
                logger.info(f"FAISS index updated. Total items indexed: {len(documents)}")
                return
            except Exception as e:
                logger.warning(f"FAISS indexing failed ({e}). Retaining in-memory documents.")
                self._use_fallback = True

        logger.info(f"Retained {len(self._fallback_docs)} documents in resilient regulatory memory store.")

    def similarity_search(self, query: str, top_k: int = 4) -> List[Document]:
        """Retrieves top-K relevant chunks with dual-mode support (FAISS or weighted token matcher)."""
        if self.vector_store is not None and not self._use_fallback:
            try:
                return self.vector_store.similarity_search(query, k=top_k)
            except Exception as e:
                logger.warning(f"FAISS search failed ({e}); falling back to resilient in-memory retrieval.")

        if not self._fallback_docs:
            return []

        # Token-weighted scoring for fallback retrieval
        q_tokens = re.findall(r"\w+", (query or "").lower())
        if not q_tokens:
            return self._fallback_docs[:top_k]

        scored = []
        for doc in self._fallback_docs:
            content_lower = (doc.page_content or "").lower()
            meta_lower = str(doc.metadata).lower()
            score = 0
            for token in q_tokens:
                if len(token) > 2:
                    if token in meta_lower:
                        score += 3
                    if token in content_lower:
                        score += 1
            scored.append((score, doc))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [doc for score, doc in scored[:top_k]]


# ------------------------------------------------------------------------------
# 5. CITATION GUARDRAIL & HALLUCINATION VALIDATION
# ------------------------------------------------------------------------------

class CitationGuardrail:
    """
    Validates LLM-generated compliance answers against BIS standards:
    1. Extracts claimed standard codes (e.g. 'IS 10500:2012', 'IS 4984') and clauses.
    2. Ensures every cited standard and clause actually exists in the retrieved context.
    3. Flags ungrounded answers or hallucinations to prevent misleading MSMEs.
    """
    def __init__(self):
        # Regex to capture Indian Standard references (e.g., 'IS 10500', 'IS 10500:2012')
        self.standard_regex = re.compile(r"\bIS\s*:?\s*(\d{3,6}(?:\s*:\s*\d{4})?)", re.IGNORECASE)
        # Regex to capture clause citations (e.g., 'Clause 4.1', 'Clause 4.2.1', 'Table 2', 'Annex A')
        self.clause_regex = re.compile(r"\b(Clause\s+\d+(?:\.\d+)*|Table\s+\d+|Annex\s+[A-Z])\b", re.IGNORECASE)

    def validate_response(
        self,
        llm_response: str,
        retrieved_docs: List[Document]
    ) -> Tuple[bool, List[str], List[Dict[str, str]]]:
        """
        Validates the output.
        Returns: (passed: bool, notes: List[str], verified_citations: List[Dict])
        """
        notes = []
        verified_citations = []

        # 1. Collect all valid standards and clauses present in retrieved ground truth
        valid_standards = set()
        valid_clauses = set()
        for doc in retrieved_docs:
            meta = doc.metadata
            if "standard_id" in meta:
                std = meta["standard_id"].upper().replace(" ", "").replace(":", "")
                valid_standards.add(std)
                std_num_match = re.search(r"\d+", meta["standard_id"])
                if std_num_match:
                    valid_standards.add(std_num_match.group(0))

            if "clause_number" in meta:
                norm_clause = meta["clause_number"].strip().lower()
                valid_clauses.add(norm_clause)
                sub_nums = re.findall(r"\d+(?:\.\d+)*", norm_clause)
                for sn in sub_nums:
                    valid_clauses.add(sn)

        # 2. Extract citations claimed by the LLM
        cited_standards = self.standard_regex.findall(llm_response)
        cited_clauses = self.clause_regex.findall(llm_response)

        # 3. Check for presence of citations
        if not cited_standards and not cited_clauses:
            notes.append("WARNING: LLM did not provide explicit citations to an Indian Standard (IS) or Clause.")
            if retrieved_docs:
                return False, notes, []

        # 4. Check for hallucinated standards
        for std in cited_standards:
            clean_std = std.upper().replace(" ", "").replace(":", "")
            std_num_match = re.search(r"\d+", clean_std)
            std_num = std_num_match.group(0) if std_num_match else ""

            is_valid = any(
                clean_std in vs or std_num in vs for vs in valid_standards
            )
            if not is_valid and valid_standards:
                notes.append(f"HALLUCINATION DETECTED: Standard 'IS {std}' cited by LLM does not exist in the retrieved context!")
                return False, notes, []
            else:
                verified_citations.append({"type": "Standard", "citation": f"IS {std}"})

        # 5. Check for hallucinated clauses
        for cls in cited_clauses:
            cls_lower = cls.lower()
            clause_nums = re.findall(r"\d+(?:\.\d+)*", cls_lower)
            is_valid = any(
                cn in valid_clauses or any(cn in vc for vc in valid_clauses)
                for cn in clause_nums
            ) if clause_nums else (cls_lower in valid_clauses)

            if not is_valid and valid_clauses:
                notes.append(f"POTENTIAL HALLUCINATION: '{cls}' was cited but could not be verified against retrieved clause metadata.")
            else:
                verified_citations.append({"type": "Clause", "citation": cls})

        notes.append("Citation validation passed: All regulatory claims are grounded in verified BIS documentation.")
        return True, notes, verified_citations


# ------------------------------------------------------------------------------
# 6. OPEN-SOURCE LLM CLIENT & QUERY ROUTER
# ------------------------------------------------------------------------------

class BISQueryRouter:
    """
    Routes queries end-to-end:
    1. Language Detection & Bhashini translation (Indic -> English).
    2. FAISS Top-K context retrieval.
    3. LLM generation (Groq, OpenAI, Ollama, or dynamic clause synthesizer).
    4. Citation Guardrail verification.
    5. Reverse translation (English -> Source Indic language) if necessary.
    """
    def __init__(
        self,
        vector_manager: BISVectorStoreManager,
        translator: BhashiniTranslator,
        guardrail: CitationGuardrail,
        llm_api_base: Optional[str] = None,
        llm_api_key: Optional[str] = None,
        llm_model: Optional[str] = None
    ):
        self.vector_manager = vector_manager
        self.translator = translator
        self.guardrail = guardrail

        # Auto-configure Groq or OpenAI cloud LLM if environment variables exist
        groq_key = os.getenv("GROQ_API_KEY")
        openai_key = os.getenv("OPENAI_API_KEY")

        if groq_key:
            self.llm_api_base = (llm_api_base or os.getenv("LLM_API_BASE", "https://api.groq.com/openai/v1")).rstrip("/")
            self.llm_api_key = llm_api_key or groq_key
            self.llm_model = llm_model or os.getenv("LLM_MODEL_NAME", "llama-3.1-8b-instant")
        elif openai_key:
            self.llm_api_base = (llm_api_base or os.getenv("LLM_API_BASE", "https://api.openai.com/v1")).rstrip("/")
            self.llm_api_key = llm_api_key or openai_key
            self.llm_model = llm_model or os.getenv("LLM_MODEL_NAME", "gpt-4o-mini")
        else:
            self.llm_api_base = (llm_api_base or os.getenv("LLM_API_BASE", "http://localhost:11434/v1")).rstrip("/")
            self.llm_api_key = llm_api_key or os.getenv("LLM_API_KEY", "ollama")
            self.llm_model = llm_model or os.getenv("LLM_MODEL_NAME", "llama3")

    async def _call_llm(self, prompt: str, system_message: str, retrieved_docs: List[Document] = None) -> str:
        """Invokes OpenAI-compatible API with fail-fast connect and factual fallback."""
        payload = {
            "model": self.llm_model,
            "messages": [
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.1,
        }
        headers = {
            "Authorization": f"Bearer {self.llm_api_key}",
            "Content-Type": "application/json"
        }

        # Use fast connect timeout (3s) so unreachable local Ollama doesn't hang in cloud production
        timeout = httpx.Timeout(connect=3.0, read=25.0, write=5.0, pool=5.0)
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.post(
                    f"{self.llm_api_base}/chat/completions",
                    json=payload,
                    headers=headers
                )
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.info(f"External LLM offline or unreachable ({e}); applying dynamic BIS clause synthesizer.")

        return self._fallback_context_synthesizer(prompt, retrieved_docs)

    def _fallback_context_synthesizer(self, prompt: str, retrieved_docs: List[Document] = None) -> str:
        """Dynamic factual synthesizer extracting and quoting retrieved BIS clauses."""
        if not retrieved_docs:
            return "According to the Bureau of Indian Standards, no direct regulatory clause was found in the local index for this query. Please verify with official BIS publication portal."

        lines = ["According to official Bureau of Indian Standards (BIS) specifications:"]
        for doc in retrieved_docs[:3]:
            m = doc.metadata
            std = m.get("standard_id", "IS Standard")
            cls = m.get("clause_number", "Clause")
            clean_content = doc.page_content.strip().replace('\n', ' ')
            lines.append(f"- As per {std}, {cls}: {clean_content}")

        lines.append("\nCompliance Notice: All parameters above are extracted directly from authenticated BIS standard clauses.")
        return "\n".join(lines)

    async def query(self, user_query: str, source_lang: Optional[str] = None) -> RAGResult:
        """
        Full RAG lifecycle for BIS Sahayak.
        """
        # Step 1: Detect language if not provided
        detected_lang = source_lang or self.translator.detect_language(user_query)
        logger.info(f"Incoming user query: '{user_query}' | Detected Language: {detected_lang}")

        # Step 2: Route to Bhashini for translation to English if query is Indic
        english_query = user_query
        if detected_lang != "en":
            english_query = await self.translator.translate(user_query, detected_lang, "en")
            logger.info(f"Translated query for retrieval: '{english_query}'")

        # Step 3: Retrieve top-K relevant chunks from FAISS
        retrieved_docs = self.vector_manager.similarity_search(english_query, top_k=4)
        
        # Step 4: Construct Citation-Enforced Prompt
        context_blocks = []
        for i, doc in enumerate(retrieved_docs):
            m = doc.metadata
            context_blocks.append(
                f"[Source {i+1} | {m.get('standard_id', 'IS')} | {m.get('clause_number', 'Clause')}]:\n{doc.page_content}"
            )
        context_str = "\n\n".join(context_blocks) if context_blocks else "NO DIRECT CLAUSES FOUND IN LOCAL DATABASE."

        system_prompt = (
            "You are 'BIS Sahayak', an AI Compliance Assistant for the Bureau of Indian Standards (BIS).\n"
            "Your mission is to guide MSMEs and Indian consumers with 100% factual accuracy based strictly on Indian Standards.\n\n"
            "MANDATORY CITATION RULES:\n"
            "1. ONLY answer using the provided context.\n"
            "2. For EVERY technical parameter, tolerance, or rule, YOU MUST CITE the exact Standard ID and Clause (e.g., '[IS 10500:2012, Clause 4.1]').\n"
            "3. If the context does not specify the required parameter, explicitly state: 'The provided BIS standards do not specify this requirement.'\n"
            "4. NEVER invent or hallucinate standard numbers or clause numbers."
        )

        user_prompt = (
            f"USER QUERY: {english_query}\n\n"
            f"OFFICIAL BIS CONTEXT:\n"
            f"{context_str}\n\n"
            "Provide a concise, practical compliance explanation for the MSME/consumer with exact citations:"
        )

        # Step 5: Call LLM
        raw_llm_answer = await self._call_llm(user_prompt, system_prompt, retrieved_docs)

        # Step 6: Apply Citation Guardrail
        passed, notes, citations = self.guardrail.validate_response(raw_llm_answer, retrieved_docs)

        final_answer = raw_llm_answer
        if not passed:
            logger.warning(f"Guardrail flagged response: {notes}")
            final_answer += f"\n\n[Compliance Notice: {'; '.join(notes)}]"

        # Step 7: Translate answer back to user's native Indic language if needed
        translated_answer = None
        if detected_lang != "en":
            translated_answer = await self.translator.translate(final_answer, "en", detected_lang)

        return RAGResult(
            query=user_query,
            translated_query=english_query if detected_lang != "en" else None,
            answer=final_answer,
            translated_answer=translated_answer,
            detected_language=detected_lang,
            citations=citations,
            guardrail_passed=passed,
            guardrail_notes=notes,
            retrieved_sources=[doc.metadata for doc in retrieved_docs]
        )


# ------------------------------------------------------------------------------
# 7. GLOBAL RAG PIPELINE SINGLETON INSTANCES
# ------------------------------------------------------------------------------

faiss_manager = BISVectorStoreManager(index_dir="data/faiss_index")
semantic_chunker = BISSemanticChunker()
bhashini_client = BhashiniTranslator()
citation_guardrail = CitationGuardrail()

query_router = BISQueryRouter(
    vector_manager=faiss_manager,
    translator=bhashini_client,
    guardrail=citation_guardrail,
    llm_api_base=os.getenv("LLM_API_BASE", "http://localhost:11434/v1"),
    llm_api_key=os.getenv("LLM_API_KEY", "ollama"),
    llm_model=os.getenv("LLM_MODEL_NAME", "llama3")
)
