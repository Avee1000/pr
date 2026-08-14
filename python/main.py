import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import router modules from the /routers folder
from routers import location, rates


# --- Application Lifespan (Startup & Shutdown) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # STARTUP: Start the periodic rate-caching task from routers/rate.py
    rate_task = asyncio.create_task(rates.periodic_refresh())
    yield
    # SHUTDOWN: Cancel background tasks gracefully
    rate_task.cancel()


# --- Main FastAPI Application ---
app = FastAPI(
    title="Custom Currency Exchange & Geolocation API",
    version="2.0.0",
    description="High-performance API handling location detection and currency exchange rates.",
    lifespan=lifespan,
)

# --- CORS Settings ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include Routers ---
app.include_router(location.router)  # Registers /api/v1/user-location
app.include_router(rates.router)      # Registers /api/v2/rates & /api/v2/convert


# --- Root / Healthcheck Route ---
@app.get("/")
async def root():
    return {
        "status": "online",
        "docs": "/docs",
        "endpoints": [
            "/api/v1/user-location",
            "/api/v2/rates",
            "/api/v2/convert",
        ],
    }