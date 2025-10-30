import React, { useState, useEffect } from "react";
import { create_event } from "../utils/requests/event";

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

    const geocodeAddress = async () => {
        setError(null);
        if (!address || address.trim() === "") {
            setLat(""); setLng("");
            return;
        }

        const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        if (!key) return;

        try {
            const resp = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`
            );
            const data = await resp.json();
            if (data.status === "OK" && data.results && data.results[0]) {
                const loc = data.results[0].geometry.location;
                setLat(String(loc.lat));
                setLng(String(loc.lng));
            }
            else {
                setLat(""); setLng("");
            }
        } catch (e) {
            console.warn('Geocode failed', e);
        }
    };

    useEffect(() => {
        const t = setTimeout(() => {
            geocodeAddress();
        }, 400);
        return () => clearTimeout(t);
    }, [address]);

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
            await create_event(payload);
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
        <div className="formContainer">
            <h2 className="blueColor">Create an Event</h2>

            <form onSubmit={handleSubmit} className="formGrid" aria-label="Create event form">
                <label className="labelStyle">
                    <div style={{ width: '100%' }}>
                        <div style={{ fontSize: 14, marginBottom: 6 }}>Title</div>
                        <input className="input" id="title" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
                    </div>
                </label>

                <label className="labelStyle">
                    <div style={{ width: '100%' }}>
                        <div style={{ fontSize: 14, marginBottom: 6 }}>Description</div>
                        <textarea className="input" id="description" value={description} maxLength={800} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the event..." />
                    </div>
                </label>

                <div className="twoCols">
                    <label className="labelStyle" style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, marginBottom: 6 }}>Date</div>
                        <input className="input" type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </label>

                    <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                        <label className="labelStyle" style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, marginBottom: 6 }}>Start</div>
                            <input className="input" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                        </label>
                        <label className="labelStyle" style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, marginBottom: 6 }}>End</div>
                            <input className="input" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                        </label>
                    </div>
                </div>

                <label className="labelStyle">
                    <div style={{ width: '100%' }}>
                        <div style={{ fontSize: 14, marginBottom: 6 }}>Address</div>
                        <input className="input" id="address" value={address} maxLength={200} onChange={(e) => setAddress(e.target.value)} placeholder="Street, city, state" />
                    </div>
                </label>

                <div className="twoCols">
                    <label className="labelStyle" style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, marginBottom: 6 }}>Category</div>
                        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="social">Social</option>
                            <option value="volunteer">Volunteer</option>
                            <option value="market">Market</option>
                            <option value="other">Other</option>
                        </select>
                    </label>

                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, marginBottom: 6 }}>Coordinates</div>
                        <div className="coordsRow">
                            <input className="input smallInput" readOnly value={lat || ''} placeholder="lat" />
                            <input className="input smallInput" readOnly value={lng || ''} placeholder="lng" />
                        </div>
                        <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>Coordinates are auto-filled from the address when available.</div>
                    </div>
                </div>

                {error && <div className="formError">{error}</div>}
                {success && <div className="formSuccess">{success}</div>}

                <div className="formActions">
                    <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Event'}</button>
                </div>
            </form>         
        </div>
    );
};