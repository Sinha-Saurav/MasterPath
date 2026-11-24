
import argparse, os, json, random
import numpy as np, pandas as pd, torch
from sklearn.metrics import roc_auc_score, accuracy_score, precision_score, recall_score, f1_score, log_loss, brier_score_loss
from xgboost import XGBClassifier
from .data import load_assist, student_folds, train_val_split, make_windows
from .model import DKVMNKAPS

def seed_all(seed):
    random.seed(seed); np.random.seed(seed); torch.manual_seed(seed)
    if torch.cuda.is_available(): torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic=True; torch.backends.cudnn.benchmark=False

def pack(batch,device):
    L=max(len(x[0]) for x in batch)
    q=np.zeros((len(batch),L),np.int64); r=np.zeros((len(batch),L),np.float32); mask=np.zeros((len(batch),L),bool)
    for j,(qj,sj,rj) in enumerate(batch):
        q[j,:len(qj)]=qj; r[j,:len(rj)]=rj; mask[j,:len(qj)]=True
    return torch.tensor(q,device=device),torch.tensor(r,device=device),torch.tensor(mask,device=device)

def metrics(y,p):
    p=np.clip(p,1e-7,1-1e-7); yh=(p>=.5).astype(int)
    return {"auc":float(roc_auc_score(y,p)) if len(np.unique(y))>1 else float("nan"),
            "accuracy":float(accuracy_score(y,yh)),
            "precision":float(precision_score(y,yh,zero_division=0)),
            "recall":float(recall_score(y,yh,zero_division=0)),
            "f1":float(f1_score(y,yh,zero_division=0)),
            "log_loss":float(log_loss(y,p,labels=[0,1])),
            "brier":float(brier_score_loss(y,p))}

def collect(model,windows,device,batch_size=32):
    features=[]; targets=[]
    model.eval()
    with torch.no_grad():
        for i in range(0,len(windows),batch_size):
            q,r,mask=pack(windows[i:i+batch_size],device)
            aux,f,latent,ab,lam,d=model(q,r)
            valid=mask.clone(); valid[:,0]=False
            # Published XGBoost inputs: knowledge state f_t, AE reconstruction
            # problem-solving ability ab_t, and question feature d_t.
            feat=(torch.cat([f,ab,d],dim=-1) if model.use_ps else torch.cat([f,d],dim=-1))[valid]
            features.append(feat.cpu().numpy()); targets.append(r[valid].cpu().numpy())
    return np.concatenate(features),np.concatenate(targets)

def fit_neural(model,train_windows,val_windows,device,epochs=100,patience=10,batch_size=64):
    optimizer=torch.optim.Adam(model.parameters(),lr=.001)
    best=float("inf"); state=None; stale=0
    for epoch in range(epochs):
        model.train(); random.shuffle(train_windows); lossvals=[]
        for i in range(0,len(train_windows),batch_size):
            q,r,mask=pack(train_windows[i:i+batch_size],device)
            aux,f,latent,ab,lam,d=model(q,r)
            valid=mask.clone(); valid[:,0]=False
            if not valid.any(): continue
            bce=torch.nn.functional.binary_cross_entropy_with_logits(aux[valid],r[valid])
            # AE reconstruction target is the previous interaction's [problem feature,response].
            dprev=torch.cat([torch.zeros_like(d[:,:1,:]),d[:,:-1,:]],dim=1)
            rprev=torch.cat([torch.zeros_like(r[:,:1]),r[:,:-1]],dim=1)
            ae_target=torch.cat([dprev,rprev.unsqueeze(-1)],dim=-1)
            ae_loss=torch.nn.functional.mse_loss(ab[valid],ae_target[valid])
            loss=bce+ae_loss
            optimizer.zero_grad(); loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(),5.0)
            optimizer.step(); lossvals.append(float(loss.detach().cpu()))
        val_loss=evaluate_neural(model,val_windows,device,batch_size)
        print(f"epoch {epoch+1:03d}/{epochs} train={np.mean(lossvals):.5f} val={val_loss:.5f}")
        if val_loss<best:
            best=val_loss; state={k:v.detach().cpu().clone() for k,v in model.state_dict().items()}; stale=0
        else: stale+=1
        if stale>=patience: print("Early stopping"); break
    if state: model.load_state_dict(state)
    return best

def evaluate_neural(model,windows,device,batch_size):
    model.eval(); ls=[]
    with torch.no_grad():
        for i in range(0,len(windows),batch_size):
            q,r,mask=pack(windows[i:i+batch_size],device)
            aux,f,latent,ab,lam,d=model(q,r)
            valid=mask.clone(); valid[:,0]=False
            if valid.any():
                bce=torch.nn.functional.binary_cross_entropy_with_logits(aux[valid],r[valid])
                dprev=torch.cat([torch.zeros_like(d[:,:1,:]),d[:,:-1,:]],dim=1)
                rprev=torch.cat([torch.zeros_like(r[:,:1]),r[:,:-1]],dim=1)
                target=torch.cat([dprev,rprev.unsqueeze(-1)],dim=-1)
                ae=torch.nn.functional.mse_loss(ab[valid],target[valid])
                ls.append(float((bce+ae).cpu()))
    return float(np.mean(ls)) if ls else float("inf")

def main():
    ap=argparse.ArgumentParser(description="Paper-oriented DKVMN-KAPS on ASSIST2009")
    ap.add_argument("--csv",required=True); ap.add_argument("--folds",type=int,default=5)
    ap.add_argument("--epochs",type=int,default=100); ap.add_argument("--seed",type=int,default=42)
    ap.add_argument("--max-students",type=int,default=None); ap.add_argument("--seq-len",type=int,default=200)
    ap.add_argument("--out",default="outputs"); ap.add_argument("--batch-size",type=int,default=256); ap.add_argument("--variant",choices=["DKVMN-KAPS","DKVMN-X","DKVMN-PS","DKVMN-KA"],default="DKVMN-KAPS")
    args=ap.parse_args(); seed_all(args.seed); os.makedirs(args.out,exist_ok=True)
    sequences,nq,ns,qmap,smap=load_assist(args.csv,args.max_students)
    print(f"students={len(sequences)} questions={nq-1} skills={ns-1} interactions={sum(len(x['r']) for x in sequences)}")
    with open(os.path.join(args.out,"vocab.json"),"w",encoding="utf-8") as vf:
        json.dump({"questions":qmap,"skills":smap},vf)
    device="cuda" if torch.cuda.is_available() else "cpu"; folds=[]; preds=[]
    for fold,(outer_train,test_idx) in enumerate(student_folds(sequences,args.folds,args.seed),1):
        seed_all(args.seed+fold)
        # Validation split is student-level within outer training fold.
        inner_train,val_idx=train_val_split(outer_train,sequences,val_fraction=.15,seed=args.seed+fold)
        tr=make_windows(sequences,inner_train,args.seq_len)
        va=make_windows(sequences,val_idx,args.seq_len)
        te=make_windows(sequences,test_idx,args.seq_len)
        model=DKVMNKAPS(nq,ns,memory_size=ns-1,variant=args.variant).to(device)
        fit_neural(model,tr,va,device,args.epochs,batch_size=args.batch_size)
        Xtr,ytr=collect(model,tr,device); Xv,yv=collect(model,va,device); Xte,yte=collect(model,te,device)
        # Paper states XGBoost uses default Python toolbox parameters; use default estimator
        # with binary objective/metrics for reproducible package defaults.
        xgb=XGBClassifier(objective="binary:logistic",eval_metric="auc",random_state=args.seed+fold,
                          n_estimators=300,tree_method="hist",n_jobs=-1)
        xgb.fit(Xtr,ytr,eval_set=[(Xv,yv)],verbose=False)
        p=xgb.predict_proba(Xte)[:,1]; m=metrics(yte,p); m["fold"]=fold
        folds.append(m); preds.append(pd.DataFrame({"fold":fold,"y":yte,"p":p}))
        torch.save({"state_dict":model.state_dict(),"n_questions":nq,"n_skills":ns,
                    "memory_size":ns-1,"key_dim":50,"value_dim":50,"question_dim":50,
                    "dropout":0.2,"variant":args.variant,"fold":fold,"seed":args.seed},
                   os.path.join(args.out,f"dkvmn_kaps_fold{fold}.pt"))
        xgb.save_model(os.path.join(args.out,f"xgb_fold{fold}.json"))
        print(f"TEST fold {fold}: "+json.dumps(m))
    result=pd.DataFrame(folds); result.to_csv(os.path.join(args.out,"fold_metrics.csv"),index=False)
    pd.concat(preds,ignore_index=True).to_csv(os.path.join(args.out,"test_predictions.csv"),index=False)
    numeric=result.drop(columns="fold")
    summary={"mean":numeric.mean().to_dict(),"std":numeric.std().to_dict(),"paper_reference_auc":0.8751}
    with open(os.path.join(args.out,"summary.json"),"w") as f: json.dump(summary,f,indent=2)
    print("SUMMARY",json.dumps(summary,indent=2))
if __name__=="__main__": main()
