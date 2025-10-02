import React from "react"
import { findEventById } from "../../utils/events";

export function EventWidget( {eventId, onClick} ) {

  // TODO: create a function for fetching event details using the eventId prop

  const event = findEventById(eventId)

  return (
    <div class="eventWidget"
        onClick={ () => onClick(eventId) }
    >
        <h1> { event.name } </h1>
        <p> Event ID: { event.id } </p>
        <p> { event.description } </p>
    </div>
  );
}