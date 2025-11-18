export const server = 'https://cae-event-tracker-backend.vercel.app';

export async function apiRequest(path, { method = 'GET', body = null, requireAuth = false } = {}) {
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