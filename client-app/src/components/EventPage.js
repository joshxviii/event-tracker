import React, { useEffect, useState } from "react";
import Review from "./ui/review-panel";
import { get_event } from "../utils/requests/event";
import { delete_review, get_reviews } from "../utils/requests/review";
import ReviewTextbox from "./ui/review-textbox";


export function EventPage( {eventId, onBack } ) {

    const [reviews, setReviews] = useState(null);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const reloadReviews = async () => {
        try {
            setReviews(await get_reviews(eventId) || []);
        } catch (e) {
            setError(e.message || String(e));
            setReviews([]);
        }
    };

    const deleteReview = async (reviewId) => {

        console.log("Deleting review", reviewId);

        delete_review(eventId, reviewId).then(() => {
            reloadReviews();
        }).catch((e) => {
            setError(e.message || String(e));
        });
    };

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
            
            <div class="eventHeader container">
                <h2>{event.title}</h2>
                <br/>
                <button
                    onClick={onBack}
                >
                    Back Home
                </button>
                <p> Event Description: {event.description} </p>
            </div>


            <div class="reviewContainer container">
                <h3> Reviews: </h3>
                {
                    reviews.map((review, i) => (
                        <Review
                            reviewId={review._id}
                            rating={review.rating}
                            text={review.text}
                            author={review.author}
                            onDelete={deleteReview}
                        />
                    ))
                }
                {reviews.length === 0 && <div>No reviews yet</div>}

                <ReviewTextbox
                    eventId={event._id}
                    onReviewSubmitted={reloadReviews}
                />
            </div>

        </div>
    );
}