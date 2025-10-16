import React, { useEffect, useState } from "react";
import { EventWidget } from "./ui/event-widget";
import MapWidget from "./ui/map-widget";
import { get_events } from "../utils/requests/event";

export const HomePage = ( { onEventClick, onEventCreationClick, onEventManageClick } ) => {
    const [events, setEvents] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (!mounted) return;
                setEvents(await get_events());
            } catch (e) {
                if (!mounted) return;
                setError(e.message || String(e));
                setEvents([]);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () =>  mounted = false;
    }, []);

    return (
        <div>
            <h2>Home Page</h2>

            <div class="buttonGroup">
                <button onClick={onEventCreationClick}>Create New Event</button>
                <button onClick={onEventManageClick}>Manage My Events</button>
            </div>


            <div class="mainContent">
                {loading && <div>Loading event data...</div>}
                
                <div class="mapContainer container">
                    <div>
                    <MapWidget
                        events = {!loading ? events : null}
                    />
                    </div>
                    <h3> [Selected Event Info Here] </h3>
                </div>

                <div class="eventContainer container">
                    {!loading && error && <div className="error">Could not load event data: {error}</div>}

                    {!loading && events.length > 0 ? (
                        events.map((e, i) => (
                            <EventWidget
                                event={e}
                                onClick={onEventClick}
                            />
                        ))
                    ) : (<div />)}
                </div>
            </div>

        </div>
    );
}