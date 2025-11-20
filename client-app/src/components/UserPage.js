import React, { useEffect, useState } from "react";
import { getUser } from "../utils/requests/user";


export function UserPage( { userId } ) {

    const [thisUser, setThisUser] = useState(null); 

    useEffect(() => {
        (async () => {
            setThisUser( await getUser(userId) )
        })();
    });

    return (
        <div>
            {thisUser.username}
        </div>
    )
}