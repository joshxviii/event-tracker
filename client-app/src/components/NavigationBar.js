import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from 'react-router-dom';
import {ReactComponent as HomeIcon} from '../assets/home.svg';
import {ReactComponent as AccountIcon} from '../assets/account.svg';
import {ReactComponent as LogOutIcon} from '../assets/log-out.svg';
import {ReactComponent as HeartIcon} from '../assets/heart.svg';
import {ReactComponent as EditIcon} from '../assets/edit.svg';
import {ReactComponent as CreateIcon} from '../assets/add.svg';
import {ReactComponent as DarkModeIcon} from '../assets/dark-mode.svg';
import {ReactComponent as LightModeIcon} from '../assets/light-mode.svg';
import {ReactComponent as GoLocalIcon} from '../assets/go-local.svg';
import { getCurrentUser } from "../utils/requests/user";
import useDarkMode from "./ui/useDarkMode";


export function NavigationBar( { onLogout } ) {
    const { isDark, toggleDarkMode } = useDarkMode();
    const navigate = useNavigate();
    const [user, setUser ] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === '1');

    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!mounted) return;
            if (isLoggedIn) {
                try {
                    const u = await getCurrentUser();
                    if (mounted) setUser(u);
                } catch (e) {
                    if (mounted) setUser(null);
                }
            } else {
                setUser(null);
            }
        })();

        return () => { mounted = false; };
    }, [isLoggedIn]);

    useEffect(() => {
        const handler = (e) => {
            if (!e) return;
            if (e.key === 'isLoggedIn') {
                setIsLoggedIn(e.newValue === '1');
            }
            if (e.key === 'token' && !e.newValue) {
                setIsLoggedIn(false);
            }
            if (e.key === 'token' && e.newValue) {
                setIsLoggedIn(true);
            }
        };

        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    useEffect(() => {
        const onSessionChanged = () => {
            setIsLoggedIn(localStorage.getItem('isLoggedIn') === '1');
        };
        window.addEventListener('session-changed', onSessionChanged);
        return () => window.removeEventListener('session-changed', onSessionChanged);
    }, []);

    useEffect(() => {
        const onFocus = async () => {
            const logged = localStorage.getItem('isLoggedIn') === '1';
            setIsLoggedIn(logged);
            if (logged) {
                try {
                    const u = await getCurrentUser();
                    setUser(u);
                } catch (e) {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, []);

    return (
        <nav id='nav-bar'>
            <div style={{ display: 'flex', padding: '4px 8px', alignItems: 'center', width: '100%', gap: 8 }}>
                
                <h3 id="navTitle" onClick={() => {setMenuOpen(false); navigate('/home');}} style={{cursor: 'pointer', display: `${menuOpen ? 'none' : 'flex'}`, gap: 8, fontSize: 28, marginBlock: 8, marginLeft: 0, marginRight: 8}} >
                    <GoLocalIcon />
                    GoLocal
                </h3>

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
                    <div className="buttonGroup">
                        <button 
                            id="theme-switch"
                            onClick={toggleDarkMode}
                            style={{ backgroundColor: 'transparent'}} 
                            >
                                <DarkModeIcon />
                                <LightModeIcon />
                        </button>

                        {isLoggedIn ? (
                            <button
                                style={{ backgroundColor: 'transparent', color: '#155dfc' }}
                                
                            >
                                <div onClick= {() => navigate('/account')}>
                                    {user && (user.profilePicture ? (
                                        <img className="profilePicture" src={user.profilePicture}/>
                                    ) : (
                                        <div aria-hidden className="nullPicture"> {user.username.charAt(0).toUpperCase()} </div>
                                    ))}
                                </div>

                                <LogOutIcon onClick={ onLogout }/>
                                <div style={{color: '#155dfc', fontWeight: 600}} onClick={ onLogout }>Sign Out</div>    
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
            </div>
        </nav>
    );
}