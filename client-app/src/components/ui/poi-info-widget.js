import { useEffect, useState } from 'react';
import { get_event } from '../../utils/requests/event';

export function PoiInfoWidget({ eventId, onClick }) {
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
                            {event.startAt && `Date: ${new Date(event.startAt).toLocaleDateString()}`}
                        </small>
                        <br />
                        <small>
                            {event.startAt && `Start: ${new Date(event.startAt).toLocaleTimeString()}`}
                        </small>
                        <br />
                        <small>
                            {event.endAt && `End: ${new Date(event.endAt).toLocaleTimeString()}`}
                        </small>
                        <br />
                        <small>
                            {event.repeat && event.repeat !== 'none' && `Repeats: ${event.repeat}`}
                        </small>
                    </div>
                    <button onClick={ () => onClick(eventId) }>View Details</button>
                </div>
            )}
        </div>
    );
}