import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query
import httpx
from pydantic import BaseModel

UPSTREAM_V2_URL = "https://api.frankfurter.dev/v2/rates"

# Router setup
router = APIRouter(prefix="/api/v2", tags=["Currency Rates"])


# --- 1. Cache Manager ---
class CacheManager:
    """Fetches v2 array data and maintains an in-memory quote lookup."""

    def __init__(self, ttl_seconds: int = 1800):
        self.ttl_seconds = ttl_seconds
        self.last_updated: Optional[datetime] = None
        self.usd_rates: Dict[str, float] = {}
        self.latest_date: Optional[str] = None

    def is_expired(self) -> bool:
        if not self.last_updated:
            return True
        return datetime.utcnow() - self.last_updated > timedelta(
            seconds=self.ttl_seconds
        )

    async def refresh_if_needed(self):
        if self.is_expired():
            async with httpx.AsyncClient() as client:
                try:
                    response = await client.get(
                        f"{UPSTREAM_V2_URL}?base=USD", timeout=10.0
                    )
                    response.raise_for_status()
                    data: List[dict] = response.json()

                    rates = {item["quote"]: item["rate"] for item in data}
                    rates["USD"] = 1.0  # Base self-value

                    self.usd_rates = rates
                    self.latest_date = (
                        data[0]["date"] if data else datetime.utcnow().strftime("%Y-%m-%d")
                    )
                    self.last_updated = datetime.utcnow()
                    print(f"[{datetime.utcnow()}] Rates successfully refreshed.")
                except Exception as err:
                    if not self.usd_rates:
                        raise HTTPException(
                            status_code=503,
                            detail=f"Unable to fetch currency data: {str(err)}",
                        )


# Global cache instance
cache = CacheManager(ttl_seconds=1800)


# --- 2. Background Task Function ---
async def periodic_refresh():
    """Background worker that runs continuously in the event loop."""
    while True:
        try:
            await cache.refresh_if_needed()
        except Exception as e:
            print(f"Error during background rate update: {e}")
        await asyncio.sleep(1800)


# --- 3. Response Models ---
class V2RatesResponse(BaseModel):
    date: str
    base: str
    rates: Dict[str, float]


class V2ConvertResponse(BaseModel):
    date: str
    from_currency: str
    to_currency: str
    amount: float
    converted_amount: float
    rate: float


# --- 4. Endpoints ---
@router.get("/rates", response_model=V2RatesResponse)
async def get_rates_v2(base: str = Query("USD", min_length=3, max_length=3)):
    """Get all rates re-based dynamically using v2 cached data."""
    base = base.upper()

    if not cache.usd_rates:
        await cache.refresh_if_needed()

    if base not in cache.usd_rates:
        raise HTTPException(
            status_code=400, detail=f"Unsupported base currency '{base}'"
        )

    base_usd_rate = cache.usd_rates[base]

    calculated_rates = {
        quote: round(rate / base_usd_rate, 6)
        for quote, rate in cache.usd_rates.items()
    }

    return V2RatesResponse(
        date=cache.latest_date or "", base=base, rates=calculated_rates
    )


@router.get("/convert", response_model=V2ConvertResponse)
async def convert_v2(
    from_curr: str = Query(..., alias="from", min_length=3, max_length=3),
    to_curr: str = Query(..., alias="to", min_length=3, max_length=3),
    amount: float = Query(..., gt=0),
):
    """Convert an amount between two currencies directly from cache."""
    from_curr = from_curr.upper()
    to_curr = to_curr.upper()

    if not cache.usd_rates:
        await cache.refresh_if_needed()

    if from_curr not in cache.usd_rates:
        raise HTTPException(
            status_code=400, detail=f"Unsupported currency '{from_curr}'"
        )
    if to_curr not in cache.usd_rates:
        raise HTTPException(
            status_code=400, detail=f"Unsupported currency '{to_curr}'"
        )

    rate = cache.usd_rates[to_curr] / cache.usd_rates[from_curr]
    converted_amount = round(amount * rate, 4)

    return V2ConvertResponse(
        date=cache.latest_date or "",
        from_currency=from_curr,
        to_currency=to_curr,
        amount=amount,
        converted_amount=converted_amount,
        rate=round(rate, 6),
    )