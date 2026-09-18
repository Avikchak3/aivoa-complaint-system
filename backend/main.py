import os
import json
import sqlite3
from typing import TypedDict, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END

# Initialize FastAPI App
app = FastAPI(title="AIVOA Pharma Compliance API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SQLite Database Setup
DB_FILE = "complaints.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_source TEXT,
            customer_name TEXT,
            product_name TEXT,
            product_strength TEXT,
            batch_number TEXT,
            manufacturing_date TEXT,
            expiry_date TEXT,
            affected_quantity TEXT,
            complaint_type TEXT,
            complaint_date TEXT,
            complaint_description TEXT,
            severity TEXT,
            priority TEXT,
            suggested_action TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

# LangGraph State Definition
class AgentState(TypedDict):
    input_text: str
    form: dict
    risk_assessment: dict
    agent_message: str

# LLM Initialization
llm = ChatGroq(model_name="llama-3.3-70b-versatile", temperature=0.1)

# LangGraph Node Functions
def process_intake_node(state: AgentState) -> AgentState:
    prompt = f"""
    You are an expert Pharma QA Assistant. Analyze the user message or document text and update the complaint form state.
    
    Current Form: {json.dumps(state['form'])}
    User Input: {state['input_text']}

    Return a valid JSON object strictly in this structure:
    {{
      "form": {{
        "complaint_source": "string or null",
        "customer_name": "string or null",
        "product_name": "string or null",
        "product_strength": "string or null",
        "batch_number": "string or null",
        "manufacturing_date": "string or null",
        "expiry_date": "string or null",
        "affected_quantity": "string or null",
        "complaint_type": "string or null",
        "complaint_date": "string or null",
        "complaint_description": "string or null"
      }},
      "risk_assessment": {{
        "severity": "Minor" | "Major" | "Critical",
        "priority": "Low" | "Medium" | "High" | "Urgent",
        "suggested_action": "Recommended QA step"
      }},
      "agent_message": "Friendly confirmation text describing what details were captured."
    }}
    """
    response = llm.invoke(prompt)
    try:
        data = json.loads(response.content)
        return {
            "input_text": state["input_text"],
            "form": {**state["form"], **{k: v for k, v in data.get("form", {}).items() if v}},
            "risk_assessment": data.get("risk_assessment", state["risk_assessment"]),
            "agent_message": data.get("agent_message", "Processed successfully.")
        }
    except Exception:
        return state

# Build LangGraph Workflow
workflow = StateGraph(AgentState)
workflow.add_node("intake_processor", process_intake_node)
workflow.set_entry_point("intake_processor")
workflow.add_edge("intake_processor", END)
compiled_graph = workflow.compile()

# API Models
class ChatRequest(BaseModel):
    message: str
    current_state: dict

class CAPARequest(BaseModel):
    form: dict
    risk_assessment: dict

# Endpoints
@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    initial_state = {
        "input_text": req.message,
        "form": req.current_state.get("form", {}),
        "risk_assessment": req.current_state.get("riskAssessment", {}),
        "agent_message": ""
    }
    result = compiled_graph.invoke(initial_state)
    return result

@app.post("/api/extract-document")
async def extract_document(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files supported.")
    
    reader = PdfReader(file.file)
    extracted_text = "".join([page.extract_text() for page in reader.pages if page.extract_text()])
    
    initial_state = {
        "input_text": f"Extract details from PDF text: {extracted_text}",
        "form": {},
        "risk_assessment": {},
        "agent_message": ""
    }
    result = compiled_graph.invoke(initial_state)
    return result

@app.post("/api/generate-capa")
async def generate_capa(req: CAPARequest):
    prompt = f"""
    Generate a 21 CFR Compliant CAPA Plan for this complaint:
    Product: {req.form.get('product_name')} | Severity: {req.risk_assessment.get('severity')}
    Description: {req.form.get('complaint_description')}

    Return JSON:
    {{
      "root_cause_analysis": "5-Whys root cause summary",
      "immediate_containment": "Quarantine & containment actions",
      "corrective_actions": "Corrective steps",
      "preventive_actions": "Preventive actions",
      "target_completion_days": 14
    }}
    """
    res = llm.invoke(prompt)
    return {"capa": json.loads(res.content)}

@app.post("/api/save-complaint")
async def save_complaint(form: dict):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO complaints (
            complaint_source, customer_name, product_name, product_strength, batch_number,
            manufacturing_date, expiry_date, affected_quantity, complaint_type, complaint_date,
            complaint_description, severity, priority, suggested_action
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        form.get('complaint_source'), form.get('customer_name'), form.get('product_name'),
        form.get('product_strength'), form.get('batch_number'), form.get('manufacturing_date'),
        form.get('expiry_date'), form.get('affected_quantity'), form.get('complaint_type'),
        form.get('complaint_date'), form.get('complaint_description'),
        form.get('severity', 'Minor'), form.get('priority', 'Low'), form.get('suggested_action', 'None')
    ))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Complaint saved to database."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)