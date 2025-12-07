import React, { useEffect, useState } from "react";
import Review from "./ui/review-panel";
import { get_event, favorite_event, rsvp_event, unrsvp_event, delete_event } from "../utils/requests/event";
import { delete_review, get_reviews } from "../utils/requests/review";
import ReviewTextbox from "./ui/review-textbox";
import {ReactComponent as HeartIcon} from '../assets/heart.svg';
import {ReactComponent as HeartFilledIcon} from '../assets/heart-filled.svg';
import {ReactComponent as ShareIcon} from '../assets/share.svg';
import {ReactComponent as BackIcon} from '../assets/back.svg';
import {ReactComponent as PoiIcon} from '../assets/poi.svg';
import {ReactComponent as ClockIcon} from '../assets/time.svg';
import {ReactComponent as CalendarIcon} from '../assets/calendar.svg';
import {ReactComponent as PersonIcon} from '../assets/account.svg';
import {ReactComponent as DeleteIcon} from '../assets/delete.svg';
import {ReactComponent as SettingsIcon} from '../assets/edit.svg';
import { getCurrentUser } from "../utils/requests/user";
import { Loading } from "./ui/loading";
import EventMapWidget from "./ui/event-map-widget";
import { UserProfileLink } from "./ui/user-profile-link";
import { useNotifications } from "./ui/Notifications";
import { AttendeeWidget } from "./ui/attendee-widget";

export function EventPage( { eventId, onBack } ) {

    const [user, setUser ] = useState(null);

    const [reviews, setReviews] = useState(null);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isToggling, setIsToggling] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isRsvped, setIsRsvped] = useState(false);
    const [isRsvpToggling, setIsRsvpToggling] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showAdminMenu, setShowAdminMenu] = useState(false);

    const notify = useNotifications();

    const reloadReviews = async () => {
        try {
            setReviews(await get_reviews(eventId) || []);
        } catch (e) {
            setError(e.message || String(e));
            setReviews([]);
        }
    };

    const deleteReview = async (reviewId) => {

        console.log("Deleting review", reviewId);

        delete_review(eventId, reviewId).then(() => {
            reloadReviews();
        }).catch((e) => {
            setError(e.message || String(e));
        });
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (!mounted) return;
                const currentUser = await getCurrentUser()
                setUser(currentUser);
                setReviews(await get_reviews(eventId) || []);
                const fetchedEvent = await get_event(eventId) || {};
                setEvent(fetchedEvent);
                console.log('User favorite events:', currentUser);
                setIsFavorited(currentUser?.favoriteEvents?.includes(eventId) ?? false);
                setIsRsvped(fetchedEvent.attendees?.some(a => a._id === currentUser?._id) ?? false);
            } catch (e) {
                if (!mounted) return;
                setError(e.message || String(e));
                setReviews([]);
                setEvent({});
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () =>  mounted = false;
    }, [eventId]);


    const toggleFavorite = async () => {
        if (isToggling || !user) return;
        
        setIsToggling(true);
        try {
            setIsFavorited(!isFavorited);
            await favorite_event(eventId);
        } catch (error) {
            setIsFavorited(!isFavorited);
            setError(error.message || 'Failed to toggle favorite');
        } finally {
            setIsToggling(false);
        }
    };

    const toggleRsvp = async () => {
        if (isRsvpToggling || !user) return;
        
        setIsRsvpToggling(true);
        try {
            if (isRsvped) {
                await unrsvp_event(eventId);
                setIsRsvped(false);
                notify.push({ type: 'success', message: 'You have un-RSVP\'d from this event' });
                // Remove from Google Calendar if token exists
                await removeEventFromGoogleCalendar(event);
            } else {
                await rsvp_event(eventId);
                setIsRsvped(true);
                notify.push({ type: 'success', message: 'You have RSVP\'d to this event!' });
                // Save to Google Calendar if token exists
                await saveEventToGoogleCalendar(event);
            }
            // Refresh event to get updated attendee list
            const updatedEvent = await get_event(eventId);
            setEvent(updatedEvent);
        } catch (error) {
            notify.push({ type: 'error', message: error.message || 'Failed to RSVP' });
        } finally {
            setIsRsvpToggling(false);
        }
    };

    const saveEventToGoogleCalendar = async (evt) => {
        const token = localStorage.getItem('googleAccessToken');
        if (!token) return; // User hasn't signed in with Google

        try {
            const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
            
            // Check if event already exists
            const title = evt.title || '(no title)';
            const startTime = evt.startAt;
            const endTime = evt.endAt;
            
            const timeMin = new Date().toISOString();
            const timeMax = new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString();
            const params = new URLSearchParams({
                q: title,
                timeMin,
                timeMax,
                singleEvents: 'true'
            });
            const checkRes = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
                { headers }
            );
            const checkData = await checkRes.json();
            
            const exists = Array.isArray(checkData.items) && checkData.items.some(e =>
                e.summary === title &&
                (e.start?.dateTime || e.start?.date) === startTime &&
                (e.end?.dateTime || e.end?.date) === endTime
            );
            
            if (exists) {
                console.log(`Event "${title}" already in Google Calendar`);
                return;
            }

            // Build event body
            const isAllDay = typeof startTime === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(startTime);
            const body = {
                summary: title,
                description: `Saved from Event Tracker: ${window.location.origin}/event/${evt._id}`,
                location: evt.location?.address || undefined,
                start: isAllDay ? { date: startTime } : { dateTime: startTime },
                end: isAllDay ? { date: endTime } : { dateTime: endTime }
            };

            const insertRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });
            
            if (!insertRes.ok) {
                const txt = await insertRes.text();
                console.warn('Failed to save to Google Calendar', insertRes.status, txt);
            } else {
                console.log(`Successfully saved "${title}" to Google Calendar`);
                // Store the Google event ID for deletion later
                sessionStorage.setItem(`google_event_${evt._id}`, await insertRes.json().then(r => r.id));
            }
        } catch (e) {
            console.warn('Error saving event to Google Calendar:', e);
        }
    };

    const removeEventFromGoogleCalendar = async (evt) => {
        const token = localStorage.getItem('googleAccessToken');
        if (!token) return; // User hasn't signed in with Google

        try {
            const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
            
            // Try to find and delete the event by matching title, start, and end
            const title = evt.title || '(no title)';
            const startTime = evt.startAt;
            const endTime = evt.endAt;
            
            const timeMin = new Date().toISOString();
            const timeMax = new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString();
            const params = new URLSearchParams({
                q: title,
                timeMin,
                timeMax,
                singleEvents: 'true'
            });
            
            const searchRes = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
                { headers }
            );
            const searchData = await searchRes.json();
            
            const matchingEvent = Array.isArray(searchData.items) && searchData.items.find(e =>
                e.summary === title &&
                (e.start?.dateTime || e.start?.date) === startTime &&
                (e.end?.dateTime || e.end?.date) === endTime
            );
            
            if (!matchingEvent) {
                console.log(`Event "${title}" not found in Google Calendar`);
                return;
            }

            const deleteRes = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(matchingEvent.id)}`,
                { method: 'DELETE', headers }
            );
            
            if (!deleteRes.ok) {
                console.warn('Failed to delete from Google Calendar', deleteRes.status);
            } else {
                console.log(`Successfully removed "${title}" from Google Calendar`);
            }
        } catch (e) {
            console.warn('Error removing event from Google Calendar:', e);
        }
    };

    const handleDeleteEvent = async () => {
        if (!window.confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            await delete_event(eventId);
            notify.push({ type: 'success', message: 'Event deleted successfully' });
            // Navigate back after a short delay to show the success message
            setTimeout(() => onBack(), 500);
        } catch (error) {
            notify.push({ type: 'error', message: error.message || 'Failed to delete event' });
        } finally {
            setIsDeleting(false);
        }
    };

    if (event) return (
        <div className="eventPageContainer">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <button onClick={onBack} style={{ marginRight: 12, fontSize: 16, backgroundColor: '#00000000', color: '#155dfc' }}><BackIcon /> Back Home</button>
                </div>
            </div>

            <div className="eventInfo">
                <div className="eventImage">
                    <div className="buttonGroup eventButtons" >
                        <button
                            onClick={toggleFavorite}
                            disabled={isToggling || !user}
                            style={{ 
                                opacity: (isToggling || !user) ? 0.6 : 1,
                                cursor: (isToggling || !user) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isFavorited ? <HeartFilledIcon style={{color: "#e84343ff"}}/> : <HeartIcon />}
                        </button>
                        <button onClick={async ()=>{
                            try {
                                await navigator.clipboard.writeText(window.location.href);
                                notify.push({ type: 'success', message: 'Event Copied to Clipboard!' })
                            } catch (err) {
                                notify.push({ type: 'error', message: err })
                            }
                        }}><ShareIcon/></button>
                    </div>
                    {event.image ? (
                        <img src={event.image} alt={event.title} className="eventBanner" />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: 8 }}>
                            <span style={{ color: '#9ca3af' }}>No Image</span>
                        </div>
                    )}
                </div>

                <div className="eventMeta">
                    <h1 className="eventHeader">{event.title}</h1>

                    <span className="eventLabel" style={{ backgroundColor: `var(--event-color-${event.category || 'other'})` }}>{event.category}</span>

                    {event.organizer && (
                        <div className="eventOrganizer" style={{color: 'var(--text-color)'}}>
                            <h4 style={{marginBlockEnd: 10}}>Organizer: </h4>
                            <UserProfileLink user={event.organizer} />
                        </div>
                    )}

                    <div style={ {display:'flex', flexDirection: 'row', gap: 16} }>
                        <div className="poiInfoText" style={{flex: 1}} >
                            <p style={{ color: 'var(--text-color-2)' }}>{event.description}</p> 
                            <div>
                                <CalendarIcon/>
                                {event.startAt ? new Date(event.startAt).toLocaleDateString() : ''}
                            </div>
                            <div>
                                <ClockIcon/>
                                {event.startAt && `${new Date(event.startAt).toLocaleTimeString()} - ${event.endAt ? new Date(event.endAt).toLocaleTimeString() : ''}`}
                            </div>
                            <div>
                                <PoiIcon/>
                                {event.location?.address}
                            </div>

                            <div>
                                <PersonIcon />
                                <AttendeeWidget attendees={event.attendees || []} />
                            </div>
                        </div>

                        <EventMapWidget style={{width: '50%', height: '100%'}} lat={event.location?.coordinates.lat} lng={event.location?.coordinates.lng}/>
                    </div>

                    {(<button
                        onClick={toggleRsvp}
                        disabled={isRsvpToggling || !user}
                        style={{
                            cursor: (isRsvpToggling || !user) ? 'not-allowed' : 'pointer',
                            backgroundColor: user ? '#155dfc' : '#9ca3af',
                            padding: '12px 48px',
                            fontSize: '18px',
                            marginTop: '8px',
                            marginLeft: 'auto',
                        }}
                    >
                        {isRsvped ? 'Unattend Event': user ? 'Attend Event': 'Log in to RSVP'}
                    </button>)}

                </div>
            </div>

            {/* Floating Admin Menu */}
            {user?.role === 'admin' && (
                <div style={{
                    position: 'fixed',
                    bottom: '40px',
                    right: '40px',
                    zIndex: 1000,
                }}>
                    <button
                        onClick={() => setShowAdminMenu(!showAdminMenu)}
                        title="Admin Menu"
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            backgroundColor: '#e84343',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '24px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            transition: 'all 0.3s ease',
                            transform: showAdminMenu ? 'rotate(45deg) scale(1.1)' : 'rotate(0deg) scale(1)',
                        }}
                    >
                        <SettingsIcon style={{ width: '24px', height: '24px' }} />
                    </button>

                    {showAdminMenu && (
                        <div style={{
                            position: 'absolute',
                            bottom: '70px',
                            right: '0',
                            backgroundColor: 'var(--background-color)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            minWidth: '180px',
                            overflow: 'hidden',
                        }}>
                            <button
                                onClick={() => {
                                    setShowAdminMenu(false);
                                    handleDeleteEvent();
                                }}
                                disabled={isDeleting}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    textAlign: 'left',
                                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                                    color: '#e84343',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'background-color 0.2s ease',
                                    opacity: isDeleting ? 0.6 : 1,
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover-background-color)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                <DeleteIcon style={{ width: '16px', height: '16px' }} />
                                Delete Event
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="reviewContainer container" style={{ marginTop: 20 }}>
                <h3 className="indent">Reviews</h3>
                <div className="reviewList" style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12, color: 'var(--text-color)'}}>
                    {reviews && reviews.length > 0 ? (
                        reviews.map((review) => (
                            <Review
                                review={review}
                                onDelete={deleteReview}                                        
                            />
                        ))
                    ) : (<div className="indent">No reviews yet</div>)}
                </div>

                <div style={{ marginTop: 12}}>
                    <ReviewTextbox
                        eventId={event._id}
                        onReviewSubmitted={reloadReviews}
                    />
                </div>
            </div>
        </div>
    );
    else return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <Loading/>
                <div style={{ color: 'var(--text-color)' }}>Loading event...</div>
            </div>
        </div>
    )
}