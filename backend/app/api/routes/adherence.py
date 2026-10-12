from datetime import datetime, date, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import User, MedicationDoseEvent, Medicine
from app.schemas.schemas import AdherenceAnalyticsResponse, DoseEventCreate, DoseEventResponse
from app.api.dependencies import get_current_active_user
from app.services.adherence_service import adherence_service

router = APIRouter(prefix="/adherence", tags=["Medication Adherence"])

@router.get("/", response_model=AdherenceAnalyticsResponse)
def get_adherence_analytics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    stats = adherence_service.calculate_adherence(db, current_user.id)
    return stats

@router.post("/dose", response_model=DoseEventResponse)
def record_dose_event(
    data: DoseEventCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Verify medicine belongs to user
    med = db.query(Medicine).filter(
        Medicine.id == data.medicine_id,
        Medicine.user_id == current_user.id
    ).first()
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medicine not found for user")

    # Check if a log already exists for this medicine, date, and time
    existing = db.query(MedicationDoseEvent).filter(
        MedicationDoseEvent.user_id == current_user.id,
        MedicationDoseEvent.medicine_id == data.medicine_id,
        MedicationDoseEvent.scheduled_date == data.scheduled_date,
        MedicationDoseEvent.scheduled_time == data.scheduled_time,
    ).first()

    if existing:
        existing.status = data.status
        existing.action_timestamp = datetime.now(timezone.utc)
        if data.audit_notes:
            existing.audit_notes = data.audit_notes
        db.commit()
        db.refresh(existing)
        return existing

    event = MedicationDoseEvent(
        user_id=current_user.id,
        medicine_id=data.medicine_id,
        schedule_id=data.schedule_id,
        scheduled_date=data.scheduled_date,
        scheduled_time=data.scheduled_time,
        status=data.status,
        audit_notes=data.audit_notes,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
