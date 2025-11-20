import React, { useEffect, useState } from "react";
import {ReactComponent as DeleteIcon} from '../../assets/delete.svg';
import { getCurrentUser } from "../../utils/requests/user";
import { UserProfileLink } from "./user-profile-link";

export default function Review({ review, onDelete }) {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (mounted) setCurrentUser(await getCurrentUser() || null);
            } catch (e) {/* ignore */}
        })();
        return () => (mounted = false);
    }, []);

    const handleDelete = () => {
        if (onDelete) onDelete(review._id);
    };

    const canDelete = currentUser && (currentUser._id === review.author._id);

    console.log(review.author)

    return (
        <div className="reviewPanel" >
            <UserProfileLink user={review.author} />
            <span className="stars" style={{fontSize: 20, color: '#f5b401ff'}}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
            
            <p style={{margin: 0}}>{review.text}</p>
            {canDelete && (
                <div>
                    <DeleteIcon onClick={handleDelete} className="delete-review" />
                </div>
            )}
        </div>
    );
}
