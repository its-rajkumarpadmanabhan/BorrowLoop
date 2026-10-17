import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class Tool(Base):
    __tablename__ = "tools"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(120), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)  # Power Tools, Gardening, Cleaning, Ladders, etc.
    description = Column(Text, nullable=False)
    daily_rate = Column(Float, nullable=False)  # ₹ per day
    hourly_rate = Column(Float, nullable=True)  # ₹ per hour
    replacement_deposit = Column(Float, nullable=False)  # Full market replacement collateral
    condition = Column(String(50), default="Excellent")
    image_url = Column(String(500), nullable=True)
    
    # Owner & Location Details (Sensitive - Protected by Privacy Shield)
    owner_id = Column(String(50), nullable=False, default="owner_user_1")
    owner_name = Column(String(100), nullable=False)
    owner_phone = Column(String(20), nullable=False)
    
    # Exact Physical Address (UNMASKED ONLY UPON ACCEPTANCE)
    house_flat_no = Column(String(100), nullable=False)
    building_street = Column(String(200), nullable=False)
    landmark = Column(String(150), nullable=True)
    locality = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=False, index=True)
    
    # GPS Coordinates for Haversine Calculation
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    rentals = relationship("Rental", back_populates="tool", cascade="all, delete-orphan")


class Rental(Base):
    __tablename__ = "rentals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tool_id = Column(Integer, ForeignKey("tools.id"), nullable=False)
    
    # Borrower Details
    borrower_id = Column(String(50), nullable=False, default="borrower_user_1")
    borrower_name = Column(String(100), nullable=False)
    borrower_phone = Column(String(20), nullable=False)
    
    # Booking Dates & Duration
    start_date = Column(String(20), nullable=False)  # YYYY-MM-DD
    end_date = Column(String(20), nullable=False)    # YYYY-MM-DD
    duration_days = Column(Integer, nullable=False, default=1)
    
    # Escrow & Financial Ledger
    daily_rate = Column(Float, nullable=False)
    rental_fee = Column(Float, nullable=False)
    security_deposit = Column(Float, nullable=False)  # Collateral held (Tool replacement value)
    total_amount = Column(Float, nullable=False)      # rental_fee + security_deposit
    payment_method = Column(String(20), default="UPI")  # UPI, CASH
    upi_id = Column(String(50), default="borrowloop@okaxis")
    
    # Rental Lifecycle Status Machine:
    # REQUESTED -> ACCEPTED -> ACTIVE_RENTAL -> COMPLETED (or REJECTED / CANCELLED)
    status = Column(String(30), default="REQUESTED", index=True)
    
    # Timestamps & Tracking Milestones
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    accepted_at = Column(DateTime, nullable=True)
    pickup_confirmed_at = Column(DateTime, nullable=True)
    return_confirmed_at = Column(DateTime, nullable=True)
    
    # Handover and Condition Notes
    handover_notes = Column(Text, nullable=True)
    return_notes = Column(Text, nullable=True)
    inspection_passed = Column(Boolean, nullable=True)
    refund_status = Column(String(30), default="PENDING")  # PENDING, REFUNDED_IN_FULL, DEDUCTED

    # Relationship
    tool = relationship("Tool", back_populates="rentals")
