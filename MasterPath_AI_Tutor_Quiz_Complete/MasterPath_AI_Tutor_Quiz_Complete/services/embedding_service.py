import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
load_dotenv()
MODEL_NAME="gemini-embedding-001"
EMBEDDING_DIMENSIONS=3072
def embed_text(text: str, task_type: str="RETRIEVAL_DOCUMENT") -> list[float]:
    if not text or not text.strip(): raise ValueError("Text is empty")
    key=os.getenv("GEMINI_API_KEY")
    if not key: raise RuntimeError("GEMINI_API_KEY is missing")
    client=genai.Client(api_key=key)
    response=client.models.embed_content(model=MODEL_NAME,contents=text,config=types.EmbedContentConfig(task_type=task_type,output_dimensionality=EMBEDDING_DIMENSIONS))
    if not response.embeddings: raise RuntimeError("No embedding returned")
    vector=response.embeddings[0].values
    if len(vector)!=EMBEDDING_DIMENSIONS: raise RuntimeError(f"Expected {EMBEDDING_DIMENSIONS}, got {len(vector)}")
    return vector
