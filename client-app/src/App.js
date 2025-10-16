import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { HomePage } from './components/HomePage';
import { AccountPage } from './components/AccountPage';
import { EventPage } from './components/EventPage';
import { NavigationBar } from './components/NavigationBar';
import { EventCreationPage } from './components/EventCreationPage';
import { EventManagementPage } from './components/EventManagementPage';

export function App() {
    /* 
    the 'states' for the app.
    depending on the combination of these states the app will show different pages.
    */
    const [isLoggedIn, setLoggedIn] = useState(false)
    const [currentPage, setCurrentPage] = useState('home') // 'home', 'account', 'event'
    const [selectedEventId, setSelectedEventId] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)
    
    const handleLogin = (user) => {
        setLoggedIn(true)
        setCurrentUser(user)
    }
    const handleLogout = () => {
        setLoggedIn(false)
        setCurrentPage('home')
    }
    const handlePageChange = (page) => {
        setCurrentPage(page)
        setSelectedEventId(null)
    }
    const handleEventClick = (eventId) => {
        console.log('Event clicked:', eventId)
        setCurrentPage('event')
        setSelectedEventId(eventId)
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
                <HomePage 
                    onEventClick={handleEventClick}
                    onEventCreationClick={() => handlePageChange('event-creation')}
                    onEventManageClick={() => handlePageChange('event-management')}
                />
            )}

            {currentPage === 'account' && (
                <AccountPage 
                    user={currentUser}
                />
            )}

            {currentPage === 'event' && selectedEventId && (
                <EventPage 
                    eventId={selectedEventId}
                    onBack={() => handlePageChange('home')}
                />
            )}

            {currentPage === 'event-creation' && (
                <EventCreationPage 
                    user={currentUser}
                />
            )}

            {currentPage === 'event-management' && (
                <EventManagementPage 
                    user={currentUser}
                />
            )}

        </div>
    );
}