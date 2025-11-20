import React from "react";

export const UserProfileLink = ( {user} ) => {

    return (
        <span style={{cursor: "pointer", display: "flex", alignItems: "center", gap: 8}}>
            {user.profilePicture ? (
                <img className="profilePicture" src={user.profilePicture}/>
            ) : (
                <div aria-hidden className="nullPicture"> {user.username.charAt(0).toUpperCase()} </div>
            )}
            <p style={{margin: 0}}>{user.username}</p>
        </span>
    )
}