import React, { useEffect, useState } from "react";
import {
    getFriends,
    getFriendRequests,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
} from "../../utils/requests/friends";

const FriendSidebar = () => {
    const [friends, setFriends] = useState([]);
    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function refreshAll() {
        try {
            setLoading(true);
            setError(null);

            const [friendsData, requestsData] = await Promise.all([
                getFriends(),
                getFriendRequests(),
            ]);

            setFriends(friendsData || []);
            setIncoming(requestsData?.incoming || []);
            setOutgoing(requestsData?.outgoing || []);
        } catch (err) {
            console.error('Friend search error:', err);
            // cleaner message instead of "GET /api/.. failed"
            setError("Could not load friend data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refreshAll();
    }, []);

    async function handleSearch(e) {
        e.preventDefault();
        if (!searchText.trim()) {
            setSearchResults([]);
            return;
        }
        try {
            const results = await searchUsers(searchText.trim());
            setSearchResults(results || []);
            setError(null);
        } catch (err) {
            setError("Search failed. Please try again.");
        }
    }

    async function handleSendRequest(userId) {
        try {
            await sendFriendRequest(userId);
            await refreshAll();
        } catch (err) {
            setError("Could not send request.");
        }
    }

    async function handleAccept(userId) {
        try {
            await acceptFriendRequest(userId);
        } catch (err) {
            setError("Could not accept request.");
        } finally {
            await refreshAll();
        }
    }

    async function handleReject(userId) {
        try {
            await rejectFriendRequest(userId);
        } catch (err) {
            setError("Could not reject request.");
        } finally {
            await refreshAll();
        }
    }

    async function handleRemoveFriend(userId) {
        try {
            await removeFriend(userId);
        } catch (err) {
            setError("Could not remove friend.");
        } finally {
            await refreshAll();
        }
    }

    function renderUserLine(user, actions) {
        const name =
            `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username;
        return (
            <div key={user._id} className="friend-row">
                <div className="friend-info">
                    {user.profilePicture && (
                        <img
                            src={user.profilePicture}
                            alt={name}
                            className="friend-avatar"
                        />
                    )}
                    <div className="friend-text">
                        <div className="friend-name">{name}</div>
                        <div className="friend-username">@{user.username}</div>
                    </div>
                </div>
                <div className="friend-actions">{actions}</div>
            </div>
        );
    }

    return (
        // eventList + container to match your other cards
        <aside className="friend-sidebar eventList">
            <div className="container">
                <h2 className="friend-sidebar-title">Friends</h2>

                {error && <div className="friend-error">{error}</div>}
                {loading && <div className="friend-loading">Loading friend data...</div>}

                {/* Search / Add friends */}
                <section className="friend-section">
                    <h3>Find people</h3>
                    <form onSubmit={handleSearch} className="friend-search-form">
                        <input
                            type="text"
                            placeholder="Search by username"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="friend-search-input"
                        />
                        <button type="submit" className="friend-btn small">
                            Search
                        </button>
                    </form>

                    {searchResults.length > 0 && (
                        <div className="friend-list">
                            {searchResults.map((user) =>
                                renderUserLine(
                                    user,
                                    <button
                                        className="friend-btn small"
                                        onClick={() => handleSendRequest(user._id)}
                                    >
                                        Add
                                    </button>
                                )
                            )}
                        </div>
                    )}
                </section>

                {/* Incoming + outgoing requests */}
                <section className="friend-section">
                    <h3>Requests</h3>
                    {incoming.length === 0 && outgoing.length === 0 && (
                        <div className="friend-empty">No pending requests</div>
                    )}

                    {incoming.length > 0 && (
                        <>
                            <div className="friend-subtitle">Incoming</div>
                            <div className="friend-list">
                                {incoming.map((user) =>
                                    renderUserLine(
                                        user,
                                        <>
                                            <button
                                                className="friend-btn small"
                                                onClick={() => handleAccept(user._id)}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                className="friend-btn small secondary"
                                                onClick={() => handleReject(user._id)}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )
                                )}
                            </div>
                        </>
                    )}

                    {outgoing.length > 0 && (
                        <>
                            <div className="friend-subtitle">Outgoing</div>
                            <div className="friend-list">
                                {outgoing.map((user) =>
                                    renderUserLine(
                                        user,
                                        <span className="friend-status">Pending</span>
                                    )
                                )}
                            </div>
                        </>
                    )}
                </section>

                {/* Friend list */}
                <section className="friend-section">
                    <h3>Your friends</h3>
                    {friends.length === 0 && (
                        <div className="friend-empty">
                            You don&apos;t have any friends yet 🥲
                        </div>
                    )}
                    {friends.length > 0 && (
                        <div className="friend-list">
                            {friends.map((user) =>
                                renderUserLine(
                                    user,
                                    <button
                                        className="friend-btn small secondary"
                                        onClick={() => handleRemoveFriend(user._id)}
                                    >
                                        Remove
                                    </button>
                                )
                            )}
                        </div>
                    )}
                </section>
            </div>
        </aside>
    );
};

export default FriendSidebar;
