# MasterPath: API Contract

Two parts:

- **Part A**: REST API between the website (frontend) and the Express backend. Owner: website/backend.
- **Part B**: Internal services the backend calls. **These are what the RAG and ML teammates implement.** The backend ships with mock versions of all of them, so teammates only need to match the request/response shapes below.

All IDs: `student_id` is a UUID, `topic_id` / `course_id` are integers, `question_id` is an integer, `document_id` is a UUID. Mastery is a number from 0 to 1. Difficulty is an integer from 1 (easy) to 5 (hard).

---

## Part A: Frontend <-> Backend (Express)

Base path `/api`. Every request except health carries `Authorization: Bearer <supabase_jwt>`. Errors: `{ "error": { "code": "string", "message": "string" } }`.

### Profile and syllabus
| Method | Path | Returns |
|---|---|---|
| GET | `/api/me` | `{ id, full_name, role, branch, semester }` |
| GET | `/api/courses` | `[{ id, code, name }]` |
| GET | `/api/courses/:id/topics` | `[{ id, parent_id, unit, name, position }]` |
| POST | `/api/courses/:id/enroll` | `{ course_id }` (student joins a course; "my courses" = enrollments) |
| PATCH | `/api/me` | body `{ full_name?, branch?, semester?, preferences? }` returns updated profile |

### Tutor chat
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/chat` | `{ session_id?, course_id, message, image_url? }` | Server-Sent Events stream: `token` events with text, then one `done` event: `{ session_id, message_id, topic_id, sources: [{chunk_id, document_title, page}] }` |
| GET | `/api/chat/sessions` | | `[{ id, title, created_at }]` |
| GET | `/api/chat/sessions/:id` | | `[{ id, role, content, image_url, sources, created_at }]` |
| POST | `/api/uploads/image` | multipart `file` | `{ image_url }` |

### Quizzes and practice
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/quizzes` | `{ course_id, topic_id?, num_questions }` (no topic = pick weak topics) | `{ quiz_id, questions: [{ id, topic_id, type, difficulty, prompt, options }] }` (**never includes answers**) |
| POST | `/api/quizzes/:id/answers` | `{ question_id, answer, time_taken_sec, hints_used }` | `{ is_correct, score, feedback, explanation, mastery_after: { topic_id, score } }` |
| POST | `/api/quizzes/:id/finish` | | `{ total, correct, percent, by_topic: [{topic_id, correct, total}] }` |
| GET | `/api/questions/next?topic_id=` | | one adaptive question (same shape as above) |
| POST | `/api/questions/:id/hint` | | `{ hint }` |

### Student profile and analytics
| Method | Path | Returns |
|---|---|---|
| GET | `/api/profile/mastery?course_id=` | `{ topics: [{ topic_id, name, score, attempts_count }], weak: [topic_id], strong: [topic_id] }` |
| GET | `/api/profile/history?course_id=&limit=` | `[{ date, topic_id, is_correct, difficulty }]` |
| GET | `/api/profile/progress?course_id=` | `[{ date, avg_mastery }]` |

### Learning plan
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/plans/generate` | `{ course_id }` | `{ plan_id, summary, items: [{ id, topic_id, title, action, position, status }] }` |
| GET | `/api/plans/current?course_id=` | | same shape, or `null` |
| PATCH | `/api/plans/items/:id` | `{ status }` | updated item |

### Admin (role = admin)
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/admin/documents` | multipart `file`, `course_id`, `title` | `{ document_id, status: "processing" }` (backend then calls `/rag/ingest`) |
| GET | `/api/admin/documents` | | `[{ id, title, status, created_at }]` |
| POST | `/api/admin/topics` | `{ course_id, parent_id?, unit?, name }` | created topic |

---

## Part B: Services the teammates implement

Plain HTTP + JSON. The backend reads their base URL from `RAG_SERVICE_URL` and `ML_SERVICE_URL`. Until those are set, the backend uses built-in mocks (simple keyword search, moving-average mastery).

Both services read/write the same Supabase Postgres database (schema in `schema.sql`) unless noted.

### B1. RAG service (RAG teammate)

**`POST /rag/ingest`**: process an uploaded document.
```json
// request
{ "document_id": "uuid", "course_id": 1, "file_url": "https://signed-url-to-pdf" }
// response (can return immediately and process in the background)
{ "document_id": "uuid", "status": "processing" }
```
When done, it must:
1. Insert rows into `chunks` (`document_id`, `content`, `page`, `embedding`).
2. **Set `chunks.topic_id`** by matching each chunk to a syllabus topic from the `topics` table. This is what links study material to the student profile.
3. Set `documents.status` to `ready` (or `failed` with `documents.error`).

**`POST /rag/query`**: retrieve context for a student's question.
```json
// request
{ "question": "Explain normalization in DBMS", "course_id": 1, "top_k": 5 }
// response
{
  "chunks": [
    { "chunk_id": 101, "content": "text...", "topic_id": 12,
      "document_title": "DBMS Unit 3 Notes", "page": 14, "score": 0.83 }
  ],
  "detected_topic_id": 12,
  "estimated_difficulty": 3
}
```
- The backend builds the LLM prompt from `chunks`, so the RAG service does not need to generate answers.
- `detected_topic_id` is the single best-matching syllabus topic for the question (this is the "Question Analyzer" box in the diagram). Use `null` if nothing matches.
- If no chunk scores above a sensible threshold, return `chunks: []` so the tutor can say it didn't find it in the notes.

### B2. ML service (ML teammate)

**`POST /ml/mastery/update`**: called after every answered question.
```json
// request
{
  "student_id": "uuid", "topic_id": 12, "question_id": 345,
  "is_correct": true, "score": 1.0, "difficulty": 3,
  "time_taken_sec": 42, "hints_used": 0
}
// response
{ "topic_id": 12, "mastery": 0.64 }
```
It should also upsert the `mastery` table (`score`, `attempts_count`, `correct_count`, `updated_at`).

**`GET /ml/mastery/{student_id}?course_id=1`**
```json
{ "mastery": [ { "topic_id": 12, "score": 0.64 }, { "topic_id": 13, "score": 0.31 } ] }
```

**`POST /ml/next-difficulty`**: used by adaptive question selection.
```json
// request
{ "student_id": "uuid", "topic_id": 12 }
// response
{ "difficulty": 3, "reason": "mastery 0.64, last 3 answers correct" }
```

**`POST /ml/recommend`**: used by the learning plan.
```json
// request
{ "student_id": "uuid", "course_id": 1, "n": 5 }
// response
{
  "weak_topics":   [ { "topic_id": 13, "mastery": 0.31 } ],
  "strong_topics": [ { "topic_id": 12, "mastery": 0.82 } ],
  "suggested_order": [13, 14, 12]
}
```

### What the ML teammate trains on
The `attempts` table: `student_id, question_id, topic_id, difficulty, is_correct, score, time_taken_sec, hints_used, created_at`. The backend includes a seed script that generates fake students and attempts so models can be tried before real usage exists.

### Fallback rule
Every call to B1/B2 has a timeout (5s). On failure the backend uses its mock for that call, so the website never breaks because a teammate's service is down.

---

## Open decisions (to confirm with teammates)
1. Embedding model and vector size (`schema.sql` uses 768).
2. Whether RAG and ML are one FastAPI app or two.
3. Who tags topics on chunks (RAG) and who tags difficulty on generated questions (backend LLM call by default).
