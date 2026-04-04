import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
});

export const scanURL = async (url) => {
  try {
    const response = await api.post('/api/scan-url', { url });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const scanEmail = async (emailText) => {
  try {
    const response = await api.post('/api/scan-email', { emailText });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const scanFile = async (filename) => {
  try {
    const response = await api.post('/api/scan-file', { filename });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const scanIdentity = async (input) => {
  try {
    const response = await api.post('/api/scan-identity', { input });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const scanFootprint = async (input) => {
  try {
    const response = await api.post('/api/scan-footprint', { input }, {
      timeout: 150000 // 150 seconds for Sherlock
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
