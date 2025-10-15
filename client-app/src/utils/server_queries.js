const server = 'http://localhost:10255';

async function apiRequest(path, { method = 'GET', body = null, requireAuth = false } = {}) {
    const headers = { 'Content-Type': 'application/json' };

    if (requireAuth) {
        const token = localStorage.getItem('token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${server}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    });

    if (!res.ok) {
        let errorMessage = `${method} ${path} failed`;
        try {
            const err = await res.json();
            errorMessage = err.message || errorMessage;
        } catch (e) {/* igonre */}
        const err = new Error(errorMessage);
        err.status = res.status;
        throw err;
    }

    try {
        return await res.json();
    } catch (e) {
        return res;
    }
}



// region EVENT REQUESTS
const create_event = async (event_details) => await apiRequest('/api/events', { method: 'POST', body: event_details});
// endregion



// region USER REQUESTS
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
// endregion


// region OTHER REQUESTS
const healthCheck = async () => apiRequest('/api/health');
// endregion

export { create_event, login, signup, healthCheck };