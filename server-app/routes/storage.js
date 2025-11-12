const express = require('express');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const { requireAuth } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-event-image', requireAuth, upload.single('image'), async (req, res) => {
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

module.exports = router;