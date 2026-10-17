import math
from typing import Dict, Any, Optional

# Curated reference pincodes with geographical centroids
PINCODE_DATABASE: Dict[str, Dict[str, Any]] = {
    # Kerala / Trivandrum region (referenced in prompt pincode 695001)
    "695001": {"city": "Thiruvananthapuram", "locality": "Statue / East Fort", "lat": 8.4900, "lng": 76.9530},
    "695003": {"city": "Thiruvananthapuram", "locality": "Kowdiar / Vellayambalam", "lat": 8.5204, "lng": 76.9632},
    "695004": {"city": "Thiruvananthapuram", "locality": "Vazhuthacaud / DPI", "lat": 8.4998, "lng": 76.9642},
    "695011": {"city": "Thiruvananthapuram", "locality": "Pattom / Kesavadasapuram", "lat": 8.5250, "lng": 76.9420},
    "695014": {"city": "Thiruvananthapuram", "locality": "Sasthamangalam", "lat": 8.5140, "lng": 76.9740},
    "695033": {"city": "Thiruvananthapuram", "locality": "Technopark / Kazhakkoottam", "lat": 8.5580, "lng": 76.8820},
    "695034": {"city": "Thiruvananthapuram", "locality": "Kariavattom University Campus", "lat": 8.5630, "lng": 76.8910},
    # Major metros for universal testing
    "560001": {"city": "Bengaluru", "locality": "MG Road / Ashok Nagar", "lat": 12.9716, "lng": 77.5946},
    "560034": {"city": "Bengaluru", "locality": "Koramangala", "lat": 12.9352, "lng": 77.6245},
    "560100": {"city": "Bengaluru", "locality": "Electronic City", "lat": 12.8452, "lng": 77.6602},
    "400001": {"city": "Mumbai", "locality": "Fort / Colaba", "lat": 18.9322, "lng": 72.8347},
    "110001": {"city": "New Delhi", "locality": "Connaught Place", "lat": 28.6315, "lng": 77.2167},
}

DEFAULT_LAT = 8.5204
DEFAULT_LNG = 76.9632
DEFAULT_PINCODE = "695003"


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points
    on the Earth surface using the standard Haversine formula.
    
    Formula:
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin^2(dlat / 2) + cos(lat1) * cos(lat2) * sin^2(dlon / 2)
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        d = R * c
        where R is Earth's mean radius = 6371 km.
    """
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 0.0

    R = 6371.0  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2.0) ** 2)
         
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    distance = R * c
    return round(distance, 2)


def get_coordinates_for_pincode(pincode: str) -> Optional[Dict[str, Any]]:
    """Look up coordinates and locality for a postal code."""
    pincode_clean = pincode.strip()
    return PINCODE_DATABASE.get(pincode_clean)


def mask_phone_number(phone: str) -> str:
    """Mask phone number for pre-acceptance privacy: e.g. +91 98*** 12345."""
    if not phone:
        return "Protected"
    clean = phone.replace(" ", "").replace("-", "")
    if len(clean) >= 10:
        prefix = clean[:4]
        suffix = clean[-2:]
        return f"{prefix}****{suffix}"
    return "Locked until accepted"


def mask_address(street_address: str, locality: str, pincode: str) -> str:
    """
    Mask exact address details for pre-acceptance privacy.
    Only shows locality and pincode, locking house/flat number and building name.
    """
    return f"🔒 Exact Street Address Locked (Approx in {locality}, {pincode})"
