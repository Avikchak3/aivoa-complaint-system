# AIVOA - AI-Powered Customer Complaint Management System

An end-to-end Quality Management System (QMS) complaint intake co-pilot designed for pharmaceutical manufacturing (API & FDF). Built with a React + Redux frontend, FastAPI + LangGraph backend, Groq LLM integration, and SQLite persistence.

## Features
- **AI Complaint Extraction:** Chat co-pilot and PDF document parser to automatically populate complaint forms.
- **LangGraph Agentic Workflow:** Orchestrated LLM graph handling complaint structure and risk assessment.
- **Real-Time Triage & Risk Gauge:** Automated severity (Minor, Major, Critical) and priority scoring.
- **CAPA Engine:** Automated 5-Whys root cause analysis, containment steps, and SLA tracking under 21 CFR standards.
- **Audit PDF Exporter:** One-click regulatory audit report generation.
- **Database Persistence:** Save complaints directly to a local SQL database.

## Tech Stack
- **Frontend:** React, Redux Toolkit, Tailwind CSS, Lucide React, `@react-pdf/renderer`
- **Backend:** Python, FastAPI, LangGraph, LangChain, PyPDF, SQLite
- **LLM:** Groq API (`llama-3.3-70b-versatile` / `gemma2-9b-it`)

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Groq API Key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend