import { apiRequest } from '../api-request.js';

const healthCheck = async () => apiRequest('/api/health');

export { healthCheck };