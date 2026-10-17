from sqlalchemy.orm import Session
from .models import Tool, Rental
import datetime

SAMPLE_TOOLS = [
    {
        "title": "Bosch GBH 2-26 DRE Rotary Hammer Drill Set",
        "category": "Power Tools",
        "description": "Heavy duty 800W rotary hammer drill with SDS-plus chuck. Includes 5 masonry drill bits (6mm to 16mm) and flat chisel. Perfect for concrete drilling and wall mounting.",
        "daily_rate": 350.0,
        "hourly_rate": 60.0,
        "replacement_deposit": 6500.0,  # Designated replacement collateral
        "condition": "Excellent (Like New)",
        "image_url": "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=80",
        "owner_id": "owner_anand",
        "owner_name": "Anand Nair",
        "owner_phone": "+919847123456",
        "house_flat_no": "Flat 3B, Silver Palms Apartment",
        "building_street": "Belhaven Palace Road, Kowdiar",
        "landmark": "Near Kowdiar Golf Club",
        "locality": "Kowdiar",
        "pincode": "695003",
        "latitude": 8.5240,
        "longitude": 76.9645,
        "is_available": True,
    },
    {
        "title": "DeWalt 20V MAX XR Cordless Circular Saw (7-1/4 Inch)",
        "category": "Carpentry & Woodwork",
        "description": "Brushless motor with 5500 RPM for fast cuts. Includes 2x 5.0Ah lithium battery packs, fast dual charger, and 24-tooth carbide blade. Ideal for plywood and timber framing.",
        "daily_rate": 450.0,
        "hourly_rate": 80.0,
        "replacement_deposit": 12000.0,
        "condition": "Pristine",
        "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80",
        "owner_id": "owner_priya",
        "owner_name": "Priya Menon",
        "owner_phone": "+919847987654",
        "house_flat_no": "Villa 14, Green Valley Enclave",
        "building_street": "Vellayambalam-Sasthamangalam Road",
        "landmark": "Opposite Cafe Coffee Day",
        "locality": "Sasthamangalam",
        "pincode": "695014",
        "latitude": 8.5145,
        "longitude": 76.9732,
        "is_available": True,
    },
    {
        "title": "Kärcher K4 Power Control High-Pressure Washer 130 Bar",
        "category": "Cleaning & Pressure",
        "description": "130 bar pressure washer with Vario Power jet spray wand and Dirt Blaster. 6-meter high-pressure hose. Ideal for car detailing, patio cleaning, and exterior walls.",
        "daily_rate": 600.0,
        "hourly_rate": 100.0,
        "replacement_deposit": 18000.0,
        "condition": "Excellent",
        "image_url": "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=700&q=80",
        "owner_id": "owner_anand",
        "owner_name": "Anand Nair",
        "owner_phone": "+919847123456",
        "house_flat_no": "House TC 4/128, Palm Grove Lane",
        "building_street": "Pattom-Marappalam Road",
        "landmark": "Behind Kendriya Vidyalaya Pattom",
        "locality": "Pattom",
        "pincode": "695011",
        "latitude": 8.5280,
        "longitude": 76.9450,
        "is_available": True,
    },
    {
        "title": "Werner 20-Foot Telescopic Multi-Position Aluminium Ladder",
        "category": "Ladders & Access",
        "description": "Heavy-duty 150 kg load rated aluminium telescopic ladder. Converts into step ladder, stairway ladder, extension ladder, and scaffold base. Lightweight and folds into car boot.",
        "daily_rate": 300.0,
        "hourly_rate": 50.0,
        "replacement_deposit": 9500.0,
        "condition": "Good & Sturdy",
        "image_url": "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=700&q=80",
        "owner_id": "owner_kiran",
        "owner_name": "Kiran George",
        "owner_phone": "+919745112233",
        "house_flat_no": "TC 28/456, Heritage Villa",
        "building_street": "Statue - General Hospital Road",
        "landmark": "Near Secretariat Gate 3",
        "locality": "Statue",
        "pincode": "695001",
        "latitude": 8.4940,
        "longitude": 76.9510,
        "is_available": True,
    },
    {
        "title": "Stihl MS 180 Compact Petrol Chainsaw with 16\" Bar",
        "category": "Gardening & Yard",
        "description": "Reliable 31.8cc 2-stroke petrol chainsaw. Comes with safety chain brake, spark plug wrench, and chain lubrication oil bottle. Perfect for tree branch trimming and firewood.",
        "daily_rate": 700.0,
        "hourly_rate": 120.0,
        "replacement_deposit": 16500.0,
        "condition": "Heavy Duty Serviced",
        "image_url": "https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=700&q=80",
        "owner_id": "owner_priya",
        "owner_name": "Priya Menon",
        "owner_phone": "+919847987654",
        "house_flat_no": "TC 15/892, Rosewood Garden",
        "building_street": "DPI Junction, Vazhuthacaud",
        "landmark": "Next to All India Radio",
        "locality": "Vazhuthacaud",
        "pincode": "695004",
        "latitude": 8.5010,
        "longitude": 76.9650,
        "is_available": True,
    },
    {
        "title": "Bosch D-TECT 120 Professional Wall Scanner & Stud Finder",
        "category": "Measurement & Detection",
        "description": "Radar detector that locates live electrical wires, copper pipes, rebar, and wooden drywall studs up to 12cm depth. Prevents costly drilling accidents.",
        "daily_rate": 280.0,
        "hourly_rate": 50.0,
        "replacement_deposit": 7500.0,
        "condition": "Excellent",
        "image_url": "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=700&q=80",
        "owner_id": "owner_kiran",
        "owner_name": "Kiran George",
        "owner_phone": "+919745112233",
        "house_flat_no": "Tower 2, Flat 804, Cyber Heights",
        "building_street": "Bypass Highway, Kazhakkoottam",
        "landmark": "Opposite Technopark Phase 1 Main Gate",
        "locality": "Technopark",
        "pincode": "695033",
        "latitude": 8.5570,
        "longitude": 76.8835,
        "is_available": True,
    }
]


def seed_database_if_empty(db: Session):
    existing_tools = db.query(Tool).count()
    if existing_tools == 0:
        created_tools = []
        for tool_dict in SAMPLE_TOOLS:
            tool = Tool(**tool_dict)
            db.add(tool)
            created_tools.append(tool)
        db.commit()

        # Refresh tools to get IDs
        for t in created_tools:
            db.refresh(t)

        now = datetime.datetime.utcnow()
        
        # 1. Seed a sample REQUESTED rental (Demonstrates Pre-acceptance privacy shield)
        rental_requested = Rental(
            tool_id=created_tools[0].id,  # Bosch Hammer Drill
            borrower_id="borrower_rahul",
            borrower_name="Rahul Varma",
            borrower_phone="+919895012345",
            start_date=(now + datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
            end_date=(now + datetime.timedelta(days=2)).strftime("%Y-%m-%d"),
            duration_days=2,
            daily_rate=created_tools[0].daily_rate,
            rental_fee=created_tools[0].daily_rate * 2,
            security_deposit=created_tools[0].replacement_deposit,
            total_amount=(created_tools[0].daily_rate * 2) + created_tools[0].replacement_deposit,
            payment_method="UPI",
            status="REQUESTED",
            created_at=now - datetime.timedelta(hours=3),
            refund_status="PENDING"
        )
        db.add(rental_requested)

        # 2. Seed a sample ACCEPTED rental (Demonstrates UNMASKED contact, exact address & Google Maps)
        rental_accepted = Rental(
            tool_id=created_tools[1].id,  # DeWalt Cordless Circular Saw
            borrower_id="borrower_rahul",
            borrower_name="Rahul Varma",
            borrower_phone="+919895012345",
            start_date=now.strftime("%Y-%m-%d"),
            end_date=(now + datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
            duration_days=1,
            daily_rate=created_tools[1].daily_rate,
            rental_fee=created_tools[1].daily_rate,
            security_deposit=created_tools[1].replacement_deposit,
            total_amount=created_tools[1].daily_rate + created_tools[1].replacement_deposit,
            payment_method="UPI",
            status="ACCEPTED",
            created_at=now - datetime.timedelta(hours=6),
            accepted_at=now - datetime.timedelta(hours=1),
            refund_status="PENDING"
        )
        db.add(rental_accepted)

        # 3. Seed an ACTIVE_RENTAL (Owner confirmed payment, escrow held, item handed over)
        rental_active = Rental(
            tool_id=created_tools[2].id,  # Kärcher High Pressure Washer
            borrower_id="borrower_rahul",
            borrower_name="Rahul Varma",
            borrower_phone="+919895012345",
            start_date=(now - datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
            end_date=now.strftime("%Y-%m-%d"),
            duration_days=1,
            daily_rate=created_tools[2].daily_rate,
            rental_fee=created_tools[2].daily_rate,
            security_deposit=created_tools[2].replacement_deposit,
            total_amount=created_tools[2].daily_rate + created_tools[2].replacement_deposit,
            payment_method="UPI",
            status="ACTIVE_RENTAL",
            created_at=now - datetime.timedelta(days=1, hours=2),
            accepted_at=now - datetime.timedelta(days=1),
            pickup_confirmed_at=now - datetime.timedelta(days=1),
            handover_notes="Paid via Google Pay UPI. ₹18,000 security collateral held in escrow. Washer and high-pressure hose handed over.",
            refund_status="PENDING"
        )
        db.add(rental_active)

        db.commit()
