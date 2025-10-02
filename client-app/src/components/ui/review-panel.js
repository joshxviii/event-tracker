import React from "react";

export default function Review( { rating, text, author } ) {

    return (
        <div class="reviewPanel">
            <p> { author } </p>
            <p> { text } </p>
            <span className="stars">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
        </div>
    );
}
