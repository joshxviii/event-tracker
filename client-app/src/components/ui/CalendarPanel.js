import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

/**
 * CalendarPanel
 * - Click "Sign in with Google" to authorize Calendar read access
 * - Lists the next 30 days of events from the user's primary calendar
 * - Renders them on FullCalendar (month/week/day views)
 */
export default function CalendarPanel() {
    const [accessToken, setAccessToken] = useState(null);
    const [events, setEvents] = useState([]);
    const tokenClientRef = useRef(null);
    const [loading, setLoading] = useState(false);

    // Load Google Identity Services
    useEffect(() => {
        const id = "gis-script";
        if (document.getElementById(id)) return; // already loaded
        const s = document.createElement("script");
        s.id = id;
        s.src = "https://accounts.google.com/gsi/client";
        s.async = true;
        s.defer = true;
        document.body.appendChild(s);
        return () => {
            // don't remove script to avoid reloading during hot-reload
        };
    }, []);

    const ensureTokenClient = () => {
        // global `google` comes from GIS script
        // eslint-disable-next-line no-undef
        if (!google?.accounts?.oauth2) {
            alert("Google Identity Services not loaded yet. Try again in a moment.");
            return null;
        }
        if (!tokenClientRef.current) {
            // eslint-disable-next-line no-undef
            tokenClientRef.current = google.accounts.oauth2.initTokenClient({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                scope: "https://www.googleapis.com/auth/calendar.readonly",
                callback: (resp) => {
                    if (resp && resp.access_token) {
                        setAccessToken(resp.access_token);
                    }
                }
            });
        }
        return tokenClientRef.current;
    };

    const handleAuthorize = () => {
        const tc = ensureTokenClient();
        if (!tc) return;
        tc.requestAccessToken(); // pop-up
    };

    const fetchEvents = async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            // Pull next 30 days of events
            const timeMin = new Date().toISOString();
            const timeMax = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
            const params = new URLSearchParams({
                maxResults: "2500",
                singleEvents: "true",
                orderBy: "startTime",
                timeMin,
                timeMax
            });
            const res = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const data = await res.json();

            const fcEvents = (data.items || []).map((e) => ({
                id: e.id,
                title: e.summary || "(no title)",
                start: e.start?.dateTime || e.start?.date, // all-day if date
                end: e.end?.dateTime || e.end?.date
            }));

            setEvents(fcEvents);
        } catch (err) {
            console.error("Calendar fetch error:", err);
            alert("Failed to load Google Calendar events. See console for details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken) fetchEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken]);

    return (
        <div className="calendarBox">
            <div className="calendarHeader">
                <h3 style={{fontFamily:"sans-serif"}}>My Google Calendar</h3>
                <div className="calendarActions">
                    {!accessToken ? (
                        <button onClick={handleAuthorize}>Sign in with Google</button>
                    ) : (
                        <button onClick={fetchEvents} disabled={loading}>
                            {loading ? "Refreshing..." : "Refresh"}
                        </button>
                    )}
                </div>
            </div>

            {!accessToken ? (
                <p style={{ marginTop: 8, fontFamily:"sans-serif", color:'var(--text-color)'}}>
                    Connect your Google account to display your next 30 days of events.
                </p>
            ) : (
                <div className="calendarContainer">
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "dayGridMonth,timeGridWeek,timeGridDay"
                        }}
                        height="60vh"
                        events={events}
                    />
                </div>
            )}
        </div>
    );
}
