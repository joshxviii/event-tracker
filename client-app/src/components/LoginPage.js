import React, { useState } from "react";
import { login } from "../utils/users";

export function LoginPage({ onLogin }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		// simple client-side validation
		if (!email) return setError("Please enter your email.");
		if (!password) return setError("Please enter your password.");

		try {
			const { token, user } = await login(email, password);
			console.log('Logged in user:', user);
			console.log('Token:', token);

			setError(null);
			if (onLogin) onLogin({ email });

		} catch (error) {
			setError(error.message);
		} finally {
			//setLoading(false);
		}
	};


	const fillDemo = () => {
		setEmail("demo@farmingdale.edu");
		setPassword("password");
		setError(null);
	};

	return (
		<div className="login-page" style={{ maxWidth: 420, margin: "48px auto", padding: 24 }}>
			<h2 style={{ marginBottom: 12 }}>Sign in</h2>

			<form onSubmit={handleSubmit} className="login-form" aria-label="login form">
				<div style={{ marginBottom: 12 }}>
					<label style={{ display: "block", fontSize: 14, marginBottom: 6 }} htmlFor="email">
						Email
					</label>
					<input
						id="email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="you@farmingdale.edu"
						style={{ width: "100%", padding: 8, fontSize: 14 }}
					/>
				</div>

				<div style={{ marginBottom: 12 }}>
					<label style={{ display: "block", fontSize: 14, marginBottom: 6 }} htmlFor="password">
						Password
					</label>
					<input
						id="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Enter your password"
						style={{ width: "100%", padding: 8, fontSize: 14 }}
					/>
				</div>

				{error && (
					<div role="alert" style={{ color: "#b00020", marginBottom: 12 }}>
						{error}
					</div>
				)}

				<div style={{ display: "flex", gap: 8 }}>
					<button type="submit" style={{ padding: "8px 12px" }}>
						Sign in
					</button>

					<button type="button" onClick={fillDemo} style={{ padding: "8px 12px" }}>
						Fill demo
					</button>
				</div>
			</form>
		</div>
	);
}