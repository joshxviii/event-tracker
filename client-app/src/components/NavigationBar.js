import React from "react";
import {ReactComponent as HomeIcon} from '../assets/home.svg';
import {ReactComponent as AccountIcon} from '../assets/account.svg';
import {ReactComponent as LogOutIcon} from '../assets/log-out.svg';
import { Button } from "./ui/button";


export const NavigationBar = () => {
    return (
        <nav id='nav-bar'>
            <p>Event Tracker</p>
            <div>
                <button>
                    <HomeIcon />
                    Home
                </button>

                <button>
                    <AccountIcon />
                    Account
                </button>
            </div>
            <button>
                <LogOutIcon />
                Sign Out
            </button>
        </nav>
    );
}