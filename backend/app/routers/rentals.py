import datetime
from urllib.parse import quote
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Rental, Tool
from ..schemas import (
    RentalCreate,
    RentalResponse,
    PickupConfirmationPayload,
    ReturnConfirmationPayload
)
from ..geo import mask_phone_number

router = APIRouter(prefix="/api/rentals", tags=["rentals"])


def _format_rental_response(rental: Rental, tool: Tool) -> RentalResponse:
    """
    Transforms internal DB record into API response.
    Enforces Two-Way Masking and Lender Acceptance Unmasking Trigger:
    - Pre-acceptance: Phone masked, exact address locked.
    - Post-acceptance (ACCEPTED, ACTIVE_RENTAL, COMPLETED):
      Immediate unmasking of phone, direct call, WhatsApp, exact address, and Google Maps.
    """
    is_unmasked = rental.status in ["ACCEPTED", "ACTIVE_RENTAL", "COMPLETED"]
    
    # Pre-acceptance default masked state
    owner_full_phone = None
    owner_call_url = None
    owner_wa_url = None
    owner_exact_address = None
    google_maps_nav_url = None
    borrower_full_phone = mask_phone_number(rental.borrower_phone)
    borrower_wa_url = None

    if is_unmasked:
        # LENDER ACCEPTANCE TRIGGER: IMMEDIATE UNMASKING
        owner_full_phone = tool.owner_phone
        owner_clean_phone = tool.owner_phone.replace("+", "").replace(" ", "").replace("-", "")
        owner_call_url = f"tel:{tool.owner_phone}"
        wa_message = quote(f"Hi {tool.owner_name}, I'm {rental.borrower_name} regarding our BorrowLoop rental for '{tool.title}'!")
        owner_wa_url = f"https://wa.me/{owner_clean_phone}?text={wa_message}"
        
        # Exact Street Address
        address_parts = [
            tool.house_flat_no,
            tool.building_street,
            tool.landmark if tool.landmark else "",
            f"{tool.locality}, Pincode {tool.pincode}"
        ]
        owner_exact_address = ", ".join([p for p in address_parts if p.strip()])
        
        # Direct Google Maps Navigation Link with coordinates
        google_maps_nav_url = f"https://www.google.com/maps/dir/?api=1&destination={tool.latitude},{tool.longitude}"
        
        # Borrower contact unmasked to owner
        borrower_full_phone = rental.borrower_phone
        borrower_clean_phone = rental.borrower_phone.replace("+", "").replace(" ", "").replace("-", "")
        borrower_wa_message = quote(f"Hi {rental.borrower_name}, this is {tool.owner_name} regarding your BorrowLoop pickup for '{tool.title}'!")
        borrower_wa_url = f"https://wa.me/{borrower_clean_phone}?text={borrower_wa_message}"

    return RentalResponse(
        id=rental.id,
        tool_id=tool.id,
        tool_title=tool.title,
        tool_category=tool.category,
        tool_image_url=tool.image_url,
        borrower_id=rental.borrower_id,
        borrower_name=rental.borrower_name,
        borrower_phone=borrower_full_phone,
        owner_id=tool.owner_id,
        owner_name=tool.owner_name,
        start_date=rental.start_date,
        end_date=rental.end_date,
        duration_days=rental.duration_days,
        daily_rate=rental.daily_rate,
        rental_fee=rental.rental_fee,
        security_deposit=rental.security_deposit,
        total_amount=rental.total_amount,
        payment_method=rental.payment_method,
        upi_id=rental.upi_id,
        status=rental.status,
        created_at=rental.created_at,
        accepted_at=rental.accepted_at,
        pickup_confirmed_at=rental.pickup_confirmed_at,
        return_confirmed_at=rental.return_confirmed_at,
        is_contact_unmasked=is_unmasked,
        owner_full_phone=owner_full_phone,
        owner_direct_call_url=owner_call_url,
        owner_whatsapp_url=owner_wa_url,
        owner_exact_address=owner_exact_address,
        google_maps_nav_url=google_maps_nav_url,
        borrower_full_phone=borrower_full_phone,
        borrower_whatsapp_url=borrower_wa_url,
        handover_notes=rental.handover_notes,
        return_notes=rental.return_notes,
        inspection_passed=rental.inspection_passed,
        refund_status=rental.refund_status
    )


@router.post("", response_model=RentalResponse)
@router.post("/request", response_model=RentalResponse)
def create_rental_request(payload: RentalCreate, db: Session = Depends(get_db)):
    """
    Demand-First Booking Request:
    - Calculates days, rental fee, and locks full replacement deposit as collateral.
    - Leaves address and phone masked until lender explicitly accepts.
    """
    tool = db.query(Tool).filter(Tool.id == payload.tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    borrower_id_clean = payload.borrower_id.strip().lower() if payload.borrower_id else "borrower_user"
    owner_id_clean = tool.owner_id.strip().lower() if tool.owner_id else ""

    if borrower_id_clean and owner_id_clean and borrower_id_clean == owner_id_clean:
        raise HTTPException(status_code=400, detail="You cannot borrow your own equipment listing.")

    try:
        start_dt = datetime.datetime.strptime(payload.start_date, "%Y-%m-%d").date()
        end_dt = datetime.datetime.strptime(payload.end_date, "%Y-%m-%d").date()
        days = max(1, (end_dt - start_dt).days + 1)
    except Exception:
        days = 1

    rental_fee = tool.daily_rate * days
    security_deposit = tool.replacement_deposit  # Full replacement collateral upfront hold
    total_amount = rental_fee + security_deposit

    rental = Rental(
        tool_id=tool.id,
        borrower_id=borrower_id_clean,
        borrower_name=payload.borrower_name,
        borrower_phone=payload.borrower_phone,
        start_date=payload.start_date,
        end_date=payload.end_date,
        duration_days=days,
        daily_rate=tool.daily_rate,
        rental_fee=rental_fee,
        security_deposit=security_deposit,
        total_amount=total_amount,
        payment_method=payload.payment_method or "UPI",
        upi_id=f"{tool.owner_id.split('@')[0]}@borrowloop",
        status="REQUESTED",
        created_at=datetime.datetime.utcnow(),
        refund_status="PENDING"
    )
    db.add(rental)
    db.commit()
    db.refresh(rental)

    return _format_rental_response(rental, tool)


@router.get("", response_model=List[RentalResponse])
def get_all_rentals(
    role: Optional[str] = None,
    user_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Fetch rental bookings with dynamic filtering by user and role."""
    query = db.query(Rental).join(Tool)

    if user_id:
        uid = user_id.strip().lower()
        if role == "BORROWER":
            query = query.filter(Rental.borrower_id == uid)
        elif role == "OWNER":
            query = query.filter(Tool.owner_id == uid)
        else:
            query = query.filter((Rental.borrower_id == uid) | (Tool.owner_id == uid))

    if status and status.upper() != "ALL":
        query = query.filter(Rental.status == status.upper())

    rentals = query.order_by(Rental.id.desc()).all()
    results = []
    for r in rentals:
        results.append(_format_rental_response(r, r.tool))
    return results


@router.get("/{rental_id}", response_model=RentalResponse)
def get_rental(rental_id: int, db: Session = Depends(get_db)):
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")
    return _format_rental_response(rental, rental.tool)


@router.post("/{rental_id}/accept", response_model=RentalResponse)
@router.patch("/{rental_id}/accept", response_model=RentalResponse)
def accept_rental(rental_id: int, db: Session = Depends(get_db)):
    """
    Lender Acceptance Trigger:
    When an owner accepts a rental request, the backend immediately unmasks:
    - Full contact phone number (with one-tap direct call and WhatsApp trigger).
    - Exact address (House/Flat number, building name, street).
    - Direct Google Maps navigation link with coordinates.
    """
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")

    if rental.status not in ["REQUESTED", "PENDING"]:
        raise HTTPException(status_code=400, detail=f"Cannot accept rental in '{rental.status}' state.")

    rental.status = "ACCEPTED"
    rental.accepted_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(rental)

    return _format_rental_response(rental, rental.tool)


@router.post("/{rental_id}/reject", response_model=RentalResponse)
@router.patch("/{rental_id}/reject", response_model=RentalResponse)
def reject_rental(rental_id: int, db: Session = Depends(get_db)):
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")

    rental.status = "REJECTED"
    db.commit()
    db.refresh(rental)
    return _format_rental_response(rental, rental.tool)


@router.post("/{rental_id}/confirm_pickup", response_model=RentalResponse)
@router.patch("/{rental_id}/confirm_pickup", response_model=RentalResponse)
@router.post("/{rental_id}/confirm-payment", response_model=RentalResponse)
@router.patch("/{rental_id}/confirm-payment", response_model=RentalResponse)
def confirm_pickup_and_handover(
    rental_id: int,
    payload: Optional[PickupConfirmationPayload] = None,
    db: Session = Depends(get_db)
):
    """
    Cash/UPI Deposit Escrow & Return Handover:
    Owner Pickup Confirmation:
    Once the borrower arrives and pays the deposit/rental fee,
    the owner clicks 'Confirm Payment Received & Hand Over Item',
    moving status to ACTIVE_RENTAL.
    """
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")

    if rental.status != "ACCEPTED":
        raise HTTPException(status_code=400, detail=f"Cannot confirm pickup for rental in '{rental.status}' state.")

    rental.status = "ACTIVE_RENTAL"
    rental.pickup_confirmed_at = datetime.datetime.utcnow()
    if payload:
        if payload.payment_mode_used:
            rental.payment_method = payload.payment_mode_used
        if payload.handover_notes:
            rental.handover_notes = payload.handover_notes

    db.commit()
    db.refresh(rental)

    return _format_rental_response(rental, rental.tool)


@router.post("/{rental_id}/confirm_return", response_model=RentalResponse)
@router.patch("/{rental_id}/confirm_return", response_model=RentalResponse)
@router.post("/{rental_id}/confirm-return", response_model=RentalResponse)
@router.patch("/{rental_id}/confirm-return", response_model=RentalResponse)
def confirm_return_and_release_refund(
    rental_id: int,
    payload: Optional[ReturnConfirmationPayload] = None,
    db: Session = Depends(get_db)
):
    """
    Owner Return & Refund Release:
    When the borrower brings the tool back, the owner inspects it for condition
    and clicks 'Confirm Item Returned & Refund Deposited',
    closing the loop and releasing the record to COMPLETED.
    """
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")

    if rental.status != "ACTIVE_RENTAL":
        raise HTTPException(status_code=400, detail=f"Cannot confirm return for rental in '{rental.status}' state.")

    rental.status = "COMPLETED"
    rental.return_confirmed_at = datetime.datetime.utcnow()
    if payload:
        rental.inspection_passed = payload.inspection_passed
        rental.refund_status = "REFUNDED_IN_FULL" if payload.refund_deposited else "DEDUCTED"
        if payload.return_notes:
            rental.return_notes = payload.return_notes
    else:
        rental.inspection_passed = True
        rental.refund_status = "REFUNDED_IN_FULL"

    db.commit()
    db.refresh(rental)

    return _format_rental_response(rental, rental.tool)


@router.post("/{rental_id}/cancel", response_model=RentalResponse)
def cancel_rental(rental_id: int, db: Session = Depends(get_db)):
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")

    if rental.status in ["ACTIVE_RENTAL", "COMPLETED"]:
        raise HTTPException(status_code=400, detail="Cannot cancel active or completed rental.")

    rental.status = "CANCELLED"
    db.commit()
    db.refresh(rental)
    return _format_rental_response(rental, rental.tool)
