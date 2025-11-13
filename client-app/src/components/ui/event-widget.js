import React from "react"
import {ReactComponent as CalendarIcon} from '../../assets/calendar.svg';
import {ReactComponent as PoiIcon} from '../../assets/poi.svg';

export function EventWidget( {event, onClick, onViewDetails, isSelected} ) {

  // TODO: create a function for fetching event details using the eventId prop

  // const event = findEventById(eventId)

  const category = event.category || 'other';
  const cssVarMap = {
    volunteer: 'var(--event-color-volunteer)',
    social: 'var(--event-color-social)',
    market: 'var(--event-color-market)',
    other: 'var(--event-color-other)'
  };

  const bg = cssVarMap[category] || cssVarMap.other;

  return (
    <div className={isSelected ? 'eventWidget selected' : 'eventWidget'} style={{ position: 'relative' }}
        onClick={ () => onClick(event._id) }
    >
        <h1> { event.title } </h1>
        <p style={ {color: '#5c5c5cff'} }> { event.description } </p>

        <div style={ {display:'flex', flexDirection: 'column', gap: 6} }>
          <div style={ {display: 'flex', gap: 6} }>
            <CalendarIcon/>
            {event.startAt ? new Date(event.startAt).toLocaleDateString() : ''}
            {event.startAt && ` at ${new Date(event.startAt).toLocaleTimeString()} - ${event.endAt ? new Date(event.endAt).toLocaleTimeString() : ''}`}
          </div>
          <div style={ {display: 'flex', gap: 6} }> <PoiIcon/> <div style={ { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px'} }> {event.location.address} </div> </div>
          <button className="viewDetailsBtn" onClick={ () => onViewDetails(event._id) }>View Details</button>
        </div>

        <div className="eventLabel" style={{ backgroundColor: bg }}>
          {category}
        </div>
    </div>
  );
}