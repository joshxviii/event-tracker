const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '.env.local' });
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');

const app = express();

app.use(cors());
app.use(express.json());

// Parse JWT (if present) and attach req.user; non-blocking
const { parseToken } = require('./middleware/auth');
app.use(parseToken);

// Mount API routes
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const eventsRouter = require('./routes/events');
app.use('/api/events', eventsRouter);

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



const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload-event-image', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const eventId = req.body.eventId; // Assuming you pass eventId in the form data
    if (!eventId) {
      return res.status(400).send('Event ID required.');
    }

    // Connect to Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.STORAGE);
    const containerClient = blobServiceClient.getContainerClient('event-images');

    // Create a unique blob name (e.g., using timestamp or UUID)
    const blobName = `${Date.now()}-${req.file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload the file buffer to Azure
    await blockBlobClient.uploadData(req.file.buffer);

    // Get the public URL (assuming public access on container)
    const imageUrl = blockBlobClient.url;

    // Update the event document in Cosmos DB
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { image: imageUrl },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).send('Event not found.');
    }

    res.status(200).json({ message: 'Image uploaded and event updated', imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

/* Key Generator: */
//
// const crypto = require('crypto');
// const secret = crypto.randomBytes(64).toString('hex');
// console.log(`Key: ${secret}`);