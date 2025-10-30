import { useEffect, useState } from "react";
import { get_events_by_user } from "../utils/requests/event";
import { EventManagementWidget } from "./ui/event-management-widget";

export const EventManagementPage = ({ user }) => {

    const [myEvents, setMyEvents] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (!mounted) return;
                setMyEvents(await get_events_by_user(user._id));
            } catch (e) {
                if (!mounted) return;
                setError(e.message || String(e));
                setMyEvents([]);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () =>  mounted = false;
    }, []);

    return (
        <div>
            <h2 class="indent blueColor">Event Management</h2>

            {loading && <div class="indent">Loading your events...</div>}
            {!loading && (
                <div class="eventContainer container">
                    {error && <div className="error">Could not load event data: {error}</div>}
                    {!error && (
                        <div>
                            {myEvents.length > 0 ? (
                                myEvents.map((e, i) => (
                                    <EventManagementWidget
                                        event={e}
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