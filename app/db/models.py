"""
Database Models for BIS Sahayak (PostgreSQL / SQLAlchemy ORM)
"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, JSON
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class BISStandard(Base):
    """Catalog of Indian Standards ingested into the system."""
    __tablename__ = "bis_standards"

    id = Column(Integer, primary_key=True, autoincrement=True)
    standard_id = Column(String(50), unique=True, nullable=False, index=True)  # e.g., "IS 10500:2012"
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    pdf_filename = Column(String(255), nullable=False)
    total_clauses = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class CMLLicense(Base):
    """Authoritative register of BIS CM/L (Certification Marks / License) numbers."""
    __tablename__ = "cml_licenses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cml_number = Column(String(20), unique=True, nullable=False, index=True)  # e.g. "8400123456"
    manufacturer_name = Column(String(255), nullable=False)
    brand_name = Column(String(100), nullable=True)
    standard_number = Column(String(50), nullable=False)  # e.g., "IS 10500:2012"
    status = Column(String(30), default="OPERATIVE")      # OPERATIVE, EXPIRED, SUSPENDED, CANCELLED
    valid_up_to = Column(DateTime, nullable=True)
    factory_address = Column(Text, nullable=True)
    is_valid = Column(Boolean, default=True)


class ComplianceQueryAudit(Base):
    """Audit log of user queries, language routing, and guardrail validations."""
    __tablename__ = "compliance_query_audits"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(100), nullable=True)
    channel = Column(String(50), default="web")  # "web", "whatsapp", "mobile"
    user_query = Column(Text, nullable=False)
    detected_language = Column(String(10), default="en")
    english_query = Column(Text, nullable=True)
    response_english = Column(Text, nullable=False)
    response_localized = Column(Text, nullable=True)
    citations = Column(JSON, nullable=True)
    guardrail_passed = Column(Boolean, default=True)
    guardrail_notes = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
