import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.all_models import Doctor, DoctorAvailability, Appointment

DEMO_DOCTORS = [
    {
        "name": "Dr. Ananya Sharma",
        "specialty": "Cardiology",
        "qualification": "MD, DM (Cardiology), FACC",
        "experience_years": 14,
        "hospital_clinic": "Apollo Heart Institute",
        "location": "Hyderabad, Jubilee Hills",
        "languages": ["English", "Telugu", "Hindi"],
        "rating": 4.9,
        "consultation_fee": "₹800",
        "bio": "Senior interventional cardiologist specializing in coronary interventions, lipid disorders, and preventive cardiac wellness.",
        "is_demo": True,
    },
    {
        "name": "Dr. Vikram Sethi",
        "specialty": "Endocrinology & Diabetology",
        "qualification": "MBBS, MD, DM (Endocrinology)",
        "experience_years": 12,
        "hospital_clinic": "MediNova Diabetes Care",
        "location": "Bengaluru, Indiranagar",
        "languages": ["English", "Hindi", "Kannada"],
        "rating": 4.8,
        "consultation_fee": "₹700",
        "bio": "Specialist in metabolic disease management, insulin therapy optimization, thyroid conditions, and weight management.",
        "is_demo": True,
    },
    {
        "name": "Dr. Priya Sundaram",
        "specialty": "Pulmonology",
        "qualification": "MBBS, DNB (Respiratory Medicine)",
        "experience_years": 10,
        "hospital_clinic": "Gleneagles Global Hospital",
        "location": "Chennai, Adyar",
        "languages": ["English", "Tamil"],
        "rating": 4.9,
        "consultation_fee": "₹650",
        "bio": "Expert in chronic obstructive pulmonary disease (COPD), asthma protocols, allergy profiling, and sleep apnea care.",
        "is_demo": True,
    },
    {
        "name": "Dr. Rajesh Kulkarni",
        "specialty": "Internal Medicine",
        "qualification": "MD (Internal Medicine)",
        "experience_years": 16,
        "hospital_clinic": "Care Hospital",
        "location": "Hyderabad, Banjara Hills",
        "languages": ["English", "Telugu", "Hindi"],
        "rating": 4.7,
        "consultation_fee": "₹500",
        "bio": "Comprehensive adult primary care, hypertension, infectious disease recovery, and geriatric wellness management.",
        "is_demo": True,
    }
]

class DoctorService:
    @staticmethod
    def ensure_demo_doctors(db: Session):
        count = db.query(Doctor).count()
        if count == 0:
            for d_data in DEMO_DOCTORS:
                doc = Doctor(**d_data)
                db.add(doc)
            db.commit()

    @staticmethod
    def book_appointment(
        db: Session,
        user_id: str,
        doctor_id: str,
        appointment_date: str,
        start_time: str,
        consultation_type: str = "video",
        symptoms_notes: Optional[str] = None
    ) -> Appointment:
        # Check doctor exists
        doc = db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

        # Conflict Detection: Prevent double-booking for same doctor at same date and time
        conflict = db.query(Appointment).filter(
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_date == appointment_date,
            Appointment.start_time == start_time,
            Appointment.status == "confirmed"
        ).first()

        if conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"This slot ({start_time} on {appointment_date}) is already booked for Dr. {doc.name}. Please select another slot."
            )

        # Calculate 30-min end time
        h, m = map(int, start_time.split(':'))
        total_m = h * 60 + m + 30
        end_time = f"{total_m // 60:02d}:{total_m % 60:02d}"

        appointment = Appointment(
            user_id=user_id,
            doctor_id=doctor_id,
            appointment_date=appointment_date,
            start_time=start_time,
            end_time=end_time,
            consultation_type=consultation_type,
            status="confirmed",
            symptoms_notes=symptoms_notes,
            meeting_link=f"https://meet.medinova.ai/room/{uuid.uuid4().hex[:12]}",
            booking_reference=f"MED-{uuid.uuid4().hex[:8].upper()}"
        )
        db.add(appointment)
        db.commit()
        db.refresh(appointment)
        return appointment

doctor_service = DoctorService()
