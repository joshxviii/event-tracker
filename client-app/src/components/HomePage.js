import React, { useEffect, useState } from "react";
import { EventWidget } from "./ui/event-widget";
import MapWidget from "./ui/map-widget";
import { getEvents } from "../utils/events";

export const HomePage = ( { onEventClick } ) => {
    const [events, setEvents] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const parsed = await getEvents();
                if (!mounted) return;
                setEvents(parsed);
            } catch (e) {
                console.warn('Failed to load DemoData.csv:', e.message || e);
                if (!mounted) return;
                setError(e.message || String(e));
                setEvents([]);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div>
            <h2 class="indent">Home Page</h2>

            <div class="mainContent">
                {loading && <div>Loading demo events...</div>}
                
                <div class="mapContainer container">
                    <div>
                    <MapWidget
                        events = {!loading ? events : null}
                    />
                    </div>
                    <h3> [Selected Event Info Here] </h3>
                </div>

                <div class="eventContainer container">
                    {!loading && error && <div className="error">Could not load demo data: {error}</div>}

                    {!loading && events.length > 0 ? (
                        events.map((e, i) => (
                            <EventWidget
                                eventId={e.id}
                                onClick={onEventClick}
                            />
                        ))
                    ) : (<div />)}
                </div>
            </div>

        </div>
    );
}