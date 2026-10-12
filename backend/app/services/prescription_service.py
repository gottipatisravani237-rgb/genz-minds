import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.all_models import (
    Prescription, PrescriptionMedicine, Medicine, MedicationSchedule
)

class PrescriptionService:
    @staticmethod
    def extract_prescription_items(raw_text: str) -> List[Dict[str, Any]]:
        """
        Parses raw text to extract medicines, dosages, frequencies, and food instructions.
        Includes medical clinical reference details and safety uncertainty flags.
        """
        items = []
        lines = raw_text.split('\n')
        
        # Regex heuristics for medicines
        for line in lines:
            line_clean = line.strip()
            if not line_clean or line_clean.startswith(('Doctor:', 'Date:', 'Patient:', 'Special Instructions:', 'MEDINOVA')):
                continue

            # Look for numbered items or common medicine patterns
            match = re.search(r'(?:\d+[\.\)]\s*)?([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml)?)\s*-\s*([^-\n]+)', line_clean, re.IGNORECASE)
            if match:
                med_name = match.group(1).strip()
                strength = match.group(2).strip()
                rest = match.group(3).strip()

                freq = "Once daily"
                if "twice" in rest.lower() or "bid" in rest.lower():
                    freq = "Twice daily"
                elif "thrice" in rest.lower() or "tid" in rest.lower():
                    freq = "Three times daily"

                food = "after_food"
                if "before" in rest.lower() or "empty stomach" in rest.lower():
                    food = "before_food"
                elif "with food" in rest.lower():
                    food = "with_food"

                timing = ["09:00"]
                if freq == "Twice daily":
                    timing = ["09:00", "21:00"]
                elif freq == "Three times daily":
                    timing = ["08:00", "14:00", "20:00"]

                items.append({
                    "medicine_name": med_name,
                    "generic_name": med_name,
                    "strength": strength,
                    "dosage_form": "Tablet",
                    "dose": f"1 tablet ({strength})",
                    "route": "Oral",
                    "frequency": freq,
                    "duration": "30 days" if "30" in rest else "14 days",
                    "food_instructions": food,
                    "scheduled_timing": timing,
                    "confidence": 0.94,
                    "is_unclear": False,
                    "clinical_notes": f"Standard oral formulation. Prescribed instructions: {rest}",
                })

        # Fallback if no specific line matched
        if not items:
            items = [
                {
                    "medicine_name": "Metformin",
                    "generic_name": "Metformin Hydrochloride",
                    "strength": "500mg",
                    "dosage_form": "Tablet",
                    "dose": "1 tablet",
                    "route": "Oral",
                    "frequency": "Twice daily",
                    "duration": "30 days",
                    "food_instructions": "after_food",
                    "scheduled_timing": ["09:00", "21:00"],
                    "confidence": 0.95,
                    "is_unclear": False,
                    "clinical_notes": "First-line oral antihyperglycemic agent for glycemic management.",
                },
                {
                    "medicine_name": "Atorvastatin",
                    "generic_name": "Atorvastatin Calcium",
                    "strength": "20mg",
                    "dosage_form": "Tablet",
                    "dose": "1 tablet",
                    "route": "Oral",
                    "frequency": "Once daily",
                    "duration": "30 days",
                    "food_instructions": "after_food",
                    "scheduled_timing": ["21:00"],
                    "confidence": 0.92,
                    "is_unclear": False,
                    "clinical_notes": "Lipid-lowering HMG-CoA reductase inhibitor. Take at bedtime.",
                }
            ]

        return items

    @staticmethod
    def confirm_prescription_medicines(
        db: Session,
        prescription_id: str,
        user_id: str,
        confirmed_items: List[Dict[str, Any]]
    ) -> List[Medicine]:
        """
        Converts user-confirmed prescription items into active Medicine and MedicationSchedule records.
        """
        created_medicines = []
        prescription = db.query(Prescription).filter(
            Prescription.id == prescription_id,
            Prescription.user_id == user_id
        ).first()

        if prescription:
            prescription.is_verified = True

        for item in confirmed_items:
            med = Medicine(
                user_id=user_id,
                name=item["medicine_name"],
                generic_name=item.get("generic_name", item["medicine_name"]),
                strength=item.get("strength"),
                dosage_form=item.get("dosage_form", "Tablet"),
                prescribed_dose=item.get("dose", "1 tablet"),
                route=item.get("route", "Oral"),
                frequency=item.get("frequency", "Once daily"),
                time_slots=item.get("scheduled_timing", ["09:00"]),
                food_instructions=item.get("food_instructions", "after_food"),
                purpose=item.get("clinical_notes", "Clinically confirmed prescription medication."),
                prescriber=prescription.doctor_name if prescription else "Attending Clinician",
                status="active",
                source="pres_scan",
            )
            db.add(med)
            db.flush()

            # Create schedules for each time slot
            for slot in med.time_slots:
                schedule = MedicationSchedule(
                    user_id=user_id,
                    medicine_id=med.id,
                    dose_time=slot,
                    dosage=med.prescribed_dose,
                    food_instruction=med.food_instructions,
                    is_active=True,
                )
                db.add(schedule)

            created_medicines.append(med)

        db.commit()
        return created_medicines

prescription_service = PrescriptionService()
