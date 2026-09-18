import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FileText, MessageSquare, ShieldCheck, Zap, BotMessageSquare, BrainCircuit, Activity, ClipboardList, Download, RotateCcw, Save } from 'lucide-react';
import clsx from 'clsx';
import { updateFormField, addChatMessage, setFullForm, setRiskAssessment, setProcessing, setCapaPlan, resetForm, setExtractionProgress } from './store/complaintSlice';
import axios from 'axios';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { AuditReport } from './components/AuditReport';

const API_URL = 'http://localhost:8000';

function App() {
  const dispatch = useDispatch();
  const { form, riskAssessment, capaPlan, chatHistory, isProcessing, extractionProgress } = useSelector((state) => state.complaint);
  const [userInput, setUserInput] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const handleInputChange = (field, value) => {
    dispatch(updateFormField({ field, value }));
  };

  const processResponse = (data) => {
    if (data.form) dispatch(setFullForm(data.form));
    if (data.risk_assessment) dispatch(setRiskAssessment(data.risk_assessment));
    if (data.agent_message) dispatch(addChatMessage({ sender: 'agent', text: data.agent_message }));
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage = userInput.trim();
    setUserInput('');
    dispatch(addChatMessage({ sender: 'user', text: userMessage }));
    dispatch(setProcessing(true));

    try {
      const { data } = await axios.post(`${API_URL}/api/chat`, {
        message: userMessage,
        current_state: { form, riskAssessment },
      });
      processResponse(data);
    } catch (error) {
      dispatch(addChatMessage({ sender: 'agent', text: 'Error communicating with AI Assistant.' }));
    } finally {
      dispatch(setProcessing(false));
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const handleDocumentExtract = async () => {
    if (!file) return;
    dispatch(setProcessing(true));
    dispatch(setExtractionProgress(25));
    dispatch(addChatMessage({ sender: 'user', text: `Processing document: ${file.name}...` }));

    const formData = new FormData();
    formData.append('file', file);

    try {
      dispatch(setExtractionProgress(60));
      const { data } = await axios.post(`${API_URL}/api/extract-document`, formData);
      dispatch(setExtractionProgress(100));
      processResponse(data);
      setFile(null);
    } catch (error) {
      dispatch(addChatMessage({ sender: 'agent', text: 'Error extracting data from PDF.' }));
    } finally {
      dispatch(setProcessing(false));
      setTimeout(() => {
        dispatch(setExtractionProgress(0));
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  };

  const handleSaveComplaint = async () => {
    try {
      await axios.post(`${API_URL}/api/save-complaint`, { ...form, ...riskAssessment });
      alert('Complaint saved successfully to database!');
    } catch (error) {
      alert('Failed to save complaint.');
    }
  };

  const handleGenerateCAPA = async () => {
    dispatch(setProcessing(true));
    try {
      const { data } = await axios.post(`${API_URL}/api/generate-capa`, { form, risk_assessment: riskAssessment });
      dispatch(setCapaPlan(data.capa));
    } catch (error) {
      alert('Error generating CAPA.');
    } finally {
      dispatch(setProcessing(false));
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 font-['Inter',sans-serif] flex flex-col antialiased">
      <header className="sticky top-0 z-50 bg-[#161b22]/90 backdrop-blur-sm border-b border-[#30363d] shadow-lg">
        <nav className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-7 w-7 text-teal-400" />
            <h1 className="text-xl font-semibold tracking-tight">
              AIVOA <span className="text-slate-400 font-normal">| Pharma Complaint Intake</span>
            </h1>
          </div>
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-semibold uppercase">Pending Triage</span>
        </nav>
      </header>

      <main className="grow max-w-screen-2xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-6 p-6">
        
        {/* LEFT COLUMN: LOG CUSTOMER COMPLAINT FORM */}
        <div className="space-y-6">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 shadow-xl space-y-6">
            <h2 className="text-lg font-semibold text-white uppercase tracking-wider border-b border-[#30363d] pb-3">Log Customer Complaint</h2>

            {/* 1. ORIGIN & CUSTOMER DETAILS */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">1. Origin & Customer Details</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Complaint Source</label>
                  <input type="text" value={form.complaint_source || ''} onChange={(e) => handleInputChange('complaint_source', e.target.value)} placeholder="Awaiting AI extraction..." className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg h-9 px-3 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Customer Name</label>
                  <input type="text" value={form.customer_name || ''} onChange={(e) => handleInputChange('customer_name', e.target.value)} placeholder="Awaiting AI extraction..." className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg h-9 px-3 text-xs text-white" />
                </div>
              </div>
            </div>

            {/* 2. PRODUCT & BATCH IDENTIFICATION */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">2. Product & Batch Identification</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Product Name</label>
                  <input type="text" value={form.product_name || ''} onChange={(e) => handleInputChange('product_name', e.target.value)} placeholder="Awaiting AI extraction..." className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg h-9 px-3 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Product Strength/Grade</label>
                  <input type="text" value={form.product_strength || ''} onChange={(e) => handleInputChange('product_strength', e.target.value)} placeholder="Awaiting AI extraction..." className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg h-9 px-3 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Batch/Lot Number</label>
                  <input type="text" value={form.batch_number || ''} onChange={(e) => handleInputChange('batch_number', e.target.value)} placeholder="Awaiting AI extraction..." className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg h-9 px-3 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Quantity Affected</label>
                  <input type="text" value={form.affected_quantity || ''} onChange={(e) => handleInputChange('affected_quantity', e.target.value)} placeholder="Awaiting AI extraction..." className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg h-9 px-3 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Manufacturing Date</label>
                  <input type="date" value={form.manufacturing_date || ''} onChange={(e) => handleInputChange('manufacturing_date', e.target.value)} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg h-9 px-3 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Expiry Date</label>
                  <input type="date" value={form.expiry_date || ''} onChange={(e) => handleInputChange('expiry_date', e.target.value)} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg h-9 px-3 text-xs text-white" />
                </div>
              </div>
            </div>

            {/* 3. COMPLAINT DETAILS */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">3. Complaint Details</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Complaint Type</label>
                  <input type="text" value={form.complaint_type || ''} onChange={(e) => handleInputChange('complaint_type', e.target.value)} placeholder="Awaiting AI extraction..." className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg h-9 px-3 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Complaint Date</label>
                  <input type="date" value={form.complaint_date || ''} onChange={(e) => handleInputChange('complaint_date', e.target.value)} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg h-9 px-3 text-xs text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Detailed Complaint Description</label>
                <textarea value={form.complaint_description || ''} onChange={(e) => handleInputChange('complaint_description', e.target.value)} placeholder="Awaiting AI extraction..." className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs text-white h-24 resize-none" />
              </div>
            </div>

            {/* 4. INITIAL ASSESSMENT & PRIORITY */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">4. Initial Assessment & Priority</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Initial Severity</label>
                  <span className="block text-sm font-semibold text-amber-400 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2">{riskAssessment.severity}</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
                  <span className="block text-sm font-semibold text-teal-400 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2">{riskAssessment.priority}</span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-between pt-4 border-t border-[#30363d]">
              <button onClick={() => dispatch(resetForm())} className="h-10 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-2 border border-[#30363d]">
                <RotateCcw className="h-4 w-4" /> Reset Form
              </button>
              <button onClick={handleSaveComplaint} className="h-10 px-6 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2">
                <Save className="h-4 w-4" /> Save Complaint
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI INTAKE ASSISTANT */}
        <div className="space-y-6">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <h2 className="text-lg font-semibold text-white">AI Complaint Intake Assistant</h2>
              <span className="text-xs font-mono px-2 py-0.5 bg-teal-950 text-teal-400 rounded border border-teal-800">BETA</span>
            </div>

            {/* FILE UPLOAD ZONE */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#30363d] hover:border-teal-500/50 bg-[#0d1117] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              <FileText className="h-8 w-8 text-slate-500 mb-2" />
              <span className="text-xs text-slate-300 font-medium">Drag & drop complaint document here or click to browse</span>
              <span className="text-[10px] text-slate-500 mt-1">Supported formats: PDF (Max size: 10MB)</span>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
            </div>

            {file && (
              <button onClick={handleDocumentExtract} className="w-full h-9 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold">
                Extract Data from {file.name}
              </button>
            )}

            {/* EXTRACTION PROGRESS */}
            {extractionProgress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>EXTRACTION PROGRESS</span>
                  <span>{extractionProgress}%</span>
                </div>
                <div className="w-full bg-[#0d1117] h-2 rounded-full overflow-hidden border border-[#30363d]">
                  <div className="bg-teal-500 h-full transition-all duration-300" style={{ width: `${extractionProgress}%` }} />
                </div>
              </div>
            )}

            {/* CHAT MESSAGES */}
            <div className="h-64 overflow-y-auto space-y-3 p-3 bg-[#0d1117] rounded-lg border border-[#30363d]">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={clsx("text-xs p-3 rounded-lg leading-relaxed", msg.sender === 'user' ? 'bg-teal-600 text-white ml-auto max-w-[80%]' : 'bg-[#161b22] text-slate-300 border border-[#30363d] max-w-[90%]')}>
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* INPUT BOX */}
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Ask anything about this complaint..." className="grow h-10 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 text-xs text-white" />
              <button type="submit" className="h-10 px-4 bg-teal-600 text-white rounded-lg text-xs font-semibold">Send</button>
            </form>
          </div>

          {/* CAPA ENGINE */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 shadow-xl space-y-3">
            <button onClick={handleGenerateCAPA} className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2">
              <Activity className="h-4 w-4" /> Trigger CAPA Investigation
            </button>
            {capaPlan && (
              <div className="p-3 bg-[#0d1117] rounded border border-[#30363d] text-xs space-y-2">
                <span className="text-indigo-400 font-semibold block uppercase">Root Cause (5-Whys)</span>
                <p className="text-slate-300">{capaPlan.root_cause_analysis}</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;