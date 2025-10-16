import { useEffect, useState } from 'react';
import { get_event } from '../../utils/requests/event';

export function PoiInfoWidget({ eventId }) {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!eventId) {
            setEvent(null);
            setError(null);
            setLoading(false);
            return;
        }

        let mounted = true;
        setLoading(true);
        setError(null);
        setEvent(null);

        (async () => {
            try {
                const e = await get_event(eventId);
                if (!mounted) return;
                setEvent(e);
            } catch (err) {
                if (!mounted) return;
                setError(err.message || String(err));
                setEvent(null);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [eventId]);

    return (
        <div className="poiInfoWidget">
            {loading && <div>Loading event data...</div>}
            {!loading && !event && !error && <div>No event selected</div>}
            {!loading && error && <div style={{ color: 'red' }}>{error}</div>}
            {!loading && event && (
                <div>
                    <h1>{event.title}</h1>
                    <p>{event.description}</p>
                    {event.location && event.location.address && <div>{event.location.address}</div>}
                    <div>
                        <small>
                            {event.date && `Date: ${new Date(event.date).toLocaleDateString()}`}
                        </small>
                    </div>
                </div>
            )}
        </div>
    );
}