import React from "react"
import {ReactComponent as CalendarIcon} from '../../assets/calendar.svg';
import {ReactComponent as PoiIcon} from '../../assets/poi.svg';

export function EventWidget( {event, onClick} ) {

  // TODO: create a function for fetching event details using the eventId prop

  //const event = findEventById(eventId)

  const category = event.category || 'other';
  const cssVarMap = {
    volunteer: 'var(--event-color-volunteer)',
    social: 'var(--event-color-social)',
    market: 'var(--event-color-market)',
    other: 'var(--event-color-other)'
  };

  const bg = cssVarMap[category] || cssVarMap.other;

  return (
    <div className="eventWidget" style={{ position: 'relative' }}
        onClick={ () => onClick(event._id) }
    >
        <h1> { event.title } </h1>
        <p> { event.description } </p>
        <p style={ {display: 'flex', gap: 6} }> <CalendarIcon/> {event.date} at { event.startTime } - { event.endTime } </p>
        <div style={ {display: 'inline-flex', gap: 6} }> <PoiIcon/> <div style={ { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px'} }> {event.location.address} </div> </div>
        <div className="eventLabel" style={{ backgroundColor: bg }}>
          {category}
        </div>
    </div>
  );
}