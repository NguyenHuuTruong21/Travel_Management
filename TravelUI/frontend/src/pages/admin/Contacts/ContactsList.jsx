import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import { FaReply, FaTrash, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const ContactsList = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        setLoading(true);
        const res = await adminService.getContacts();
        if (res.data) {
            setContacts(res.data);
        } else {
            alert(res.error || 'Lỗi khi tải danh sách liên hệ');
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) {
            const res = await adminService.deleteContact(id);
            if (res.message) {
                alert('Xóa thành công');
                fetchContacts();
            } else {
                alert(res.error || 'Lỗi khi xóa');
            }
        }
    };

    const openReplyModal = (contact) => {
        setSelectedContact(contact);
        setReplyMessage(contact.response || ''); // Pre-fill if already responded (though usually we reply to new ones)
        setShowReplyModal(true);
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        const res = await adminService.replyContact(selectedContact._id, replyMessage);
        if (res.data) {
            alert('Đã gửi phản hồi');
            setShowReplyModal(false);
            setReplyMessage('');
            fetchContacts();
        } else {
            alert(res.error || 'Lỗi khi gửi phản hồi');
        }
    };

    const filteredContacts = contacts.filter(c => {
        if (filterStatus === 'all') return true;
        return c.status === filterStatus;
    });

    if (loading) return <div className="text-center p-5">Đang tải...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản Lý Liên Hệ & Phản Hồi</h2>

            <div className="flex gap-4 mb-6">
                <button
                    className={`px-4 py-2 rounded-lg ${filterStatus === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
                    onClick={() => setFilterStatus('all')}
                >
                    Tất cả
                </button>
                <button
                    className={`px-4 py-2 rounded-lg ${filterStatus === 'new' ? 'bg-yellow-500 text-white' : 'bg-gray-100'}`}
                    onClick={() => setFilterStatus('new')}
                >
                    Chưa xử lý
                </button>
                <button
                    className={`px-4 py-2 rounded-lg ${filterStatus === 'processed' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
                    onClick={() => setFilterStatus('processed')}
                >
                    Đã xử lý
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày gửi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người gửi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chủ đề</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredContacts.map(contact => (
                            <tr key={contact._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(contact.createdAt).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <div className="font-semibold">{contact.name}</div>
                                    <div className="text-gray-500 text-xs">{contact.email}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <div className="font-medium truncate max-w-xs" title={contact.subject}>{contact.subject}</div>
                                    <div className="text-gray-500 text-xs truncate max-w-xs">{contact.message}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {contact.status === 'processed' ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            <FaCheckCircle className="mr-1 mt-0.5" /> Đã xử lý
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            <FaExclamationCircle className="mr-1 mt-0.5" /> Mới
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => openReplyModal(contact)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        title="Phản hồi"
                                    >
                                        <FaReply size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(contact._id)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Xóa"
                                    >
                                        <FaTrash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredContacts.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    Chưa có liên hệ nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Reply Modal */}
            {showReplyModal && selectedContact && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Phản hồi liên hệ</h3>
                            <p className="text-sm text-gray-500 mt-1">Gửi tới: {selectedContact.email}</p>
                        </div>

                        <div className="p-6 bg-gray-50 max-h-40 overflow-y-auto mb-4 border-b">
                            <p className="text-xs font-bold text-gray-500 mb-1">Nội dung từ khách hàng:</p>
                            <p className="text-sm text-gray-800 italic">{selectedContact.message}</p>
                        </div>

                        <form onSubmit={handleReplySubmit} className="p-6 pt-0">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung phản hồi</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-32"
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    placeholder="Nhập nội dung phản hồi..."
                                    required
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowReplyModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Gửi phản hồi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactsList;
