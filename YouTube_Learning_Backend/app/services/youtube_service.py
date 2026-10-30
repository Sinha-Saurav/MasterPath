import logging, os, time
from typing import Any
import httpx
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)
API_BASE = "https://www.googleapis.com/youtube/v3"
CACHE_TTL = int(os.getenv("YOUTUBE_CACHE_TTL_SECONDS", "600"))
_CACHE: dict[str, tuple[float, list[dict[str, Any]]]] = {}

class YouTubeAPIError(Exception):
    def __init__(self, public_message: str, status_code: int = 502):
        super().__init__(public_message)
        self.public_message, self.status_code = public_message, status_code

def _key(course: str, topic: str) -> str:
    return f"{course.casefold().strip()}::{topic.casefold().strip()}"

async def _get(client: httpx.AsyncClient, endpoint: str, params: dict[str, Any]) -> dict[str, Any]:
    api_key = os.getenv("YOUTUBE_API_KEY", "").strip()
    if not api_key:
        raise YouTubeAPIError("Add YOUTUBE_API_KEY to the backend .env file.", 500)
    try:
        response = await client.get(f"{API_BASE}/{endpoint}", params={**params, "key": api_key})
    except httpx.RequestError as exc:
        logger.warning("YouTube connection failed: %s", type(exc).__name__)
        raise YouTubeAPIError("Could not connect to YouTube. Try again later.", 502) from exc
    try:
        payload = response.json()
    except ValueError:
        payload = {}
    if response.is_error:
        # Never log the request URL because it contains the API key.
        logger.warning("YouTube API returned HTTP %s: %s", response.status_code,
                       payload.get("error", {}).get("message", "No details"))
        raise YouTubeAPIError("YouTube API request failed. Check API key, API enablement and quota.", 502)
    return payload

async def get_educational_videos(course: str, topic: str) -> list[dict[str, Any]]:
    cache_key = _key(course, topic)
    now = time.monotonic()
    cached = _CACHE.get(cache_key)
    if cached and cached[0] > now:
        return cached[1]
    _CACHE.pop(cache_key, None)

    async with httpx.AsyncClient(timeout=15.0) as client:
        search = await _get(client, "search", {
            "part": "snippet", "type": "video", "maxResults": 5,
            "videoEmbeddable": "true",
            "q": f"{course} {topic} tutorial lecture explained educational",
            "safeSearch": "moderate",
        })
        videos = []
        for item in search.get("items", []):
            vid = (item.get("id") or {}).get("videoId")
            snippet = item.get("snippet") or {}
            if not vid:
                continue
            thumbs = snippet.get("thumbnails") or {}
            thumb = ((thumbs.get("high") or {}).get("url")
                     or (thumbs.get("medium") or {}).get("url")
                     or (thumbs.get("default") or {}).get("url") or "")
            videos.append({
                "videoId": vid, "title": snippet.get("title", ""),
                "channelTitle": snippet.get("channelTitle", ""),
                "thumbnailUrl": thumb, "description": snippet.get("description", ""),
                "embedUrl": f"https://www.youtube.com/embed/{vid}", "duration": None,
            })
        if videos:
            details = await _get(client, "videos", {
                "part": "contentDetails", "id": ",".join(v["videoId"] for v in videos)
            })
            duration_map = {
                item.get("id"): (item.get("contentDetails") or {}).get("duration")
                for item in details.get("items", [])
            }
            for video in videos:
                video["duration"] = duration_map.get(video["videoId"])
    _CACHE[cache_key] = (time.monotonic() + CACHE_TTL, videos)
    return videos
