import React, { useState } from "react";
import { healthCheck, login, signup } from "../utils/server_queries";

export function LoginPage({ onLogin }) {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [emailOrUsername, setEmailOrUsername] = useState("");
	const [error, setError] = useState(null);
	const [isSignUp, setIsSignUp] = useState(false);

	const handleLogin = async (e) => {
		e.preventDefault();
		// simple client-side validation
		if (!emailOrUsername) return setError("Please enter your email/username.");
		if (!password) return setError("Please enter your password.");

		try {
			const { token, user } = await login(emailOrUsername, password);
			console.log('Logged in user:', user);
			console.log('Token:', token);

			setError(null);
			if (onLogin) onLogin(user);

		} catch (error) {
			setError(error.message);
		}
	};

	const handleSignup = async (e) => {
		e.preventDefault();

		if (!firstName) return setError("Please enter your first name.");
		if (!lastName) return setError("Please enter your last name.");
		if (!username) return setError("Please enter your username.");
		if (!email) return setError("Please enter your email.");
		if (!password) return setError("Please enter your password.");

		try {
			const { token, user } = await signup(firstName, lastName, username, email, password);
			console.log('Logged in user:', user);
			console.log('Token:', token);

			setError(null);
			if (onLogin) onLogin(user);

		} catch (error) {
			setError(error.message);
		}
	};

	const fillDemo = () => {
		setEmailOrUsername("demo@farmingdale.edu");
		setPassword("password");
		setError(null);
	};

	return (
		<div className="login-page" style={{ maxWidth: 420, margin: "48px auto", padding: 24, fontSize: 14 }}>
			
			{ isSignUp ? (
				<div>
					<h2 style={{ marginBottom: 12 }}>Sign Up</h2>

					<form onSubmit={handleSignup} className="login-form" aria-label="login form">

						<div style={{ display: "flex", gap:0, marginBottom: 12 }}>
							<label style={{ width: "100%", display: "grid"}} htmlFor="fname">
								First Name
								<input
									id="fname"
									type="name"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									placeholder="First Name"
									style={{ padding: 8}}
								/>
							</label>
							
							<label style={{ width: "100%", display: "grid" }} htmlFor="lname">
								Last Name
								<input
									id="lname"
									type="name"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									placeholder="Last Name"
									style={{ padding: 8 }}
								/>
							</label>

						</div>

						<div style={{ marginBottom: 12 }}>
							<label style={{ width: "100%", display: "grid" }} htmlFor="username">
								Username
								<input
									id="username"
									type="username"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									placeholder="Username"
									style={{ padding: 8 }}
								/>
							</label>
						</div>

						<div style={{ marginBottom: 12 }}>
							<label style={{ width: "100%", display: "grid" }} htmlFor="email">
								Email
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="Email"
									style={{ padding: 8, }}
								/>
							</label>
						</div>

						<div style={{ marginBottom: 12 }}>
							<label style={{ width: "100%", display: "grid" }} htmlFor="password">
								Password
								<input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Password"
									style={{ padding: 8}}
								/>
							</label>
						</div>

						{error && (
							<div role="alert" style={{ color: "#b00020", marginBottom: 12 }}>
								{error}
							</div>
						)}

						
						<button type="submit" style={{ padding: "8px 12px" }}>
							Sign up
						</button>
						
					</form>

					<p>Already have an account? <a style={{cursor: "pointer", color: "blue"}} onClick={ () => setIsSignUp(false)}>Log In</a></p>

				</div>
			) : (
				<div>
					<h2 style={{ marginBottom: 12 }}>Log In</h2>

					<form onSubmit={handleLogin} className="login-form" aria-label="login form">
						
						<div style={{ marginBottom: 12 }}>
							<label style={{ width: "100%", display: "grid" }} htmlFor="user">
								Username
								<input
									id="user"
									type="text"
									value={emailOrUsername}
									onChange={(e) => setEmailOrUsername(e.target.value)}
									placeholder="Email or Username"
									style={{ padding: 8}}
								/>
							</label>

						</div>

						<div style={{ marginBottom: 12 }}>
							<label style={{ width: "100%", display: "grid" }} htmlFor="password">
								Password
								<input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Password"
									style={{ padding: 8, }}
								/>
							</label>

						</div>

						{error && (
							<div role="alert" style={{ color: "#b00020", marginBottom: 12 }}>
								{error}
							</div>
						)}

						<div style={{ display: "flex", gap: 8 }}>
							<button type="submit" style={{ padding: "8px 12px" }}>
								Log in
							</button>

							<button type="button" onClick={fillDemo} style={{ padding: "8px 12px" }}>
								Fill demo
							</button>
						</div>
					</form>

					<p>Don't have an account? <a style={{cursor: "pointer", color: "blue"}} onClick={ () => setIsSignUp(true)}>Create an account</a></p>

				</div>
			)}
		</div>
	);
}