from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import User, Medicine, MedicationSchedule
from app.schemas.schemas import MedicineCreate, MedicineResponse
from app.api.dependencies import get_current_active_user
from app.core.permissions import verify_resource_ownership

router = APIRouter(prefix="/medicines", tags=["My Medicines"])

@router.get("/", response_model=List[MedicineResponse])
def list_medicines(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    meds = db.query(Medicine).filter(
        Medicine.user_id == current_user.id,
        Medicine.status != "archived"
    ).order_by(Medicine.created_at.desc()).all()
    return meds

@router.post("/", response_model=MedicineResponse)
def create_medicine(
    data: MedicineCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    med = Medicine(
        user_id=current_user.id,
        name=data.name,
        generic_name=data.generic_name or data.name,
        strength=data.strength,
        dosage_form=data.dosage_form,
        prescribed_dose=data.prescribed_dose,
        route=data.route,
        frequency=data.frequency,
        time_slots=data.time_slots,
        food_instructions=data.food_instructions,
        purpose=data.purpose,
        precautions=data.precautions,
        side_effects=data.side_effects,
        warnings=data.warnings,
        prescriber=data.prescriber,
        start_date=data.start_date,
        end_date=data.end_date,
        status="active",
        source="manual",
    )
    db.add(med)
    db.flush()

    # Create associated dose schedules
    for slot in data.time_slots:
        sched = MedicationSchedule(
            user_id=current_user.id,
            medicine_id=med.id,
            dose_time=slot,
            dosage=data.prescribed_dose,
            food_instruction=data.food_instructions,
            is_active=True,
        )
        db.add(sched)

    db.commit()
    db.refresh(med)
    return med

@router.delete("/{medicine_id}")
def delete_medicine(
    medicine_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    med = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medicine not found")
    verify_resource_ownership(med.user_id, current_user.id, "Medicine")

    med.status = "archived"
    db.commit()
    return {"status": "success", "message": "Medicine archived successfully"}
