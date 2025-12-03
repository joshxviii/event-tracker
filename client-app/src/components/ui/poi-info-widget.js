import { useEffect, useState } from 'react';
import { get_event } from '../../utils/requests/event';
import { Loading } from './loading';
import {ReactComponent as PoiIcon} from '../../assets/poi.svg';
import {ReactComponent as ClockIcon} from '../../assets/time.svg';
import {ReactComponent as CalendarIcon} from '../../assets/calendar.svg';
import {ReactComponent as PersonIcon} from '../../assets/account.svg';

import { useNavigate } from 'react-router-dom';
import { AttendeeWidget } from './attendee-widget';

export function PoiInfoWidget({ eventId }) {
    const navigate = useNavigate();

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
        <div className="poiInfoWidget" style={{margin: 10}}>
            {loading && <Loading/>}
            {!loading && !event && !error && <div className = 'labelStyle' style={{color: 'var(--text-color)'}}>No event selected</div>}
            {!loading && error && <div style={{ color: 'red' }}>{error}</div>}
            {!loading && event && (
                <div style={{display: 'flex', gap: 8, flexDirection: 'column',}}>
                    
                    <h1>{event.title}</h1>
                    
                    <div className='eventImage'>
                        {event.image ? (
                            <img src={event.image} alt={event.title} className="eventBanner" />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: 8 }}>
                                <span style={{ color: '#9ca3af' }}>No Image</span>
                            </div>
                        )}
                    </div>

                    <p style={{ color: 'var(--text-color-2)' }}>{event.description}</p>
                    <div className="poiInfoText" >
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
                            {event.location.address}
                        </div> 

                        <div>
                            <PersonIcon />
                            <AttendeeWidget attendees={event.attendees || []} />
                        </div>
                    </div>

                    <button className="viewDetailsBtn" style={{marginBlockStart: 16}} onClick={ () => navigate(`/event/${event._id}`) }>
                        View Details
                    </button>
                </div>
            )}
        </div>
    );
}