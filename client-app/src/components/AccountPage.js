import React from "react";
import { useNotifications } from './ui/Notifications';
import { getCurrentUser } from "../utils/requests/user";

// Simple, view-only account page for displaying account information
export const AccountPage = ({  }) => {
    const notify = useNotifications();
    const user = getCurrentUser();
    if (user) return (
        <div style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
            <h2>Account</h2>

            <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                <div>
                    <div style={{ fontSize: 12, color: '#666' }}>Name</div>
                    <div style={{ fontSize: 16 }}>{user.firstName} {user.lastName}</div>
                </div>

                <div>
                    <div style={{ fontSize: 12, color: '#666' }}>Username</div>
                    <div style={{ fontSize: 16 }}>{user.username}</div>
                </div>

                <div>
                    <div style={{ fontSize: 12, color: '#666' }}>Email</div>
                    <div style={{ fontSize: 16 }}>{user.email}</div>
                </div>
            </div>

            <div style={{ marginTop: 18 }}>
                <button
                    onClick={() => notify.push({ type: 'info', message: 'Edit not implemented' })}
                    style={{ padding: '8px 12px' }}
                >
                    Edit account
                </button>
            </div>
        </div>
    );
};