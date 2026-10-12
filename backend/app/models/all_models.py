import uuid
from datetime import datetime, timezone
import json
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

# ----------------- USERS & AUTH -----------------
class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    documents = relationship("MedicalDocument", back_populates="user", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="user", cascade="all, delete-orphan")
    medicines = relationship("Medicine", back_populates="user", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(50), nullable=True)
    phone = Column(String(50), nullable=True)
    photo_url = Column(String(500), nullable=True)
    allergies = Column(JSON, default=list)
    existing_conditions = Column(JSON, default=list)
    emergency_contact = Column(JSON, default=dict)
    preferred_language = Column(String(20), default="en")
    timezone = Column(String(50), default="UTC")
    completed = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    user = relationship("User", back_populates="profile")


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    reminder_sound = Column(Boolean, default=True)
    browser_push_enabled = Column(Boolean, default=True)
    email_reminders = Column(Boolean, default=False)
    dark_theme = Column(Boolean, default=True)
    voice_language = Column(String(20), default="en")

    user = relationship("User", back_populates="preferences")


# ----------------- MEDICAL DOCUMENTS & OCR -----------------
class MedicalDocument(Base):
    __tablename__ = "medical_documents"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    original_filename = Column(String(255), nullable=False)
    storage_path = Column(String(500), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, default=0)
    document_type = Column(String(50), default="general_report")  # lab_report, prescription, diagnostic, etc.
    upload_timestamp = Column(DateTime, default=get_utc_now)
    processing_status = Column(String(50), default="uploaded")   # uploaded, queued, extracting, analyzing, indexing, completed, failed
    processing_error = Column(Text, nullable=True)
    extraction_metadata = Column(JSON, default=dict)
    is_deleted = Column(Boolean, default=False)

    user = relationship("User", back_populates="documents")
    extracted_data = relationship("ExtractedDocumentData", back_populates="document", uselist=False, cascade="all, delete-orphan")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    report_analyses = relationship("ReportAnalysis", back_populates="document", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="document", cascade="all, delete-orphan")


class ExtractedDocumentData(Base):
    __tablename__ = "extracted_document_data"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("medical_documents.id", ondelete="CASCADE"), unique=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    raw_text = Column(Text, nullable=False)
    structured_data = Column(JSON, default=dict)
    confidence = Column(Float, default=0.95)
    page_count = Column(Integer, default=1)
    created_at = Column(DateTime, default=get_utc_now)

    document = relationship("MedicalDocument", back_populates="extracted_data")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    document_id = Column(String(36), ForeignKey("medical_documents.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    chunk_text = Column(Text, nullable=False)
    chunk_index = Column(Integer, default=0)
    page_number = Column(Integer, default=1)
    source_metadata = Column(JSON, default=dict)
    # Stored as serialized vector for portability across SQLite and PostgreSQL
    embedding_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    document = relationship("MedicalDocument", back_populates="chunks")


class DocumentProcessingJob(Base):
    __tablename__ = "document_processing_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("medical_documents.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_type = Column(String(50), default="ocr_and_rag")
    status = Column(String(50), default="queued")
    progress = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)


# ----------------- PRESCRIPTIONS & MEDICINES -----------------
class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    document_id = Column(String(36), ForeignKey("medical_documents.id", ondelete="SET NULL"), nullable=True)
    doctor_name = Column(String(255), nullable=True)
    clinic_name = Column(String(255), nullable=True)
    prescription_date = Column(String(50), nullable=True)
    raw_text = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=False)
    extraction_status = Column(String(50), default="completed")
    created_at = Column(DateTime, default=get_utc_now)

    user = relationship("User", back_populates="prescriptions")
    document = relationship("MedicalDocument", back_populates="prescriptions")
    medicines = relationship("PrescriptionMedicine", back_populates="prescription", cascade="all, delete-orphan")


class PrescriptionMedicine(Base):
    __tablename__ = "prescription_medicines"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    prescription_id = Column(String(36), ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    medicine_name = Column(String(255), nullable=False)
    generic_name = Column(String(255), nullable=True)
    strength = Column(String(100), nullable=True)
    dosage_form = Column(String(100), default="Tablet")  # Tablet, Capsule, Syrup, Injection
    dose = Column(String(100), default="1 tablet")
    route = Column(String(100), default="Oral")
    frequency = Column(String(100), default="Once daily")
    duration = Column(String(100), default="7 days")
    quantity = Column(String(100), nullable=True)
    food_instructions = Column(String(100), default="after_food")  # before_food, after_food, with_food, anytime
    scheduled_timing = Column(JSON, default=list)  # ["08:00", "20:00"]
    confidence = Column(Float, default=0.92)
    is_unclear = Column(Boolean, default=False)
    is_confirmed = Column(Boolean, default=False)
    clinical_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    prescription = relationship("Prescription", back_populates="medicines")


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    prescription_medicine_id = Column(String(36), ForeignKey("prescription_medicines.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    generic_name = Column(String(255), nullable=True)
    strength = Column(String(100), nullable=True)
    dosage_form = Column(String(100), default="Tablet")
    prescribed_dose = Column(String(100), default="1 tablet")
    route = Column(String(100), default="Oral")
    frequency = Column(String(100), default="Once daily")
    time_slots = Column(JSON, default=lambda: ["09:00"])
    food_instructions = Column(String(100), default="after_food")
    purpose = Column(Text, nullable=True)
    precautions = Column(JSON, default=list)
    side_effects = Column(JSON, default=list)
    warnings = Column(JSON, default=list)
    prescriber = Column(String(255), nullable=True)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    status = Column(String(50), default="active")  # active, completed, archived
    source = Column(String(50), default="manual")  # manual, pres_scan, medi_scan
    created_at = Column(DateTime, default=get_utc_now)

    user = relationship("User", back_populates="medicines")
    schedules = relationship("MedicationSchedule", back_populates="medicine", cascade="all, delete-orphan")
    dose_events = relationship("MedicationDoseEvent", back_populates="medicine", cascade="all, delete-orphan")


class MedicationSchedule(Base):
    __tablename__ = "medication_schedules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    medicine_id = Column(String(36), ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False)
    dose_time = Column(String(10), nullable=False)  # HH:MM format e.g. "08:00"
    dosage = Column(String(100), default="1 tablet")
    food_instruction = Column(String(100), default="after_food")
    is_active = Column(Boolean, default=True)
    timezone = Column(String(50), default="UTC")
    created_at = Column(DateTime, default=get_utc_now)

    medicine = relationship("Medicine", back_populates="schedules")
    dose_events = relationship("MedicationDoseEvent", back_populates="schedule", cascade="all, delete-orphan")


class MedicationDoseEvent(Base):
    __tablename__ = "medication_dose_events"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    medicine_id = Column(String(36), ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False)
    schedule_id = Column(String(36), ForeignKey("medication_schedules.id", ondelete="SET NULL"), nullable=True)
    scheduled_date = Column(String(20), nullable=False)  # YYYY-MM-DD
    scheduled_time = Column(String(10), nullable=False)  # HH:MM
    status = Column(String(50), default="taken")  # taken, skipped, missed, corrected
    action_timestamp = Column(DateTime, default=get_utc_now)
    audit_notes = Column(Text, nullable=True)

    medicine = relationship("Medicine", back_populates="dose_events")
    schedule = relationship("MedicationSchedule", back_populates="dose_events")


# ----------------- REPORTS & RAG AI -----------------
class ReportAnalysis(Base):
    __tablename__ = "report_analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    document_id = Column(String(36), ForeignKey("medical_documents.id", ondelete="CASCADE"), nullable=False)
    report_type = Column(String(100), default="Laboratory Report")
    report_date = Column(String(50), nullable=True)
    laboratory_name = Column(String(255), nullable=True)
    overall_summary = Column(Text, nullable=False)
    key_findings = Column(JSON, default=list)       # list of structured findings
    abnormal_findings = Column(JSON, default=list)  # list of out-of-range values
    questions_for_doctor = Column(JSON, default=list)
    plain_language_explanation = Column(Text, nullable=True)
    historical_comparison = Column(JSON, default=dict)
    created_at = Column(DateTime, default=get_utc_now)

    document = relationship("MedicalDocument", back_populates="report_analyses")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), default="New Health Consultation")
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    user = relationship("User", back_populates="conversations")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    citations = Column(JSON, default=list)       # list of cited documents and pages
    is_grounded = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=get_utc_now)

    conversation = relationship("Conversation", back_populates="messages")


# ----------------- NOTIFICATIONS -----------------
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="reminder")  # reminder, alert, system
    is_read = Column(Boolean, default=False)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=get_utc_now)

    user = relationship("User", back_populates="notifications")


# ----------------- DOCTORS & APPOINTMENTS -----------------
class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    name = Column(String(255), nullable=False)
    specialty = Column(String(100), nullable=False)
    qualification = Column(String(100), default="MD, MBBS")
    experience_years = Column(Integer, default=10)
    hospital_clinic = Column(String(255), default="MediNova Health Institute")
    location = Column(String(255), default="Hyderabad, India")
    languages = Column(JSON, default=lambda: ["English", "Telugu", "Hindi"])
    rating = Column(Float, default=4.9)
    consultation_fee = Column(String(50), default="₹600")
    bio = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)
    is_demo = Column(Boolean, default=True)

    availabilities = relationship("DoctorAvailability", back_populates="doctor", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="doctor", cascade="all, delete-orphan")


class DoctorAvailability(Base):
    __tablename__ = "doctor_availabilities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    doctor_id = Column(String(36), ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(String(20), nullable=False)  # Monday, Tuesday, etc.
    start_time = Column(String(10), default="09:00")
    end_time = Column(String(10), default="17:00")
    slot_duration_minutes = Column(Integer, default=30)
    is_available = Column(Boolean, default=True)

    doctor = relationship("Doctor", back_populates="availabilities")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    doctor_id = Column(String(36), ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    appointment_date = Column(String(20), nullable=False)  # YYYY-MM-DD
    start_time = Column(String(10), nullable=False)        # HH:MM
    end_time = Column(String(10), nullable=False)          # HH:MM
    consultation_type = Column(String(50), default="video") # video, in_person, audio
    status = Column(String(50), default="confirmed")       # confirmed, cancelled, completed
    symptoms_notes = Column(Text, nullable=True)
    meeting_link = Column(String(500), nullable=True)
    booking_reference = Column(String(100), default=lambda: f"MED-{uuid.uuid4().hex[:8].upper()}")
    created_at = Column(DateTime, default=get_utc_now)

    user = relationship("User", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")


# ----------------- AUDIT EVENTS -----------------
class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=False)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=True)
    status = Column(String(50), default="success")
    created_at = Column(DateTime, default=get_utc_now)
