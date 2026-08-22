import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const apiService = {
  // Get overview KPI metrics & main critical incident
  async getOverview(brand = 'All') {
    const response = await apiClient.get('/api/overview', {
      params: { brand: brand === 'All' ? undefined : brand },
    });
    return response.data;
  },

  // Get active and historical incidents
  async getIncidents(brand = 'All', status = 'All') {
    const response = await apiClient.get('/api/incidents', {
      params: {
        brand: brand === 'All' ? undefined : brand,
        status: status === 'All' ? undefined : status,
      },
    });
    return response.data;
  },

  // Get detail for a specific incident
  async getIncidentDetail(id) {
    const response = await apiClient.get(`/api/incidents/${id}`);
    return response.data;
  },

  // Get social posts (Live Feed) with filters & pagination
  async getPosts({ brand = 'All', platform = 'All', sentiment = 'All', topic = 'All', search = '', limit = 50, offset = 0 } = {}) {
    const params = {};
    if (brand && brand !== 'All') params.brand = brand;
    if (platform && platform !== 'All') params.platform = platform;
    if (sentiment && sentiment !== 'All') params.sentiment = sentiment;
    if (topic && topic !== 'All') params.topic = topic;
    if (search) params.search = search;
    params.limit = limit;
    params.offset = offset;

    const response = await apiClient.get('/api/posts', { params });
    return response.data;
  },

  // Get anomalies & emerging issues
  async getAnomalies(brand = 'All') {
    const response = await apiClient.get('/api/anomalies', {
      params: { brand: brand === 'All' ? undefined : brand },
    });
    return response.data;
  },

  // Get detailed analytics data
  async getAnalytics(brand = 'All') {
    const response = await apiClient.get('/api/analytics', {
      params: { brand: brand === 'All' ? undefined : brand },
    });
    return response.data;
  },

  // Get topic analysis
  async getTopics(brand = 'All') {
    const response = await apiClient.get('/api/topics', {
      params: { brand: brand === 'All' ? undefined : brand },
    });
    return response.data;
  },
};
