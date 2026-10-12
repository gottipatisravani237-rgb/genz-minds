import time
import datetime
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.all_models import MedicationSchedule, Notification, User

def process_due_reminders():
    """
    Checks all active medication schedules against the current clock time.
    Generates persistent in-app notifications and delivers reminder events.
    """
    now = datetime.datetime.now()
    current_time_str = now.strftime("%H:%M")
    today_str = now.strftime("%Y-%m-%d")

    with SessionLocal() as db:
        # Find active schedules matching current minute
        schedules = db.query(MedicationSchedule).filter(
            MedicationSchedule.is_active == True,
            MedicationSchedule.dose_time == current_time_str
        ).all()

        for s in schedules:
            med_name = s.medicine.name if s.medicine else "Scheduled Medicine"
            # Prevent duplicate notifications for same schedule on same day
            existing = db.query(Notification).filter(
                Notification.user_id == s.user_id,
                Notification.notification_type == "reminder",
                Notification.message.like(f"%{med_name}%"),
                Notification.created_at >= datetime.datetime.combine(now.date(), datetime.time.min)
            ).first()

            if not existing:
                notif = Notification(
                    user_id=s.user_id,
                    title=f"Medication Due: {med_name}",
                    message=f"Scheduled dose: {s.dosage} ({s.food_instruction.replace('_', ' ')}). Time: {s.dose_time}",
                    notification_type="reminder",
                    metadata_json={
                        "medicine_id": s.medicine_id,
                        "schedule_id": s.id,
                        "scheduled_time": s.dose_time,
                        "scheduled_date": today_str,
                    }
                )
                db.add(notif)
        db.commit()

def run_worker_loop(interval_seconds: int = 60):
    print(f"[*] MEDINOVA-AI Medication Reminder Worker started. Polling every {interval_seconds}s...")
    while True:
        try:
            process_due_reminders()
        except Exception as e:
            print(f"[!] Error processing reminder schedule: {e}")
        time.sleep(interval_seconds)

if __name__ == "__main__":
    run_worker_loop()
