import React, { useEffect, useState } from "react";
import {
    getFriends,
    getFriendRequests,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
} from "../../utils/requests/friends.js";
import {UserProfileLink} from "./user-profile-link";

export default function FriendSidebar({ isOpen, onClose }) {
    const [friends, setFriends] = useState([]);
    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statusMsg, setStatusMsg] = useState(null);
    const [busyId, setBusyId] = useState(null);

    const showStatus = (msg) => {
        setStatusMsg(msg);
        setTimeout(() => setStatusMsg(null), 2500);
    };

    const loadFriends = async () => {
        try {
            const data = await getFriends();
            setFriends(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to load friends");
        }
    };

    const loadRequests = async () => {
        try {
            const data = await getFriendRequests();
            setIncoming(data.incoming || []);
            setOutgoing(data.outgoing || []);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to load friend requests");
        }
    };

    // Load data when sidebar is opened
    useEffect(() => {
        if (!isOpen) return;
        setInitialLoading(true);
        setError(null);
        (async () => {
            try {
                await Promise.all([loadFriends(), loadRequests()]);
            } finally {
                setInitialLoading(false);
            }
        })();
    }, [isOpen]);

    const handleSearch = async (e) => {
        e.preventDefault();
        const q = searchTerm.trim();
        if (!q) {
            setSearchResults([]);
            return;
        }
        setLoadingSearch(true);
        setError(null);
        try {
            const data = await searchUsers(q);
            setSearchResults(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError(err.message || "Search failed");
        } finally {
            setLoadingSearch(false);
        }
    };

    const handleSendRequest = async (userId) => {
        setBusyId(userId);
        setError(null);
        try {
            await sendFriendRequest(userId);
            showStatus("Friend request sent");
            await loadRequests();
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to send friend request");
        } finally {
            setBusyId(null);
        }
    };

    const handleAccept = async (fromId) => {
        setBusyId(fromId);
        setError(null);
        try {
            await acceptFriendRequest(fromId);
            showStatus("Friend request accepted");
            await Promise.all([loadFriends(), loadRequests()]);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to accept friend request");
        } finally {
            setBusyId(null);
        }
    };

    const handleReject = async (fromId) => {
        setBusyId(fromId);
        setError(null);
        try {
            await rejectFriendRequest(fromId);
            showStatus("Friend request rejected");
            await loadRequests();
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to reject friend request");
        } finally {
            setBusyId(null);
        }
    };

    const handleRemoveFriend = async (friendId) => {
        setBusyId(friendId);
        setError(null);
        try {
            await removeFriend(friendId);
            showStatus("Friend removed");
            await loadFriends();
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to remove friend");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div onClick={onClose} className={`friendSidebarOverlay ${isOpen ? "open" : ""}`}>
            <div onClick={(e) => e.stopPropagation()} className="friendSidebar">
                <div className="friendSidebarHeader">
                    <h3>Friends</h3>
                    <button
                        className="friendSidebarCloseBtn"
                        type="button"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                {statusMsg && <div className="friendSidebarStatus">{statusMsg}</div>}
                {error && <div className="friendSidebarError">{error}</div>}

                {initialLoading ? (
                    <div className="friendSidebarLoading">Loading friends…</div>
                ) : (
                    <>
                        {/* Search */}
                        <form className="friendSidebarSearchRow" onSubmit={handleSearch}>
                            <input
                                className="input friendSidebarSearchInput"
                                type="text"
                                placeholder="Search users by username…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit" disabled={loadingSearch}>
                                {loadingSearch ? "…" : "Search"}
                            </button>
                        </form>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="friendSidebarSection">
                                <div className="friendSidebarSectionTitle">Search Results</div>
                                <div className="friendSidebarList">
                                    {searchResults.map((user) => (
                                        <div key={user._id} className="friendSidebarItem">
                                            <UserProfileLink user={user} style={{flex: 1}} />
                                            <button
                                                type="button"
                                                disabled={busyId === user._id}
                                                onClick={() => handleSendRequest(user._id)}
                                            >
                                                {busyId === user._id ? "Sending…" : "Add"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Incoming Requests */}
                        <div className="friendSidebarSection">
                            <div className="friendSidebarSectionTitle">
                                Incoming Requests
                            </div>
                            {incoming.length === 0 ? (
                                <div className="friendSidebarEmpty">
                                    No incoming requests.
                                </div>
                            ) : (
                                <div className="friendSidebarList">
                                    {incoming.map((user) => (
                                        <div key={user._id} className="friendSidebarItem">
                                            <UserProfileLink user={user} style={{flex: 1}} />
                                            <div className="friendSidebarActions">
                                                <button
                                                    type="button"
                                                    disabled={busyId === user._id}
                                                    onClick={() => handleAccept(user._id)}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={busyId === user._id}
                                                    onClick={() => handleReject(user._id)}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Outgoing Requests */}
                        <div className="friendSidebarSection">
                            <div className="friendSidebarSectionTitle">
                                Outgoing Requests
                            </div>
                            {outgoing.length === 0 ? (
                                <div className="friendSidebarEmpty">
                                    No outgoing requests.
                                </div>
                            ) : (
                                <div className="friendSidebarList">
                                    {outgoing.map((user) => (
                                        <div key={user._id} className="friendSidebarItem">
                                            <UserProfileLink user={user} style={{flex: 1}} />
                                            <span className="friendSidebarBadge">Pending</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Friend List */}
                        <div className="friendSidebarSection">
                            <div className="friendSidebarSectionTitle">Your Friends</div>
                            {friends.length === 0 ? (
                                <div className="friendSidebarEmpty">
                                    You don't have any friends added yet.
                                </div>
                            ) : (
                                <div className="friendSidebarList">
                                    {friends.map((user) => (
                                        <div key={user._id} className="friendSidebarItem">
                                            <UserProfileLink user={user} style={{flex: 1}} />
                                            <button
                                                type="button"
                                                disabled={busyId === user._id}
                                                onClick={() => handleRemoveFriend(user._id)}
                                            >
                                                {busyId === user._id ? "Removing…" : "Remove"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
