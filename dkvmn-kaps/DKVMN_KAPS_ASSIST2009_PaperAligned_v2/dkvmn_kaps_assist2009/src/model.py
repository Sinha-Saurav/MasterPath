
import torch
from torch import nn
import torch.nn.functional as F

class CausalGLUResidual(nn.Module):
    """Paper-style hierarchical causal convolution with kernel=6 and residual connection."""
    def __init__(self, dim, kernel_size=6, dropout=0.2):
        super().__init__()
        self.kernel_size=kernel_size
        self.conv=nn.Conv1d(dim, 2*dim, kernel_size=kernel_size, padding=0)
        self.proj=nn.Conv1d(dim,dim,kernel_size=1)
        self.dropout=nn.Dropout(dropout)
    def forward(self,x):
        # x: [B,T,D], causal left pad so no future memory state can enter.
        y=self.conv(F.pad(x.transpose(1,2),(self.kernel_size-1,0)))
        a,b=y.chunk(2,dim=1)
        y=a*torch.sigmoid(b) # GLU
        y=self.dropout(y)
        return (self.proj(x.transpose(1,2))+y).transpose(1,2)

class DKVMNKAPS(nn.Module):
    """
    Paper-aligned DKVMN-KAPS.
    Question embedding queries a learned key memory; response-conditioned
    value-memory update uses SVD-derived absorption scalar. KAPS features:
    absorption via hierarchical causal GLU CNN + SVD,
    problem-solving via AE on (problem feature, prior response),
    question feature via MLP.
    """
    def __init__(self,n_questions,n_skills,memory_size=None,key_dim=50,value_dim=50,question_dim=50,dropout=.2,variant='DKVMN-KAPS'):
        super().__init__()
        self.n_questions=n_questions
        self.n_skills=n_skills
        self.variant=variant
        self.use_ka=variant in ('DKVMN-KAPS','DKVMN-KA')
        self.use_ps=variant in ('DKVMN-KAPS','DKVMN-PS')
        self.N=memory_size or n_skills
        self.dk=key_dim; self.dv=value_dim; self.dq=question_dim
        # Paper's question embedding matrix A and response embedding matrix B.
        self.question_embedding=nn.Embedding(n_questions,key_dim,padding_idx=0)
        self.response_embedding=nn.Embedding(n_questions*2,value_dim,padding_idx=0)
        self.key_memory=nn.Parameter(torch.randn(self.N,key_dim)*0.1)
        self.initial_value_memory=nn.Parameter(torch.randn(self.N,value_dim)*0.1)
        # Knowledge state f_t = tanh(W_f [m_t,k_t] + b_f)
        self.knowledge_state=nn.Linear(value_dim+key_dim,value_dim)
        # λ derived from hierarchical CNN/SVD of historical value-memory states
        self.hier_layers=nn.ModuleList([CausalGLUResidual(value_dim,6,dropout) for _ in range(3)])
        self.abs_svd_proj=nn.Sequential(nn.Linear(6,16),nn.ReLU(),nn.Linear(16,1),nn.Softplus())
        # Erase/add maps applied to adaptive knowledge growth [v_t, f_t].
        self.erase_map=nn.Linear(value_dim*2,value_dim,bias=False)
        self.erase_bias=nn.Parameter(torch.zeros(value_dim))
        self.add_map=nn.Linear(value_dim*2,value_dim,bias=False)
        self.add_bias=nn.Parameter(torch.zeros(value_dim))
        # Question/problem features d_t = tanh(MLP(k_t))
        self.problem_feature=nn.Sequential(nn.Linear(key_dim,question_dim),nn.ReLU(),nn.Linear(question_dim,question_dim),nn.Tanh())
        # AE: aw_t = [d_t, r_t]; encoder two ReLU hidden layers + linear latent.
        ae_in=question_dim+1
        self.ae_encoder=nn.Sequential(nn.Linear(ae_in,64),nn.ReLU(),nn.Linear(64,32),nn.ReLU(),nn.Linear(32,16))
        self.ae_decoder=nn.Sequential(nn.Linear(16,32),nn.ReLU(),nn.Linear(32,64),nn.ReLU(),nn.Linear(64,ae_in),nn.Sigmoid())
        # Auxiliary supervised head to provide gradient to neural representation;
        # XGBoost remains the published final predictor.
        aux_width=value_dim+(ae_in if self.use_ps else 0)+question_dim
        self.aux_head=nn.Sequential(nn.Linear(aux_width,128),nn.ReLU(),nn.Dropout(dropout),nn.Linear(128,1))
    def forward(self,q,r):
        """q,r [B,T]; logits at t predict r_t before r_t is applied to memory."""
        B,T=q.shape
        k=self.question_embedding(q)
        d=self.problem_feature(k)
        mem=self.initial_value_memory.unsqueeze(0).expand(B,-1,-1)
        mem_hist=[]
        f_list=[]; lam_list=[]; ps_list=[]; recon_list=[]; aux_logits=[]
        prior_ae=torch.zeros(B,self.dq+1,device=q.device,dtype=k.dtype)
        prior_response=torch.zeros(B,self.dv,device=q.device,dtype=k.dtype)
        for t in range(T):
            # Historical value memory states only; no future leakage.
            if mem_hist and self.use_ka:
                hist_vec=torch.stack(mem_hist[-21:],dim=1) # bounded causal receptive field (3 layers x kernel 6; SVD tail 6)
                z=hist_vec
                for layer in self.hier_layers: z=layer(z)
                tail=z[:,-6:,:]
                if tail.shape[1] < 6: tail=F.pad(tail,(0,0,6-tail.shape[1],0))
                sv=torch.linalg.svdvals(tail)
                if sv.shape[1] < 6: sv=F.pad(sv,(0,6-sv.shape[1]))
                lam=self.abs_svd_proj(sv).clamp(min=1e-3,max=10.0)
            else:
                lam=torch.ones(B,1,device=q.device,dtype=k.dtype)
            # Attention lookup current question on key memory.
            w=torch.softmax(torch.matmul(k[:,t,:],self.key_memory.T),dim=-1) # B,N
            m=torch.sum(w.unsqueeze(-1)*mem,dim=1)
            f=torch.tanh(self.knowledge_state(torch.cat([m,k[:,t,:]],dim=-1)))
            # PS ability is reconstructed AE representation from prior question-answer
            # pair only. It is shifted: current target response is never fed into AE.
            if self.use_ps:
                latent=self.ae_encoder(prior_ae)
                ab=self.ae_decoder(latent)
            else:
                latent=torch.zeros(B,16,device=q.device,dtype=k.dtype)
                ab=torch.zeros(B,self.dq+1,device=q.device,dtype=k.dtype)
            recon_list.append(ab)
            ps_list.append(latent)
            f_list.append(f); lam_list.append(lam.squeeze(-1))
            aux_feature=torch.cat([f,ab,d[:,t,:]],dim=-1) if self.use_ps else torch.cat([f,d[:,t,:]],dim=-1)
            aux_logits.append(self.aux_head(aux_feature).squeeze(-1))
            # response embedding current (after prediction), response ID 2*q+r
            qr=(q[:,t]*2+r[:,t].long()).clamp(0,self.response_embedding.num_embeddings-1)
            v=self.response_embedding(qr)
            v_adap=torch.cat([v,f],dim=-1)
            e=torch.sigmoid(self.erase_map(v_adap)/lam+self.erase_bias)
            a=torch.sigmoid(self.add_map(v_adap)*lam+self.add_bias)
            updated=mem*(1-w.unsqueeze(-1)*e.unsqueeze(1))
            updated=updated*(1+w.unsqueeze(-1)*a.unsqueeze(1))
            active=(q[:,t]>0).view(B,1,1)
            mem=torch.where(active,updated,mem)
            mem_hist.append(m) # store pre-update question-conditioned knowledge state
            # AE input becomes current interaction only after target prediction.
            current_ae=torch.cat([d[:,t,:],r[:,t:t+1]],dim=-1)
            prior_ae=torch.where((q[:,t]>0).view(B,1),current_ae,prior_ae)
        return (torch.stack(aux_logits,dim=1),torch.stack(f_list,dim=1),
                torch.stack(ps_list,dim=1),torch.stack(recon_list,dim=1),
                torch.stack(lam_list,dim=1),d)
