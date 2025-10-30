import React, { useEffect, useState, useRef, useMemo } from "react";
import { EventWidget } from "./ui/event-widget";
import MapWidget from "./ui/map-widget";
import { get_events } from "../utils/requests/event";
import { PoiInfoWidget } from "./ui/poi-info-widget";
import CalendarPanel from "./ui/CalendarPanel";

export const HomePage = ({
        onEventClick,
        onEventCreationClick,
        onEventManageClick
    }) => {
    const [events, setEvents] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [activeFilters, setActiveFilters] = useState(new Set());
    
    const [dateFilter, setDateFilter] = useState(""); // YYYY-MM-DD
    const [timeStartFilter, setTimeStartFilter] = useState(""); // HH:MM
    const [timeEndFilter, setTimeEndFilter] = useState(""); // HH:MM
    
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

        return () => (mounted = false);
    }, []);

    const handlePoiClick = (id) => {
        setSelectedEventId((prev) => (prev === id ? null : id));
    };

    const toggleCatFilter = (category) => {
        setActiveFilters((prev) => {
            const next = new Set(Array.from(prev));
            if (next.has(category)) next.delete(category);
            else next.add(category);
            return next;
        });
    };

    const filteredEvents = useMemo(() => {
        if (!Array.isArray(events)) return [];

        const text = (searchText || "").trim().toLowerCase();

        const parseTimeToMin = (t) => {
            if (!t) return null;
            const parts = String(t).split(":");
            if (parts.length < 2) return null;
            const hh = Number(parts[0]);
            const mm = Number(parts[1]);
            if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
            return hh * 60 + mm;
        };

        const fStartMin = parseTimeToMin(timeStartFilter);
        const fEndMin = parseTimeToMin(timeEndFilter);

        const toLocalYMD = (d) => {
            if (!d) return null;
            const dt = new Date(d);
            if (isNaN(dt.getTime())) return null;
            const y = dt.getFullYear();
            const m = String(dt.getMonth() + 1).padStart(2, '0');
            const day = String(dt.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };

        return events.filter((e) => {
            // text filter
            if (text) {
                const keyWords = `${e.title} ${e.description} ${e.category} ${e.location?.address || ''}`.toLowerCase();
                if (!keyWords.includes(text)) return false;
            }

            // category filter
            if (activeFilters.size > 0) {
                if (!activeFilters.has(e.category || "other")) return false;
            }

            // date filter: match event local date with selected date
            if (dateFilter) {
                const evDate = toLocalYMD(e.startAt);
                if (evDate !== dateFilter) return false;
            }

            // time range filter: ensure event time overlaps requested range (local time)
            if (fStartMin !== null || fEndMin !== null) {
                const evStart = new Date(e.startAt);
                const evEnd = new Date(e.endAt);
                if (isNaN(evStart.getTime()) || isNaN(evEnd.getTime())) return false;
                const evStartMin = evStart.getHours() * 60 + evStart.getMinutes();
                const evEndMin = evEnd.getHours() * 60 + evEnd.getMinutes();
                const rangeStart = fStartMin !== null ? fStartMin : 0;
                const rangeEnd = fEndMin !== null ? fEndMin : 24 * 60;
                // overlap check
                if (evEndMin <= rangeStart || evStartMin >= rangeEnd) return false;
            }

            // TODO distance filter

            return true;
        });
    }, [events, searchText, activeFilters, dateFilter, timeStartFilter, timeEndFilter]);

    // Reset display count when filters or search change
    useEffect(() => {
        setDisplayCount(PAGE_SIZE);
        if (listRef.current) listRef.current.scrollTop = 0;
    }, [searchText, activeFilters, dateFilter, timeStartFilter, timeEndFilter]);

    const displayedEvents = useMemo(
        () => filteredEvents.slice(0, displayCount),
        [filteredEvents, displayCount]
    );

    const handleScroll = (e) => {
        const node = e.target;
        if (!node) return;
        if (node.scrollTop + node.clientHeight >= node.scrollHeight - 200) {
            // load more
            setDisplayCount((prev) => {
                if (prev >= filteredEvents.length) return prev;
                return Math.min(prev + PAGE_SIZE, filteredEvents.length);
            });
        }
    };

    return (
        <div>
            <h2 className="indent blueColor">Discover Events Near You</h2>
            <label className="indent labelStyle">
                Find and join community events happening in your neighborhood
            </label>

            <h2 className="indent">
                <div className="buttonGroup">
                    <button onClick={onEventCreationClick}>Create New Event</button>
                    <button onClick={onEventManageClick}>Manage My Events</button>
                </div>
            </h2>

            <div className="mainContent">
                <div className="mapContainer container">
                    <div>
                        <MapWidget events={!loading ? filteredEvents : []} onPoiClick={handlePoiClick} />
                    </div>
                    <PoiInfoWidget
                        eventId={selectedEventId}
                        onClick={onEventClick}
                    />
                </div>

                <div>
                    <div className="eventList" style={{ marginBottom: 16 }}>
                        <CalendarPanel />
                    </div>

                    {loading && <div>Loading event data...</div>}
                    <div className="eventList">

                        <div className="eventSearch">
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>

                        <div className="filterCatagory">
                            {["volunteer", "social", "market", "other"].map((cat) => (
                                <button
                                    key={cat}
                                    className={"filterBtn " + (activeFilters.has(cat) ? "active" : "")}
                                    style={{ backgroundColor: `var(--event-color-${cat || 'other'})` }}
                                    onClick={() => toggleCatFilter(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                            <button
                                className="filterBtn clear"
                                onClick={() => {
                                    setActiveFilters(new Set());
                                    setSearchText("");
                                }}
                            >
                                Clear
                            </button>
                        </div>

                        <div className="filterDate">
                            <label>
                                <span style={{ fontSize: 12 }}>Date: </span>
                                <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
                                <span style={{ fontSize: 12 }}>From: </span>
                                <input type="time" value={timeStartFilter} onChange={(e) => setTimeStartFilter(e.target.value)} />
                                <span style={{ fontSize: 12 }}>To: </span>
                                <input type="time" value={timeEndFilter} onChange={(e) => setTimeEndFilter(e.target.value)} />
                            </label>
                            <button
                                className="filterBtn clear"
                                onClick={() => { setDateFilter(''); setTimeStartFilter(''); setTimeEndFilter(''); }}
                                style={{ marginLeft: 'auto' }}
                            >Clear</button>
                        </div>

                        <div
                            className="eventContainer container"
                            ref={listRef}
                            onScroll={handleScroll}
                        >
                            {!loading && error && (
                                <div className="error">Could not load event data: {error}</div>
                            )}

                            {!loading && displayedEvents.length > 0 ? (
                                displayedEvents.map((e, i) => (
                                    <EventWidget
                                        key={e._id || i}
                                        event={e}
                                        onClick={onEventClick}
                                    />
                                ))
                            ) : (<div />)}
                            {}
                            {displayCount < filteredEvents.length && (
                                <div style={{ padding: 12, textAlign: "center" }}>Loading more...</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
