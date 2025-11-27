import React, { useState } from 'react';
import { create_review } from '../../utils/requests/review';
import { getCurrentUser } from '../../utils/requests/user';

export default function ReviewTextbox({ eventId, onReviewSubmitted }) {
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const submit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const author = await getCurrentUser();
            await create_review( { rating, text, author: author._id, event: eventId }, eventId );
            if (onReviewSubmitted) onReviewSubmitted();
            setText('');
            setRating(5);
        } catch (err) {
            setError(err.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submit} style={{ backgroundColor: 'var(--event-list-color)', padding: 12, borderRadius: 6,}}>
            <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex'}}>
                {[1,2,3,4,5].map((s) => (
                    <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        aria-label={`${s} star`}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 24,
                            color: s <= rating ? '#f5b401ff' : '#ddddddff'
                        }}
                    >
                    ★
                    </button>
                ))}
                </div>
            </div>

            <div style={{ marginBottom: 8 }}>
                <textarea
                    value={text}
                    maxLength={250}
                    onChange={(e) => setText(e.target.value)}
                    style={{ padding: 8 }}
                    placeholder="Write your review..."
                />
            </div>

            {error && <div role="alert" style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>
                {loading ? 'Posting...' : 'Post review'}
                </button>
                <button type="button" style={{ padding: '8px 12px' }}>Cancel</button>
            </div>
        </form>
    );
}