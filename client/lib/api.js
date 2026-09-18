import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 30000,
});

const scanRequest = async (method, path, payload, config = {}) => {
  try {
    const response = await api.request({ method, url: path, data: payload, ...config });
    return response.data?.data;
  } catch (error) {
    const message = error.response?.data?.message
      || (error.code === 'ECONNABORTED' ? 'The scan took too long. Please try again.' : '')
      || (error.code === 'ERR_NETWORK' ? 'The scanner service is unavailable.' : '')
      || error.message
      || 'Unable to complete the scan';
    const normalized = new Error(message);
    normalized.status = error.response?.status;
    throw normalized;
  }
};

export const scanURL = async (url) => {
  return scanRequest('post', '/api/scan-url', { url });
};

export const scanEmail = async (emailText) => {
  return scanRequest('post', '/api/scan-email', { emailText });
};

export const scanFile = async (filename) => {
  return scanRequest('post', '/api/scan-file', { filename });
};

export const scanIdentity = async (input) => {
  return scanRequest('post', '/api/scan-identity', { input });
};

export const scanFootprint = async (input) => {
  return scanRequest('post', '/api/scan-footprint', { input }, { timeout: 150000 });
};

export const getResults = async (limit = 20) => {
  try {
    const response = await api.get('/api/results', { params: { limit } });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getResultById = async (id) => {
  try {
    const response = await api.get(`/api/results/${id}`);
    return response.data.data;
  } catch (error) {
    // Preserve 404 so callers can show "not found"
    const status = error.response?.status;
    if (status === 404) {
      const err = new Error('Result not found');
      err.status = 404;
      throw err;
    }
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getStats = async () => {
  try {
    const response = await api.get('/api/stats');
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
