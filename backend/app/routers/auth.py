import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from ..database import get_db
from ..models import User
from ..schemas import UserLoginRegister, UserResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login-or-register", response_model=UserResponse)
def login_or_register(payload: UserLoginRegister, db: Session = Depends(get_db)):
    raw_email = payload.email.strip().lower()
    if not raw_email or "@" not in raw_email or "." not in raw_email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")

    user = db.query(User).filter(User.email == raw_email).first()
    if user:
        # Existing user - update fields if provided
        if payload.full_name and payload.full_name.strip():
            user.full_name = payload.full_name.strip()
        if payload.phone and payload.phone.strip():
            user.phone = payload.phone.strip()
        if payload.locality and payload.locality.strip():
            user.locality = payload.locality.strip()
        if payload.pincode and payload.pincode.strip():
            user.pincode = payload.pincode.strip()
        if payload.upi_id and payload.upi_id.strip():
            user.upi_id = payload.upi_id.strip()
        db.commit()
        db.refresh(user)
        return user

    # New user registration
    name = (
        payload.full_name.strip()
        if payload.full_name and payload.full_name.strip()
        else raw_email.split("@")[0].replace(".", " ").capitalize()
    )
    phone = (
        payload.phone.strip()
        if payload.phone and payload.phone.strip()
        else "+91 98000 00000"
    )

    new_user = User(
        email=raw_email,
        full_name=name,
        phone=phone,
        locality=payload.locality.strip() if payload.locality and payload.locality.strip() else "Neighborhood",
        pincode=payload.pincode.strip() if payload.pincode and payload.pincode.strip() else "695001",
        upi_id=payload.upi_id.strip() if payload.upi_id and payload.upi_id.strip() else f"{raw_email.split('@')[0]}@upi",
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get("/me", response_model=UserResponse)
def get_current_user(email: str = Query(..., description="User email"), db: Session = Depends(get_db)):
    raw_email = email.strip().lower()
    user = db.query(User).filter(User.email == raw_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
