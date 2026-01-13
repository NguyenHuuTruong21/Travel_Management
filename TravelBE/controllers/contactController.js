const Contact = require('../models/Contact');

exports.createContact = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        // Basic validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
        }

        const contact = await Contact.create({
            name,
            email,
            subject,
            message,
            user: req.user ? req.user._id : null
        });

        res.status(201).json({
            message: 'Gửi liên hệ thành công!',
            data: contact
        });
    } catch (err) {
        next(err);
    }
};

exports.getAllContacts = async (req, res, next) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json({ data: contacts });
    } catch (err) {
        next(err);
    }
};

const notification = require('../utils/notification');

exports.replyContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { response } = req.body;

        if (!response) {
            return res.status(400).json({ message: 'Nội dung phản hồi không được để trống' });
        }

        const contact = await Contact.findById(id);
        if (!contact) {
            return res.status(404).json({ message: 'Liên hệ không tồn tại' });
        }

        contact.response = response;
        contact.status = 'processed';
        contact.respondedBy = req.user._id;
        contact.respondedAt = Date.now();

        await contact.save();

        // Send notification to user if registered
        console.log('Replying to contact:', contact._id, 'User ID:', contact.user);
        if (contact.user) {
            await notification.createAndDeliver({
                userId: contact.user,
                title: 'Phản hồi từ Admin',
                message: `Admin đã trả lời liên hệ "${contact.subject}" của bạn: ${response.substring(0, 50)}${response.length > 50 ? '...' : ''}`,
                type: 'contact',
                metadata: { contactId: contact._id },
                sendEmail: false
            });
        }

        res.json({
            message: 'Đã gửi phản hồi thành công',
            data: contact
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contact = await Contact.findByIdAndDelete(id);

        if (!contact) {
            return res.status(404).json({ message: 'Liên hệ không tồn tại' });
        }

        res.json({ message: 'Đã xóa liên hệ thành công' });
    } catch (err) {
        next(err);
    }
};
