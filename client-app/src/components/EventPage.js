import React from "react";
import { findEventById } from "../utils/events";

export function EventPage( {eventId, onBack } ) {

    const event = findEventById(eventId)

    return (
        <div>
            <h2>{event.name}</h2>
            <br/>
            <button
                onClick={onBack}
            >
                Back Home
            </button>
            <p> event Id: {event.id} </p>
            <p> event description: {event.description} </p>
        </div>
    );
}