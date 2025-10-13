const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '.env.local' });

const app = express();

app.use(cors());
app.use(express.json());

const pass = encodeURIComponent(process.env.PASSWORD)
const user = process.env.USERNAME
const port = process.env.PORT || 5000;
const host = process.env.HOST

const uri = `mongodb+srv://${user}:${pass}@${host}/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000`

mongoose.connect(uri)
    .then(() => console.log('MongoDB database connection established successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// TODO

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});


/* Key Generator: */
//
// const crypto = require('crypto');
// const secret = crypto.randomBytes(64).toString('hex');
// console.log(`Key: ${secret}`);