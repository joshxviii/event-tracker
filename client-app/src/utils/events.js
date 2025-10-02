import { parseCsvLine } from "./csv-parser";

var events = [];

async function loadDemoEvents(url = '/DemoDataEvents.csv') {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} not found`);
    const text = await res.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
    if (lines.length <= 1) return [];

    const rows = lines.slice(1).map((line) => parseCsvLine(line));

    return rows.map((cols, idx) => {
        const idRaw = cols[0] ?? idx + 1;
        const idNum = Number(idRaw);
        const id = Number.isNaN(idNum) ? idRaw : idNum;

        const name = cols[1].replace(/^\s*"(.*)"\s*$/s, '$1') ?? `event-${id}`;
        const description = cols[2].replace(/^\s*"(.*)"\s*$/s, '$1') ?? '';
        const lat = cols[3] === undefined || cols[3] === '' ? null : Number(cols[3]);
        const lng = cols[4] === undefined || cols[4] === '' ? null : Number(cols[4]);

        return {
            id,
            name,
            description,
            lat,
            lng
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
