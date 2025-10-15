import React, { useEffect, useState } from "react";
import Review from "./ui/review-panel";
import { get_event } from "../utils/requests/event";
import { get_reviews } from "../utils/requests/review";


export function EventPage( {eventId, onBack } ) {

    const [reviews, setReviews] = useState(null);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (!mounted) return;
                setReviews(await get_reviews(eventId) || []);
                setEvent(await get_event(eventId) || {});
            } catch (e) {
                if (!mounted) return;
                setError(e.message || String(e));
                setReviews([]);
                setEvent({});
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () =>  mounted = false;
    }, []);

    if (event) return (
        <div>
            <h2>{event.title}</h2>
            <br/>
            <button
                onClick={onBack}
            >
                Back Home
            </button>
            <p> Event Description: {event.description} </p>

            <div class="reviewContainer container">
                <h3> Reviews: </h3>
                {
                    reviews.map((review, i) => (
                        <Review 
                            rating={review.rating}
                            text={review.text}
                            author={review.author}
                        />
                    ))
                }
            </div>

        </div>
    );
}