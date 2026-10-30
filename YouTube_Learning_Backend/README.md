# YouTube Learning Backend — Python + FastAPI

Backend only; no frontend included.

## Windows / VS Code setup
1. Install Python 3.11+ from https://www.python.org/downloads/ and tick **Add Python to PATH**.
2. Open this folder in VS Code; open Terminal → New Terminal.
3. Create environment: `py -m venv .venv`
4. Activate in PowerShell: `.venv\\Scripts\\Activate.ps1`
   If blocked, use Command Prompt terminal: `.venv\\Scripts\\activate.bat`
5. Install: `python -m pip install --upgrade pip` then `pip install -r requirements.txt`
6. Copy `.env.example` to `.env`; put your real key in `YOUTUBE_API_KEY=...`
7. Run: `uvicorn main:app --reload`
8. Open Swagger: http://127.0.0.1:8000/docs

## API key
- Google Cloud Console: https://console.cloud.google.com/
- Enable YouTube Data API v3: https://console.cloud.google.com/apis/library/youtube.googleapis.com
- Create API key: https://console.cloud.google.com/apis/credentials
Restrict the key to YouTube Data API v3 where possible. Never commit `.env` or share the real key.

Official documentation: https://developers.google.com/youtube/v3/getting-started

## Endpoint examples
- `http://127.0.0.1:8000/api/resources/youtube?course=DBMS&topic=Normalization`
- `http://127.0.0.1:8000/api/resources/youtube?course=DBMS&topic=SQL%20Joins`
- `http://127.0.0.1:8000/api/resources/youtube?course=DSA&topic=Arrays`
- `http://127.0.0.1:8000/api/resources/youtube?course=DSA&topic=Two%20Pointer%20Technique`

Returns course, topic and up to five videos with videoId, title, channelTitle, thumbnailUrl, description, embedUrl and ISO-8601 duration.

## Notes
- Missing key returns HTTP 500; upstream/network errors return HTTP 502.
- Missing query parameters are validated by FastAPI (HTTP 422); blank values return HTTP 400.
- Results are cached in memory for 10 minutes by normalized course/topic. Restarting the server clears the cache.
- The original requirement specifies Express.js. This is a Python/FastAPI equivalent; the original project owner must adapt/mount it if their existing backend remains Express.
