const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '.env.local' });

const app = express();

app.use(cors());
app.use(express.json());

// Mount API routes
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const eventsRouter = require('./routes/events');
app.use('/api/events', eventsRouter);

// Reviews nested under events
const reviewsRouter = require('./routes/reviews');
app.use('/api/events/:id/reviews', reviewsRouter);

app.get('/api/health', (req, res) => {
    console.log("Health Check Passed!");
    res.json({ ok: true })
});

const pass = process.env.PASSWORD
const user = process.env.USER
const port = process.env.PORT || 5000;
const host = process.env.HOST
const dbName = process.env.DB_NAME

const uri = `mongodb+srv://${user}:${pass}@${host}/${dbName}?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000`

mongoose.connect(uri)
    .then(() => console.log('MongoDB database connection established successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});


/* Key Generator: */
//
// const crypto = require('crypto');
// const secret = crypto.randomBytes(64).toString('hex');
// console.log(`Key: ${secret}`);