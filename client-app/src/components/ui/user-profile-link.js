import React from "react";
import { useNavigate } from "react-router-dom";

export const UserProfileLink = ( {user, showDetails = true, style}) => {
    const navigate = useNavigate();
    
    return (
        <div style={style}>
            <span
                onClick={() => navigate(`/user/${user._id}`)}
                style={{cursor: "pointer", display: "flex", alignItems: "center", gap: 8}}
            >
                {user.profilePicture ? (
                    <img className="profilePicture" src={user.profilePicture}/>
                ) : (
                    <div aria-hidden className="nullPicture"> {user.username.charAt(0).toUpperCase()} </div>
                )}
                {showDetails && (
                    <div className="friendSidebarItemInfo">
                        <div className="friendSidebarName">
                            {user.firstName} {user.lastName}
                        </div>
                        <div className="friendSidebarUsername">
                            @{user.username}
                        </div>
                    </div>
                )}
            </span>
        </div>
    )
}