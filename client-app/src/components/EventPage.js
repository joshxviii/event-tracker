import React from "react";
import { findEventById } from "../utils/events";
import { getReviewsFromEventID } from "../utils/reviews";
import Review from "./ui/review-panel";


export function EventPage( {eventId, onBack } ) {

    const event = findEventById(eventId)
    const reviews = getReviewsFromEventID(eventId)

    console.log(reviews)

    return (
        <div>
            <h2 class="indent2">{event.name}</h2>
            <br/>
            <button  class="indent2"
                onClick={onBack}
            >
                Back Home
            </button>
            <p class="indent2"> Event Description: {event.description} </p>

            <div class="reviewContainer container">
                <h3 class="indent2"> Reviews: </h3>
                {
                    reviews.map((e, i) => (
                        <Review 
                            rating={e.rating}
                            text={e.text}
                            author={e.author}
                        />
                        
                    ))
                }
            </div>

        </div>
    );
}