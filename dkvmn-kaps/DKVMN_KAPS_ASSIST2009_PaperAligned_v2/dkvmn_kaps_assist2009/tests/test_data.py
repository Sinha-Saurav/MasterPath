import pandas as pd
from src.data import load_assist, make_windows
def test_load_small(tmp_path):
    p=tmp_path/"tiny.csv"
    pd.DataFrame({"user_id":[1,1,2,2],"problem_id":[11,12,11,13],"correct":[1,0,0,1],
                  "skill_id":[4,4,5,5],"order_id":[1,2,1,2]}).to_csv(p,index=False)
    seq,nq,ns,qm,sm=load_assist(str(p))
    assert len(seq)==2 and nq>=2 and ns>=2
    w=make_windows(seq,[0,1],seq_len=5)
    assert len(w)==2

def test_student_folds_are_disjoint_and_cover_all():
    from src.data import student_folds
    seq=[{"student":str(i),"q":[1,2],"s":[1,1],"r":[0,1]} for i in range(20)]
    folds=list(student_folds(seq,n_splits=5,seed=123))
    test_sets=[set(te.tolist()) for _,te in folds]
    assert all(len(tr)==16 and len(te)==4 for tr,te in folds)
    assert set.union(*test_sets)==set(range(20))
    assert sum(len(x) for x in test_sets)==20
    for tr,te in folds: assert not set(tr).intersection(set(te))
