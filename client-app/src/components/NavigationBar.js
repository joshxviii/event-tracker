import React from "react";
import { App, setLoggedIn } from "../App";
import {ReactComponent as HomeIcon} from '../assets/home.svg';
import {ReactComponent as AccountIcon} from '../assets/account.svg';
import {ReactComponent as LogOutIcon} from '../assets/log-out.svg';


export function NavigationBar( { currentPage, onPageChange, onLogout, onEventCreationClick, onEventManageClick } ) {
    return (
        <nav id='nav-bar' style={{ backgroundColor: '#f1f8ffff' }}>
            <h3 id="navTitle"> Event Tracker </h3>
            <div class="buttonGroup">
                <button
                    onClick={ () => onPageChange('home') }
                >
                    <HomeIcon />
                    Home
                </button>

                <button
                    onClick={ () => onPageChange('account') }
                >
                    <AccountIcon />
                    Account
                </button>
            </div>

            <h2 className="indent">
                <div className="buttonGroup">
                    <button onClick={onEventCreationClick}>Create New Event</button>
                    <button onClick={onEventManageClick}>Manage My Events</button>
                </div>
            </h2>

            <button
                style={{marginLeft: 'auto', marginRight: '16px'}}
                onClick={ onLogout }
            >
                <LogOutIcon />
                Sign Out
            </button>
        </nav>
    );
}