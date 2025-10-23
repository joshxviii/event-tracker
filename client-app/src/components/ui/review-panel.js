import React, { useEffect, useState } from "react";
import {ReactComponent as DeleteIcon} from '../../assets/delete.svg';
import { getCurrentUser } from "../../utils/requests/user";

export default function Review({ reviewId, rating, text, author, onDelete }) {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const u = await getCurrentUser();
                if (mounted) setCurrentUser(u || null);
            } catch (e) {/* ignore */}
        })();
        return () => (mounted = false);
    }, []);

    const handleDelete = () => {
        if (onDelete) onDelete(reviewId);
    };

    const canDelete = currentUser && (currentUser._id === author._id);

    return (
        <div className="reviewPanel">
            <p>{author?.username || 'Anonymous'}</p>
            <p>{text}</p>
            <span className="stars">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
            {canDelete && (
                <div>
                    <DeleteIcon onClick={handleDelete} class="delete-review"/>
                </div>
            )}
        </div>
    );
}
