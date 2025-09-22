import logo from './assets/logo.svg';
import './styles/App.css';
import React, { useState } from 'react';
import { LogInPage } from './components/LogInPage';
import { HomePage } from './components/HomePage';
import { AccountPage } from './components/AccountPage';
import { EventPage } from './components/EventPage';
import { NavigationBar } from './components/NavigationBar';

export function App() {
    /* 
    the 'states' for the app.
    depending on the combination of these states the app will show different pages.
    */
    const [isLoggedIn, setLoggedIn] = useState(true)
    const [currentPage, setCurrentPage] = useState('home') // 'home', 'account', 'event'
    const [selectedEventId, setSelectedEventId] = useState(0)

    // if the user is not logged in display login page.
    if(!isLoggedIn) return (
        <LogInPage />
    ) 
    // display other pages otherwise.
    else return (
        <div>
            <NavigationBar />

            {currentPage === 'home' && (
                <HomePage />
            )}

            {currentPage === 'account' && (
                <AccountPage />
            )}

            {currentPage === 'event' && (
                <EventPage />
            )}
        </div>
    );
}