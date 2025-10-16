import { apiRequest } from '../api-request.js';

let currentUser = null;

const getCurrentUser = async () => {
    if (currentUser) return currentUser;
}

const login = async (emailOrUsername, password) => {
    const body = emailOrUsername.includes('@') ? { email: emailOrUsername, password } : { username: emailOrUsername, password };
    const data = await apiRequest('/api/auth/login', { method: 'POST', body });
    if (data.token) localStorage.setItem('token', data.token);
    currentUser = data.user;
    return data;
};

const signup = async (firstName, lastName, username, email, password) => {
    const data = await apiRequest('/api/auth/register', { method: 'POST', body: { firstName, lastName, username, email, password } });
    if (data.token) localStorage.setItem('token', data.token);
    currentUser = data.user;
    return data;
};

export { login, signup, getCurrentUser };