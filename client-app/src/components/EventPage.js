import React, { useEffect, useState } from "react";
import Review from "./ui/review-panel";
import { get_event, favorite_event } from "../utils/requests/event";
import { delete_review, get_reviews } from "../utils/requests/review";
import ReviewTextbox from "./ui/review-textbox";
import {ReactComponent as HeartIcon} from '../assets/heart.svg';
import {ReactComponent as HeartFilledIcon} from '../assets/heart-filled.svg';
import {ReactComponent as ShareIcon} from '../assets/share.svg';
import {ReactComponent as BackIcon} from '../assets/back.svg';
import {ReactComponent as PoiIcon} from '../assets/poi.svg';
import {ReactComponent as CalendarIcon} from '../assets/calendar.svg';
import { getCurrentUser } from "../utils/requests/user";

export function EventPage( { eventId, onBack } ) {

    const [user, setUser ] = useState(null);

    const [reviews, setReviews] = useState(null);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isToggling, setIsToggling] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);

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
                const currentUser = await getCurrentUser()
                setUser(currentUser);
                setReviews(await get_reviews(eventId) || []);
                setEvent(await get_event(eventId) || {});
                console.log('User favorite events:', currentUser);
                setIsFavorited(currentUser?.favoriteEvents?.includes(eventId) ?? false);
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
    }, [eventId]);


    const toggleFavorite = async () => {
        if (isToggling || !user) return;
        
        setIsToggling(true);
        try {
            setIsFavorited(!isFavorited);
            await favorite_event(eventId);
        } catch (error) {
            setIsFavorited(!isFavorited);
            setError(error.message || 'Failed to toggle favorite');
        } finally {
            setIsToggling(false);
        }
    };

    if (event) return (
        <div className="eventPageContainer">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <button onClick={onBack} style={{ marginRight: 12, fontSize: 16, backgroundColor: '#00000000', color: '#155dfc' }}><BackIcon /> Back Home</button>
                </div>
            </div>

            <div className="eventInfo">
                <div className="eventImage">
                    <div className="buttonGroup eventButtons" >
                        <button
                            onClick={toggleFavorite}
                            disabled={isToggling || !user}
                            style={{ 
                                opacity: (isToggling || !user) ? 0.6 : 1,
                                cursor: (isToggling || !user) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isFavorited ? <HeartFilledIcon style={{color: "#e84343ff"}}/> : <HeartIcon />}
                        </button>
                        <button onClick={()=>{}}><ShareIcon/></button>
                    </div>
                    {event.image ? (
                        <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: 8 }}>
                            <span style={{ color: '#9ca3af' }}>No image</span>
                        </div>
                    )}
                </div>

                <div className="eventMeta">
                    <h1 className="eventHeader">{event.title}</h1>
                    <div style={{ marginBottom: 8 }}>
                        <span className="eventLabel" style={{ backgroundColor: `var(--event-color-${event.category || 'other'})` }}>{event.category}</span>
                    </div>
                    <p style={{ color: '#374151' }}>{event.description}</p>
                    <div style={ {display:'flex', flexDirection: 'column', gap: 6} }>
                        <div style={ {display: 'flex', gap: 6} }>
                            <CalendarIcon/>
                            {event.startAt ? new Date(event.startAt).toLocaleDateString() : ''}
                            {event.startAt && ` at ${new Date(event.startAt).toLocaleTimeString()} - ${event.endAt ? new Date(event.endAt).toLocaleTimeString() : ''}`}
                        </div>
                        <div style={ {display: 'flex', gap: 6} }> <PoiIcon/> <div style={ { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'} }> {event.location.address} </div> </div> 
                    </div>
                </div>
            </div>

            <div className="reviewContainer container" style={{ marginTop: 20 }}>
                <h3 className="indent">Reviews</h3>
                <div>
                    {reviews && reviews.length > 0 ? (
                        reviews.map((review) => (
                            <Review
                                key={review._id}
                                reviewId={review._id}
                                rating={review.rating}
                                text={review.text}
                                author={review.author}
                                onDelete={deleteReview}
                            />
                        ))
                    ) : (<div className="indent">No reviews yet</div>)}
                </div>

                <div style={{ marginTop: 12 }}>
                    <ReviewTextbox
                        eventId={event._id}
                        onReviewSubmitted={reloadReviews}
                    />
                </div>
            </div>
        </div>
    );
}