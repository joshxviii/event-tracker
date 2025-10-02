import { parseCsvLine } from "./csv-parser";

var reviews = [];

async function loadDemoReviews(url = '/DemoDataReviews.csv') {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} not found`);
    const text = await res.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
    if (lines.length <= 1) return [];

    const rows = lines.slice(1).map((line) => parseCsvLine(line));

    const map = {};
    for (const cols of rows) {
        // expected columns: eventid,rating,author,text
        const eventidRaw = cols[0];
        const ratingRaw = cols[1];
        const authorRaw = cols[2];
        const textRaw = cols[3];

        const eventidNum = Number(eventidRaw);
        const eventid = Number.isNaN(eventidNum) ? String(eventidRaw) : eventidNum;
        const rating = ratingRaw === undefined || ratingRaw === '' ? null : Number(ratingRaw);
        const author = (typeof authorRaw === 'string') ? authorRaw : (authorRaw ?? '');
        const reviewText = (typeof textRaw === 'string') ? textRaw : (textRaw ?? '');

        const review = { eventid, rating, author, text: reviewText };
        const key = String(eventid);
        if (!map[key]) map[key] = [];
        map[key].push(review);
    }

    return map;
}
reviews = await loadDemoReviews();

function getReviewsFromEventID(id) {
    return reviews[String(id)] || [];
}

export { getReviewsFromEventID }
