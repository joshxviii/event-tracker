import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from 'react-router-dom';
import {ReactComponent as HomeIcon} from '../assets/home.svg';
import {ReactComponent as AccountIcon} from '../assets/account.svg';
import {ReactComponent as LogOutIcon} from '../assets/log-out.svg';
import { getCurrentUser } from "../utils/requests/user";


export function NavigationBar( { onLogout } ) {
    const navigate = useNavigate();
    const [user, setUser ] = useState(null);

    useEffect(() => {
        (async () => {
            setUser(await getCurrentUser());
        })();
    }, []);

    return (
        <nav id='nav-bar' style={{ backgroundColor: '#cee7ffff' }}>
            <h3 id="navTitle"> Event Tracker </h3>
            <div className="buttonGroup">
                <button onClick={() => navigate('/home')}>
                    <HomeIcon />
                    Home
                </button>

                <button onClick={() => navigate('/account')}>
                    <AccountIcon />
                    Account
                </button>
            </div>

            <h2 className="indent">
                <div className="buttonGroup">
                    <button onClick={() => navigate('/event-creation')}>Create New Event</button>
                    <button onClick={() => navigate('/event-management')}>Manage My Events</button>
                </div>
            </h2>

            <button
                style={{marginLeft: 'auto', marginRight: '16px', backgroundColor: 'transparent', color: '#155dfc', fontWeight: 600}}
                onClick={ onLogout }
            >
            {user && (
                user.profilePicture ? (
                    <img className="profilePicture" src={user?.profilePicture}/>
                ) : (
                    <div aria-hidden className="nullPicture"> {user?.username.charAt(0).toUpperCase()} </div>
                )
            )}
                <LogOutIcon />
                Sign Out
            </button>
        </nav>
    );
}