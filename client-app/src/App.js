import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { HomePage } from './components/HomePage';
import { AccountPage } from './components/AccountPage';
import { EventPage } from './components/EventPage';
import { NavigationBar } from './components/NavigationBar';
import { EventCreationPage } from './components/EventCreationPage';
import { EventManagementPage } from './components/EventManagementPage';
import { EventEditPage } from './components/EventEditPage';
import { UserPage } from './components/UserPage';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser } from './utils/requests/user';
import { Loading } from './components/ui/loading';
import { ErrorNotFoundPage } from './components/ErrorNotFoundPage';
import { SavedEventsPage } from './components/SavedEventsPage';

export function App() {
    const [isLoggedIn, setLoggedIn] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (user) => {
        setLoggedIn(true);
        // persist a lightweight flag to allow quick client-side checks (optional)
        try { localStorage.setItem('isLoggedIn', '1'); } catch (e) {}
        navigate('/home');
    };
    const handleLogout = () => {
        setLoggedIn(false);
        try { localStorage.removeItem('isLoggedIn'); } catch (e) {}
        navigate('/');
    };
    // On mount, verify session with server. This keeps the user logged in across refresh/navigation
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const user = await getCurrentUser();
                if (!mounted) return;
                if (user) setLoggedIn(true);
                else setLoggedIn(false);
            } catch (err) {
                setLoggedIn(false);
            } finally {
                if (mounted) setAuthChecked(true);
            }
        })();

        return () => { mounted = false; };
    }, []);

    // wrapper components to map route params into existing page props
    function EventPageRoute() {
        const { eventId } = useParams();
        return <EventPage eventId={eventId} onBack={() => navigate('/home')} />;
    }

    function UserPageRoute() {
        const { userId } = useParams();
        return <UserPage userId={userId} />;
    }

    function EventEditRoute() {
        const { eventId } = useParams();
        return (
            <EventEditPage
                eventId={eventId}
                onSaved={() => navigate('/event-management')}
                onCancel={() => navigate('/event-management')}
            />
        );
    }

    // if the user is not logged in display login page.
    if (!authChecked) return <Loading />;

    return (
        <div>
            <NavigationBar onLogout={handleLogout} />
            <Routes>
                <Route path="/" element={<Navigate to={ isLoggedIn?'/home':'/login' } replace />} />
                <Route path="/login" element={
                    isLoggedIn ? <Navigate to={'/home'} replace />
                    : <LoginPage onLogin={handleLogin} />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/event/:eventId" element={<EventPageRoute />} />
                <Route path="/event-creation" element={<EventCreationPage />} />
                <Route path="/event-management" element={<EventManagementPage onEditEvent={(id) => navigate(`/event-edit/${id}`)} />} />
                <Route path="/event-favorites" element={<SavedEventsPage />} />
                <Route path="/event-edit/:eventId" element={<EventEditRoute />} />
                <Route path="/user/:userId" element={<UserPageRoute />} />
                <Route path="*" element={<ErrorNotFoundPage />} />
            </Routes>
        </div>
    );
}