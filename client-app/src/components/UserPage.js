import React, { useEffect, useState } from "react";
import { getUser, getCurrentUser } from "../utils/requests/user";
import { sendFriendRequest, removeFriend, acceptFriendRequest, rejectFriendRequest } from "../utils/requests/friends";
import { Loading } from "./ui/loading";
import { useNavigate } from 'react-router-dom';

export function UserPage({ userId: propUserId }) {
    const navigate = useNavigate();
    const [targetUser, setTargetUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionInProgress, setActionInProgress] = useState(false);

    const userId = propUserId; // App passes userId via prop from route wrapper

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);

        (async () => {
            try {
                const [u, me] = await Promise.all([getUser(userId), getCurrentUser()]);
                if (!mounted) return;
                setTargetUser(u);
                setCurrentUser(me);
            } catch (err) {
                if (!mounted) return;
                setError(err?.message || String(err));
                setTargetUser(null);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => { mounted = false; };
    }, [userId]);

    const hasId = (arr, id) => Array.isArray(arr) && arr.some(item => String((item && item._id) || item) === String(id));
    const isSelf = currentUser && targetUser && String(currentUser._id) === String(targetUser._id);
    const isFriend = currentUser && targetUser && hasId(currentUser.friends, targetUser._id);
    const isOutgoing = currentUser && targetUser && hasId(currentUser.outgoingRequests, targetUser._id);
    const isIncoming = currentUser && targetUser && hasId(currentUser.incomingRequests, targetUser._id);

    const handleAddFriend = async () => {
        if (actionInProgress || !targetUser) return;
        setActionInProgress(true);
        try {
            await sendFriendRequest(targetUser._id);
            const me = await getCurrentUser();
            setCurrentUser(me);
        } catch (err) {
            setError('Could not send friend request.');
        } finally {
            setActionInProgress(false);
        }
    };

    const handleAccept = async () => {
        if (actionInProgress || !targetUser) return;
        setActionInProgress(true);
        try {
            await acceptFriendRequest(targetUser._id);
            const me = await getCurrentUser();
            setCurrentUser(me);
        } catch (err) {
            setError('Could not accept request.');
        } finally {
            setActionInProgress(false);
        }
    };

    const handleReject = async () => {
        if (actionInProgress || !targetUser) return;
        setActionInProgress(true);
        try {
            await rejectFriendRequest(targetUser._id);
            const me = await getCurrentUser();
            setCurrentUser(me);
        } catch (err) {
            setError('Could not reject request.');
        } finally {
            setActionInProgress(false);
        }
    };

    const handleRemoveFriend = async () => {
        if (actionInProgress || !targetUser) return;
        setActionInProgress(true);
        try {
            await removeFriend(targetUser._id);
            const me = await getCurrentUser();
            setCurrentUser(me);
        } catch (err) {
            setError('Could not remove friend.');
        } finally {
            setActionInProgress(false);
        }
    };

    if (loading) return <Loading />;
    if (error) return <div className="error">Could not load user: {error}</div>;
    if (!targetUser) return <div className="error">User not found.</div>;

    return (
        <div className="eventPageContainer container">
            <div className="userMeta" style={{  }}>
                {targetUser.profilePicture ? (
                    <img src={targetUser.profilePicture} alt={targetUser.username} className="profilePicture big" />
                ) : (
                    <div className="nullPicture big">{(targetUser.username || '').charAt(0).toUpperCase()}</div>
                )}

                <div>
                    <h2 className="eventHeader">{targetUser.firstName} {targetUser.lastName}</h2>
                    <div style={{ color: '#666' }}>@{targetUser.username}</div>
                    {targetUser.email && <div style={{ marginTop: 8 }}>{targetUser.email}</div>}
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    {!isSelf && currentUser && (
                        isFriend ? (
                            <button className="viewDetailsBtn" onClick={handleRemoveFriend} disabled={actionInProgress}>Remove Friend</button>
                        ) : isOutgoing ? (
                            <button className="viewDetailsBtn" disabled>Request Sent</button>
                        ) : isIncoming ? (
                            <>
                                <button className="viewDetailsBtn" onClick={handleAccept} disabled={actionInProgress}>Accept</button>
                                <button className="viewDetailsBtn" onClick={handleReject} disabled={actionInProgress}>Reject</button>
                            </>
                        ) : (
                            <button className="viewDetailsBtn" onClick={handleAddFriend} disabled={actionInProgress}>Add Friend</button>
                        )
                    )}

                    {isSelf && (
                        <button className="viewDetailsBtn" onClick={() => navigate('/account')}>Edit Profile</button>
                    )}
                </div>
            </div>

            <div style={{ marginTop: 20 }} className="eventMeta">
                <h3>Activity</h3>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div className="stat">
                        <div className="stat-number">{(targetUser.createdEvents || []).length}</div>
                        <div className="stat-label">Created</div>
                    </div>
                    <div className="stat">
                        <div className="stat-number">{(targetUser.attendedEvents || []).length}</div>
                        <div className="stat-label">Attended</div>
                    </div>
                    <div className="stat">
                        <div className="stat-number">{(targetUser.friends || []).length}</div>
                        <div className="stat-label">Followers</div>
                    </div>
                </div>
            </div>
        </div>
    );
}