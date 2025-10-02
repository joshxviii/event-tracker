// Simplified utilities for the expected CSV format: id,name,description,lat,lng
var events = [];

async function loadDemoEvents(url = '/DemoData.csv') {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} not found`);
    const text = await res.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
    if (lines.length <= 1) return [];

    const rows = lines.slice(1).map((line) => line.split(',').map((c) => c.trim()));

    return rows.map((cols, idx) => {
        const idRaw = cols[0] ?? idx + 1;
        const idNum = Number(idRaw);
        const id = Number.isNaN(idNum) ? idRaw : idNum;

        const name = cols[1] ?? `event-${id}`;
        const description = cols[2] ?? '';
        const lat = cols[3] === undefined || cols[3] === '' ? null : Number(cols[3]);
        const lng = cols[4] === undefined || cols[4] === '' ? null : Number(cols[4]);

        return {
            id,
            name,
            description,
            lat,
            lng,
            raw: {
                id: cols[0],
                name: cols[1],
                description: cols[2],
                lat: cols[3],
                lng: cols[4],
            },
        };
    });
}
events = await loadDemoEvents();

function findEventById(id) {
    if (!Array.isArray(events)) return null;
    return events.find((e) => String(e.id) === String(id)) ?? null;
}

function getEvents() {
    return events;
}

export { findEventById, getEvents }
