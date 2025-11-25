import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from 'react-router-dom';
import {ReactComponent as HomeIcon} from '../assets/home.svg';
import {ReactComponent as AccountIcon} from '../assets/account.svg';
import {ReactComponent as LogOutIcon} from '../assets/log-out.svg';
import {ReactComponent as DarkModeIcon} from '../assets/dark-mode.svg';
import {ReactComponent as LightModeIcon} from '../assets/light-mode.svg';
import { getCurrentUser } from "../utils/requests/user";
//import useDarkMode from "";  //currently an error, need to fix


export function NavigationBar( { onLogout } ) {
    const navigate = useNavigate();
    const [user, setUser ] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    //const [darkmode, setDarkmode] = useDarkMode();

    useEffect(() => {
        (async () => {
            setUser(await getCurrentUser());
        })();
    }, []);

    return (
        <nav id='nav-bar' className = "lightmodenavbar" >
            <div style={{ display: 'flex', padding: '4px 8px', alignItems: 'center', width: '100%', gap: 8 }}>
                <h3 id="navTitle"> Event Tracker </h3>

                <button
                    className="hamburger"
                    aria-label="Toggle navigation"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((s) => !s)}
                >
                    ☰
                </button>

                <div className={`navMenu ${menuOpen ? 'open' : ''}`}>
                    <div className="buttonGroup">
                        <button onClick={() => { setMenuOpen(false); navigate('/home'); }}>
                            <HomeIcon />
                            Home
                        </button>

                        <button onClick={() => { setMenuOpen(false); navigate('/account'); }}>
                            <AccountIcon />
                            Account
                        </button>
                    </div>

                    <div style={{ marginLeft: 8 }}>
                        <div className="buttonGroup">
                            <button onClick={() => { setMenuOpen(false); navigate('/event-creation'); }}>Create New Event</button>
                            <button onClick={() => { setMenuOpen(false); navigate('/event-management'); }}>Manage My Events</button>
                        </div>
                    </div>
                </div>

                <div style={{ marginLeft: 'auto', marginRight: 16 }}>
                    <div className="buttonGroup">
                        <button 
                        id="theme-switch"
                        style={{ backgroundColor: 'transparent'}} 
                        onClick={() => {
                            setMenuOpen(false);
                            //setDarkmode(!darkmode);
                            navigate("/home");
                        }}
                        >
                            <DarkModeIcon />
                            <LightModeIcon/>
                        </button>
                    <button
                        style={{ backgroundColor: 'transparent', color: '#155dfc', fontWeight: 600 }}
                        onClick={ onLogout }
                    >
                    {user && (
                        user.profilePicture ? (
                            <img className="profilePicture" src={user?.profilePicture}/>
                        ) : (
                            <div aria-hidden className="nullPicture"> {user?.username?.charAt(0).toUpperCase()} </div>
                        )
                    )}
                        <LogOutIcon />
                        Sign Out
                    </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}