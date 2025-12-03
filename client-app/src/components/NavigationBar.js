import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from 'react-router-dom';
import {ReactComponent as HomeIcon} from '../assets/home.svg';
import {ReactComponent as AccountIcon} from '../assets/account.svg';
import {ReactComponent as LogOutIcon} from '../assets/log-out.svg';
import {ReactComponent as HeartIcon} from '../assets/heart.svg';
import {ReactComponent as EditIcon} from '../assets/edit.svg';
import {ReactComponent as CreateIcon} from '../assets/add.svg';
import { getCurrentUser } from "../utils/requests/user";


export function NavigationBar( { onLogout } ) {
    const navigate = useNavigate();
    const [user, setUser ] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const isLoggedIn = localStorage.getItem('isLoggedIn');

    useEffect(() => {
        (async () => {
            setUser(await getCurrentUser());
        })();
    }, []);

    return (
        <nav id='nav-bar' style={{ backgroundColor: '#cee7ffff' }}>
            <div style={{ display: 'flex', padding: '4px 8px', alignItems: 'center', width: '100%', gap: 8 }}>
                <h3 id="navTitle" style={{cursor: 'pointer'}} onClick={() => {setMenuOpen(false); navigate('/home');}} > Event Tracker </h3>

                <button
                    className="hamburger"
                    aria-label="Toggle navigation"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((s) => !s)}
                >
                    ☰
                </button>

                <div className={`navMenu ${menuOpen ? 'open' : ''}`}>
                    {isLoggedIn &&
                        (<div className="buttonGroup">
                            <button onClick={() => { setMenuOpen(false); navigate('/home'); }}>
                                <HomeIcon />
                                Home</button>
                            <button onClick={() => { setMenuOpen(false); navigate('/account'); }}>
                                <AccountIcon />
                                Account</button>
                            <button onClick={() => { setMenuOpen(false); navigate('/event-creation'); }}>
                                <CreateIcon />
                                Create New Event</button>
                            <button onClick={() => { setMenuOpen(false); navigate('/event-management'); }}>
                                <EditIcon />
                                Manage My Events</button>
                            <button onClick={() => { setMenuOpen(false); navigate('/event-favorites'); }}>
                                <HeartIcon />
                                View Saved Events</button>
                        </div>)}

                    {!isLoggedIn &&
                        (<div className="buttonGroup">
                            <button onClick={() => { setMenuOpen(false); navigate('/home'); }}>
                                <HomeIcon />
                                Home
                            </button>
                        </div>)}

                </div>



                <div style={{ marginLeft: 'auto', marginRight: 16 }}>
                    {isLoggedIn ? (
                        <button
                            style={{ backgroundColor: 'transparent', color: '#155dfc', fontWeight: 600 }}
                            onClick={ onLogout }
                        >
                            {user && (user.profilePicture ? (
                                <img className="profilePicture" src={user.profilePicture}/>
                            ) : (
                                <div aria-hidden className="nullPicture"> {user.username.charAt(0).toUpperCase()} </div>
                            ))}
                            <LogOutIcon />
                            Sign Out
                        </button>
                    ) : (
                        <button
                            style={{ backgroundColor: 'transparent', color: '#155dfc', fontWeight: 600 }}
                            onClick={ () => navigate('/login') }
                        >
                            <LogOutIcon />
                            Log In
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}