import React, { useEffect, useState, useRef, useMemo } from "react";
import { EventWidget } from "./ui/event-widget";
import MapWidget from "./ui/map-widget";
import { get_events } from "../utils/requests/event";
import { PoiInfoWidget } from "./ui/poi-info-widget";

export const HomePage = ( { onEventClick, onEventCreationClick, onEventManageClick } ) => {
    const [events, setEvents] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [activeFilters, setActiveFilters] = useState(new Set());
    const [displayCount, setDisplayCount] = useState(20);
    const listRef = useRef(null);
    const PAGE_SIZE = 5;

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

    const handlePoiClick = (id) => {
        setSelectedEventId(prev => (prev === id ? null : id));
    };

    const toggleFilter = (category) => {
        setActiveFilters(prev => {
            const next = new Set(Array.from(prev));
            if (next.has(category)) next.delete(category);
            else next.add(category);
            return next;
        });
    };

    const filteredEvents = useMemo(() => {
        if (!Array.isArray(events)) return [];

        const text = (searchText || '').trim().toLowerCase();

        return events.filter(e => {
            // filter by text
            if (text) {
                const hay = `${e.title} ${e.description} ${e.category} ${e.location?.address || ''}`.toLowerCase();
                if (!hay.includes(text)) return false;
            }

            // filter by category buttons
            if (activeFilters.size > 0) {
                if (!activeFilters.has(e.category || 'other')) return false;
            }

            // TODO filter by time

            // TODO filter by distance

            return true;
        });
    }, [events, searchText, activeFilters]);

    // Reset display count when filters or search change
    useEffect(() => {
        setDisplayCount(PAGE_SIZE);
        if (listRef.current) listRef.current.scrollTop = 0;
    }, [searchText, activeFilters]);

    const displayedEvents = useMemo(() => filteredEvents.slice(0, displayCount), [filteredEvents, displayCount]);

    const handleScroll = (e) => {
        const node = e.target;
        if (!node) return;
        const threshold = 200; // px from bottom
        if (node.scrollTop + node.clientHeight >= node.scrollHeight - threshold) {
            // load more
            setDisplayCount(prev => {
                if (prev >= filteredEvents.length) return prev;
                return Math.min(prev + PAGE_SIZE, filteredEvents.length);
            });
        }
    };

    return (
        <div>
            <br/>
            <div class="buttonGroup">
                <button onClick={onEventCreationClick}>Create New Event</button>
                <button onClick={onEventManageClick}>Manage My Events</button>
            </div>

            <div class="mainContent">
                
                <div class="mapContainer container">
                    <div>
                        <MapWidget
                            events={!loading ? events : []}
                            onPoiClick={handlePoiClick}
                        />
                    </div>
                    <PoiInfoWidget
                        eventId={selectedEventId}
                    />
                </div>

                {loading && <div>Loading event data...</div>}
                <div className='eventList'>
                    <div className='eventSearch'>
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>

                    <div className='filterBar'>
                        {['volunteer','social','market','other'].map(cat => (
                            <button
                                key={cat}
                                className={"filterBtn " + (activeFilters.has(cat) ? 'active' : '')}
                                onClick={() => toggleFilter(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                        <button className='filterBtn clear' onClick={() => { setActiveFilters(new Set()); setSearchText(''); }}>Clear</button>
                    </div>

                    <div className="eventContainer container" ref={listRef} onScroll={handleScroll}>
                        {!loading && error && <div className="error">Could not load event data: {error}</div>}
                        {!loading && displayedEvents.length > 0 ? (
                            displayedEvents.map((e, i) => (
                                <EventWidget
                                    key={e._id || i}
                                    event={e}
                                    onClick={onEventClick}
                                />
                            ))
                        ) : (<div />)}
                        {/* show loader when there are more events to fetch */}
                        {displayCount < filteredEvents.length && (
                            <div style={{ padding: 12, textAlign: 'center' }}>Loading more...</div>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}