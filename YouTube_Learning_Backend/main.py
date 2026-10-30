from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.youtube import router as youtube_router

app = FastAPI(title="YouTube Learning API", version="1.0.0",
              description="Backend-only educational YouTube video search API.")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False,
                   allow_methods=["GET"], allow_headers=["*"])
app.include_router(youtube_router, prefix="/api/resources/youtube", tags=["YouTube Resources"])

@app.get("/")
async def root():
    return {"message": "YouTube Learning API is running", "docs": "/docs"}
