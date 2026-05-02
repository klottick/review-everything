from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import httpx
import os
import re
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY", "")

class PlaceSearchResult(BaseModel):
    place_id: str
    name: str
    address: Optional[str] = None
    rating: Optional[str] = None
    reference: str
    url: Optional[str] = None

class PlaceSearchResponse(BaseModel):
    results: List[PlaceSearchResult]
    status: str

def extract_place_id_from_url(url: str) -> Optional[str]:
    """Extract place ID from Google Maps URL"""
    patterns = [
        r'/place/([^/]+)',  # /place/Place+Name/...
        r'place_id=([^&]+)',  # ?place_id=...
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

@router.get("/search")
async def search_places(query: str, location: str = ""):
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API key not configured")
    
    url = "https://places.googleapis.com/v1/places:searchText"
    headers = {
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "Content-Type": "application/json"
    }
    
    body = {
        "textQuery": query,
        "pageSize": 10
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=body, timeout=10.0)
        
        if response.status_code != 200:
            return {"results": [], "status": "error", "error": response.text}
        
        data = response.json()
        
        results = []
        for place in data.get("places", []):
            results.append(PlaceSearchResult(
                place_id=place.get("id", ""),
                name=place.get("displayName", {}).get("text", ""),
                address=place.get("formattedAddress", ""),
                rating=str(place.get("rating", "")) if place.get("rating") else None,
                reference=place.get("reference", ""),
                url=place.get("googleMapsUri", "")
            ))
        
        return PlaceSearchResponse(results=results, status=data.get("status", "OK"))

@router.get("/place/{place_id}")
async def get_place_details(place_id: str):
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API key not configured")
    
    url = f"https://places.googleapis.com/v1/places/{place_id}?fields=id,displayName,formattedAddress,rating,googleMapsUri"
    headers = {
        "X-Goog-Api-Key": GOOGLE_API_KEY
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, timeout=10.0)
        
        if response.status_code != 200:
            return {"error": response.text}
        
        place = response.json()
        
        return {
            "place_id": place.get("id", ""),
            "name": place.get("displayName", {}).get("text", ""),
            "address": place.get("formattedAddress", ""),
            "rating": str(place.get("rating", "")) if place.get("rating") else None,
            "url": place.get("googleMapsUri", "")
        }

@router.post("/from-url")
async def get_place_from_url(data: dict):
    """Get place details from a Google Maps URL"""
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API key not configured")
    
    url = data.get("url", "")
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
    
    place_id = extract_place_id_from_url(url)
    
    if not place_id:
        try:
            search_result = await search_places(url)
            if search_result["results"]:
                return search_result["results"][0]
        except:
            pass
        raise HTTPException(status_code=400, detail="Could not find place from URL")
    
    return await get_place_details(place_id)

# Cache for geocoding to reduce API calls
_geocode_cache: dict[str, tuple[float, float] | None] = {}

@router.get("/geocode")
async def geocode_address(address: str):
    """Geocode an address and cache the result"""
    global _geocode_cache
    
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API key not configured")
    
    # Check cache first
    cache_key = address.lower().strip()
    if cache_key in _geocode_cache:
        cached = _geocode_cache[cache_key]
        if cached:
            return {"lat": cached[0], "lng": cached[1]}
        return {"lat": None, "lng": None}
    
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {"address": address, "key": GOOGLE_API_KEY}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=10.0)
        
        if response.status_code != 200:
            _geocode_cache[cache_key] = None
            return {"lat": None, "lng": None}
        
        data = response.json()
        if data.get("status") == "OK" and data.get("results"):
            location = data["results"][0]["geometry"]["location"]
            lat, lng = location["lat"], location["lng"]
            _geocode_cache[cache_key] = (lat, lng)
            return {"lat": lat, "lng": lng}
        
        _geocode_cache[cache_key] = None
        return {"lat": None, "lng": None}