const express = require('express');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const { requireAuth } = require('../middleware/auth');
const { dbConnect } = require('../middleware/mongoose');
const User = require('../schemas/User');
const Event = require('../schemas/Event');

const router = express.Router({ mergeParams: true });
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-event-image', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No file uploaded.');

    await dbConnect();

    const eventId = req.body.eventId;
    if (!eventId) return res.status(400).send('Event ID required.');

    const imageUrl = await uploadToContainer(req.file, 'event-images');

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).send('Event not found.');

    // Only organizer may update event image
    if (String(event.organizer) !== String(req.user?.userId)) {
      return res.status(403).send('Forbidden');
    }

    // Delete previous image blob if present
    if (event.image) {
      try {
        await deleteBlobFromUrl(event.image);
      } catch (e) {
        console.warn('Failed to delete old event image blob:', e?.message || e);
      }
    }

    event.image = imageUrl;
    await event.save();

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

router.post('/upload-profile-images', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No file uploaded.');

    await dbConnect();

    // Use authenticated user id for security
    const userId = req.user?.userId;
    if (!userId) return res.status(401).send('Unauthorized');

    const imageUrl = await uploadToContainer(req.file, 'profile-images');

    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found.');

    // Delete previous profile blob if present
    if (user.profilePicture) {
      try {
        await deleteBlobFromUrl(user.profilePicture);
      } catch (e) {
        console.warn('Failed to delete old profile image blob:', e?.message || e);
      }
    }

    user.profilePicture = imageUrl;
    await user.save();

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

async function uploadToContainer(file, containerName) {

  // Connect to Azure Blob Storage
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.STORAGE);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Ensure container exists (idempotent)
  try {
    await containerClient.createIfNotExists();
  } catch (e) { /* ignore */ }

  // Create a unique blob name
  const blobName = `${Date.now()}-${file.originalname}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Upload the file buffer to Azure
  await blockBlobClient.uploadData(file.buffer);

  // Get the public URL
  return blockBlobClient.url;
}

async function deleteBlobFromUrl(url) {
  if (!url) return;
  try {
    // parse blob URL to get container and blob name
    const parsed = new URL(url);
    // pathname format: /<containerName>/<blobPath>
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return; // unexpected format
    const containerName = parts[0];
    const blobName = parts.slice(1).join('/');

    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.STORAGE);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.deleteIfExists();
  } catch (e) {
    // don't fail the overall request for failures in cleanup
    console.warn('deleteBlobFromUrl failed:', e?.message || e);
  }
}


module.exports = router;