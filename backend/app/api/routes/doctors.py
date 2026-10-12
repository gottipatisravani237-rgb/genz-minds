from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import User, Doctor, Appointment
from app.schemas.schemas import DoctorResponse, AppointmentCreate, AppointmentResponse
from app.api.dependencies import get_current_active_user
from app.core.permissions import verify_resource_ownership
from app.services.doctor_service import doctor_service

router = APIRouter(prefix="/doctors", tags=["Doctors & Appointments"])

@router.get("/", response_model=List[DoctorResponse])
def get_doctors(
    specialty: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    doctor_service.ensure_demo_doctors(db)
    query = db.query(Doctor)
    if specialty:
        query = query.filter(Doctor.specialty.ilike(f"%{specialty}%"))
    return query.all()

@router.post("/appointments", response_model=AppointmentResponse)
def book_appointment(
    data: AppointmentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    appointment = doctor_service.book_appointment(
        db=db,
        user_id=current_user.id,
        doctor_id=data.doctor_id,
        appointment_date=data.appointment_date,
        start_time=data.start_time,
        consultation_type=data.consultation_type,
        symptoms_notes=data.symptoms_notes,
    )
    return {
        "id": appointment.id,
        "user_id": appointment.user_id,
        "doctor_id": appointment.doctor_id,
        "doctor_name": appointment.doctor.name if appointment.doctor else "Dr. MediNova Specialist",
        "doctor_specialty": appointment.doctor.specialty if appointment.doctor else "General Consultation",
        "appointment_date": appointment.appointment_date,
        "start_time": appointment.start_time,
        "end_time": appointment.end_time,
        "consultation_type": appointment.consultation_type,
        "status": appointment.status,
        "symptoms_notes": appointment.symptoms_notes,
        "booking_reference": appointment.booking_reference,
        "meeting_link": appointment.meeting_link,
        "created_at": appointment.created_at,
    }

@router.get("/appointments", response_model=List[AppointmentResponse])
def list_appointments(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    appointments = db.query(Appointment).filter(
        Appointment.user_id == current_user.id
    ).order_by(Appointment.appointment_date.desc()).all()

    results = []
    for appt in appointments:
        results.append({
            "id": appt.id,
            "user_id": appt.user_id,
            "doctor_id": appt.doctor_id,
            "doctor_name": appt.doctor.name if appt.doctor else "Dr. Specialist",
            "doctor_specialty": appt.doctor.specialty if appt.doctor else "Consultation",
            "appointment_date": appt.appointment_date,
            "start_time": appt.start_time,
            "end_time": appt.end_time,
            "consultation_type": appt.consultation_type,
            "status": appt.status,
            "symptoms_notes": appt.symptoms_notes,
            "booking_reference": appt.booking_reference,
            "meeting_link": appt.meeting_link,
            "created_at": appt.created_at,
        })
    return results

@router.delete("/appointments/{appointment_id}")
def cancel_appointment(
    appointment_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    verify_resource_ownership(appt.user_id, current_user.id, "Appointment")
    appt.status = "cancelled"
    db.commit()
    return {"status": "success", "message": "Appointment cancelled successfully"}
