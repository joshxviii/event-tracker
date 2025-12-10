import { apiRequest } from '../api-request.js';

/* Auth Routes */
const getCurrentUser = async () => {
    const isLogged = typeof localStorage !== 'undefined' && localStorage.getItem('isLoggedIn') === '1';
    if (!isLogged) return null;

    try {
        const currentUser = await apiRequest('/api/auth/me', { requireAuth: true });
        return currentUser;
    } catch (err) {
        localStorage.removeItem('isLoggedIn');
        return null;
    }
}

const updateCurrentUser = async (userDetails) => {
    const data = await apiRequest('/api/auth/me', { method: 'PUT', body: userDetails, requireAuth: true });
    return data;
}

const login = async (emailOrUsername, password) => {
    const body = emailOrUsername.includes('@') ? { email: emailOrUsername, password } : { username: emailOrUsername, password };
    const data = await apiRequest('/api/auth/login', { method: 'POST', body });
    if (data.token) localStorage.setItem('token', data.token);
    if (data.token) localStorage.setItem('isLoggedIn', '1');
    try { window.dispatchEvent(new Event('session-changed')); } catch (e) {}
    return data;
};

const signup = async (firstName, lastName, username, email, password) => {
    const data = await apiRequest('/api/auth/register', { method: 'POST', body: { firstName, lastName, username, email, password } });
    if (data.token) localStorage.setItem('token', data.token);
    if (data.token) localStorage.setItem('isLoggedIn', '1');
    try { window.dispatchEvent(new Event('session-changed')); } catch (e) {}
    return data;
};


/* User Routes */
const getUser = async (userId) => await apiRequest(`/api/users/${userId}`);

export { login, signup, getCurrentUser, updateCurrentUser, getUser };