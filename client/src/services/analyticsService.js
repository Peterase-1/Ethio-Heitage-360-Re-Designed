import axios from 'axios';

const API_URL = '/api/analytics';

const getSystemAnalytics = async () => {
  try {
    const response = await axios.get(`${API_URL}/system`);
    return response.data;
  } catch (error) {
    console.error('Error fetching system analytics', error);
    throw error;
  }
};

const getMuseumAnalytics = async (museumId) => {
  try {
    const response = await axios.get(`${API_URL}/museum/${museumId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching museum analytics', error);
    throw error;
  }
};

const getVisitorAnalytics = async () => {
  try {
    const response = await axios.get(`${API_URL}/visitor`);
    return response.data;
  } catch (error) {
    console.error('Error fetching visitor analytics', error);
    throw error;
  }
};

const trackEvent = async (eventData) => {
  try {
    const response = await axios.post(`${API_URL}/track`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error tracking event', error);
    throw error;
  }
};

export default {
  getSystemAnalytics,
  getMuseumAnalytics,
  getVisitorAnalytics,
  trackEvent,
};
