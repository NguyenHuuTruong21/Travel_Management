const express = require('express');
const router = express.Router();
const contactCtrl = require('../controllers/contactController');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

// Public: Submit contact
// Optional auth to link user, but generally public
router.post('/', contactCtrl.createContact);

// Admin: Get all contacts
router.get('/', auth(['admin']), contactCtrl.getAllContacts);

// Admin: Reply to contact
router.put('/:id', auth(['admin']), contactCtrl.replyContact);

// Admin: Delete contact
router.delete('/:id', auth(['admin']), contactCtrl.deleteContact);

module.exports = router;
