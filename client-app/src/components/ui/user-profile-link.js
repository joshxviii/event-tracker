import React from "react";
import { useNavigate } from "react-router-dom";

export const UserProfileLink = ( {user} ) => {
    const navigate = useNavigate();
    
    return (
        <span
            onClick={() => navigate(`/user/${user._id}`)}
            style={{cursor: "pointer", display: "flex", alignItems: "center", gap: 8}}
        >
            {user.profilePicture ? (
                <img className="profilePicture" src={user.profilePicture}/>
            ) : (
                <div aria-hidden className="nullPicture"> {user.username.charAt(0).toUpperCase()} </div>
            )}
            <p style={{margin: 0}}>{user.username}</p>
        </span>
    )
}