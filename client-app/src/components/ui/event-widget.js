import React from "react"

export function EventWidget( {event, onClick} ) {

  // TODO: create a function for fetching event details using the eventId prop

  //const event = findEventById(eventId)

  return (
    <div class="eventWidget"
        onClick={ () => onClick(event._id) }
    >
        <h1> { event.title } </h1>
        <p> Event ID: { event._id } </p>
        <p> { event.description } </p>
    </div>
  );
}