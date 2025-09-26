import React from "react";
import { App, setLoggedIn } from "../App";
import {ReactComponent as HomeIcon} from '../assets/home.svg';
import {ReactComponent as AccountIcon} from '../assets/account.svg';
import {ReactComponent as LogOutIcon} from '../assets/log-out.svg';


export function NavigationBar( { currentPage, onPageChange, onLogout } ) {
    return (
        <nav id='nav-bar'>
            <p>Event Tracker</p>
            <div>
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
            <button
                onClick={ onLogout }
            >
                <LogOutIcon />
                Sign Out
            </button>
        </nav>
    );
}