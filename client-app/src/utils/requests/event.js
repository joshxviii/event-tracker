import { apiRequest } from '../api-request.js';

const create_event = async (event_details) => await apiRequest('/api/events', { method: 'POST', body: event_details});
const get_events = async () => await apiRequest('/api/events');
const get_event = async (eventId) => await apiRequest(`/api/events/${eventId}`);
const get_events_by_user = async (userId) => await apiRequest(`/api/events/organizer/${userId}`);
const update_event = async (eventId, event_details) => await apiRequest(`/api/events/${eventId}`, { method: 'PUT', body: event_details});
const delete_event = async (eventId) => await apiRequest(`/api/events/${eventId}`, { method: 'DELETE'});

export { create_event, get_events, get_event, get_events_by_user, update_event, delete_event };
