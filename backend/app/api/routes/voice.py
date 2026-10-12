from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.models.all_models import User
from app.schemas.schemas import VoiceTranscribeResponse
from app.api.dependencies import get_current_active_user

router = APIRouter(prefix="/voice", tags=["Voice Assistant"])

class VoiceProcessRequest(BaseModel):
    speech_text: str
    language: str = "en" # en, te, hi, ta, kn

@router.post("/process", response_model=VoiceTranscribeResponse)
def process_voice_input(
    data: VoiceProcessRequest,
    current_user: User = Depends(get_current_active_user)
):
    text_lower = data.speech_text.lower()
    
    # Clinical Safety: Detect medication or dosage instructions in speech
    med_keywords = ["medicine", "dose", "tablet", "stop", "increase", "mg", "pill", "prescription"]
    requires_confirm = any(k in text_lower for k in med_keywords)
    
    warning = None
    if requires_confirm:
        warning = (
            "Clinical Safety Alert: Speech recognition has detected medication or dosage terms. "
            "Never modify or log medication based solely on voice input without reviewing the exact text on screen."
        )

    return {
        "recognized_text": data.speech_text,
        "language": data.language,
        "confidence": 0.95,
        "requires_confirmation": requires_confirm,
        "warning_notice": warning,
    }
