import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FiMonitor, FiGift, FiUsers, FiCalendar, FiUser, FiX } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const ServicesPage = () => {
    const [activeTab, setActiveTab] = useState('vehicles'); // vehicles, guides, promotions
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '', // reusing email field for contact info
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['vehicles', 'promotions'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location.search]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let endpoint = '';
            switch (activeTab) {
                case 'vehicles':
                    endpoint = '/vehicles/public';
                    break;
                case 'promotions':
                    endpoint = '/promotions/public';
                    break;
                default:
                    endpoint = '/vehicles/public';
            }

            const res = await axios.get(`${API_URL}${endpoint}`);
            setData(res.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [activeTab, fetchData]);

    const getVehicleName = (item) => {
        const typeMap = {
            'bus': 'Xe Bus',
            'minivan': 'Xe Minivan',
            'electric': 'Xe Điện',
            'boat': 'Thuyền/Phà',
            'train': 'Tàu Hỏa',
            'car': 'Xe Ô tô'
        };
        const typeName = typeMap[item.type] || item.type;
        return `${typeName} ${item.capacity} Chỗ`;
    };

    const handleRentClick = (vehicle) => {
        setSelectedVehicle(vehicle);
        setContactForm({ name: '', email: '', message: '' });
        setShowModal(true);
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const vehicleName = getVehicleName(selectedVehicle);
            const payload = {
                name: contactForm.name,
                email: contactForm.email,
                subject: `Thuê xe: ${vehicleName}`,
                message: `Yêu cầu thuê xe: ${vehicleName}\n\nLời nhắn: ${contactForm.message}`
            };

            const config = {
                headers: {}
            };
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }

            await axios.post(`${API_URL}/contacts`, payload, config); // Note: server.js uses /api/contacts now
            alert('Gửi yêu cầu thuê xe thành công! Chúng tôi sẽ liên hệ lại sớm.');
            setShowModal(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderTabButton = (id, label, icon) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${activeTab === id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
        >
            {icon}
            {label}
        </button>
    );

    const renderVehicleCard = (item) => {
        const vehicleName = getVehicleName(item);
        return (
            <div key={item._id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                <div className="h-48 overflow-hidden relative">
                    <img
                        src={item.image ? `http://localhost:5000${item.image}` : 'https://via.placeholder.com/400x300?text=No+Image'}
                        alt={vehicleName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-indigo-600 uppercase">
                        {item.type}
                    </div>
                </div>
                <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{vehicleName}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                            <FiUsers className="text-indigo-500" />
                            <span>{item.capacity} chỗ</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <FiUser className="text-indigo-500" />
                            <span>Tài xế: {item.driverName || 'Đang cập nhật'}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => handleRentClick(item)}
                        className="w-full py-2 bg-gray-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors"
                    >
                        Liên hệ thuê xe
                    </button>
                </div>
            </div>
        );
    };

    const renderPromotionCard = (item) => (
        <div key={item._id} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg text-white overflow-hidden relative p-6 flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black opacity-10 rounded-full -ml-10 -mb-10 blur-xl"></div>

            <div>
                <div className="flex justify-between items-start mb-4">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-sm font-bold border border-white/20">
                        {item.code}
                    </span>
                    <FiGift className="text-3xl opacity-80" />
                </div>

                <h3 className="text-2xl font-bold mb-2">
                    Giảm {item.discountType === 'percent'
                        ? `${item.discountValue || 0}%`
                        : `${(item.discountValue || 0).toLocaleString()}đ`}
                </h3>

                <p className="text-indigo-100 text-sm mb-4 line-clamp-2">
                    {item.description || 'Áp dụng cho các tour du lịch hấp dẫn.'}
                </p>
            </div>

            <div className="mt-auto pt-4 border-t border-white/20 flex justify-between items-center text-sm">
                <div className="flex items-center gap-1 opacity-90">
                    <FiCalendar />
                    <span>HSD: {new Date(item.endDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <button className="px-4 py-1.5 bg-white text-indigo-600 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors">
                    Sao chép
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 relative">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Dịch vụ & Tiện ích</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Khám phá các dịch vụ bổ trợ giúp chuyến đi của bạn trở nên hoàn hảo hơn.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {renderTabButton('vehicles', 'Thuê xe du lịch', <FiMonitor />)}
                    {renderTabButton('promotions', 'Ưu đãi & Khuyến mãi', <FiGift />)}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <>
                        {data.length === 0 ? (
                            <div className="text-center py-20 text-gray-500">
                                Chưa có dữ liệu cho mục này.
                            </div>
                        ) : (
                            <div className={`grid gap-8 ${activeTab === 'promotions'
                                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                                }`}>
                                {activeTab === 'vehicles' && data.map(renderVehicleCard)}
                                {activeTab === 'promotions' && data.map(renderPromotionCard)}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Rent Modal */}
            {showModal && selectedVehicle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 flex justify-between items-center text-white">
                            <h3 className="text-xl font-bold">Liên hệ thuê xe</h3>
                            <button onClick={() => setShowModal(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                                <FiX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleModalSubmit} className="p-6">
                            <div className="mb-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <p className="text-indigo-800 font-bold mb-1">Xe đang chọn:</p>
                                <p className="text-indigo-600 text-lg">{getVehicleName(selectedVehicle)}</p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên của bạn</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    placeholder="Nhập họ tên..."
                                    value={contactForm.name}
                                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email hoặc SĐT liên hệ</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    placeholder="Nhập email hoặc số điện thoại..."
                                    value={contactForm.email}
                                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lời nhắn</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all h-24 resize-none"
                                    placeholder="Ví dụ: Tôi muốn thuê xe này vào ngày..."
                                    value={contactForm.message}
                                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                                    required
                                ></textarea>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70"
                                >
                                    {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServicesPage;
