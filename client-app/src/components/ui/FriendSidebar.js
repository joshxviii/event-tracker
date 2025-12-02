import React, { useEffect, useState } from "react";

// Helper to send authenticated requests.
// Adjust the token retrieval if your app stores it differently.
async function authFetch(url, options = {}) {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = data?.message || res.statusText || "Request failed";
        throw new Error(msg);
    }
    return data;
}

export default function FriendSidebar({ isOpen, onClose }) {
    const [friends, setFriends] = useState([]);
    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
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
            const data = await authFetch("/api/friends"); // GET friend list
            setFriends(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const loadRequests = async () => {
        try {
            const data = await authFetch("/api/friends/requests"); // GET incoming/outgoing
            setIncoming(data.incoming || []);
            setOutgoing(data.outgoing || []);
        } catch (err) {
            console.error(err);
            setError(err.message);
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
        setLoading(true);
        setError(null);
        try {
            const data = await authFetch(`/api/friends/search?q=${encodeURIComponent(q)}`);
            setSearchResults(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (userId) => {
        setBusyId(userId);
        setError(null);
        try {
            await authFetch(`/api/friends/request/${userId}`, {
                method: "POST",
            });
            showStatus("Friend request sent");
            // Refresh request lists so UI stays in sync
            await loadRequests();
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const handleAccept = async (fromId) => {
        setBusyId(fromId);
        setError(null);
        try {
            await authFetch(`/api/friends/accept/${fromId}`, { method: "POST" });
            showStatus("Friend request accepted");
            await Promise.all([loadFriends(), loadRequests()]);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const handleReject = async (fromId) => {
        setBusyId(fromId);
        setError(null);
        try {
            await authFetch(`/api/friends/reject/${fromId}`, { method: "POST" });
            showStatus("Friend request rejected");
            await loadRequests();
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const handleRemoveFriend = async (friendId) => {
        setBusyId(friendId);
        setError(null);
        try {
            await authFetch(`/api/friends/remove/${friendId}`, {
                method: "DELETE",
            });
            showStatus("Friend removed");
            await loadFriends();
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const renderUserAvatar = (user, big = false) => {
        const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}` || (user.username?.[0] || "?");
        if (user.profilePicture) {
            return (
                <img
                    src={user.profilePicture}
                    alt={user.username}
                    className={`profilePicture ${big ? "big" : ""}`}
                />
            );
        }
        return (
            <div className={`nullPicture ${big ? "big" : ""}`}>
                {initials.toUpperCase()}
            </div>
        );
    };

    return (
        <div className={`friendSidebarOverlay ${isOpen ? "open" : ""}`}>
            <div className="friendSidebar">
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

                {statusMsg && (
                    <div className="friendSidebarStatus">
                        {statusMsg}
                    </div>
                )}
                {error && (
                    <div className="friendSidebarError">
                        {error}
                    </div>
                )}

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
                            <button type="submit" disabled={loading}>
                                {loading ? "…" : "Search"}
                            </button>
                        </form>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="friendSidebarSection">
                                <div className="friendSidebarSectionTitle">
                                    Search Results
                                </div>
                                <div className="friendSidebarList">
                                    {searchResults.map((user) => (
                                        <div key={user._id} className="friendSidebarItem">
                                            {renderUserAvatar(user)}
                                            <div className="friendSidebarItemInfo">
                                                <div className="friendSidebarName">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                <div className="friendSidebarUsername">
                                                    @{user.username}
                                                </div>
                                            </div>
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
                                <div className="friendSidebarEmpty">No incoming requests.</div>
                            ) : (
                                <div className="friendSidebarList">
                                    {incoming.map((user) => (
                                        <div key={user._id} className="friendSidebarItem">
                                            {renderUserAvatar(user)}
                                            <div className="friendSidebarItemInfo">
                                                <div className="friendSidebarName">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                <div className="friendSidebarUsername">
                                                    @{user.username}
                                                </div>
                                            </div>
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
                                <div className="friendSidebarEmpty">No outgoing requests.</div>
                            ) : (
                                <div className="friendSidebarList">
                                    {outgoing.map((user) => (
                                        <div key={user._id} className="friendSidebarItem">
                                            {renderUserAvatar(user)}
                                            <div className="friendSidebarItemInfo">
                                                <div className="friendSidebarName">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                <div className="friendSidebarUsername">
                                                    @{user.username}
                                                </div>
                                            </div>
                                            <span className="friendSidebarBadge">Pending</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Friend List */}
                        <div className="friendSidebarSection">
                            <div className="friendSidebarSectionTitle">
                                Your Friends
                            </div>
                            {friends.length === 0 ? (
                                <div className="friendSidebarEmpty">
                                    You don't have any friends added yet.
                                </div>
                            ) : (
                                <div className="friendSidebarList">
                                    {friends.map((user) => (
                                        <div key={user._id} className="friendSidebarItem">
                                            {renderUserAvatar(user)}
                                            <div className="friendSidebarItemInfo">
                                                <div className="friendSidebarName">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                <div className="friendSidebarUsername">
                                                    @{user.username}
                                                </div>
                                            </div>
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
