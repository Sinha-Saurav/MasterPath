
import torch
from src.model import DKVMNKAPS
def test_forward_shapes_and_finite():
    model=DKVMNKAPS(20,10,memory_size=9,key_dim=8,value_dim=8,question_dim=8,dropout=.0)
    q=torch.tensor([[1,2,3,0],[4,5,6,0]])
    r=torch.tensor([[1.,0.,1.,0.],[0.,1.,0.,0.]])
    aux,f,latent,ab,lam,d=model(q,r)
    assert aux.shape==(2,4)
    assert f.shape==(2,4,8)
    assert latent.shape==(2,4,16)
    assert ab.shape==(2,4,9)
    assert lam.shape==(2,4)
    assert d.shape==(2,4,8)
    assert torch.isfinite(aux).all()
    # The question response at t should not be incorporated in the features at t.
    q2=q.clone(); r2=r.clone(); r2[:,2]=1-r2[:,2]
    out2=model(q2,r2)
    assert torch.allclose(f[:,2],out2[1][:,2],atol=1e-6)
    assert torch.allclose(ab[:,2],out2[3][:,2],atol=1e-6)
    assert torch.allclose(aux[:,2],out2[0][:,2],atol=1e-6)

def test_ablation_variants_forward():
    q=torch.tensor([[1,2,3]])
    r=torch.tensor([[1.,0.,1.]])
    for variant in ('DKVMN-X','DKVMN-PS','DKVMN-KA','DKVMN-KAPS'):
        model=DKVMNKAPS(20,10,memory_size=9,key_dim=8,value_dim=8,question_dim=8,dropout=0.,variant=variant)
        out=model(q,r)
        assert out[0].shape==(1,3)
        assert torch.isfinite(out[0]).all()
