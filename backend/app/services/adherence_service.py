from datetime import datetime, date, timedelta, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.all_models import MedicationDoseEvent, MedicationSchedule, Medicine

class AdherenceService:
    @staticmethod
    def calculate_adherence(db: Session, user_id: str) -> Dict[str, Any]:
        """
        Calculates daily, weekly, and monthly adherence percentages using the formula:
        Adherence % = (recorded taken doses / eligible scheduled doses) * 100.
        """
        today = date.today()
        today_str = today.isoformat()
        seven_days_ago = (today - timedelta(days=7)).isoformat()
        thirty_days_ago = (today - timedelta(days=30)).isoformat()

        # Active schedules for user
        active_schedules = db.query(MedicationSchedule).filter(
            MedicationSchedule.user_id == user_id,
            MedicationSchedule.is_active == True
        ).all()
        schedules_count_per_day = len(active_schedules)

        # Dose events for user
        events = db.query(MedicationDoseEvent).filter(
            MedicationDoseEvent.user_id == user_id
        ).all()

        # Today's metrics
        today_events = [e for e in events if e.scheduled_date == today_str]
        today_taken = len([e for e in today_events if e.status == "taken"])
        today_skipped = len([e for e in today_events if e.status == "skipped"])
        today_missed = len([e for e in today_events if e.status == "missed"])
        
        today_eligible = max(schedules_count_per_day, len(today_events))
        today_pct = round((today_taken / today_eligible * 100), 1) if today_eligible > 0 else 100.0

        # Weekly metrics
        weekly_events = [e for e in events if e.scheduled_date >= seven_days_ago]
        weekly_taken = len([e for e in weekly_events if e.status == "taken"])
        weekly_eligible = max(schedules_count_per_day * 7, len(weekly_events), 1)
        weekly_pct = round((weekly_taken / weekly_eligible * 100), 1)

        # Monthly metrics
        monthly_events = [e for e in events if e.scheduled_date >= thirty_days_ago]
        monthly_taken = len([e for e in monthly_events if e.status == "taken"])
        monthly_eligible = max(schedules_count_per_day * 30, len(monthly_events), 1)
        monthly_pct = round((monthly_taken / monthly_eligible * 100), 1)

        # Daily history for chart
        daily_history = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            d_str = d.isoformat()
            d_events = [e for e in events if e.scheduled_date == d_str]
            d_taken = len([e for e in d_events if e.status == "taken"])
            d_sched = max(schedules_count_per_day, len(d_events), 1)
            d_pct = round((d_taken / d_sched * 100), 0)
            daily_history.append({
                "date": d.strftime("%a"),
                "full_date": d_str,
                "adherence": d_pct,
                "taken": d_taken,
                "total": d_sched,
            })

        return {
            "today_percentage": min(today_pct, 100.0),
            "weekly_percentage": min(weekly_pct, 100.0),
            "monthly_percentage": min(monthly_pct, 100.0),
            "taken_count": today_taken,
            "skipped_count": today_skipped,
            "missed_count": today_missed,
            "total_eligible": today_eligible,
            "formula_note": "Adherence % = (recorded taken doses / eligible scheduled doses) * 100",
            "daily_history": daily_history,
        }

adherence_service = AdherenceService()
