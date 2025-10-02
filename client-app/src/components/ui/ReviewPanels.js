import React from "react";

export default function ReviewsPanel({ reviews = [] }) {
    // filler data if none passed in
    const demo = reviews.length
        ? reviews
        : [
            {
                id: 1,
                event: "FSC",
                rating: 5,
                text: "Great crowd, easy parking. Would go again!",
                author: "Alex P."
            },
            {
                id: 2,
                event: "My event",
                rating: 4,
                text: "Good vibes, a bit crowded near the entrance.",
                author: "Jordan R."
            },
            {
                id: 3,
                event: "Brooklyn",
                rating: 5,
                text: "Awesome venue and staff were super helpful.",
                author: "Sam K."
            }
        ];

    return (
        <div className="reviewsBox">
            <div className="reviewsHeader">
                <h3>Event Reviews</h3>
            </div>

            <div className="reviewsList">
                {demo.map((r) => (
                    <div key={r.id} className="reviewCard">
                        <div className="reviewTop">
                            <strong>{r.event}</strong>
                            <span className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                        </div>
                        <p className="reviewText">{r.text}</p>
                        <div className="reviewAuthor">— {r.author}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
