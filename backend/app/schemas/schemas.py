from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# ----------------- AUTH & USER -----------------
class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserProfileUpdate(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    photo_url: Optional[str] = None
    allergies: Optional[List[str]] = None
    existing_conditions: Optional[List[str]] = None
    emergency_contact: Optional[Dict[str, str]] = None
    preferred_language: Optional[str] = "en"
    timezone: Optional[str] = "UTC"

class UserPreferenceUpdate(BaseModel):
    reminder_sound: Optional[bool] = None
    browser_push_enabled: Optional[bool] = None
    email_reminders: Optional[bool] = None
    dark_theme: Optional[bool] = None
    voice_language: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: str
    user_id: str
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    photo_url: Optional[str] = None
    allergies: List[str] = []
    existing_conditions: List[str] = []
    emergency_contact: Dict[str, Any] = {}
    preferred_language: str = "en"
    timezone: str = "UTC"
    completed: bool = False

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    is_active: bool
    created_at: datetime
    profile: Optional[UserProfileResponse] = None

    class Config:
        from_attributes = True


# ----------------- MEDICAL DOCUMENTS & OCR -----------------
class MedicalDocumentResponse(BaseModel):
    id: str
    user_id: str
    original_filename: str
    document_type: str
    upload_timestamp: datetime
    processing_status: str
    processing_error: Optional[str] = None
    file_size: int = 0
    extraction_metadata: Dict[str, Any] = {}

    class Config:
        from_attributes = True

class DocumentProcessingStatusResponse(BaseModel):
    document_id: str
    status: str
    progress: int
    error_message: Optional[str] = None


# ----------------- PRESCRIPTIONS -----------------
class PrescriptionMedicineItem(BaseModel):
    id: Optional[str] = None
    medicine_name: str
    generic_name: Optional[str] = None
    strength: Optional[str] = None
    dosage_form: str = "Tablet"
    dose: str = "1 tablet"
    route: str = "Oral"
    frequency: str = "Once daily"
    duration: str = "7 days"
    food_instructions: str = "after_food"
    scheduled_timing: List[str] = ["09:00"]
    confidence: float = 0.95
    is_unclear: bool = False
    is_confirmed: bool = False
    clinical_notes: Optional[str] = None

class PrescriptionResponse(BaseModel):
    id: str
    user_id: str
    document_id: Optional[str] = None
    doctor_name: Optional[str] = None
    clinic_name: Optional[str] = None
    prescription_date: Optional[str] = None
    raw_text: Optional[str] = None
    is_verified: bool
    extraction_status: str
    medicines: List[PrescriptionMedicineItem] = []
    created_at: datetime

    class Config:
        from_attributes = True

class PrescriptionConfirmRequest(BaseModel):
    prescription_id: str
    medicines: List[PrescriptionMedicineItem]


# ----------------- MEDICINES & SCHEDULES -----------------
class MedicineCreate(BaseModel):
    name: str
    generic_name: Optional[str] = None
    strength: Optional[str] = None
    dosage_form: str = "Tablet"
    prescribed_dose: str = "1 tablet"
    route: str = "Oral"
    frequency: str = "Once daily"
    time_slots: List[str] = ["09:00"]
    food_instructions: str = "after_food"
    purpose: Optional[str] = None
    precautions: List[str] = []
    side_effects: List[str] = []
    warnings: List[str] = []
    prescriber: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class MedicineResponse(BaseModel):
    id: str
    user_id: str
    name: str
    generic_name: Optional[str] = None
    strength: Optional[str] = None
    dosage_form: str
    prescribed_dose: str
    route: str
    frequency: str
    time_slots: List[str] = []
    food_instructions: str
    purpose: Optional[str] = None
    precautions: List[str] = []
    side_effects: List[str] = []
    warnings: List[str] = []
    prescriber: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: str
    source: str
    created_at: datetime

    class Config:
        from_attributes = True

class DoseEventCreate(BaseModel):
    medicine_id: str
    schedule_id: Optional[str] = None
    scheduled_date: str # YYYY-MM-DD
    scheduled_time: str # HH:MM
    status: str = "taken" # taken, skipped, missed
    audit_notes: Optional[str] = None

class DoseEventResponse(BaseModel):
    id: str
    user_id: str
    medicine_id: str
    schedule_id: Optional[str] = None
    scheduled_date: str
    scheduled_time: str
    status: str
    action_timestamp: datetime

    class Config:
        from_attributes = True

class AdherenceAnalyticsResponse(BaseModel):
    today_percentage: float
    weekly_percentage: float
    monthly_percentage: float
    taken_count: int
    skipped_count: int
    missed_count: int
    total_eligible: int
    formula_note: str = "Adherence = (taken / eligible) * 100"
    daily_history: List[Dict[str, Any]] = []


# ----------------- REPORTS & LAB FINDINGS -----------------
class LabTestFinding(BaseModel):
    test_name: str
    result_value: str
    unit: str
    reference_range: str
    is_out_of_range: bool = False
    clinical_significance: Optional[str] = None

class ReportAnalysisResponse(BaseModel):
    id: str
    user_id: str
    document_id: str
    report_type: str
    report_date: Optional[str] = None
    laboratory_name: Optional[str] = None
    overall_summary: str
    key_findings: List[Dict[str, Any]] = []
    abnormal_findings: List[Dict[str, Any]] = []
    questions_for_doctor: List[str] = []
    plain_language_explanation: Optional[str] = None
    historical_comparison: Dict[str, Any] = {}
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------- RAG & AI CHAT -----------------
class Citation(BaseModel):
    document_id: str
    document_name: str
    page_number: int
    excerpt: str
    relevance_score: float

class ChatQueryRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str
    use_rag: bool = True

class ChatMessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender: str
    content: str
    citations: List[Citation] = []
    is_grounded: bool
    timestamp: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True


# ----------------- DOCTORS & APPOINTMENTS -----------------
class DoctorResponse(BaseModel):
    id: str
    name: str
    specialty: str
    qualification: str
    experience_years: int
    hospital_clinic: str
    location: str
    languages: List[str] = []
    rating: float
    consultation_fee: str
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    is_demo: bool = True

    class Config:
        from_attributes = True

class AppointmentCreate(BaseModel):
    doctor_id: str
    appointment_date: str # YYYY-MM-DD
    start_time: str # HH:MM
    consultation_type: str = "video" # video, in_person, audio
    symptoms_notes: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: str
    user_id: str
    doctor_id: str
    doctor_name: Optional[str] = None
    doctor_specialty: Optional[str] = None
    appointment_date: str
    start_time: str
    end_time: str
    consultation_type: str
    status: str
    symptoms_notes: Optional[str] = None
    booking_reference: str
    meeting_link: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------- VOICE & NOTIFICATIONS -----------------
class VoiceTranscribeResponse(BaseModel):
    recognized_text: str
    language: str
    confidence: float
    requires_confirmation: bool = False
    warning_notice: Optional[str] = None

class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
