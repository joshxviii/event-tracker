import React, { useEffect, useState } from "react";
import { EventWidget } from "./ui/event-widget";
import MapWidget from "./ui/map-widget";

export const HomePage = ( { onEventClick } ) => {
    const [events, setEvents] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadDemoData = async () => {
            try {
                const res = await fetch('/DemoData.csv');
                if (!res.ok) throw new Error('DemoData.csv not found');
                const text = await res.text();
                const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
                
                console.log(res)

                if (lines.length <= 1) {
                    setEvents([]);
                    return;
                }

                const headers = lines[0].split(',').map(h => h.trim());
                const rows = lines.slice(1).map(line => line.split(',').map(c => c.trim()));
                const data = rows.map(cols => {
                    const obj = {};
                    headers.forEach((h, i) => obj[h] = cols[i] ?? '');
                    return obj;
                });

                // Detect an ID column from common names
                const idKey = 'id';
                const parsed = data.map((d, idx) => {
                    let id = null;
                    if (Object.prototype.hasOwnProperty.call(d, idKey) && d[idKey] !== '') { id = d[idKey]; }
                    return { ...d, id: Number(id) };
                });

                setEvents(parsed);
            } catch (e) {
                // if anything goes wrong, just keep events null and show fallback
                console.warn('Failed to load DemoData.csv:', e.message || e);
                setError(e.message || String(e));
                setEvents(null);
            } finally {
                setLoading(false);
            }
        };

        loadDemoData();
    }, []);

    const fallbackIds = [16, 42, 3];

    return (
        <div>
            <h2>Home Page</h2>

            <div>
                {loading && <div>Loading demo events...</div>}
                
                <div className="mapContainer container">
                    <div id="map">
                        <MapWidget 
                            events = {!loading ? events : null}
                        />
                        MAP HERE
                    </div>
                </div>

                <div className="eventContainer container">
                    {!loading && error && <div className="error">Could not load demo data: {error}</div>}

                    {!loading && events.length > 0 ? (
                        events.map((e, i) => (
                            <EventWidget
                                key={e.id ?? i}
                                eventId={e.id}
                                eventName={e.name}
                                onClick={onEventClick}
                            />
                        ))
                    ) : (<div />)}
                </div>
            </div>

        </div>
    );
}