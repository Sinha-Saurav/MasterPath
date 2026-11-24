
"""FastAPI inference endpoint using paper-oriented neural feature extraction and XGBoost."""
import os,json,torch
from fastapi import FastAPI,HTTPException
from pydantic import BaseModel,Field
from xgboost import XGBClassifier
from .model import DKVMNKAPS
ARTIFACT_DIR=os.getenv("ARTIFACT_DIR","outputs")
DEVICE="cuda" if torch.cuda.is_available() else "cpu"
app=FastAPI(title="DKVMN-KAPS ASSIST2009",version="0.2.0")
model=None; booster=None; vocab=None
class Interaction(BaseModel):
    question_id:str
    skill_id:str="0"
    correct:int=Field(ge=0,le=1)
class PredictRequest(BaseModel):
    history:list[Interaction]
    target_question_id:str
    target_skill_id:str="0"
@app.on_event("startup")
def load_artifacts():
    global model,booster,vocab
    fold=os.getenv("MODEL_FOLD","1")
    paths=[os.path.join(ARTIFACT_DIR,f"dkvmn_kaps_fold{fold}.pt"),
           os.path.join(ARTIFACT_DIR,f"xgb_fold{fold}.json"),
           os.path.join(ARTIFACT_DIR,"vocab.json")]
    if not all(os.path.exists(x) for x in paths): return
    ck=torch.load(paths[0],map_location=DEVICE,weights_only=False)
    model=DKVMNKAPS(ck["n_questions"],ck["n_skills"],ck["memory_size"],ck["key_dim"],ck["value_dim"],ck["question_dim"],ck["dropout"],ck.get("variant","DKVMN-KAPS")).to(DEVICE)
    model.load_state_dict(ck["state_dict"]); model.eval()
    booster=XGBClassifier(); booster.load_model(paths[1])
    with open(paths[2],encoding="utf-8") as f:vocab=json.load(f)
@app.get("/health")
def health():
    return {"status":"ready" if model is not None else "not_ready","model":"DKVMN-KAPS","dataset":"ASSIST2009 Skill Builder"}
@app.post("/predict")
def predict(req:PredictRequest):
    if model is None or booster is None or vocab is None: raise HTTPException(503,"Artifacts not loaded. Train first.")
    try:
        qmap=vocab["questions"]
        q=[qmap[str(x.question_id)] for x in req.history]+[qmap[str(req.target_question_id)]]
        r=[x.correct for x in req.history]+[0] # dummy current target label; feature extraction shifts prior response
    except KeyError as e: raise HTTPException(422,f"Unknown question ID: {e}")
    qt=torch.tensor([q],dtype=torch.long,device=DEVICE); rt=torch.tensor([r],dtype=torch.float32,device=DEVICE)
    with torch.no_grad():
        aux,f,latent,ab,lam,d=model(qt,rt)
        feature=torch.cat([f,ab,d],dim=-1)[:,-1,:].cpu().numpy()
    probability=float(booster.predict_proba(feature)[0,1])
    return {"p_correct":probability,"model":"DKVMN-KAPS","estimated_mastery":None,
            "note":"Probability estimate only; mastery aggregation should be done by MasterPath backend."}
