import { apiRequest } from '../api-request.js';

/* Auth Routes */
const getCurrentUser = async () => {
    const currentUser = await apiRequest('/api/auth/me', { requireAuth: true });
    return currentUser;
}

const updateCurrentUser = async (userDetails) => {
    const data = await apiRequest('/api/auth/me', { method: 'PUT', body: userDetails, requireAuth: true });
    return data;
}

const login = async (emailOrUsername, password) => {
    const body = emailOrUsername.includes('@') ? { email: emailOrUsername, password } : { username: emailOrUsername, password };
    const data = await apiRequest('/api/auth/login', { method: 'POST', body });
    if (data.token) localStorage.setItem('token', data.token);
    return data;
};

const signup = async (firstName, lastName, username, email, password) => {
    const data = await apiRequest('/api/auth/register', { method: 'POST', body: { firstName, lastName, username, email, password } });
    if (data.token) localStorage.setItem('token', data.token);
    return data;
};


/* User Routes */
const getUser = async (userId) => await apiRequest(`/api/users/${userId}`);

export { login, signup, getCurrentUser, updateCurrentUser, getUser };