import { apiRequest } from '../api-request';

// Get full friend list
export async function getFriends() {
    return await apiRequest('/api/friends', {
        method: 'GET',
        requireAuth: true,
    });
}

// Get incoming + outgoing friend requests
export async function getFriendRequests() {
    return await apiRequest('/api/friends/requests', {
        method: 'GET',
        requireAuth: true,
    });
}

// Search users by username
export async function searchUsers(query) {
    const encoded = encodeURIComponent(query || '');
    return await apiRequest(`/api/friends/search?q=${encoded}`, {
        method: 'GET',
        requireAuth: true,
    });
}

// Send a friend request to target user id
export async function sendFriendRequest(targetUserId) {
    return await apiRequest(`/api/friends/request/${targetUserId}`, {
        method: 'POST',
        requireAuth: true,
    });
}

// Accept an incoming request from user id
export async function acceptFriendRequest(fromUserId) {
    return await apiRequest(`/api/friends/accept/${fromUserId}`, {
        method: 'POST',
        requireAuth: true,
    });
}

// Reject an incoming request from user id
export async function rejectFriendRequest(fromUserId) {
    return await apiRequest(`/api/friends/reject/${fromUserId}`, {
        method: 'POST',
        requireAuth: true,
    });
}

// Remove an existing friend
export async function removeFriend(friendId) {
    return await apiRequest(`/api/friends/remove/${friendId}`, {
        method: 'DELETE',
        requireAuth: true,
    });
}
