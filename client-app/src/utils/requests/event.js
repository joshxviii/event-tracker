import { apiRequest } from '../api-request.js';

const create_event = async (event_details, userId) => await apiRequest('/api/events', { method: 'POST', body: event_details, userId});
const get_events = async () => await apiRequest('/api/events');
const get_event = async (eventId) => await apiRequest(`/api/events/${eventId}`);
const update_event = async (eventId, event_details) => await apiRequest(`/api/events/${eventId}`, { method: 'PUT', body: event_details, requireAuth: true});
const delete_event = async (eventId) => await apiRequest(`/api/events/${eventId}`, { method: 'DELETE', requireAuth: true});

export { create_event, get_events, get_event, update_event, delete_event };
