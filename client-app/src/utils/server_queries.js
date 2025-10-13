const server = 'http://localhost:10255';

// Attempt to login
const login = async (emailOrUsername, password) => {
    try {
        const response = await fetch(server+'/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailOrUsername.includes('@') ? { email: emailOrUsername, password } : { username: emailOrUsername, password } ),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        const { token, user } = data;

        localStorage.setItem('token', token);

        return { token, user };

    } catch (error) {
        console.error('Login error:', error.message);
        throw error;
    }
};

// Attempt to signup
const signup = async (firstName, lastName, username, email, password) => {
    try {
        const response = await fetch(server+'/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firstName, lastName, username, email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Signup failed');
        }

        const data = await response.json();
        const { token, user } = data;

        localStorage.setItem('token', token);

        return { token, user };

    } catch (error) {
        console.error('Signup error:', error.message);
        throw error;
    }
};

// Health Check
const healthCheck = async () => {
    try {
        const response = await fetch(server+'/api/health');
        console.log('Health check response:', response);
    }
    catch (error) {
        throw error;
    }
};

export { login, signup, healthCheck };