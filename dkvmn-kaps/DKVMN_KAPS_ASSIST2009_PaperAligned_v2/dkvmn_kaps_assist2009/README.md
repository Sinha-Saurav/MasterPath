
# DKVMN-KAPS — ASSIST2009 Skill Builder (paper-oriented reproduction)

This repository is a **research reproduction implementation** based on the published description of Zhang et al., *DKVMN-KAPS: Dynamic Key-Value Memory Networks Knowledge Tracing With Students’ Knowledge-Absorption Ability and Problem-Solving Ability* (IEEE Access, 2024). It is not an author-released official codebase. It implements the paper's described equations/modules and marks details requiring interpretive choices.

## Current state and scientific honesty
- Code has unit tests and an end-to-end smoke test on a 50-student subset of the uploaded ASSIST2009 CSV (2 folds, 1 epoch).
- **The full ASSIST2009 five-fold benchmark has not yet been run in this packaged snapshot.**
- Paper reference AUC on ASSIST2009: **0.8751**. That is the paper value, not our measured value. The 50-student smoke test produced mean AUC **0.6166** (fold AUCs 0.6104 and 0.6228); this limited pilot is not comparable to the paper's full benchmark.
- Dataset raw file has 525,534 rows; paper reports 325,637 interactions. This difference signals that filtering / record granularity must be reconciled before claiming strict benchmark equivalence. We do not falsely claim this is solved.
- Architecture details such as exact embedding dimensions and the precise tensor layout around SVD are incompletely specified in the accessible text; this code uses clearly documented reasonable interpretations.

## Paper-described architecture implemented
1. **Correlation weights:** question embedding \(k_t=A(q_t)\), dot product with learned key memory, softmax over memory slots.
2. **Knowledge state:** read weighted value memory \(m_t\), concatenate with \(k_t\), linear projection + tanh to \(f_t\).
3. **Knowledge absorption (KA):** hierarchical causal 1-D convolution over prior question-conditioned knowledge read states; 3 layers, kernel 6; GLU gate and residual projection in each layer. A short-window SVD spectrum is mapped to positive absorption scalar \(\lambda\). Future states are excluded.
4. **Adaptive memory update:** response embedding \(v_t=B(q_t,r_t)\); adaptive growth concatenates \(v_t\) and current \(f_t\); erase/add gates apply the paper's inverse/direct \(\lambda\) scaling and weighted slot update.
5. **Problem feature:** MLP on question embedding \(d_t=\tanh(MLP(k_t))\).
6. **Problem-solving (PS):** autoencoder receives prior interaction's \([d_{t-1},r_{t-1}]\), uses ReLU encoder/decoder hidden layers and sigmoid reconstruction. It is shifted so the target answer cannot leak into its own features.
7. **Prediction:** XGBoost receives \([f_t,ab_t,d_t]\). The final metric is calculated against \(r_t\), where these features are extracted before applying \(r_t\) to the memory.

## Explicit interpretation / deviations
- The paper says CNN uses value-memory matrices across time. We use question-conditioned read vectors as the temporal state fed to CNN to keep a causal sequence representation. The exact tensor interpretation is not unambiguously recoverable from prose alone.
- Paper's SVD output is converted to a scalar absorption factor via a learned projection of a six-step singular spectrum; this is an engineering interpretation.
- A supervised auxiliary neural head is trained to provide gradient to learned neural representations before fitting XGBoost. The paper's text states cross-entropy optimizes neural embeddings but the exact gradient path between XGBoost and neural blocks is not specified; XGBoost is not differentiable.
- Inner student-level validation and early stopping are added for robust model selection. This is not stated as the paper's exact CV protocol.
- Dataset is mapped to one item ID per question and first skill tag per row; no attempt/hint action sequence is used.

## Paper settings encoded
- Five-fold student-disjoint CV
- Adam learning rate 0.001
- up to 100 epochs/iterations
- batch size 256
- dropout 0.2
- hierarchical CNN layers 3, kernel size 6, residual blocks 3
- XGBoost Python default hyperparameters except binary objective/eval metric explicitly set

Some dimensions (key/value/question embedding 50) are reproduction defaults because they are not completely specified in the extracted experimental text. Adjust in `src/train.py` model constructor only with recorded configuration.

## Dataset
Official source: https://sites.google.com/site/assistmentsdata/home/2009-2010-assistment-data/skill-builder-data-2009-2010

Use Skill-builder data 2009–2010. Uploaded CSV is included in `data/skill_builder_data.csv`. The checksum is in `DATASET_CHECKSUM.txt`.

## Setup
Python 3.10–3.12 recommended.
```bash
python -m venv .venv
# Windows PowerShell
.venv\\Scripts\\Activate.ps1
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
```

## Run full five-fold benchmark
```bash
python -m src.train --csv data/skill_builder_data.csv --folds 5 --epochs 100 --batch-size 256 --seed 42 --out outputs/full_seed42
```
This run can be compute-intensive; GPU is recommended. Additional seeds:
```bash
python -m src.train --csv data/skill_builder_data.csv --folds 5 --epochs 100 --batch-size 256 --seed 43 --out outputs/full_seed43
```

## Ablation models (paper's variants)
Run each as separate five-fold experiments:
```bash
python -m src.train --csv data/skill_builder_data.csv --variant DKVMN-X --out outputs/dkvmn_x
python -m src.train --csv data/skill_builder_data.csv --variant DKVMN-PS --out outputs/dkvmn_ps
python -m src.train --csv data/skill_builder_data.csv --variant DKVMN-KA --out outputs/dkvmn_ka
python -m src.train --csv data/skill_builder_data.csv --variant DKVMN-KAPS --out outputs/dkvmn_kaps
```
Variant definitions: DKVMN-X omits both KA and PS; DKVMN-PS removes KA but retains PS; DKVMN-KA removes PS but retains KA; DKVMN-KAPS is full model.

## Tests
```bash
pytest -q tests
```
Tests cover data parsing/windowing, forward tensor shapes, finite predictions, and target-response non-leakage in the current interaction feature.

## FastAPI service
Train artifacts first. Then:
```bash
ARTIFACT_DIR=outputs/full_seed42 MODEL_FOLD=1 uvicorn src.api:app --host 0.0.0.0 --port 8000
```
Windows PowerShell:
```powershell
$env:ARTIFACT_DIR="outputs/full_seed42"
$env:MODEL_FOLD="1"
uvicorn src.api:app --host 0.0.0.0 --port 8000
```
Endpoint: `POST /predict` with prior interaction history and target question ID.

## Results to report
Record the five fold AUCs and mean ± std from `outputs/.../fold_metrics.csv`. Do not claim 0.8751 reproduction until preprocessing is matched and the full benchmark is run. Cite the paper and the exact ASSISTments data page in the project report.
