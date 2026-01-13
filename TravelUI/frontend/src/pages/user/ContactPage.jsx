import React from 'react';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const ContactPage = () => {
    return (
        <div className="bg-white min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Liên hệ với chúng tôi</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn. Hãy để lại tin nhắn cho chúng tôi.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div>
                        <div className="bg-blue-50 p-8 rounded-2xl mb-8">
                            <h3 className="text-2xl font-bold text-blue-900 mb-6">Thông tin liên hệ</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
                                        <FiMapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">Địa chỉ</h4>
                                        <p className="text-gray-600">123 Đường ABC, Quận 1, TP. Hồ Chí Minh, Việt Nam</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
                                        <FiPhone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">Hotline</h4>
                                        <p className="text-gray-600 font-bold text-lg">+84 123 456 789</p>
                                        <p className="text-sm text-gray-500">Hỗ trợ 24/7</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
                                        <FiMail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">Email</h4>
                                        <p className="text-gray-600">contact@travelmanagement.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div>
                        <form className="space-y-6" onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const data = Object.fromEntries(formData.entries());

                            try {
                                const btn = e.target.querySelector('button');
                                const originalText = btn.innerText;
                                btn.innerText = 'Đang gửi...';
                                btn.disabled = true;

                                const token = localStorage.getItem('accessToken');
                                const headers = { 'Content-Type': 'application/json' };
                                if (token) {
                                    headers['Authorization'] = `Bearer ${token}`;
                                }

                                const response = await fetch('http://localhost:5000/api/contacts', {
                                    method: 'POST',
                                    headers: headers,
                                    body: JSON.stringify(data)
                                });

                                const result = await response.json();
                                if (response.ok) {
                                    alert('Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ lại sớm.');
                                    e.target.reset();
                                } else {
                                    alert(result.message || 'Có lỗi xảy ra');
                                }
                                btn.innerText = originalText;
                                btn.disabled = false;
                            } catch (err) {
                                console.error(err);
                                alert('Lỗi kết nối server');
                            }
                        }}>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                                    <input required name="name" type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input required name="email" type="email" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Chủ đề</label>
                                <input required name="subject" type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Lời nhắn</label>
                                <textarea required name="message" rows="5" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                            </div>
                            <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
                                Gửi tin nhắn
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
