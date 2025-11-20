import React, { useEffect, useState } from "react";
import { useNotifications } from './ui/Notifications';
import { getCurrentUser, updateCurrentUser } from "../utils/requests/user";
import { uploadProfileImage } from '../utils/requests/storage';
import { Loading } from "./ui/loading";

// Editable account page: allows updating name, username, email and profile picture.
export const AccountPage = () => {
    const [user, setUser] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [profilePreview, setProfilePreview] = useState(null);
    const [profileFile, setProfileFile] = useState(null);
    const [saving, setSaving] = useState(false);

    const notify = useNotifications();

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const u = await getCurrentUser();
                if (!mounted) return;
                setUser(u || null);
                setFirstName(u?.firstName || '');
                setLastName(u?.lastName || '');
                setUsername(u?.username || '');
                setEmail(u?.email || '');
                setProfilePreview(u?.profilePicture || null);
            } catch (err) {
                console.error('Failed to load current user', err);
                if (notify?.push) notify.push({ type: 'error', message: 'Failed to load account data' });
            }
        })();
        return () => { mounted = false; };
    }, []);

    const handleFileChange = (ev) => {
        const f = ev.target.files && ev.target.files[0];
        setProfileFile(f || null);
        if (f) {
            const url = URL.createObjectURL(f);
            setProfilePreview(url);
        }
    };

    // use exported updateCurrentUser from requests/user.js

    const handleSave = async (ev) => {
        ev.preventDefault();
        if (!user) return;
        setSaving(true);
        try {
            let imageUrl = user.profilePicture || null;
            if (profileFile) imageUrl = await uploadProfileImage(profileFile, user._id);

            const body = { firstName, lastName, username, email, profilePicture: imageUrl };
            const updated = await updateCurrentUser(body);
            setUser(updated || { ...user, ...body });
            if (notify?.push) notify.push({ type: 'success', message: 'Account updated' });
        } catch (err) {
            console.error('Update failed', err);
            if (notify?.push) notify.push({ type: 'error', message: `'Update failed: ${err.message}` || 'Update failed' });
        } finally {
            setSaving(false);
        }
    };

    if (!user) return (
        <div className="formContainer">
            <Loading/>
            <p>Loading account...</p>
        </div>
    );

    return (
        <div className="formContainer" style={{ gap: 16, display: 'flex', flexDirection: 'column' }}>
            <h2 className="blueColor">Account Information</h2>

            <form onSubmit={handleSave} style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div>
                        {profilePreview ? (
                            <img src={profilePreview} className="profilePicture big" />
                        ) : (
                            <div aria-hidden className="nullPicture big">{(username || 'U').charAt(0).toUpperCase()}</div>
                        )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ display: 'flex', flexDirection: 'column', fontFamily:"sans-serif"}}>
                            Profile Picture
                            <input type="file" accept="image/*" onChange={handleFileChange} />
                        </label>
                        <div style={{ fontSize: 12, color: '#666' }}>Max 5MB. JPEG/PNG.</div>
                    </div>
                </div>

                <label>
                    <div style={{ fontSize: 12, color: '#666' }}>First name</div>
                    <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </label>

                <label>
                    <div style={{ fontSize: 12, color: '#666' }}>Last name</div>
                    <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </label>

                <label>
                    <div style={{ fontSize: 12, color: '#666' }}>Username</div>
                    <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>

                <label>
                    <div style={{ fontSize: 12, color: '#666' }}>Email</div>
                    <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>

                <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                </div>
            </form>
        </div>
    );
};