from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Tool
from ..schemas import ToolPublic, ToolCreate, ToolAdminView
from ..geo import haversine_distance_km, get_coordinates_for_pincode, mask_phone_number, DEFAULT_LAT, DEFAULT_LNG

router = APIRouter(prefix="/api/tools", tags=["tools"])


@router.get("", response_model=List[ToolPublic])
def list_tools(
    query: Optional[str] = Query(None, description="Demand keyword e.g. hammer drill, saw"),
    category: Optional[str] = Query(None, description="Category filter"),
    user_lat: Optional[float] = Query(None, description="Borrower current latitude"),
    user_lng: Optional[float] = Query(None, description="Borrower current longitude"),
    pincode: Optional[str] = Query(None, description="Borrower current pincode"),
    max_distance_km: Optional[float] = Query(None, description="Radius limit in km"),
    db: Session = Depends(get_db)
):
    """
    Demand-First Discovery & Geospatial Proximity Matching:
    - Calculates distance using Haversine formulas against user latitude/longitude and postal codes.
    - Applies strict Privacy-Shielding:
      - Tools show category, rates, replacement deposit, and approximate distance (e.g., '0.8 km away in Pincode 695001').
      - Precise street address and phone number remain locked.
    """
    # 1. Resolve borrower location
    borrower_lat = user_lat
    borrower_lng = user_lng
    
    if (borrower_lat is None or borrower_lng is None) and pincode:
        geo_info = get_coordinates_for_pincode(pincode)
        if geo_info:
            borrower_lat = geo_info["lat"]
            borrower_lng = geo_info["lng"]
            
    # Default fallback to center of Trivandrum if no geo provided
    if borrower_lat is None or borrower_lng is None:
        borrower_lat = DEFAULT_LAT
        borrower_lng = DEFAULT_LNG

    # 2. Query tools
    db_query = db.query(Tool).filter(Tool.is_available == True)
    
    if category and category.lower() != "all":
        db_query = db_query.filter(Tool.category.ilike(f"%{category}%"))
        
    if query:
        search_pattern = f"%{query}%"
        db_query = db_query.filter(
            (Tool.title.ilike(search_pattern)) |
            (Tool.description.ilike(search_pattern)) |
            (Tool.category.ilike(search_pattern))
        )
        
    tools = db_query.all()
    results = []
    
    for tool in tools:
        # 3. Geospatial Proximity Calculation via Python Haversine formula
        dist_km = haversine_distance_km(borrower_lat, borrower_lng, tool.latitude, tool.longitude)
        
        # Distance filter if specified
        if max_distance_km is not None and dist_km > max_distance_km:
            continue
            
        first_name = tool.owner_name.split()[0] if tool.owner_name else "Neighbor"
        
        # Privacy-Shielded Card Transformation
        public_card = ToolPublic(
            id=tool.id,
            title=tool.title,
            category=tool.category,
            description=tool.description,
            daily_rate=tool.daily_rate,
            hourly_rate=tool.hourly_rate,
            replacement_deposit=tool.replacement_deposit,
            condition=tool.condition or "Good",
            image_url=tool.image_url,
            approx_location=f"{tool.locality}, Pincode {tool.pincode}",
            pincode=tool.pincode,
            approx_distance_km=dist_km,
            distance_label=f"{dist_km} km away in Pincode {tool.pincode}",
            owner_display_name=f"{first_name} (Verified Neighbor)",
            owner_phone_masked=mask_phone_number(tool.owner_phone),
            address_privacy_badge="🔒 Exact street address & contact locked until booking accepted",
            is_available=tool.is_available
        )
        results.append((dist_km, public_card))
        
    # Sort closest first
    results.sort(key=lambda x: x[0])
    return [item[1] for item in results]


@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Tool.category).distinct().all()
    return [c[0] for c in categories if c[0]]


@router.get("/{tool_id}", response_model=ToolPublic)
def get_tool_details(
    tool_id: int,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    db: Session = Depends(get_db)
):
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
        
    ref_lat = user_lat if user_lat is not None else DEFAULT_LAT
    ref_lng = user_lng if user_lng is not None else DEFAULT_LNG
    dist_km = haversine_distance_km(ref_lat, ref_lng, tool.latitude, tool.longitude)
    first_name = tool.owner_name.split()[0] if tool.owner_name else "Neighbor"
    
    return ToolPublic(
        id=tool.id,
        title=tool.title,
        category=tool.category,
        description=tool.description,
        daily_rate=tool.daily_rate,
        hourly_rate=tool.hourly_rate,
        replacement_deposit=tool.replacement_deposit,
        condition=tool.condition or "Good",
        image_url=tool.image_url,
        approx_location=f"{tool.locality}, Pincode {tool.pincode}",
        pincode=tool.pincode,
        approx_distance_km=dist_km,
        distance_label=f"{dist_km} km away in Pincode {tool.pincode}",
        owner_display_name=f"{first_name} (Verified Neighbor)",
        owner_phone_masked=mask_phone_number(tool.owner_phone),
        address_privacy_badge="🔒 Exact street address & contact locked until booking accepted",
        is_available=tool.is_available
    )


@router.post("", response_model=ToolAdminView)
def create_tool(tool_in: ToolCreate, db: Session = Depends(get_db)):
    tool_data = tool_in.dict()
    new_tool = Tool(**tool_data)
    db.add(new_tool)
    db.commit()
    db.refresh(new_tool)
    return new_tool
