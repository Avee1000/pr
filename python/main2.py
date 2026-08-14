# from datetime import datetime, timedelta
# from typing import Dict, List, Optional
# from fastapi import FastAPI, HTTPException, Query
# import httpx
# from pydantic import BaseModel

# app = FastAPI(
#     title="Custom Currency Exchange Rate API (v2)",
#     version="2.0.0",
#     description="High-performance currency rate API using Frankfurter v2 flat structure.",
# )

# # v2 endpoint returns a flat array: [{"date": "...", "base": "...", "quote": "...", "rate": ...}]
# UPSTREAM_V2_URL = "https://api.frankfurter.dev/v2/rates"


# class RateItem(BaseModel):
#     date: str
#     base: str
#     quote: str
#     rate: float


# class CacheManager:
#     """Fetches v2 array data and maintains an in-memory quote lookup."""

#     def __init__(self, ttl_seconds: int = 1800):
#         self.ttl_seconds = ttl_seconds
#         self.last_updated: Optional[datetime] = None
#         self.usd_rates: Dict[str, float] = {}  # Quote -> Rate map relative to USD
#         self.latest_date: Optional[str] = None

#     def is_expired(self) -> bool:
#         if not self.last_updated:
#             return True
#         return datetime.utcnow() - self.last_updated > timedelta(
#             seconds=self.ttl_seconds
#         )

#     async def refresh_if_needed(self):
#         if self.is_expired():
#             async with httpx.AsyncClient() as client:
#                 try:
#                     response = await client.get(
#                         f"{UPSTREAM_V2_URL}?base=USD", timeout=10.0
#                     )
#                     response.raise_for_status()
#                     data: List[dict] = response.json()

#                     # Transform the v2 array into a quick lookup table
#                     # [{"date": "...", "base": "USD", "quote": "AED", "rate": 3.67}, ...]
#                     rates = {item["quote"]: item["rate"] for item in data}
#                     rates["USD"] = 1.0  # Base self-value

#                     self.usd_rates = rates
#                     self.latest_date = (
#                         data[0]["date"] if data else datetime.utcnow().strftime("%Y-%m-%d")
#                     )
#                     self.last_updated = datetime.utcnow()
#                 except Exception as err:
#                     if not self.usd_rates:
#                         raise HTTPException(
#                             status_code=503,
#                             detail=f"Unable to fetch currency data: {str(err)}",
#                         )


# cache = CacheManager(ttl_seconds=1800)


# # --- Response Models ---
# class V2RatesResponse(BaseModel):
#     date: str
#     base: str
#     rates: Dict[str, float]


# class V2ConvertResponse(BaseModel):
#     date: str
#     from_currency: str
#     to_currency: str
#     amount: float
#     converted_amount: float
#     rate: float


# # --- Endpoints ---


# @app.get("/")
# async def root():
#     return {
#         "status": "online",
#         "docs": "/docs",
#         "endpoints": ["/api/v2/rates", "/api/v2/convert"],
#     }


# @app.get("/api/v2/rates", response_model=V2RatesResponse)
# async def get_rates_v2(base: str = Query("USD", min_length=3, max_length=3)):
#     """Get all rates re-based dynamically using v2 data."""
#     base = base.upper()
#     await cache.refresh_if_needed()

#     if base not in cache.usd_rates:
#         raise HTTPException(
#             status_code=400, detail=f"Unsupported base currency '{base}'"
#         )

#     base_usd_rate = cache.usd_rates[base]

#     # Re-base calculated cross-rates
#     calculated_rates = {
#         quote: round(rate / base_usd_rate, 6)
#         for quote, rate in cache.usd_rates.items()
#     }

#     return V2RatesResponse(
#         date=cache.latest_date or "", base=base, rates=calculated_rates
#     )


# @app.get("/api/v2/convert", response_model=V2ConvertResponse)
# async def convert_v2(
#     from_curr: str = Query(..., alias="from", min_length=3, max_length=3),
#     to_curr: str = Query(..., alias="to", min_length=3, max_length=3),
#     amount: float = Query(..., gt=0),
# ):
#     """Convert an amount between two currencies."""
#     from_curr = from_curr.upper()
#     to_curr = to_curr.upper()

#     await cache.refresh_if_needed()

#     if from_curr not in cache.usd_rates:
#         raise HTTPException(
#             status_code=400, detail=f"Unsupported currency '{from_curr}'"
#         )
#     if to_curr not in cache.usd_rates:
#         raise HTTPException(
#             status_code=400, detail=f"Unsupported currency '{to_curr}'"
#         )

#     rate = cache.usd_rates[to_curr] / cache.usd_rates[from_curr]
#     converted_amount = round(amount * rate, 4)

#     return V2ConvertResponse(
#         date=cache.latest_date or "",
#         from_currency=from_curr,
#         to_currency=to_curr,
#         amount=amount,
#         converted_amount=converted_amount,
#         rate=round(rate, 6),
#     )

from flask import Flask, request

app = Flask(__name__)

@app.route('/')
def get_ip():
    # Check if the app is behind a proxy (like Cloudflare, Heroku, Nginx)
    if request.headers.getlist("X-Forwarded-For"):
        user_ip = request.headers.getlist("X-Forwarded-For")[0]
    else:
        user_ip = request.remote_addr
        
    return f"Your IP address is: {user_ip}"

if __name__ == '__main__':
    app.run(debug=True)

# import requests

# def get_device_location():
#     try:
#         # Step 1: Get the public IP address of the user's device
#         ip_response = requests.get('https://api.ipify.org?format=json')
#         ip_response.raise_for_status()
#         public_ip = ip_response.json()['ip']
#         print(f"Device Public IP: {public_ip}")
        
#         # Step 2: Query the geolocation API with the public IP
#         geo_url = f"https://ipapi.co/{public_ip}/json/"
#         # Added a custom User-Agent header to prevent potential request blocking
#         headers = {'User-Agent': 'Mozilla/5.0'} 
        
#         geo_response = requests.get(geo_url, headers=headers)
#         geo_response.raise_for_status()
#         location_data = geo_response.json()
        
#         # Step 3: Extract and display the relevant location fields
#         print("\n--- Location Details ---")
#         print(f"City: {location_data.get('city')}")
#         print(f"Region/State: {location_data.get('region')}")
#         print(f"Country: {location_data.get('country_name')}")
#         print(f"Latitude: {location_data.get('latitude')}")
#         print(f"Longitude: {location_data.get('longitude')}")
#         print(f"Timezone: {location_data.get('timezone')}")
        
#     except requests.exceptions.RequestException as e:
#         print(f"Error retrieving location: {e}")

# if __name__ == "__main__":
#     get_device_location()