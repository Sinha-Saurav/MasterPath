import os,secrets,tempfile
from pathlib import Path
from uuid import UUID
from dotenv import load_dotenv
from fastapi import FastAPI,Depends,HTTPException,File,Form,UploadFile
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from pydantic import BaseModel,Field
from services.retrieval_service import retrieve_chunks
from services.generation_service import generate_answer,generate_quiz
from services.ingestion_service import ingest_pdf
load_dotenv()
app=FastAPI(title="MasterPath AI Tutor & Quiz RAG API",version="2.0.0")
bearer=HTTPBearer(auto_error=False)
def auth(credentials:HTTPAuthorizationCredentials=Depends(bearer)):
    key=os.getenv("RAG_API_KEY")
    if not key: raise HTTPException(500,"RAG_API_KEY is not configured")
    if not credentials or not secrets.compare_digest(credentials.credentials,key): raise HTTPException(401,"Not authenticated")
class QueryRequest(BaseModel):
    student_id:str|None=None
    course_id:str
    question:str=Field(min_length=1,max_length=4000)
    top_k:int=Field(default=5,ge=1,le=10)
    document_id:str|None=None
class QuizRequest(BaseModel):
    student_id:str|None=None
    course_id:str
    topic:str=Field(min_length=1,max_length=300)
    mastery:float=Field(default=0.5,ge=0,le=1)
    top_k:int=Field(default=10,ge=1,le=20)
def uid(v,n,optional=False):
    if v is None and optional:return None
    try:return str(UUID(v))
    except Exception:raise HTTPException(400,n+" must be a valid UUID")
def sources(chunks):
    return [{"document_id":c.get("document_id"),"title":c.get("title"),"page_number":c.get("page_number"),"chunk_id":c.get("chunk_id"),"content":c.get("content","")[:1200]} for c in chunks]
def fetch(req):
    return retrieve_chunks(question=req.question,course_id=uid(req.course_id,"course_id"),student_id=uid(req.student_id,"student_id",True),document_id=uid(req.document_id,"document_id",True),top_k=req.top_k)
@app.get("/health")
def health():return {"status":"ok"}
@app.post("/api/rag/v1/documents/ingest",dependencies=[Depends(auth)])
def ingest(course_id:str=Form(...),scope:str=Form(...),owner_user_id:str|None=Form(None),file:UploadFile=File(...)):
    course_id=uid(course_id,"course_id")
    if scope not in ("global","student"):raise HTTPException(400,"scope must be global or student")
    if scope=="global" and owner_user_id:raise HTTPException(400,"Global docs cannot have owner_user_id")
    if scope=="student":owner_user_id=uid(owner_user_id,"owner_user_id")
    if not file.filename or not file.filename.lower().endswith(".pdf"):raise HTTPException(400,"Only PDF files accepted")
    try:
        with tempfile.TemporaryDirectory() as td:
            path=Path(td)/Path(file.filename).name;path.write_bytes(file.file.read())
            return ingest_pdf(str(path),course_id,scope,owner_user_id)
    except ValueError as e:raise HTTPException(400,str(e))
    except Exception as e:raise HTTPException(500,"Ingestion failed") from e
    finally:file.file.close()
@app.post("/api/rag/v1/retrieve",dependencies=[Depends(auth)])
def retrieve(req:QueryRequest):
    try:
        c=fetch(req);return {"chunks":c,"sources":sources(c),"count":len(c),"retrieval":{"used_global_documents":any(x.get("scope")=="global" for x in c),"used_student_documents":any(x.get("scope")=="student" for x in c)}}
    except Exception as e:raise HTTPException(502,"Retrieval failed") from e
@app.post("/api/rag/v1/query",dependencies=[Depends(auth)])
def query(req:QueryRequest):
    try:
        c=fetch(req);a=generate_answer(req.question,c) if c else "Uploaded material mein relevant evidence nahi mila. Is answer ko document-grounded nahi maana ja sakta."
        return {"answer":a,"sources":sources(c),"retrieval":{"used_global_documents":any(x.get("scope")=="global" for x in c),"used_student_documents":any(x.get("scope")=="student" for x in c)}}
    except Exception as e:raise HTTPException(502,"RAG query/provider failed") from e
@app.post("/api/quiz/v1/generate",dependencies=[Depends(auth)])
def quiz(req:QuizRequest):
    try:
        course=uid(req.course_id,"course_id");student=uid(req.student_id,"student_id",True)
        chunks=retrieve_chunks(question=req.topic,course_id=course,student_id=student,top_k=req.top_k)
        result=generate_quiz(req.course_id,req.topic,req.mastery,chunks);result["sources"]=sources(chunks);return result
    except Exception as e:raise HTTPException(502,"Quiz generation failed") from e
