import React, { useEffect, useState, useRef, useMemo } from "react";
import { EventWidget } from "./ui/event-widget";
import MapWidget from "./ui/map-widget";
import { get_events } from "../utils/requests/event";
import { PoiInfoWidget } from "./ui/poi-info-widget";
import CalendarPanel from "./ui/CalendarPanel";
import { useMap } from "@vis.gl/react-google-maps";
import { Loading } from "./ui/loading";
import FriendSidebar from "./ui/FriendSidebar";
import {ReactComponent as FriendsIcon} from '../assets/friends.svg';

export const HomePage = ({}) => {
    const [events, setEvents] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [mapViewport, setMapViewport] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [activeFilters, setActiveFilters] = useState(new Set());

    const [dateFilter, setDateFilter] = useState(""); // YYYY-MM-DD
    const [timeStartFilter, setTimeStartFilter] = useState(""); // HH:MM
    const [timeEndFilter, setTimeEndFilter] = useState(""); // HH:MM

    const [displayCount, setDisplayCount] = useState(20);
    const [showPastEvents, setShowPastEvents] = useState(false);
    const [showFriends, setShowFriends] = useState(false);
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
                console.log(e);
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

    const handleViewportChange = ({ center, zoom }) => {
        if (!center) return;
        setMapViewport({ center, zoom });
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
            const [hh, mm] = t.split(":").map(Number);
            if (isNaN(hh) || isNaN(mm)) return null;
            return hh * 60 + mm;
        };

        const fStartMin = parseTimeToMin(timeStartFilter);
        const fEndMin = parseTimeToMin(timeEndFilter);

        const toLocalYMD = (dateLike) => {
            const d = new Date(dateLike);
            if (isNaN(d.getTime())) return "";
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}`;
        };

        const now = new Date();

        return events.filter((e) => {
            // Past / upcoming filter
            const start = new Date(e.startAt || e.startTime || e.time);
            if (isNaN(start.getTime())) return false;

            if (!showPastEvents && start < now) return false;
            if (showPastEvents && start >= now) return false;

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

                const overlaps =
                    evStartMin <= rangeEnd && evEndMin >= rangeStart;
                if (!overlaps) return false;
            }

            return true;
        });
    }, [events, searchText, activeFilters, dateFilter, timeStartFilter, timeEndFilter, showPastEvents]);

    const handleScroll = (e) => {
        const el = e.currentTarget;
        if (!el) return;

        const { scrollTop, scrollHeight, clientHeight } = el;
        const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

        if (distanceFromBottom < 100) {
            setDisplayCount((prev) => {
                if (prev >= filteredEvents.length) return prev;
                return Math.min(filteredEvents.length, prev + PAGE_SIZE);
            });
        }
    };

    return (
        <div
            className="homepage-layout"
            style={{
                alignItems: "flex-start",
                maxWidth: "1600px",
                margin: "0 auto",
                paddingRight: "1rem",
                paddingLeft: "1rem"
            }}
        >
            {/* LEFT: all existing home content (map, calendar, event list) */}
            <div className="homepage-main" style={{ flex: 3 }}>
                <div className="homepageHeaderRow">
                    <div>
                        <h2 className="indent blueColor">Discover Events Near You</h2>
                        <label className="indent labelStyle">
                            Find and join community events happening in your neighborhood
                        </label>
                    </div>
                    <button
                        type="button"
                        className="friendSidebarToggleBtn"
                        onClick={() => setShowFriends(true)}
                    >
                        <FriendsIcon/>
                        Friends
                    </button>
                </div>

                <div className="mainContent">
                    <div
                        className="mapContainer container"                                               
                    >
                        <div>
                            <MapWidget
                                focusedEventId={selectedEventId}
                                events={!loading ? filteredEvents : []}
                                onPoiClick={handlePoiClick}
                            />
                        </div>
                        <PoiInfoWidget
                            eventId={selectedEventId}
                        />
                    </div>

                    <div className="rightColumn">
                        <div className="eventList calendarPanel">
                            <CalendarPanel />
                        </div>

                        {loading && <div style={{color: 'var(--text-color)'}}>Loading event data...</div>}

                        <div className="eventList eventsPanel">
                            <div className="eventSearch">
                                <input
                                    className="input"
                                    type="text"                                
                                    placeholder="Search events..."
                                    style={{color: 'var(--text-color)'}}
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                            </div>

                            <div className="filterCatagory">
                                {["volunteer", "social", "market", "other"].map((cat) => (
                                    <button
                                        key={cat}
                                        className={
                                            "filterBtn " + (activeFilters.has(cat) ? "active" : "")
                                        }
                                        style={{
                                            backgroundColor: `var(--event-color-${cat || "other"})`,
                                        }}
                                        onClick={() => toggleCatFilter(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                                <button
                                    className="filterBtn clear"
                                    style={{
                                        color: 'var(--text-color)'
                                    }}
                                    onClick={() => {
                                        setActiveFilters(new Set());
                                        setSearchText("");
                                        setDateFilter("");
                                        setTimeStartFilter("");
                                        setTimeEndFilter("");
                                    }}
                                >
                                    Clear
                                </button>
                            </div>

                            <div className="filterDate">
                                <label style={{ display: "flex", flexFlow: "wrap", gap: "4px" }}>
                                    <label style={{ fontSize: 12, color: 'var(--text-color)'}}>
                                        Date:
                                        <input
                                            type="date"
                                            style={{color: 'var(--text-color)'}}
                                            className="input"
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                        />
                                    </label>
                                    <label style={{ fontSize: 12, color: 'var(--text-color)'}}>
                                        From:
                                        <input
                                            type="time"
                                            style={{color: 'var(--text-color)'}}
                                            className="input"
                                            value={timeStartFilter}
                                            onChange={(e) => setTimeStartFilter(e.target.value)}
                                        />
                                    </label>
                                    <label style={{ fontSize: 12, color: 'var(--text-color)'}}>
                                        To:
                                        <input
                                            type="time"
                                            style={{color: 'var(--text-color)'}}
                                            className="input"
                                            value={timeEndFilter}
                                            onChange={(e) => setTimeEndFilter(e.target.value)}
                                        />
                                    </label>
                                </label>
                            </div>

                            <div className="eventListHeader">
                                <h3>
                                    {showPastEvents ? "Past Events" : "Upcoming Events"} (
                                    {filteredEvents.length})
                                </h3>
                                <button
                                    className="togglePastEventsBtn"
                                    onClick={() => setShowPastEvents((prev) => !prev)}
                                    style={{
                                        marginLeft: "auto",
                                        width: "120px",
                                        borderRadius: 8,
                                        background: showPastEvents ? "#888" : undefined,
                                        color: showPastEvents ? "#fff" : undefined,
                                    }}
                                >
                                    {showPastEvents ? "View Upcoming Events" : "View Past Events"}
                                </button>
                            </div>

                            <div
                                className="eventContainer container"
                                style={{fontFamily:"sans-serif"}}
                                ref={listRef}
                                onScroll={handleScroll}
                            >
                                {!loading && error && (
                                    <div className="error">
                                        Could not load event data: {error}
                                    </div>
                                )}

                                {!loading ? (
                                    filteredEvents
                                        .slice(0, displayCount)
                                        .map((event, index) => (
                                            <EventWidget
                                                key={event._id}
                                                event={event}
                                                delay={index * 0.05}
                                                selected={selectedEventId === event._id}
                                                setSelected={setSelectedEventId}
                                                onFocusOnMap={() => {
                                                    setSelectedEventId(event._id);
                                                    if (event.location?.coords && mapViewport) {
                                                        // optionally pan map here
                                                    }
                                                }}
                                            />
                                        ))
                                ) : (
                                    <div className="loadingEvents">
                                        <Loading info="Loading events..." />
                                    </div>
                                )}

                                {!loading && filteredEvents.length === 0 && (
                                    <div className="emptyEvents">
                                        No events found matching your search and filters.
                                    </div>
                                )}

                                {displayCount < filteredEvents.length && (
                                    <div style={{ padding: 12, textAlign: "center" }}>
                                        Loading more...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <FriendSidebar
                isOpen={showFriends}
                onClose={() => setShowFriends(false)}
            />
        </div>
    );
};