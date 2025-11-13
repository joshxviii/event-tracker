import React, { use, useEffect, useState } from "react";
import { useNotifications } from './ui/Notifications';
import { getCurrentUser } from "../utils/requests/user";

// Simple, view-only account page for displaying account information
export const AccountPage = ({  }) => {
    const [ user, setUser ] = useState(null);

    const notify = useNotifications();
    useEffect(() => {
        (async () => {
            setUser(await getCurrentUser());
        })();
    }, [user]);

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
                    style={{ padding: '8px 12px' }}
                >
                    Edit account
                </button>
            </div>
        </div>
    );
};