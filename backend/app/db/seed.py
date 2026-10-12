import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.db.session import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.all_models import (
    User, UserProfile, UserPreference, MedicalDocument, ExtractedDocumentData,
    DocumentChunk, Prescription, PrescriptionMedicine, Medicine, MedicationSchedule,
    MedicationDoseEvent, ReportAnalysis, Doctor, Appointment
)
from app.services.embedding_service import embedding_service
from app.services.doctor_service import doctor_service

def seed_demo_database():
    print("[*] Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        # 1. Seed Doctors
        doctor_service.ensure_demo_doctors(db)

        # 2. Check if demo user exists
        demo_email = "demo@medinova.ai"
        user = db.query(User).filter(User.email == demo_email).first()
        if not user:
            print("[*] Creating demo user: demo@medinova.ai / Medinova2026!")
            user = User(
                email=demo_email,
                hashed_password=hash_password("Medinova2026!"),
                full_name="Alex Chen",
            )
            db.add(user)
            db.flush()

            profile = UserProfile(
                user_id=user.id,
                age=38,
                gender="Male",
                phone="+91 98765 43210",
                allergies=["Penicillin", "Sulfa drugs"],
                existing_conditions=["Mild Hypertension", "Early Pre-diabetes"],
                emergency_contact={
                    "name": "Sarah Chen",
                    "relationship": "Spouse",
                    "phone": "+91 98765 43211",
                },
                preferred_language="en",
                timezone="Asia/Kolkata",
                completed=True,
            )
            prefs = UserPreference(
                user_id=user.id,
                reminder_sound=True,
                browser_push_enabled=True,
                dark_theme=True,
                voice_language="en",
            )
            db.add(profile)
            db.add(prefs)

            # 3. Seed Sample Medical Lab Document & RAG Chunks
            lab_text = (
                "MEDINOVA CLINICAL LABORATORIES - METABOLIC & HEMATOLOGY PROFILE\n"
                "Patient: Alex Chen | Age: 38 | Gender: Male | Date: 10-Oct-2026\n"
                "Physician: Dr. Ramesh Varma, MD\n\n"
                "Test Results:\n"
                "1. Fasting Blood Sugar: 128 mg/dL (Reference Range: 70 - 99 mg/dL) [HIGH]\n"
                "2. Glycated Hemoglobin (HbA1c): 6.8% (Reference Range: 4.0 - 5.6%) [HIGH]\n"
                "3. Total Cholesterol: 215 mg/dL (Reference Range: < 200 mg/dL) [HIGH]\n"
                "4. LDL Cholesterol: 135 mg/dL (Reference Range: < 100 mg/dL) [HIGH]\n"
                "5. HDL Cholesterol: 46 mg/dL (Reference Range: > 40 mg/dL) [NORMAL]\n"
                "6. Triglycerides: 165 mg/dL (Reference Range: < 150 mg/dL) [HIGH]\n"
                "7. Serum Creatinine: 0.9 mg/dL (Reference Range: 0.7 - 1.3 mg/dL) [NORMAL]\n"
                "8. eGFR: >90 mL/min/1.73m2 (Reference Range: > 60 mL/min/1.73m2) [NORMAL]\n\n"
                "Clinical Notes: Elevated fasting glucose and HbA1c suggest prediabetes. "
                "Combined with borderline lipid abnormalities, lifestyle interventions and clinical follow-up are recommended."
            )
            doc = MedicalDocument(
                user_id=user.id,
                original_filename="comprehensive_metabolic_panel.pdf",
                storage_path="./storage/comprehensive_metabolic_panel.pdf",
                mime_type="application/pdf",
                file_size=245000,
                document_type="lab_report",
                processing_status="completed",
            )
            db.add(doc)
            db.flush()

            # Extracted data
            extracted = ExtractedDocumentData(
                document_id=doc.id,
                user_id=user.id,
                raw_text=lab_text,
                structured_data={"test_count": 8, "lab": "MediNova Clinical Laboratories"},
                confidence=0.98,
                page_count=1,
            )
            db.add(extracted)

            # RAG Chunks
            chunk_vec = embedding_service.get_embedding(lab_text)
            chunk = DocumentChunk(
                document_id=doc.id,
                user_id=user.id,
                chunk_text=lab_text,
                chunk_index=0,
                page_number=1,
                source_metadata={"filename": doc.original_filename, "type": "lab_report"},
                embedding_json=chunk_vec,
            )
            db.add(chunk)

            # Report Analysis
            report_analysis = ReportAnalysis(
                user_id=user.id,
                document_id=doc.id,
                report_type="Metabolic & Hematology Panel",
                report_date="10-Oct-2026",
                laboratory_name="MediNova Clinical Laboratories",
                overall_summary=(
                    "Laboratory panel indicates mildly elevated Fasting Blood Glucose (128 mg/dL) and "
                    "HbA1c (6.8%), pointing to early glycemic impairment. Borderline hyperlipidemia with "
                    "Total Cholesterol of 215 mg/dL and LDL of 135 mg/dL. Renal function is normal."
                ),
                key_findings=[
                    {"test_name": "Fasting Blood Sugar", "result_value": "128", "unit": "mg/dL", "reference_range": "70 - 99", "is_out_of_range": True, "status": "High"},
                    {"test_name": "HbA1c", "result_value": "6.8", "unit": "%", "reference_range": "4.0 - 5.6", "is_out_of_range": True, "status": "High"},
                    {"test_name": "Total Cholesterol", "result_value": "215", "unit": "mg/dL", "reference_range": "< 200", "is_out_of_range": True, "status": "High"},
                    {"test_name": "LDL Cholesterol", "result_value": "135", "unit": "mg/dL", "reference_range": "< 100", "is_out_of_range": True, "status": "High"},
                    {"test_name": "HDL Cholesterol", "result_value": "46", "unit": "mg/dL", "reference_range": "> 40", "is_out_of_range": False, "status": "Normal"},
                    {"test_name": "Serum Creatinine", "result_value": "0.9", "unit": "mg/dL", "reference_range": "0.7 - 1.3", "is_out_of_range": False, "status": "Normal"},
                ],
                abnormal_findings=[
                    {"test_name": "Fasting Blood Sugar", "result_value": "128 mg/dL", "status": "High"},
                    {"test_name": "HbA1c", "result_value": "6.8%", "status": "High"},
                    {"test_name": "Total Cholesterol", "result_value": "215 mg/dL", "status": "High"},
                    {"test_name": "LDL Cholesterol", "result_value": "135 mg/dL", "status": "High"},
                ],
                questions_for_doctor=[
                    "Should we begin lifestyle modifications first or start metformin?",
                    "What target LDL level should we aim for?",
                    "How often should we repeat the HbA1c test?"
                ],
                plain_language_explanation=(
                    "Your blood sugar markers (fasting blood sugar and 3-month average HbA1c) and bad cholesterol "
                    "are moderately above standard ranges. Your kidneys are functioning normally."
                ),
                historical_comparison={
                    "previous_date": "15-May-2026",
                    "hba1c_change": "+0.4%",
                    "trend": "Upward trend requiring lifestyle intervention"
                }
            )
            db.add(report_analysis)

            # 4. Seed Active Medicines & Schedules
            med1 = Medicine(
                user_id=user.id,
                name="Metformin",
                generic_name="Metformin Hydrochloride",
                strength="500mg",
                dosage_form="Tablet",
                prescribed_dose="1 tablet",
                route="Oral",
                frequency="Twice daily",
                time_slots=["09:00", "21:00"],
                food_instructions="after_food",
                purpose="Assists in regulating glycemic response and blood glucose control.",
                precautions=["Take with meals to minimize gastrointestinal discomfort."],
                side_effects=["Mild nausea", "Stomach upset"],
                prescriber="Dr. Ramesh Varma, MD",
                status="active",
                source="pres_scan",
            )
            med2 = Medicine(
                user_id=user.id,
                name="Atorvastatin",
                generic_name="Atorvastatin Calcium",
                strength="20mg",
                dosage_form="Tablet",
                prescribed_dose="1 tablet",
                route="Oral",
                frequency="Once daily",
                time_slots=["21:00"],
                food_instructions="after_food",
                purpose="Lipid-lowering agent for cardiovascular risk reduction.",
                precautions=["Take at bedtime. Report unexplained muscle aches."],
                side_effects=["Headache", "Mild joint discomfort"],
                prescriber="Dr. Ramesh Varma, MD",
                status="active",
                source="pres_scan",
            )
            db.add(med1)
            db.add(med2)
            db.flush()

            # Add Schedules
            s1 = MedicationSchedule(user_id=user.id, medicine_id=med1.id, dose_time="09:00", dosage="1 tablet", food_instruction="after_food", is_active=True)
            s2 = MedicationSchedule(user_id=user.id, medicine_id=med1.id, dose_time="21:00", dosage="1 tablet", food_instruction="after_food", is_active=True)
            s3 = MedicationSchedule(user_id=user.id, medicine_id=med2.id, dose_time="21:00", dosage="1 tablet", food_instruction="after_food", is_active=True)
            db.add_all([s1, s2, s3])

            # Dose Events for Adherence Demo
            db.add(MedicationDoseEvent(user_id=user.id, medicine_id=med1.id, schedule_id=s1.id, scheduled_date="2026-10-12", scheduled_time="09:00", status="taken"))
            db.add(MedicationDoseEvent(user_id=user.id, medicine_id=med1.id, schedule_id=s1.id, scheduled_date="2026-10-11", scheduled_time="09:00", status="taken"))
            db.add(MedicationDoseEvent(user_id=user.id, medicine_id=med1.id, schedule_id=s2.id, scheduled_date="2026-10-11", scheduled_time="21:00", status="taken"))
            db.add(MedicationDoseEvent(user_id=user.id, medicine_id=med2.id, schedule_id=s3.id, scheduled_date="2026-10-11", scheduled_time="21:00", status="taken"))

            # 5. Seed Demo Appointment
            first_doc = db.query(Doctor).first()
            if first_doc:
                appt = Appointment(
                    user_id=user.id,
                    doctor_id=first_doc.id,
                    appointment_date="2026-10-18",
                    start_time="11:00",
                    end_time="11:30",
                    consultation_type="video",
                    status="confirmed",
                    symptoms_notes="Follow-up review for metabolic panel and medication initiation.",
                    meeting_link="https://meet.medinova.ai/room/med-telehealth-2026",
                    booking_reference="MED-88921A",
                )
                db.add(appt)

            db.commit()
            print("[+] Seed completed successfully!")
        else:
            print("[*] Demo user already exists.")

if __name__ == "__main__":
    seed_demo_database()
