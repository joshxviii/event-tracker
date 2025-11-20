const express = require('express');
const router = express.Router();
const User = require('../schemas/User');
const { dbConnect } = require('../middleware/mongoose');
const { parseToken, requireAuth } = require('../middleware/auth');

// Make sure every route below has req.user set and is protected
router.use(parseToken);
router.use(requireAuth);

// ========== SEND FRIEND REQUEST ==========
router.post('/request/:targetId', async (req, res) => {
    try {
        await dbConnect();

        const meId = req.user.userId;
        const targetId = req.params.targetId;

        if (!meId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        if (meId === targetId) {
            return res.status(400).json({ message: "You can't friend yourself" });
        }

        const me = await User.findById(meId);
        const target = await User.findById(targetId);

        if (!target) return res.status(404).json({ message: 'User not found' });

        if (me.friends.includes(targetId)) {
            return res.status(400).json({ message: 'Already friends' });
        }

        if (me.outgoingRequests?.includes(targetId)) {
            return res.status(400).json({ message: 'Request already sent' });
        }

        if (me.incomingRequests?.includes(targetId)) {
            return res.status(400).json({ message: 'They already requested you' });
        }

        me.outgoingRequests = me.outgoingRequests || [];
        target.incomingRequests = target.incomingRequests || [];

        me.outgoingRequests.push(targetId);
        target.incomingRequests.push(meId);

        await me.save();
        await target.save();

        res.json({ message: 'Friend request sent' });
    } catch (err) {
        console.error('Friend request error:', err);
        res.status(500).json({ message: 'Could not send friend request' });
    }
});

// ========== ACCEPT REQUEST ==========
router.post('/accept/:fromId', async (req, res) => {
    try {
        await dbConnect();

        const meId = req.user.userId;
        const fromId = req.params.fromId;

        const me = await User.findById(meId);
        const fromUser = await User.findById(fromId);

        if (!fromUser) return res.status(404).json({ message: 'User not found' });

        if (!me.incomingRequests?.includes(fromId)) {
            return res.status(400).json({ message: 'No incoming request from this user' });
        }

        me.incomingRequests = me.incomingRequests.filter(
            (id) => id.toString() !== fromId
        );
        fromUser.outgoingRequests = fromUser.outgoingRequests.filter(
            (id) => id.toString() !== meId
        );

        me.friends.push(fromId);
        fromUser.friends.push(meId);

        await me.save();
        await fromUser.save();

        res.json({ message: 'Friend request accepted' });
    } catch (err) {
        console.error('Accept friend error:', err);
        res.status(500).json({ message: 'Could not accept friend request' });
    }
});

// ========== REJECT REQUEST ==========
router.post('/reject/:fromId', async (req, res) => {
    try {
        await dbConnect();

        const meId = req.user.userId;
        const fromId = req.params.fromId;

        const me = await User.findById(meId);
        const fromUser = await User.findById(fromId);

        if (!fromUser) return res.status(404).json({ message: 'User not found' });

        me.incomingRequests = (me.incomingRequests || []).filter(
            (id) => id.toString() !== fromId
        );
        fromUser.outgoingRequests = (fromUser.outgoingRequests || []).filter(
            (id) => id.toString() !== meId
        );

        await me.save();
        await fromUser.save();

        res.json({ message: 'Friend request rejected' });
    } catch (err) {
        console.error('Reject friend error:', err);
        res.status(500).json({ message: 'Could not reject friend request' });
    }
});

// ========== REMOVE FRIEND ==========
router.delete('/remove/:friendId', async (req, res) => {
    try {
        await dbConnect();

        const meId = req.user.userId;
        const friendId = req.params.friendId;

        const me = await User.findById(meId);
        const friend = await User.findById(friendId);

        if (!friend) return res.status(404).json({ message: 'User not found' });

        me.friends = me.friends.filter((id) => id.toString() !== friendId);
        friend.friends = friend.friends.filter((id) => id.toString() !== meId);

        await me.save();
        await friend.save();

        res.json({ message: 'Friend removed' });
    } catch (err) {
        console.error('Remove friend error:', err);
        res.status(500).json({ message: 'Could not remove friend' });
    }
});

// ========== GET FRIEND LIST ==========
router.get('/', async (req, res) => {
    try {
        await dbConnect();

        const me = await User.findById(req.user.userId).populate(
            'friends',
            'username firstName lastName profilePicture'
        );

        res.json(me?.friends || []);
    } catch (err) {
        console.error('Get friends error:', err);
        res.status(500).json({ message: 'Could not load friends' });
    }
});

// ========== GET FRIEND REQUESTS ==========
router.get('/requests', async (req, res) => {
    try {
        await dbConnect();

        const me = await User.findById(req.user.userId)
            .populate('incomingRequests', 'username firstName lastName profilePicture')
            .populate('outgoingRequests', 'username firstName lastName profilePicture');

        res.json({
            incoming: me?.incomingRequests || [],
            outgoing: me?.outgoingRequests || [],
        });
    } catch (err) {
        console.error('Get friend requests error:', err);
        res.status(500).json({ message: 'Could not load friend requests' });
    }
});

// ========== SEARCH USERS ==========
router.get('/search', async (req, res) => {
    try {
        await dbConnect();
        const q = req.query.q || '';

        const users = await User.find({
            _id: { $ne: meId }, //excludes yourself
            username: { $regex: q, $options: 'i' },
        }).select('username firstName lastName profilePicture');

        res.json(users);
    } catch (err) {
        console.error('Friend search error:', err);
        res.status(500).json({ message: 'Friend search failed' });
    }
});

module.exports = router;
