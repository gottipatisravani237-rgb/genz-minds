from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.all_models import User, UserProfile, UserPreference
from app.schemas.schemas import (
    UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse, UserProfileUpdate
)
from app.api.dependencies import get_current_active_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register_user(data: UserRegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    hashed_pwd = hash_password(data.password)
    new_user = User(
        email=data.email.lower(),
        hashed_password=hashed_pwd,
        full_name=data.full_name,
    )
    db.add(new_user)
    db.flush()

    # Create default profile and preferences
    profile = UserProfile(
        user_id=new_user.id,
        preferred_language="en",
        completed=False,
    )
    prefs = UserPreference(
        user_id=new_user.id,
        reminder_sound=True,
        browser_push_enabled=True,
        dark_theme=True,
    )
    db.add(profile)
    db.add(prefs)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(subject=new_user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name,
        }
    }

@router.post("/login", response_model=TokenResponse)
def login_user(data: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    token = create_access_token(subject=user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
        }
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.put("/profile")
def update_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
    
    if data.age is not None: profile.age = data.age
    if data.gender is not None: profile.gender = data.gender
    if data.phone is not None: profile.phone = data.phone
    if data.photo_url is not None: profile.photo_url = data.photo_url
    if data.allergies is not None: profile.allergies = data.allergies
    if data.existing_conditions is not None: profile.existing_conditions = data.existing_conditions
    if data.emergency_contact is not None: profile.emergency_contact = data.emergency_contact
    if data.preferred_language is not None: profile.preferred_language = data.preferred_language
    if data.timezone is not None: profile.timezone = data.timezone
    profile.completed = True

    db.commit()
    db.refresh(profile)
    return {"status": "success", "profile": profile}
