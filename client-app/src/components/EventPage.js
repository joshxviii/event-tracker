import React from "react";

export function EventPage( { eventId, onBack } ) {
    return (
        <div>
            Event Page
            <br/>
            <button
                onClick={onBack}
            >
                Back Home
            </button>
            <p> current event Id: {eventId} </p>
        </div>
    );
}