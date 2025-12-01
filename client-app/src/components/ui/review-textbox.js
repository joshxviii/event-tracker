import React, { useState, useEffect } from 'react';
import { create_review } from '../../utils/requests/review';
import { getCurrentUser } from '../../utils/requests/user';

export default function ReviewTextbox({ eventId, onReviewSubmitted }) {
    
    const [user, setUser] = useState(null);
    
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try { setUser(await getCurrentUser()) }
            catch (e) {/* ignore */}
        })();
        return () => {};
    });

    const submit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (user)
            await create_review( { rating, text, author: user._id, event: eventId }, eventId );
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
        <div style={{ position: 'relative' }}>
            {!user && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.49)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1
                }}>
                    <p style={{ fontSize: 16, color: '#666' }}>Please log in to write a review.</p>
                </div>
            )}
            <form onSubmit={submit} style={{ backgroundColor: '#fff', border: '1px solid #ddd', padding: 12, borderRadius: 6, pointerEvents: user ? 'auto' : 'none', opacity: user ? 1 : 0.6 }}>
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

                {user && (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>
                        {loading ? 'Posting...' : 'Post review'}
                        </button>
                        <button type="button" style={{ padding: '8px 12px' }}>Cancel</button>
                    </div>
                )}
            </form>
        </div>
    );
}