// Attempt to login
export const login = async (email, password) => {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        const { token, user } = data;

        // Store the token in localStorage
        localStorage.setItem('token', token);

        return { token, user };

    } catch (error) {
        console.error('Login error:', error.message);
        throw error;
    }
};