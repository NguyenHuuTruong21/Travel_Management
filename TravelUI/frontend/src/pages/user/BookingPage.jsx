import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { FiCalendar, FiMapPin, FiUsers, FiCreditCard, FiCheckCircle } from 'react-icons/fi';

const BookingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Success

    // Form state
    const [bookingData, setBookingData] = useState({
        participants: 1,
        startDate: '',
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: '',
        note: '',
        paymentMethod: 'credit_card'
    });

    useEffect(() => {
        const fetchTour = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/tours/${id}`);
                setTour(response.data.tour);
            } catch (error) {
                console.error('Error fetching tour:', error);
                // navigate('/tours');
            } finally {
                setLoading(false);
            }
        };
        fetchTour();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (step === 1) {
            if (!bookingData.startDate) {
                alert('Vui lòng chọn ngày khởi hành');
                return;
            }
            setStep(2);
            return;
        }

        // Final Submit
        try {
            const token = localStorage.getItem('accessToken');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const paymentMethodMap = {
                'credit_card': 'credit_card',
                'bank_transfer': 'banking',
                'cash': 'none'
            };

            await axios.post('http://localhost:5000/api/bookings', {
                tourId: id,
                quantity: bookingData.participants,
                startDate: bookingData.startDate,
                specialRequest: bookingData.note,
                paymentMethod: paymentMethodMap[bookingData.paymentMethod],
                promotionCode: bookingData.promotionCode // Add promotion code
                // vehicle and guide are optional and not in this form
            }, config);

            // Success
            setStep(3);
        } catch (error) {
            console.error('Booking error:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!tour) return <div className="text-center py-20">Tour not found</div>;

    const totalPrice = tour.price * bookingData.participants;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Progress Steps */}
                <div className="flex justify-center mb-10">
                    <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                        <span className={`ml-2 font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>Thông tin</span>
                    </div>
                    <div className={`w-20 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                        <span className={`ml-2 font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>Thanh toán</span>
                    </div>
                    <div className={`w-20 h-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
                        <span className={`ml-2 font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>Hoàn tất</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Booking Form */}
                    <div className="lg:col-span-2">
                        {step === 1 && (
                            <div className="bg-white rounded-2xl shadow-sm p-8">
                                <h2 className="text-2xl font-bold mb-6">Thông tin đặt tour</h2>
                                <form id="booking-form" onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                                            <input required type="text" name="fullName" value={bookingData.fullName} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                            <input required type="email" name="email" value={bookingData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                                            <input required type="tel" name="phone" value={bookingData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng khách</label>
                                            <input required type="number" min="1" max={tour.maxGroupSize} name="participants" value={bookingData.participants} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày khởi hành</label>
                                            <input
                                                required
                                                type="date"
                                                name="startDate"
                                                value={bookingData.startDate}
                                                onChange={handleChange}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú thêm</label>
                                        <textarea rows="3" name="note" value={bookingData.note} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"></textarea>
                                    </div>
                                    {!user && (
                                        <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                            <p className="text-sm text-yellow-800">
                                                Bạn chưa đăng nhập. Vui lòng <a href="/login" className="font-bold underline">đăng nhập</a> để đặt tour.
                                            </p>
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={!user}
                                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Tiếp tục thanh toán
                                    </button>
                                </form>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="bg-white rounded-2xl shadow-sm p-8">
                                <h2 className="text-2xl font-bold mb-6">Mã giảm giá</h2>
                                <div className="flex gap-4 mb-8">
                                    <input
                                        type="text"
                                        placeholder="Nhập mã giảm giá"
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        id="promo-input"
                                    />
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const code = document.getElementById('promo-input').value;
                                            if (!code) return alert('Vui lòng nhập mã');
                                            try {
                                                const res = await axios.post('http://localhost:5000/api/promotions/check', {
                                                    code,
                                                    tourId: id,
                                                    totalAmount: totalPrice
                                                });
                                                if (res.data.valid) {
                                                    alert(`Áp dụng mã thành công! Giảm ${new Intl.NumberFormat('vi-VN').format(res.data.discountAmount)} đ`);
                                                    setBookingData(prev => ({
                                                        ...prev,
                                                        promotionCode: res.data.code,
                                                        discountAmount: res.data.discountAmount
                                                    }));
                                                }
                                            } catch (err) {
                                                alert(err.response?.data?.message || 'Mã không hợp lệ');
                                                setBookingData(prev => ({ ...prev, promotionCode: '', discountAmount: 0 }));
                                            }
                                        }}
                                        className="px-6 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700"
                                    >
                                        Áp dụng
                                    </button>
                                </div>

                                <h2 className="text-2xl font-bold mb-6">Chọn phương thức thanh toán</h2>
                                <div className="space-y-4 mb-8">
                                    <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                                        <input type="radio" name="paymentMethod" value="credit_card" checked={bookingData.paymentMethod === 'credit_card'} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                                        <div className="ml-4 flex items-center gap-3">
                                            <FiCreditCard className="text-xl text-gray-600" />
                                            <span className="font-medium text-gray-900">Thẻ tín dụng / Ghi nợ quốc tế</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                                        <input type="radio" name="paymentMethod" value="bank_transfer" checked={bookingData.paymentMethod === 'bank_transfer'} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                                        <div className="ml-4 flex items-center gap-3">
                                            <span className="font-medium text-gray-900">Chuyển khoản ngân hàng (QR Code)</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                                        <input type="radio" name="paymentMethod" value="cash" checked={bookingData.paymentMethod === 'cash'} onChange={handleChange} className="w-5 h-5 text-blue-600" />
                                        <div className="ml-4 flex items-center gap-3">
                                            <span className="font-medium text-gray-900">Tiền mặt tại văn phòng</span>
                                        </div>
                                    </label>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setStep(1)} className="w-1/3 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                                        Quay lại
                                    </button>
                                    <button onClick={handleSubmit} className="w-2/3 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
                                        Xác nhận thanh toán
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                                    <FiCheckCircle size={40} />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Đặt tour thành công!</h2>
                                <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                                    Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi. Mã đơn hàng của bạn đã được gửi đến email <strong>{bookingData.email}</strong>. Nhân viên tư vấn sẽ liên hệ với bạn trong vòng 24h.
                                </p>
                                <button onClick={() => navigate('/')} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors">
                                    Về trang chủ
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Booking Summary - Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h3>

                            <div className="flex gap-4 mb-4">
                                <img src={tour.images?.[0]
                                    ? (tour.images[0].startsWith('http') ? tour.images[0] : `http://localhost:5000${tour.images[0].startsWith('/') ? '' : '/'}${tour.images[0].replace(/\\/g, '/')}`)
                                    : 'https://via.placeholder.com/200'}
                                    alt={tour.name} className="w-20 h-20 rounded-lg object-cover" />
                                <div>
                                    <h4 className="font-medium text-gray-900 line-clamp-2">{tour.name}</h4>
                                </div>
                            </div>

                            <div className="space-y-3 border-t border-gray-100 pt-4 mb-4 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span className="flex items-center gap-2"><FiCalendar /> Khởi hành:</span>
                                    <span className="font-medium text-gray-900">{bookingData.startDate ? new Date(bookingData.startDate).toLocaleDateString('vi-VN') : 'Chưa chọn'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="flex items-center gap-2"><FiUsers /> Số khách:</span>
                                    <span className="font-medium text-gray-900">{bookingData.participants} người</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="flex items-center gap-2"><FiMapPin /> Nơi đi:</span>
                                    <span className="font-medium text-gray-900">{tour.startLocation}</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Đơn giá</span>
                                    <span className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.price)}</span>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-600">Số lượng</span>
                                    <span className="font-medium">x {bookingData.participants}</span>
                                </div>
                                {bookingData.discountAmount > 0 && (
                                    <div className="flex justify-between items-center mb-4 text-green-600">
                                        <span className="">Giảm giá</span>
                                        <span className="font-medium">- {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bookingData.discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-4">
                                    <span className="font-bold text-lg text-gray-900">Tổng cộng</span>
                                    <span className="font-bold text-2xl text-blue-600">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.max(0, totalPrice - (bookingData.discountAmount || 0)))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
