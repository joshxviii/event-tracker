import React from "react"
import {ReactComponent as CalendarIcon} from '../../assets/calendar.svg';
import {ReactComponent as PoiIcon} from '../../assets/poi.svg';
import { useNavigate } from "react-router-dom";

export function EventWidget( {event, onClick, isSelected} ) {
  const navigate = useNavigate();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const evEnd = new Date(event.endAt);
  const isPast = !isNaN(evEnd.getTime()) && evEnd < today;

  const category = event.category || 'other';
  const cssVarMap = {
    volunteer: 'var(--event-color-volunteer)',
    social: 'var(--event-color-social)',
    market: 'var(--event-color-market)',
    other: 'var(--event-color-other)'
  };

  const bg = cssVarMap[category] || cssVarMap.other;

  return (
    <div
      className={isSelected ? 'eventWidget selected' : 'eventWidget'}
      style={{
        position: 'relative',
        opacity: isPast ? 0.5 : 1,
        filter: isPast ? 'grayscale(0.7)' : undefined,
        pointerEvents: 'auto',
      }}
      onClick={() => onClick(event._id)}
    >
      <h1> {event.title} </h1>
      <p style={{ color: '#5c5c5cff' }}> {event.description} </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <CalendarIcon />
          {event.startAt ? new Date(event.startAt).toLocaleDateString() : ''}
          {event.startAt && ` at ${new Date(event.startAt).toLocaleTimeString()} - ${event.endAt ? new Date(event.endAt).toLocaleTimeString() : ''}`}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <PoiIcon />
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' }}>
            {event.location.address}
          </div>
        </div>
        <button className="viewDetailsBtn" onClick={() => navigate(`/event/${event._id}`)}>
          View Details
        </button>
      </div>

      <div className="eventLabel" style={{ backgroundColor: bg }}>
        {category}
      </div>
    </div>
  );
}