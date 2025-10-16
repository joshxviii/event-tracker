import React from "react"

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
        <p> Event ID: { event._id } </p>
        <p> { event.description } </p>
        <div className="eventLabel" style={{ backgroundColor: bg }}>
          {category}
        </div>
    </div>
  );
}