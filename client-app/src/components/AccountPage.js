import React from "react";

// Simple, view-only account page for displaying account information
export const AccountPage = ({ user = { username: 'Demo', email: 'demo@farmingdale.edu' } }) => {
    if (user) return (
        <div className="formContainer">
            <h2 className="blueColor">Account Information</h2>
            <label className="labelStyle">
                <div style={{ gap: 8, width: '100%' }}>
                    <div style={{ fontSize: 15, color: '#0008b1', marginBottom: 6 }}>Name:</div>
                    <div style={{ fontSize: 16 }}>{user.firstName} {user.lastName}</div>
                </div>
            </label>

            <label className="labelStyle">
                <div style={{ gap: 8, width: '100%' }}>
                    <div style={{ fontSize: 20, marginBottom: 20 }}>   </div>
                    <div style={{ fontSize: 15, color: '#0008b1', marginBottom: 6 }}>Username:</div>
                    <div style={{ fontSize: 16 }}>{user.username}</div>
                </div>
            </label>

            <label className="labelStyle">
                <div style={{ gap: 8, width: '100%' }}>
                    <div style={{ fontSize: 20, marginBottom: 20 }}>   </div>
                    <div style={{ fontSize: 15, color: '#0008b1', marginBottom: 6 }}>Email:</div>
                    <div style={{ fontSize: 16 }}>{user.email}</div>
                </div>
            </label>

            <div style={{ marginTop: 18 }}>
                <button
                    onClick={() => alert('Edit not implemented')}
                    style={{ padding: '8px 12px' }}>
                    Edit account
                </button>
            </div>
        </div>
    );
};