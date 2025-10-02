import React from "react"

export function EventWidget( {eventId, eventName, eventDsc, onClick} ) {
  return (
    <div class="eventWidget"
        onClick={ () => onClick(eventId) }
    >
        <h1> { eventName } </h1>
        <p> Event ID: { eventId } </p>
        <p> { eventDsc } </p>
    </div>
  );
}