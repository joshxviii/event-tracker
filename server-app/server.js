const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '.env.local' });
const { dbConnect } = require('./middleware/mongoose');

const authRouter = require('./routes/auth');
const eventsRouter = require('./routes/events');
const reviewsRouter = require('./routes/reviews');
const storageRouter = require('./routes/storage');

const app = express();

app.use(cors());
app.use(express.json());

// Parse JWT (if present) and attach req.user; non-blocking
const { parseToken } = require('./middleware/auth');
app.use(parseToken);

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/events/:id/reviews', reviewsRouter);
app.use('/api/storage', storageRouter);

app.get('/api/health', async (req, res) => {
    await dbConnect();
    console.log("Health Check Passed!");
    res.json({ ok: true })
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
    dbConnect().catch(err => console.error('DB Connection failed on startup:', err));
});