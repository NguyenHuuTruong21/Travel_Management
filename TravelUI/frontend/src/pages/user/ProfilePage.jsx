import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

import axios from 'axios';
import { FiUser, FiPackage, FiCalendar, FiClock, FiCamera, FiLock, FiEdit2, FiStar } from 'react-icons/fi';
import ReviewModal from '../../components/user/ReviewModal';

const ProfilePage = () => {
    const { user, logout, login } = useContext(AuthContext); // Re-login to update context if needed, or update manually
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('bookings'); // 'profile' or 'bookings'

    // View/Edit Mode
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        avatar: null
    });
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const [updateMessage, setUpdateMessage] = useState({ type: '', content: '' });

    // Review Modal State
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [selectedTour, setSelectedTour] = useState(null);

    const handleOpenReview = (tour) => {
        setSelectedTour(tour);
        setIsReviewOpen(true);
    };

    const handleReviewSuccess = () => {
        alert("Cảm ơn bạn đã đánh giá!");
        fetchUserBookings(); // Refresh bookings to likely update UI if needed
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchUserBookings();

        // Initialize form data
        setFormData(prev => ({
            ...prev,
            fullName: user.fullName || '',
            phoneNumber: user.phoneNumber || ''
            // password logic is separate
        }));
    }, [user, navigate]);

    const [error, setError] = useState(null);

    const fetchUserBookings = async () => {
        try {
            setError(null);
            const token = localStorage.getItem('accessToken');
            const response = await axios.get('http://localhost:5000/api/bookings/user', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Bookings response:', response.data);
            setBookings(response.data.data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setError(error.response?.data?.message || 'Không thể tải lịch sử đặt tour. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, avatar: file }));
            setPreviewAvatar(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdateMessage({ type: '', content: '' });

        if (formData.password && formData.password !== formData.confirmPassword) {
            setUpdateMessage({ type: 'error', content: 'Mật khẩu xác nhận không khớp!' });
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const data = new FormData();
            data.append('fullName', formData.fullName);
            data.append('phoneNumber', formData.phoneNumber);
            if (formData.password) data.append('password', formData.password);
            if (formData.avatar) data.append('avatar', formData.avatar);

            const response = await axios.put('http://localhost:5000/api/auth/profile', data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setUpdateMessage({ type: 'success', content: 'Cập nhật hồ sơ thành công!' });
            setIsEditing(false);

            // Update local storage with new user data
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            // Reload to reflect changes
            window.location.reload();

        } catch (error) {
            console.error('Error updating profile:', error);
            setUpdateMessage({ type: 'error', content: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.' });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-100 text-green-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            case 'Completed': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Confirmed': return 'Đã xác nhận';
            case 'Pending': return 'Chờ xử lý';
            case 'Cancelled': return 'Đã hủy';
            case 'Completed': return 'Hoàn thành';
            default: return status;
        }
    };

    if (!user) return null;

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 text-center border-b border-gray-100">
                                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 relative overflow-hidden">
                                    {user.avatar || previewAvatar ? (
                                        <img src={previewAvatar || (user.avatar?.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`)} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <FiUser size={40} />
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">{user.fullName}</h2>
                                <p className="text-gray-500 text-sm">{user.email}</p>
                            </div>
                            <div className="p-4">
                                <button
                                    onClick={() => setActiveTab('bookings')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'bookings' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <FiPackage /> Lịch sử đặt tour
                                </button>
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <FiUser /> Thông tin cá nhân
                                </button>
                                <button
                                    onClick={logout}
                                    className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-red-600 hover:bg-red-50 mt-4 border-t border-gray-100"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {activeTab === 'bookings' && (
                            <div className="space-y-6">
                                <h1 className="text-2xl font-bold text-gray-800">Lịch sử đặt tour</h1>
                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-red-700">{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                                    </div>
                                ) : bookings.length > 0 ? (
                                    bookings.map((booking) => (
                                        <div key={booking._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-100">
                                            <div className="p-6">
                                                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                                                {getStatusText(booking.status)}
                                                            </span>
                                                            <span className="text-gray-400 text-xs">#{booking._id.slice(-6)}</span>
                                                        </div>
                                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{booking.tour?.name || booking.hotel?.name || 'Dịch vụ'}</h3>
                                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                            <div className="flex items-center gap-1">
                                                                <FiCalendar /> {new Date(booking.startDate).toLocaleDateString('vi-VN')}
                                                            </div>
                                                            {booking.tour && (
                                                                <div className="flex items-center gap-1">
                                                                    <FiClock /> {booking.tour.duration}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-1">
                                                                <FiUser /> {booking.quantity} người
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-500">Tổng tiền</p>
                                                        <p className="text-xl font-bold text-indigo-600">{booking.totalPrice?.toLocaleString()} VNĐ</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                                                <div className="text-sm text-gray-500">
                                                    Ngày đặt: {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
                                                </div>
                                                {booking.status === 'Completed' && booking.tour && (
                                                    <button
                                                        onClick={() => handleOpenReview(booking.tour)}
                                                        className="flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                                                    >
                                                        <FiStar /> Viết đánh giá
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                            <FiPackage size={32} />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đơn đặt tour nào</h3>
                                        <p className="text-gray-500 mb-6">Bạn chưa đặt tour nào. Hãy khám phá các tour du lịch hấp dẫn ngay!</p>
                                        <button onClick={() => navigate('/tours')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                            Khám phá Tour
                                        </button>
                                    </div>
                                )}

                                {/* Review Modal */}
                                {selectedTour && (
                                    <ReviewModal
                                        isOpen={isReviewOpen}
                                        onClose={() => setIsReviewOpen(false)}
                                        tourId={selectedTour._id}
                                        tourName={selectedTour.name}
                                        onSuccess={handleReviewSuccess}
                                    />
                                )}
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-xl shadow-sm p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h1 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h1>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
                                        >
                                            <FiEdit2 /> Chỉnh sửa
                                        </button>
                                    )}
                                </div>

                                {updateMessage.content && (
                                    <div className={`mb-6 p-4 rounded-lg ${updateMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {updateMessage.content}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-6 max-w-xl">
                                        {/* Avatar Upload */}
                                        {isEditing && (
                                            <div className="flex items-center gap-4">
                                                <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden relative">
                                                    {previewAvatar || user.avatar ? (
                                                        <img src={previewAvatar || (user.avatar?.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`)} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><FiUser size={32} /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label htmlFor="avatar-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                                                        <FiCamera className="inline mr-2" /> Chọn ảnh
                                                    </label>
                                                    <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                                    <p className="text-xs text-gray-500 mt-1">Hỗ trợ JPG, PNG, GIF. Tối đa 2MB.</p>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={isEditing ? formData.fullName : user.fullName}
                                                readOnly={!isEditing}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-2 border rounded-lg ${isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500' : 'border-gray-200 bg-gray-50 text-gray-600'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={user.email}
                                                readOnly
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                value={isEditing ? formData.phoneNumber : (user.phoneNumber || '')}
                                                readOnly={!isEditing}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-2 border rounded-lg ${isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500' : 'border-gray-200 bg-gray-50 text-gray-600'}`}
                                            />
                                        </div>

                                        {isEditing && (
                                            <div className="pt-4 border-t border-gray-100">
                                                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                    <FiLock /> Đổi mật khẩu (Bỏ trống nếu không đổi)
                                                </h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                                                        <input
                                                            type="password"
                                                            name="password"
                                                            value={formData.password}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                                                        <input
                                                            type="password"
                                                            name="confirmPassword"
                                                            value={formData.confirmPassword}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {isEditing && (
                                            <div className="flex gap-4 pt-4">
                                                <button
                                                    type="submit"
                                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                                >
                                                    Lưu thay đổi
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setIsEditing(false); setPreviewAvatar(null); }}
                                                    className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                                >
                                                    Hủy
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
