// User Related Routes
const express = require('express');
const router = express.Router();
const User = require('../schemas/User');
const { dbConnect } = require('../middleware/mongoose');

// Get a single user by Id
router.get('/:id', async (req, res) => {
    try {
        await dbConnect();
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;