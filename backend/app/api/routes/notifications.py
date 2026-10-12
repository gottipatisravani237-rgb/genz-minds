from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import User, Notification
from app.schemas.schemas import NotificationResponse
from app.api.dependencies import get_current_active_user
from app.core.permissions import verify_resource_ownership

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=List[NotificationResponse])
def list_notifications(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()
    return notifs

@router.post("/{notification_id}/read")
def mark_read(
    notification_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    verify_resource_ownership(notif.user_id, current_user.id, "Notification")
    notif.is_read = True
    db.commit()
    return {"status": "success"}

@router.post("/test-alarm", response_model=NotificationResponse)
def trigger_test_alarm(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    test_notif = Notification(
        user_id=current_user.id,
        title="Medication Reminder: Metformin 500mg",
        message="It is 09:00 AM. Please take 1 tablet with or after breakfast.",
        notification_type="reminder",
        metadata_json={
            "medicine": "Metformin",
            "dosage": "500mg",
            "food": "after_food",
            "sound": True,
        }
    )
    db.add(test_notif)
    db.commit()
    db.refresh(test_notif)
    return test_notif
