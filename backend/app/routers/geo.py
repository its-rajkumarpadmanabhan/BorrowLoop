from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models import Tool
from ..geo import PINCODE_DATABASE, haversine_distance_km, DEFAULT_LAT, DEFAULT_LNG
import math

router = APIRouter(prefix="/api/geo", tags=["geo"])


@router.get("/pincodes")
def list_pincodes():
    """Return available postal codes with center coordinates and localities."""
    return [
        {"pincode": k, "city": v["city"], "locality": v["locality"], "lat": v["lat"], "lng": v["lng"]}
        for k, v in PINCODE_DATABASE.items()
    ]


@router.get("/radar")
def get_proximity_radar(
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """
    Computes distance and polar angle (bearing) for all available tools
    relative to borrower's current location, powering the interactive radar visualization.
    """
    center_lat = user_lat if user_lat is not None else DEFAULT_LAT
    center_lng = user_lng if user_lng is not None else DEFAULT_LNG

    tools = db.query(Tool).filter(Tool.is_available == True).all()
    radar_points = []

    for tool in tools:
        dist_km = haversine_distance_km(center_lat, center_lng, tool.latitude, tool.longitude)
        
        # Calculate compass bearing in degrees (0 = North, 90 = East, etc.)
        d_lon = math.radians(tool.longitude - center_lng)
        lat1 = math.radians(center_lat)
        lat2 = math.radians(tool.latitude)
        y = math.sin(d_lon) * math.cos(lat2)
        x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(d_lon)
        bearing = (math.degrees(math.atan2(y, x)) + 360) % 360

        radar_points.append({
            "tool_id": tool.id,
            "title": tool.title,
            "category": tool.category,
            "daily_rate": tool.daily_rate,
            "replacement_deposit": tool.replacement_deposit,
            "locality": tool.locality,
            "pincode": tool.pincode,
            "distance_km": dist_km,
            "bearing_degrees": round(bearing, 1),
            "image_url": tool.image_url,
            "privacy_notice": f"Distance: {dist_km} km ({tool.locality}) - Exact address shielded"
        })

    radar_points.sort(key=lambda p: p["distance_km"])
    return {
        "center": {"lat": center_lat, "lng": center_lng},
        "points": radar_points
    }
