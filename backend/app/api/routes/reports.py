from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import User, ReportAnalysis, MedicalDocument
from app.schemas.schemas import ReportAnalysisResponse
from app.api.dependencies import get_current_active_user
from app.core.permissions import verify_resource_ownership
from app.services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["Report Analysis"])

@router.get("/", response_model=List[ReportAnalysisResponse])
def list_reports(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    reports = db.query(ReportAnalysis).filter(
        ReportAnalysis.user_id == current_user.id
    ).order_by(ReportAnalysis.created_at.desc()).all()
    return reports

@router.get("/{report_id}", response_model=ReportAnalysisResponse)
def get_report(
    report_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    report = db.query(ReportAnalysis).filter(ReportAnalysis.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report analysis not found")
    verify_resource_ownership(report.user_id, current_user.id, "Report Analysis")
    return report
