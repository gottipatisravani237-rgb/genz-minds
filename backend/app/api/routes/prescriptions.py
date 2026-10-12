from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import User, Prescription, PrescriptionMedicine
from app.schemas.schemas import PrescriptionResponse, PrescriptionConfirmRequest
from app.api.dependencies import get_current_active_user
from app.core.permissions import verify_resource_ownership
from app.services.prescription_service import prescription_service

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])

@router.get("/", response_model=List[PrescriptionResponse])
def list_prescriptions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    prescriptions = db.query(Prescription).filter(
        Prescription.user_id == current_user.id
    ).order_by(Prescription.created_at.desc()).all()
    return prescriptions

@router.get("/{prescription_id}", response_model=PrescriptionResponse)
def get_prescription(
    prescription_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
    verify_resource_ownership(prescription.user_id, current_user.id, "Prescription")
    return prescription

@router.post("/confirm")
def confirm_prescription(
    data: PrescriptionConfirmRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    prescription = db.query(Prescription).filter(Prescription.id == data.prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
    verify_resource_ownership(prescription.user_id, current_user.id, "Prescription")

    items_dicts = [item.model_dump() for item in data.medicines]
    created_meds = prescription_service.confirm_prescription_medicines(
        db=db,
        prescription_id=data.prescription_id,
        user_id=current_user.id,
        confirmed_items=items_dicts
    )

    return {
        "status": "success",
        "message": f"Confirmed {len(created_meds)} medicines. Schedules added to My Medicines.",
        "medicines_created": len(created_meds),
    }
