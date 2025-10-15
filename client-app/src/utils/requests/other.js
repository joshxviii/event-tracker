import apiRequest from '../api-rquest.js';

const healthCheck = async () => apiRequest('/api/health');

export { healthCheck };