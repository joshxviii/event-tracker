import { apiRequest } from '../api-request.js';

const create_review = async (review_details, eventId) => await apiRequest(`/api/events/${eventId}/reviews`, { method: 'POST', body: review_details});
const get_reviews = async (eventId) => await apiRequest(`/api/events/${eventId}/reviews`);
const delete_review = async (eventId, reviewId) => await apiRequest(`/api/events/${eventId}/reviews/${reviewId}`, { method: 'DELETE'});

export { create_review, get_reviews, delete_review };