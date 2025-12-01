import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../utils/requests/user';
import { get_event } from '../utils/requests/event';
import { EventWidget } from './ui/event-widget';
import { useNavigate } from 'react-router-dom';
import { Loading } from './ui/loading';

export function SavedEventsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [rsvpedEvents, setRsvpedEvents] = useState([]);
    const [favoriteEvents, setFavoriteEvents] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const currentUser = await getCurrentUser();
                if (!mounted) return;
                setUser(currentUser);

                if (!currentUser) {
                    setRsvpedEvents([]);
                    setFavoriteEvents([]);
                    return;
                }

                // Fetch events for attendedEvents and favoriteEvents
                const attendedIds = Array.isArray(currentUser.attendedEvents) ? currentUser.attendedEvents : [];
                const favIds = Array.isArray(currentUser.favoriteEvents) ? currentUser.favoriteEvents : [];

                const attendedPromises = attendedIds.map(id => get_event(id).catch(() => null));
                const favPromises = favIds.map(id => get_event(id).catch(() => null));

                const [attendedResults, favResults] = await Promise.all([
                    Promise.all(attendedPromises),
                    Promise.all(favPromises)
                ]);

                if (!mounted) return;

                setRsvpedEvents(attendedResults.filter(Boolean));
                setFavoriteEvents(favResults.filter(Boolean));
            } catch (err) {
                if (!mounted) return;
                setError(err.message || String(err));
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => { mounted = false; };
    }, []);

    const openEvent = (id) => navigate(`/event/${id}`);

    if (loading) return <div style={{ padding: 24 }}><Loading/> Loading saved events...</div>;

    return (
        <div style={{ padding: 16 }}>
            <h2 className="indent blueColor">Saved Events</h2>
            {error && <div className="error">Error loading saved events: {error}</div>}

            {!user && (
                <div className="indent">You need to be logged in to view your saved events.</div>
            )}

            {user && (
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 320 }}>
                        <h3>Attending Events</h3>
                        {rsvpedEvents.length > 0 ? (
                            rsvpedEvents.map(ev => (
                                <EventWidget key={ev._id} event={ev} onClick={openEvent} onViewDetails={openEvent} />
                            ))
                        ) : (
                            <div className="indent">You have not signed up to attend any events.</div>
                        )}
                    </div>

                    <div style={{ flex: 1, minWidth: 320 }}>
                        <h3>Favorited Events</h3>
                        {favoriteEvents.length > 0 ? (
                            favoriteEvents.map(ev => (
                                <EventWidget key={ev._id} event={ev} onClick={openEvent} onViewDetails={openEvent} />
                            ))
                        ) : (
                            <div className="indent">You have not favorited any events.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}