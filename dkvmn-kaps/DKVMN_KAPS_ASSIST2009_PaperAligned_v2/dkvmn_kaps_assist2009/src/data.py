import numpy as np
import pandas as pd
from sklearn.model_selection import GroupKFold, GroupShuffleSplit

def load_assist(csv_path, max_students=None):
    # Read only relevant fields to keep RAM manageable.
    header = pd.read_csv(csv_path, nrows=0, encoding="cp1252").columns
    wanted = ["user_id","problem_id","assistment_id","correct","skill_id","order_id","sequence_id","position"]
    usecols = [c for c in wanted if c in header]
    df = pd.read_csv(csv_path, usecols=usecols, low_memory=False, encoding="cp1252")
    if "user_id" not in df or "correct" not in df:
        raise ValueError("Dataset must contain user_id and correct columns")
    df = df.dropna(subset=["user_id","correct"]).copy()
    df["correct"] = pd.to_numeric(df["correct"], errors="coerce")
    df = df[df["correct"].isin([0,1])].copy()
    df["user_id"] = df["user_id"].astype(str)
    qcol = "problem_id" if "problem_id" in df and df["problem_id"].notna().any() else "assistment_id"
    if qcol not in df:
        df["question_raw"] = "unknown"
    else:
        df["question_raw"] = df[qcol].fillna(-1).astype(str)
    scol = "skill_id" if "skill_id" in df else None
    df["skill_raw"] = df[scol].fillna("0").astype(str) if scol else "0"
    # Paper-style single skill per interaction: first listed skill, no synthetic labels.
    df["skill_raw"] = df["skill_raw"].str.split(",").str[0].str.strip()
    sort_cols = [c for c in ["order_id","sequence_id","position"] if c in df]
    df["_row"] = np.arange(len(df))
    # Sort within learner using dataset order fields; row order remains tie breaker.
    df = df.sort_values(["user_id"] + sort_cols + ["_row"], kind="mergesort")
    students = df["user_id"].drop_duplicates().tolist()
    if max_students:
        keep = set(students[:max_students])
        df = df[df["user_id"].isin(keep)]
    qmap = {v:i+1 for i,v in enumerate(sorted(df["question_raw"].unique()))}
    smap = {v:i+1 for i,v in enumerate(sorted(df["skill_raw"].unique()))}
    df["question"] = df["question_raw"].map(qmap).astype(int)
    df["skill"] = df["skill_raw"].map(smap).astype(int)
    df["correct"] = df["correct"].astype(int)
    sequences=[]
    for uid,g in df.groupby("user_id", sort=False):
        if len(g) < 2: continue
        sequences.append({"student":uid,"q":g["question"].to_numpy(np.int64),
                          "s":g["skill"].to_numpy(np.int64),
                          "r":g["correct"].to_numpy(np.float32)})
    return sequences, len(qmap)+1, len(smap)+1, qmap, smap

def student_folds(sequences, n_splits=5, seed=42):
    # One sequence per learner; shuffle learner IDs once, then make disjoint folds.
    # Every learner appears in exactly one test fold, with no learner overlap.
    idx=np.arange(len(sequences))
    rng=np.random.default_rng(seed)
    shuffled=rng.permutation(idx)
    parts=np.array_split(shuffled,n_splits)
    for fold in range(n_splits):
        test=parts[fold]
        train=np.concatenate([parts[j] for j in range(n_splits) if j!=fold])
        yield train,test

def train_val_split(train_indices, sequences, val_fraction=.15, seed=42):
    idx=np.asarray(train_indices)
    groups=np.array([sequences[i]["student"] for i in idx])
    splitter=GroupShuffleSplit(n_splits=1,test_size=val_fraction,random_state=seed)
    tr,va=next(splitter.split(idx,groups=groups))
    return idx[tr],idx[va]

def make_windows(sequences, indices, seq_len=200):
    windows=[]
    for i in indices:
        x=sequences[int(i)]
        n=len(x["r"])
        for start in range(0,n-1,seq_len):
            end=min(start+seq_len,n-1)
            if end<=start: continue
            # Targets r[t+1]; model receives question/skill at t+1 and response at t.
            # Prefix interaction context is not carried across chunks (documented approximation).
            windows.append((x["q"][start:end+1],x["s"][start:end+1],x["r"][start:end+1]))
    return windows
