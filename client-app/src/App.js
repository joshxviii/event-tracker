import './styles/App.css';
import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
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
    
    const handleLogin = () => {
        setLoggedIn(true)
    }
    const handleLogout = () => {
        setLoggedIn(false)
        setCurrentPage('home')
    }
    const handlePageChange = (page) => {
        setCurrentPage(page)
    }


    // if the user is not logged in display login page.
    if(!isLoggedIn) return (
        <LoginPage
            onLogin={handleLogin}
        />
    )
    // display other pages otherwise.
    else return (
        <div>
            <NavigationBar
                currentPage={currentPage}
                onPageChange = {handlePageChange}
                onLogout={handleLogout}
            />

            {currentPage === 'home' && (
                <HomePage />
            )}

            {currentPage === 'account' && (
                <AccountPage />
            )}

            {currentPage === 'event' && selectedEventId && (
                <EventPage />
            )}
        </div>
    );
}