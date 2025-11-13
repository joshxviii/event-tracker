import React, { useState, useEffect, useRef } from "react";
import { get_event, update_event } from "../utils/requests/event";
import { useNotifications } from './ui/Notifications';
import EventMapWidget from "./ui/event-map-widget";
import { getCurrentUser } from "../utils/requests/user";

// Props: eventId (string), user (object), onSaved (fn), onCancel (fn)
export const EventEditPage = ({ eventId, onSaved, onCancel }) => {
    const [ user, setUser ] = useState(null);
    
    const fileInputRef = useRef(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(""); // yyyy-mm-dd
    const [startTime, setStartTime] = useState(""); // HH:MM
    const [endTime, setEndTime] = useState("");
    const [address, setAddress] = useState("");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [category, setCategory] = useState("social");
    const [repeat, setRepeat] = useState('none');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const notify = useNotifications();

    const handleImageSelect = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
        console.log("Selected image:", selectedFile);
            // TODO
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current.click(); // Programmatically click the hidden file input
    };

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

    // load event data when editing
    useEffect(() => {
        let mounted = true;
        if (!eventId) return;
        (async () => {
            try {
                setUser(await getCurrentUser());
                const ev = await get_event(eventId);
                if (!mounted || !ev) return;
                setTitle(ev.title || "");
                setDescription(ev.description || "");
                // parse ISO datetimes
                if (ev.startAt) {
                    const s = new Date(ev.startAt);
                    if (!isNaN(s.getTime())) {
                        const y = s.getFullYear();
                        const m = String(s.getMonth() + 1).padStart(2, '0');
                        const d = String(s.getDate()).padStart(2, '0');
                        setDate(`${y}-${m}-${d}`);
                        setStartTime(String(s.getHours()).padStart(2,'0') + ':' + String(s.getMinutes()).padStart(2,'0'));
                    }
                }
                if (ev.endAt) {
                    const e = new Date(ev.endAt);
                    if (!isNaN(e.getTime())) {
                        setEndTime(String(e.getHours()).padStart(2,'0') + ':' + String(e.getMinutes()).padStart(2,'0'));
                    }
                }
                setAddress(ev.location?.address || "");
                setLat(ev.location?.coordinates?.lat ? String(ev.location.coordinates.lat) : "");
                setLng(ev.location?.coordinates?.lng ? String(ev.location.coordinates.lng) : "");
                setCategory(ev.category || 'social');
                setRepeat(ev.repeat || 'none');
            } catch (err) {
                console.warn('Failed to load event for editing', err);
            }
        })();

        return () => { mounted = false; };
    }, [eventId]);

    const toISOStringFromDateAndTime = (d, t) => {
        if (!d || !t) return null;
        // d: YYYY-MM-DD, t: HH:MM
        const iso = new Date(`${d}T${t}`);
        if (isNaN(iso.getTime())) return null;
        return iso.toISOString();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!title || !date || !startTime || !endTime) {
            setError('Please fill in title, date, start and end times.');
            return;
        }

        const startAtISO = toISOStringFromDateAndTime(date, startTime);
        const endAtISO = toISOStringFromDateAndTime(date, endTime);

        if (!startAtISO || !endAtISO) {
            setError('Invalid date/time combination.');
            return;
        }

        const payload = {
            title,
            description,
            startAt: startAtISO,
            endAt: endAtISO,
            repeat,
            location: {
                address: address || 'N/A',
                coordinates: { lat: lat ? Number(lat) : null, lng: lng ? Number(lng) : null }
            },
            organizer: user,
            category,
            isPublic: true,
        };

        if (!eventId) {
            setError('No event selected to edit');
            return;
        }

        setLoading(true);
        try {
            await update_event(eventId, payload);
            setSuccess('Event updated');
            notify.push({ type: 'success', message: 'Event updated' });
            if (onSaved) onSaved();
        } catch (err) {
            const msg = err.message || 'Failed to update event';
            setError(msg);
            notify.push({ type: 'error', message: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>

            <div className="formContainer" >
                <h2 className="blueColor">Edit Event</h2>

                <form onSubmit={handleSubmit} className="formGrid" aria-label="Create event form">

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        style={{ display: 'none' }}
                    />
                    <button onClick={handleButtonClick}>
                        Update Image
                    </button>

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
                            <div style={{ fontSize: 14, marginBottom: 6 }}>Repeat</div>
                            <select className="input" value={repeat} onChange={(e) => setRepeat(e.target.value)}>
                                <option value="none">Does not repeat</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="annual">Annually</option>
                            </select>
                        </div>
                    </div>

                    <label className="labelStyle">
                        <div style={{ width: '100%' }}>
                            <div style={{ fontSize: 14, marginBottom: 6 }}>Address</div>
                            <input className="input" id="address" value={address} maxLength={200} onChange={(e) => setAddress(e.target.value)} placeholder="Street, city, state" />
                        </div>
                    </label>

                    <EventMapWidget lat={lat} lng={lng}/>

                    {error && <div className="formError">{error}</div>}
                    {success && <div className="formSuccess">{success}</div>}

                    <div className="formActions" style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                        <button type="button" onClick={() => onCancel ? onCancel() : null}>Cancel</button>
                    </div>
                </form>         

            </div>
        </div>
    );
};