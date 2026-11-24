import json, os
from dotenv import load_dotenv
from google import genai
from openai import OpenAI
load_dotenv()
def _ctx(chunks):
    return "\n\n".join("[Page %s] %s"%(c.get("page_number","?"),c.get("content","")) for c in chunks)
def _gemini(prompt):
    key=os.getenv("GEMINI_API_KEY")
    if not key: raise RuntimeError("GEMINI_API_KEY missing")
    r=genai.Client(api_key=key).models.generate_content(model=os.getenv("GEMINI_MODEL","gemini-2.5-flash"),contents=prompt)
    if not r.text: raise RuntimeError("Gemini returned empty output")
    return r.text.strip()
def _grok(prompt):
    key=os.getenv("GROK_API_KEY")
    if not key: raise RuntimeError("GROK_API_KEY missing; fallback unavailable")
    c=OpenAI(api_key=key,base_url=os.getenv("GROK_BASE_URL","https://api.x.ai/v1"),timeout=45)
    r=c.chat.completions.create(model=os.getenv("GROK_MODEL","grok-3-mini-fast"),messages=[{"role":"user","content":prompt}],temperature=0.2)
    value=r.choices[0].message.content
    if not value: raise RuntimeError("Grok returned empty output")
    return value.strip()
def generate_with_fallback(prompt,validator=None):
    errors=[]
    for name,fn in [("gemini",_gemini),("grok",_grok)]:
        try:
            value=fn(prompt)
            if validator: validator(value)
            return value,name
        except Exception as e: errors.append(name+": "+str(e))
    raise RuntimeError("Both LLM providers failed: "+" | ".join(errors))
def generate_answer(question,context_chunks):
    if not question.strip(): raise ValueError("Question is empty")
    if not context_chunks: return "Uploaded course material mein relevant evidence nahi mila; answer ko PDF-grounded nahi maana ja sakta."
    prompt=("You are MasterPath AI Tutor. Explain step by step in simple language. Use only supplied context for claims about uploaded material, say when evidence is insufficient, and cite page numbers.\nCONTEXT:\n"+_ctx(context_chunks)+"\nQUESTION: "+question)
    return generate_with_fallback(prompt)[0]
def _json(text):
    text=text.strip()
    if text.startswith("```"): text=text.split("\n",1)[1].rsplit("```",1)[0].strip()
    a,b=text.find("{"),text.rfind("}")
    if a<0 or b<a: raise ValueError("No JSON object returned")
    return json.loads(text[a:b+1])
def validate_quiz_text(text):
    data=_json(text); qs=data.get("questions") if isinstance(data,dict) else None
    if not isinstance(qs,list) or len(qs)!=10: raise ValueError("Exactly 10 questions required")
    for i,q in enumerate(qs,1):
        if not isinstance(q.get("options"),dict) or set(q["options"])!={"A","B","C","D"}: raise ValueError(f"Question {i}: options A-D required")
        if q.get("correct_option") not in ("A","B","C","D"): raise ValueError(f"Question {i}: invalid correct_option")
        if not q.get("question") or not q.get("explanation"): raise ValueError(f"Question {i}: explanation missing")
    return data
def generate_quiz(course,topic,mastery,chunks):
    level="foundational" if mastery<0.4 else ("applied" if mastery<0.75 else "challenging/deeper")
    context=_ctx(chunks) if chunks else "No course chunks found; use general knowledge and mark every item general_knowledge."
    prompt=("Return only JSON {\"questions\":[...]}. Generate exactly 10 MCQs for course "+course+", topic "+topic+". Mastery="+str(mastery)+"; difficulty="+level+". Each item keys: question, options (exact A-D meaningful options), correct_option (one letter), explanation, difficulty, source_type (course_material or general_knowledge), sources (array). Numerical explanations must show formula, substitution and calculation. Never invent PDF facts. Context:\n"+context)
    errors=[]
    for attempt in range(2):
        try:
            raw,provider=generate_with_fallback(prompt+("" if attempt==0 else "\nFix previous invalid output and return valid JSON."),validate_quiz_text)
            result=validate_quiz_text(raw); result["provider"]=provider; result["mastery_level"]=level; return result
        except Exception as e: errors.append(str(e))
    raise RuntimeError("Quiz invalid after one retry: "+"; ".join(errors))
