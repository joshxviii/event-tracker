import React from "react";
import { EventWidget } from "./ui/event-widget";

export const HomePage = ( { onEventClick } ) => {
    return (
        <div>
            Home Page

            <div className="eventContainer">
                <EventWidget
                    eventId={16}
                    onClick={onEventClick}
                />
                <EventWidget
                    eventId={42}
                    onClick={onEventClick}
                />
                <EventWidget
                    eventId={3}
                    onClick={onEventClick}
                />
            </div>

        </div>
    );
}