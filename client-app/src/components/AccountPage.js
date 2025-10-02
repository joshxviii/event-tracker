import React from "react";

// Simple, view-only account page for displaying account information
export const AccountPage = ({ user = { name: 'Demo User', email: 'demo@farmingdale.edu' } }) => {
    return (
        <div style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
            <h2>Account</h2>

            <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                <div>
                    <div style={{ fontSize: 12, color: '#666' }}>Name</div>
                    <div style={{ fontSize: 16 }}>{user.name}</div>
                </div>

                <div>
                    <div style={{ fontSize: 12, color: '#666' }}>Email</div>
                    <div style={{ fontSize: 16 }}>{user.email}</div>
                </div>
            </div>

            <div style={{ marginTop: 18 }}>
                <button
                    onClick={() => alert('Edit not implemented')}
                    style={{ padding: '8px 12px' }}
                >
                    Edit account
                </button>
            </div>
        </div>
    );
};