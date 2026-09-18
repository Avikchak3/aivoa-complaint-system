from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class FormModel(BaseModel):
    product_name: Optional[str] = Field(default="", description="Name of the pharmaceutical product")
    product_strength: Optional[str] = Field(default="", description="Strength or concentration (e.g., 500mg)")
    batch_number: Optional[str] = Field(default="", description="Batch or lot number")
    manufacturing_date: Optional[str] = Field(default="", description="Manufacturing date YYYY-MM-DD")
    expiry_date: Optional[str] = Field(default="", description="Expiry date YYYY-MM-DD")
    affected_quantity: Optional[str] = Field(default="", description="Quantity or number of affected packs")
    reporter_name: Optional[str] = Field(default="", description="Name of person reporting the issue")
    complaint_description: Optional[str] = Field(default="", description="Detailed explanation of the issue")

class RiskAssessmentModel(BaseModel):
    severity: str = Field(description="Severity level: 'Minor', 'Major', or 'Critical'")
    suggested_action: str = Field(description="Recommended immediate QA compliance step")
    risk_summary: str = Field(description="Brief rationale for the assigned risk level")

class StructuredResponse(BaseModel):
    form: FormModel
    risk_assessment: RiskAssessmentModel
    agent_message: str = Field(description="Conversational response to display to the user")

class ChatRequest(BaseModel):
    message: str
    current_state: Dict[str, Any]

class CAPAPlan(BaseModel):
    root_cause_analysis: str = Field(description="5-Whys or Ishikawa hypothesis for the defect")
    immediate_containment: str = Field(description="Immediate action to quarantine or stop distribution")
    corrective_actions: str = Field(description="Steps taken to fix the root cause")
    preventive_actions: str = Field(description="Process or equipment controls to prevent recurrence")
    target_completion_days: int = Field(description="Target resolution SLA in days")

class CAPARequest(BaseModel):
    form: Dict[str, Any]
    risk_assessment: Dict[str, Any]

class CAPAResponse(BaseModel):
    capa: CAPAPlan