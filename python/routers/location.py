from fastapi import APIRouter, Request

router = APIRouter(prefix="/api/v1", tags=["Location"])

@router.get("/user-location")
async def get_user_location(request: Request):
    """
    Extracts the user's location directly from CDN Edge headers.
    Takes 0ms on the backend because the lookup happened at the CDN edge.
    """
    # 1. Check popular CDN location headers
    # - Cloudflare: 'cf-ipcountry'
    # - AWS CloudFront: 'cloudfront-viewer-country'
    # - Fastly / Akamai / Generic: 'x-country-code'
    country_code = (
        request.headers.get("cf-ipcountry")
        or request.headers.get("cloudfront-viewer-country")
        or request.headers.get("x-country-code")
    )

    # 2. Extract Client IP address (handles proxies and CDN headers)
    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        client_ip = x_forwarded_for.split(",")[0].strip()
    else:
        client_ip = request.client.host

    # 3. Fallback for Local Development (Since local requests don't pass through a CDN)
    if not country_code or country_code == "XX":
        if client_ip in ["127.0.0.1", "localhost", "::1"]:
            country_code = "US"  # Mock country code for local frontend testing
        else:
            country_code = "UNKNOWN"

    return {
        "status": "success",
        "data": {
            "ip": client_ip,
            "country_code": country_code.upper()  # e.g., 'GH', 'US', 'GB'
        }
    }