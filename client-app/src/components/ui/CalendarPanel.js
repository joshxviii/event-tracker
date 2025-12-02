import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getCurrentUser } from "../../utils/requests/user";
import { get_event } from "../../utils/requests/event";
import { useNavigate } from "react-router-dom";

/**
 * CalendarPanel
 * - Click "Sign in with Google" to authorize Calendar read access
 * - Lists the next 30 days of events from the user's primary calendar
 * - Also displays user's attended and favorite events
 * - Click any event to navigate to the event page
 */
export default function CalendarPanel() {
    const [accessToken, setAccessToken] = useState(null);
    const [events, setEvents] = useState([]);
    const tokenClientRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [gisReady, setGisReady] = useState(false);
    const navigate = useNavigate();

    // Load Google Identity Services and restore saved token if available
    useEffect(() => {
        const id = "gis-script";
        const existingScript = document.getElementById(id);
        
        if (existingScript) {
            // Script already loaded, set ready and restore token
            setGisReady(true);
            try {
                const savedToken = localStorage.getItem('googleAccessToken');
                if (savedToken) {
                    setAccessToken(savedToken);
                }
            } catch (e) {
                console.warn('Failed to restore Google token from storage:', e);
            }
            return;
        }
        
        // Create and load the script
        const s = document.createElement("script");
        s.id = id;
        s.src = "https://accounts.google.com/gsi/client";
        s.async = true;
        s.defer = true;
        s.onload = () => {
            setGisReady(true);
            // After GIS loads, try to restore saved token
            try {
                const savedToken = localStorage.getItem('googleAccessToken');
                if (savedToken) {
                    setAccessToken(savedToken);
                }
            } catch (e) {
                console.warn('Failed to restore Google token from storage:', e);
            }
        };
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
                        // Save token to localStorage for next time
                        try {
                            localStorage.setItem('googleAccessToken', resp.access_token);
                        } catch (e) {
                            console.warn('Failed to save Google token:', e);
                        }
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

            const googleEvents = (data.items || []).map((e) => ({
                id: e.id,
                title: e.summary || "(no title)",
                start: e.start?.dateTime || e.start?.date, // all-day if date
                end: e.end?.dateTime || e.end?.date,
                source: 'google'
            }));

            // Fetch user's attended and favorite events
            const currentUser = await getCurrentUser();
            const userEvents = [];

            if (currentUser) {
                const attendedIds = Array.isArray(currentUser.attendedEvents) ? currentUser.attendedEvents : [];
                const favIds = Array.isArray(currentUser.favoriteEvents) ? currentUser.favoriteEvents : [];
                const allUserEventIds = [...new Set([...attendedIds, ...favIds])]; // deduplicate

                for (const eventId of allUserEventIds) {
                    try {
                        const event = await get_event(eventId);
                        if (event && event.startAt && event.endAt) {
                            userEvents.push({
                                id: event._id,
                                title: event.title || "(no title)",
                                start: event.startAt,
                                end: event.endAt,
                                source: 'app',
                                backgroundColor: '#155dfc',
                                borderColor: '#0d47a1',
                                textColor: '#ffffff'
                            });
                        }
                    } catch (err) {
                        console.warn(`Failed to fetch event ${eventId}:`, err);
                    }
                }
            }

            // Combine Google Calendar events and user's app events
            setEvents([...googleEvents, ...userEvents]);
        } catch (err) {
            console.error("Calendar fetch error:", err);
            alert("Failed to load Google Calendar events. See console for details.");
        } finally {
            setLoading(false);
        }
    };

    // Handle event click to navigate to event page
    const handleEventClick = (info) => {
        const event = info.event;
        // Only navigate if it's an app event (has _id or source is 'app')
        if (event.extendedProps?.source === 'app') {
            navigate(`/event/${event.id}`);
        }
    };

    useEffect(() => {
        if (accessToken && gisReady) fetchEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken, gisReady]);

    return (
        <div className="calendarBox">
            <div className="calendarHeader">
                <h3>My Google Calendar</h3>
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
                <p style={{ marginTop: 8 }}>
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
                        height="27em"
                        events={events}
                        eventClick={handleEventClick}
                    />
                </div>
            )}
        </div>
    );
}
