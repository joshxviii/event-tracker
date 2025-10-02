import React from "react"

export function EventWidget( {eventId, eventName, onClick} ) {
  return (
    <div class="eventWidget"
        onClick={ () => onClick(eventId) }
    >
        <h1> { eventName } </h1>
    </div>
  );
}