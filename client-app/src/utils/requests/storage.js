// Client-side helpers for uploading images to server storage endpoints.
// These use a plain fetch with FormData so Content-Type is handled by the browser.

async function doUpload(path, file, extra = {}) {
    if (!file) throw new Error('No file provided');
    const fd = new FormData();
    fd.append('image', file);
    Object.keys(extra || {}).forEach(k => {
        if (extra[k] !== undefined && extra[k] !== null) fd.append(k, extra[k]);
    });

    // Use the same backend base URL as apiRequest so requests hit the backend server
    const { server } = await import('../api-request.js');
    const res = await fetch(`${server}/api/storage/${path}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: fd
    });

    if (!res.ok) {
        let text = await res.text();
        const err = new Error(text || 'Upload failed');
        err.status = res.status;
        throw err;
    }

    const data = await res.json();
    // Prefer common keys for returned URL
    return data.imageUrl || data.url || data.image || null;
}

export async function uploadProfileImage(file, userId) {
    return await doUpload('upload-profile-images', file, { userId });
}

export async function uploadEventImage(file, eventId) {
    return await doUpload('upload-event-image', file, { eventId });
}

export default { uploadProfileImage, uploadEventImage };
