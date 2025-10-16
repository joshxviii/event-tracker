import React, { useState } from "react";
import { create_event } from "../utils/requests/event";
import { getCurrentUser } from "../utils/requests/user";

// Simple event creation page with a minimal form
export const EventCreationPage = ({ user }) => {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [address, setAddress] = useState("");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [category, setCategory] = useState("social");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!title || !date || !startTime || !endTime) {
            setError('Please fill in title, date, start and end times.');
            return;
        }

        const payload = {
            title,
            description,
            date,
            startTime,
            endTime,
            location: {
                address: address || 'N/A',
                coordinates: { lat: lat ? Number(lat) : null, lng: lng ? Number(lng) : null }
            },
            organizer: user,
            category,
            isPublic: true,
        };

        setLoading(true);
        try {
            const res = await create_event(payload);
            setSuccess('Event created');
            // clear form
            setTitle(''); setDescription(''); setDate(''); setStartTime(''); setEndTime(''); setAddress(''); setLat(''); setLng('');
        } catch (err) {
            setError(err.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
            <h2>Event Creation</h2>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
                <label>
                    Title
                    <input value={title} maxLength={50} onChange={(e) => setTitle(e.target.value)} />
                </label>

                <label>
                    Description
                    <textarea value={description} maxLength={200} onChange={(e) => setDescription(e.target.value)} />
                </label>

                <div style={{ display: 'flex', gap: 8 }}>
                    <label style={{ flex: 1 }}>
                        Date
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </label>
                    <label>
                        Start
                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </label>
                    <label>
                        End
                        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </label>
                </div>

                <label>
                    Address
                    <input value={address} maxLength={200} onChange={(e) => setAddress(e.target.value)} />
                </label>

                <div style={{ display: 'flex', gap: 8 }}>
                    <label>
                        Lat
                        <input value={lat} onChange={(e) => setLat(e.target.value)} />
                    </label>
                    <label>
                        Lng
                        <input value={lng} onChange={(e) => setLng(e.target.value)} />
                    </label>
                </div>

                <label>
                    Category
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="social">Social</option>
                        <option value="volunteer">Volunteer</option>
                        <option value="market">Market</option>
                        <option value="other">Other</option>
                    </select>
                </label>

                {error && <div style={{ color: 'red' }}>{error}</div>}
                {success && <div style={{ color: 'green' }}>{success}</div>}

                <div>
                    <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Event'}</button>
                </div>
            </form>
        </div>
    );
};