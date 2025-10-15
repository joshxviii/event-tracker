import { apiRequest } from '../api-request.js';

const create_review = async (eventId, review_details) => await apiRequest(`/api/events/${eventId}/reviews`, { method: 'POST', body: review_details, requireAuth: true});
const get_reviews = async (eventId) => await apiRequest(`/api/events/${eventId}/reviews`);

export { create_review, get_reviews };