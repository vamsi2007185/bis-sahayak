"""
================================================================================
BIS Sahayak - Hyper-Local Lab Verification Router (CARE Database)
================================================================================
Features:
  1. Authoritative registry of BIS Recognized & NABL Accredited Testing Laboratories.
  2. Great-circle Haversine geospatial proximity calculations.
  3. Product-category capability filtering (Drinking Water, Electrical, Mechanical, Food).
  4. Direct Google Maps navigation deep links and contact details for MSMEs.
================================================================================
"""

import math
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class LabInfo(BaseModel):
    lab_id: str
    lab_name: str
    zone: str
    latitude: float
    longitude: float
    distance_km: float
    address: str
    city: str
    state: str
    contact_person: str
    phone: str
    email: str
    accredited_categories: List[str]
    nabl_accreditation_number: str
    is_bis_central_lab: bool
    navigation_url: str


class BISLabDirectory:
    """Geospatial directory of BIS testing laboratories across India."""

    def __init__(self):
        # Database of authoritative BIS laboratories across Indian zones
        self.laboratories = [
            {
                "lab_id": "BIS-LAB-001",
                "lab_name": "BIS Central Laboratory (CL)",
                "zone": "Central",
                "lat": 28.6946,
                "lon": 77.3489,
                "address": "Plot No. 20/9, Site IV, Sahibabad Industrial Area, Ghaziabad",
                "city": "Ghaziabad",
                "state": "Uttar Pradesh",
                "contact": "Dr. R. K. Sharma (Scientist-F & Head)",
                "phone": "+91-120-4177100",
                "email": "cl-bis@nic.in",
                "categories": ["drinking_water", "electrical", "mechanical", "chemical", "food"],
                "nabl": "TC-5012",
                "is_central": True
            },
            {
                "lab_id": "BIS-LAB-002",
                "lab_name": "BIS Western Regional Laboratory (WROL)",
                "zone": "West",
                "lat": 19.1245,
                "lon": 72.8687,
                "address": "Plot No. E-9, Road No. 8, MIDC, Andheri (East)",
                "city": "Mumbai",
                "state": "Maharashtra",
                "contact": "Smt. Sunita Rao (Scientist-E)",
                "phone": "+91-22-28329295",
                "email": "wrol@bis.gov.in",
                "categories": ["electrical", "electronics", "plastics", "mechanical"],
                "nabl": "TC-5120",
                "is_central": False
            },
            {
                "lab_id": "BIS-LAB-003",
                "lab_name": "BIS Northern Regional Laboratory (NROL)",
                "zone": "North",
                "lat": 30.7046,
                "lon": 76.7179,
                "address": "Plot No. 4-A, Sector 27-B, Madhya Marg",
                "city": "Mohali / Chandigarh",
                "state": "Punjab",
                "contact": "Shri Amit Verma (Scientist-E)",
                "phone": "+91-172-2650206",
                "email": "nrol@bis.gov.in",
                "categories": ["drinking_water", "mechanical", "food", "agriculture"],
                "nabl": "TC-5234",
                "is_central": False
            },
            {
                "lab_id": "BIS-LAB-004",
                "lab_name": "BIS Southern Regional Laboratory (SROL)",
                "zone": "South",
                "lat": 13.0033,
                "lon": 80.2550,
                "address": "CIT Campus, IV Cross Road, Taramani",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "contact": "Dr. K. Balasubramanian (Director)",
                "phone": "+91-44-22541442",
                "email": "srol@bis.gov.in",
                "categories": ["electrical", "medical_devices", "textile", "drinking_water"],
                "nabl": "TC-5389",
                "is_central": False
            },
            {
                "lab_id": "BIS-LAB-005",
                "lab_name": "BIS Eastern Regional Laboratory (EROL)",
                "zone": "East",
                "lat": 22.5697,
                "lon": 88.4069,
                "address": "1/14 C.I.T. Scheme VII M, VIP Road, Kankurgachi",
                "city": "Kolkata",
                "state": "West Bengal",
                "contact": "Shri S. Mukherjee (Scientist-E)",
                "phone": "+91-33-23553243",
                "email": "erol@bis.gov.in",
                "categories": ["metallurgy", "chemical", "cables", "mechanical"],
                "nabl": "TC-5491",
                "is_central": False
            },
            {
                "lab_id": "BIS-LAB-006",
                "lab_name": "BIS Bangalore Branch Testing Centre",
                "zone": "South",
                "lat": 12.9716,
                "lon": 77.5946,
                "address": "Peenya Industrial Area, 1st Stage",
                "city": "Bengaluru",
                "state": "Karnataka",
                "contact": "Shri M. Ramesh (Scientist-D)",
                "phone": "+91-80-28394955",
                "email": "bnbo@bis.gov.in",
                "categories": ["electronics", "solar_pv", "electrical", "batteries"],
                "nabl": "TC-6102",
                "is_central": False
            },
            {
                "lab_id": "BIS-LAB-007",
                "lab_name": "Gujarat State Analytical Laboratory (BIS Recognized)",
                "zone": "West",
                "lat": 23.0225,
                "lon": 72.5714,
                "address": "GIDC Electronics Zone, Sector 25",
                "city": "Gandhinagar / Ahmedabad",
                "state": "Gujarat",
                "contact": "Dr. H. Patel (Chief Analyst)",
                "phone": "+91-79-23241289",
                "email": "info@gsal-bis.org",
                "categories": ["textile", "pumps", "chemical", "drinking_water"],
                "nabl": "TC-7214",
                "is_central": False
            }
        ]

    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Computes Great-Circle distance in kilometers."""
        R = 6371.0  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(R * c, 2)

    def find_nearest_labs(
        self,
        user_lat: float,
        user_lon: float,
        product_category: Optional[str] = None,
        max_radius_km: float = 2000.0,
        limit: int = 5
    ) -> List[LabInfo]:
        """
        Ranks BIS labs by geographical proximity and capability matching.
        """
        results = []

        norm_category = product_category.strip().lower() if product_category else None

        for lab in self.laboratories:
            # Check category matching
            if norm_category:
                matched = any(norm_category in c for c in lab["categories"])
                if not matched and not lab["is_central"]:
                    continue

            dist = self._haversine_distance(user_lat, user_lon, lab["lat"], lab["lon"])
            if dist <= max_radius_km:
                nav_url = f"https://www.google.com/maps/dir/?api=1&destination={lab['lat']},{lab['lon']}"
                results.append(
                    LabInfo(
                        lab_id=lab["lab_id"],
                        lab_name=lab["lab_name"],
                        zone=lab["zone"],
                        latitude=lab["lat"],
                        longitude=lab["lon"],
                        distance_km=dist,
                        address=lab["address"],
                        city=lab["city"],
                        state=lab["state"],
                        contact_person=lab["contact"],
                        phone=lab["phone"],
                        email=lab["email"],
                        accredited_categories=lab["categories"],
                        nabl_accreditation_number=lab["nabl"],
                        is_bis_central_lab=lab["is_central"],
                        navigation_url=nav_url
                    )
                )

        results.sort(key=lambda x: x.distance_km)
        return results[:limit]


lab_router = BISLabDirectory()
