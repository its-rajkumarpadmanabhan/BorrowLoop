from typing import Optional, List
from pydantic import BaseModel, Field
import datetime


class ToolBase(BaseModel):
    title: str
    category: str
    description: str
    daily_rate: float
    hourly_rate: Optional[float] = None
    replacement_deposit: float  # Full replacement value designated upfront as collateral
    condition: Optional[str] = "Excellent"
    image_url: Optional[str] = None
    locality: str
    pincode: str
    latitude: float
    longitude: float


class ToolCreate(ToolBase):
    owner_id: Optional[str] = "owner_anand"
    owner_name: str
    owner_phone: str
    house_flat_no: str
    building_street: str
    landmark: Optional[str] = None


class ToolPublic(BaseModel):
    """
    Privacy-Shielded Tool Representation for Discovery & Search.
    Locks exact street address and contact phone number.
    Only reveals category, rates, replacement deposit, and approximate distance.
    """
    id: int
    title: str
    category: str
    description: str
    daily_rate: float
    hourly_rate: Optional[float] = None
    replacement_deposit: float
    condition: str
    image_url: Optional[str] = None
    
    # Privacy Shielded Geospatial & Contact Data
    approx_location: str  # e.g., "Kowdiar, Pincode 695003"
    pincode: str
    approx_distance_km: Optional[float] = None  # Haversine distance
    distance_label: Optional[str] = None       # e.g., "0.8 km away in Pincode 695001"
    
    # Shielded Owner Details
    owner_display_name: str
    owner_phone_masked: str  # e.g., "+91 98*** 12345"
    address_privacy_badge: str = "🔒 Exact street address & contact locked until booking accepted"
    is_available: bool

    class Config:
        from_attributes = True


class ToolAdminView(ToolBase):
    """Full detail view for owner or internal inspection."""
    id: int
    owner_id: str
    owner_name: str
    owner_phone: str
    house_flat_no: str
    building_street: str
    landmark: Optional[str] = None
    is_available: bool

    class Config:
        from_attributes = True


# --- Rental Handover & Escrow Schemas ---

class RentalCreate(BaseModel):
    tool_id: int
    borrower_id: Optional[str] = "borrower_rahul"
    borrower_name: str
    borrower_phone: str
    start_date: str  # YYYY-MM-DD
    end_date: str    # YYYY-MM-DD
    payment_method: Optional[str] = "UPI"  # UPI, CASH
    notes: Optional[str] = None


class PickupConfirmationPayload(BaseModel):
    payment_received: bool = True
    payment_mode_used: Optional[str] = "UPI"
    handover_notes: Optional[str] = "Tool handed over in pristine condition. Replacement deposit held."


class ReturnConfirmationPayload(BaseModel):
    inspection_passed: bool = True
    refund_deposited: bool = True
    return_notes: Optional[str] = "Item returned in good working order. Full deposit collateral refunded."


class RentalResponse(BaseModel):
    id: int
    tool_id: int
    tool_title: str
    tool_category: str
    tool_image_url: Optional[str] = None
    
    # Borrower & Owner Identities
    borrower_id: str
    borrower_name: str
    borrower_phone: str  # Masked if not accepted/relevant
    owner_id: str
    owner_name: str
    
    # Rental Dates & Duration
    start_date: str
    end_date: str
    duration_days: int
    
    # Escrow & Financial Ledger
    daily_rate: float
    rental_fee: float
    security_deposit: float  # Full replacement value designated upfront as collateral
    total_amount: float
    payment_method: str
    upi_id: str
    
    # Status Machine: REQUESTED, ACCEPTED, ACTIVE_RENTAL, COMPLETED, REJECTED, CANCELLED
    status: str
    created_at: datetime.datetime
    accepted_at: Optional[datetime.datetime] = None
    pickup_confirmed_at: Optional[datetime.datetime] = None
    return_confirmed_at: Optional[datetime.datetime] = None
    
    # TWO-WAY UNMASKING TRIGGER (Populated ONLY when status is ACCEPTED, ACTIVE_RENTAL, or COMPLETED)
    is_contact_unmasked: bool = False
    
    # Owner Unmasked Fields (Visible to Borrower when accepted)
    owner_full_phone: Optional[str] = None
    owner_direct_call_url: Optional[str] = None     # tel:+91...
    owner_whatsapp_url: Optional[str] = None        # https://wa.me/...
    owner_exact_address: Optional[str] = None       # "House 12B, Palm Grove Avenue, Kowdiar"
    google_maps_nav_url: Optional[str] = None       # Direct Google Maps navigation link with coordinates
    
    # Borrower Unmasked Fields (Visible to Owner when accepted)
    borrower_full_phone: Optional[str] = None
    borrower_whatsapp_url: Optional[str] = None
    
    # Handover and Return Notes
    handover_notes: Optional[str] = None
    return_notes: Optional[str] = None
    inspection_passed: Optional[bool] = None
    refund_status: str

    class Config:
        from_attributes = True
