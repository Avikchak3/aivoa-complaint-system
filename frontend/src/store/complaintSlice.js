import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  form: {
    complaint_source: '',
    customer_name: '',
    product_name: '',
    product_strength: '',
    batch_number: '',
    manufacturing_date: '',
    expiry_date: '',
    affected_quantity: '',
    complaint_type: '',
    complaint_date: '',
    complaint_description: '',
  },
  riskAssessment: {
    severity: 'Pending',
    priority: 'Pending',
    suggested_action: 'Awaiting AI extraction...',
  },
  capaPlan: null,
  chatHistory: [
    { sender: 'agent', text: 'Upload a complaint document or paste text. I will automatically extract details and populate the form.' }
  ],
  isProcessing: false,
  extractionProgress: 0,
};

const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    updateFormField: (state, action) => {
      state.form[action.payload.field] = action.payload.value;
    },
    setFullForm: (state, action) => {
      state.form = { ...state.form, ...action.payload };
    },
    setRiskAssessment: (state, action) => {
      state.riskAssessment = { ...state.riskAssessment, ...action.payload };
    },
    setCapaPlan: (state, action) => {
      state.capaPlan = action.payload;
    },
    addChatMessage: (state, action) => {
      state.chatHistory.push(action.payload);
    },
    setProcessing: (state, action) => {
      state.isProcessing = action.payload;
    },
    setExtractionProgress: (state, action) => {
      state.extractionProgress = action.payload;
    },
    resetForm: () => initialState,
  },
});

export const {
  updateFormField,
  setFullForm,
  setRiskAssessment,
  setCapaPlan,
  addChatMessage,
  setProcessing,
  setExtractionProgress,
  resetForm
} = complaintSlice.actions;

export default complaintSlice.reducer;