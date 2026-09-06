import axios from 'axios';

// Single configurable API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const api = {
  // Health & Diagnostics
  checkHealth: async () => {
    try {
      const res = await client.get('/health');
      return { ok: true, data: res.data };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },

  // 1. AI Sahayak Multilingual Chat (RAG)
  askBIS: async (query, language = 'en', sessionId = null) => {
    const res = await client.post('/chat', {
      query,
      language: language === 'en' ? null : language,
      session_id: sessionId,
    });
    return res.data;
  },

  // 2. ISI License Text Verification
  verifyISI: async (cmlNumber) => {
    const res = await client.post('/verify_isi', { cml_number: cmlNumber });
    return res.data;
  },

  // 3. Photo-to-Standard OCR Verification
  verifyPhoto: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/verify_isi/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // 4. Automated 3D CAD Compliance Scanner
  scanCAD: async (file, targetStandard = 'IS 15652', nominalSpec = 'Class A (3.3kV)') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_standard', targetStandard);
    formData.append('nominal_spec', nominalSpec);
    const res = await client.post('/cad/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // 5. Hyper-Local Testing Labs
  findLabs: async (latitude, longitude, productCategory = null, limit = 6) => {
    const params = { latitude, longitude, limit };
    if (productCategory && productCategory !== 'all') {
      params.product_category = productCategory;
    }
    const res = await client.get('/labs/nearest', { params });
    return res.data;
  },

  // 6. Gazette Amendments Feed
  getAmendments: async () => {
    const res = await client.get('/amendments/feed');
    return res.data;
  },

  // 7. Proactive Broadcast Amendment
  broadcastAmendment: async (amendmentId) => {
    const res = await client.post('/amendments/broadcast', null, {
      params: { amendment_id: amendmentId },
    });
    return res.data;
  },

  // 8. Reports Management
  getReports: async () => {
    const res = await client.get('/reports');
    return res.data;
  },

  saveReport: async (reportData) => {
    const res = await client.post('/reports', reportData);
    return res.data;
  },

  deleteReport: async (reportId) => {
    const res = await client.delete(`/reports/${reportId}`);
    return res.data;
  },

  // 9. Citizen Suspicious Product Report
  reportSuspicious: async (reportPayload) => {
    const res = await client.post('/reports/suspicious', reportPayload);
    return res.data;
  },

  // 10. Standards Catalog
  getStandardsCatalog: async () => {
    const res = await client.get('/standards');
    return res.data;
  },

  // 11. Upload BIS Standard PDF
  uploadStandardPDF: async (file, standardId, standardTitle) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('standard_id', standardId);
    formData.append('standard_title', standardTitle);
    const res = await client.post('/upload_standard', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
