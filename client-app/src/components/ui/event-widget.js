import React from "react"

export function EventWidget( {eventId, onClick} ) {
  return (
    <div class="eventWidget"
        onClick={ () => onClick(eventId) }
    >
        <h1> EventID: { eventId } </h1>
    </div>
  );
}