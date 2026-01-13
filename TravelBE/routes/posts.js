const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');

// Public routes
router.get('/', cmsController.getPosts);
router.get('/:id', async (req, res, next) => {
    try {
        const Post = require('../models/Post');
        const post = await Post.findById(req.params.id).populate('author', 'fullName');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json({ post }); // Matches getPosts response structure roughly? getPosts returns { data: [] }
    } catch (err) { next(err); }
});

module.exports = router;
