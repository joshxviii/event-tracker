import { useEffect, useState } from "react";
import { get_events_by_user } from "../utils/requests/event";
import { EventManagementWidget } from "./ui/event-management-widget";
import { useNotifications } from './ui/Notifications';
import { getCurrentUser } from "../utils/requests/user";
import { Loading } from "./ui/loading";

export const EventManagementPage = ({ onEditEvent }) => {

    const [ user, setUser ] = useState(null);

    const [myEvents, setMyEvents] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const notify = useNotifications();

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (!mounted) return;
                setLoading(true);
                setError(null);
                const currentUser = await getCurrentUser();
                setUser(currentUser);
                const events = await get_events_by_user(currentUser._id);
                if (!mounted) return;
                setMyEvents(events || []);
            } catch (e) {
                if (!mounted) return;
                const msg = e.message || String(e);
                setError(msg);
                notify.push({ type: 'error', message: `Failed to load events: ${msg}` });
                setMyEvents([]);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () =>  mounted = false;
    }, [user?._id]);

    return (
        <div>
            <h2 className="indent blueColor">Event Management</h2>

            {loading && <div className="indent"> <Loading/> Loading your events...</div>}
            {!loading && (
                <div style={{fontFamily:"sans-serif"}}>
                    {error && <div className="error">Could not load event data: {error}</div>}
                    {!error && (
                        <div>
                            {myEvents.length > 0 ? (
                                myEvents.map((e, i) => (
                                    <EventManagementWidget
                                        key={e._id || i}
                                        event={e}
                                        onEdit={onEditEvent}
                                        onDelete={(deletedId) => setMyEvents((prev) => prev.filter(ev => ev._id !== deletedId))}
                                    />
                                ))
                            ) : (
                                <div>You have not created any events.</div>
                            )}
                        </div>
                    )}
                </div>)
            }
        </div>
    )

}