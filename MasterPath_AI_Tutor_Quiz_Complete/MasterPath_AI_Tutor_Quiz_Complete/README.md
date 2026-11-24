# MasterPath AI Tutor & Quiz Engine — extended RAG service

Includes PDF ingestion, authenticated grounded tutor query, full-text retrieval-only endpoint, adaptive exactly-10-MCQ quiz generation with schema validation and one retry, and Gemini-first/Grok-second LLM fallback.

## Important limitation of supplied source
The files supplied in the original ZIP contain only the separate FastAPI RAG service. They do not include the MasterPath Express backend, main Supabase schema, student authentication/enrollment middleware, or existing quiz lifecycle APIs. Accordingly, this package can ingest/retrieve/tutor/generate quizzes, but cannot truthfully implement save/resume/finish/results and mastery updates against an absent backend. The generated quiz is returned as JSON and is not persisted to the main Supabase project.

## Windows
1. Extract and open this folder in VS Code.
2. `python -m venv venv`
3. `venv\Scripts\activate`
4. `pip install -r requirements.txt`
5. Copy `.env.example` to `.env`; fill RAG Supabase URL/secret, Gemini key, a NEW random RAG_API_KEY, and Grok key if fallback is required.
6. `uvicorn main:app --reload`
7. Swagger: http://127.0.0.1:8000/docs

## Endpoints (Bearer RAG_API_KEY)
- GET `/health`
- POST `/api/rag/v1/documents/ingest`
- POST `/api/rag/v1/query` (student_id may be null for global-only retrieval)
- POST `/api/rag/v1/retrieve` (full chunks + metadata)
- POST `/api/quiz/v1/generate` (course_id, optional student_id, topic, mastery 0..1)

RAG Supabase must already have `documents`, `document_chunks`, and `match_document_chunks` RPC with 3072-dimensional embeddings. Existing data/schema is not migrated. The main backend must authenticate students, verify enrollment, pass canonical IDs/mastery, persist quiz via its lifecycle APIs, and update mastery on finish. Use real UUIDs, not placeholder IDs.

Security: never share `.env`; rotate any API keys visible in screenshots. Keys must remain server-side.
