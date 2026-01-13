const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const controller = require('../controllers/notificationController');

// create notification (admin or internal modules) - allow admin role
router.post('/', auth(['admin']), controller.create);

// get notifications for current user
router.get('/user', auth(), controller.getForUser);

// mark single notification read
router.patch('/:id/read', auth(), controller.markRead);

// mark multiple as read
router.patch('/mark-many-read', auth(), controller.markManyRead);

module.exports = router;
