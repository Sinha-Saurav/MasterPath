from fastapi import APIRouter, HTTPException, Query
from app.services.youtube_service import YouTubeAPIError, get_educational_videos

router = APIRouter()

@router.get("")
async def search_youtube_videos(
    course: str = Query(..., min_length=1, max_length=100),
    topic: str = Query(..., min_length=1, max_length=150),
):
    course, topic = course.strip(), topic.strip()
    if not course or not topic:
        raise HTTPException(status_code=400, detail="course and topic must not be blank.")
    try:
        videos = await get_educational_videos(course, topic)
        return {"course": course, "topic": topic, "videos": videos}
    except YouTubeAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.public_message) from exc
