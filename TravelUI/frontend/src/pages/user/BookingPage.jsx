import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { FiCalendar, FiMapPin, FiUsers, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import VoucherInput from '../../components/Payment/VoucherInput';

const BookingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1); // 1: Thông tin, 2: Thanh toán, 3: Success

    const [bookingId, setBookingId] = useState(null); // Lưu ID booking sau khi tạo

    const [bookingData, setBookingData] = useState({
        participants: 1,
        startDate: '',
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: '',
        note: '',
        promotionCode: '',
        discountAmount: 0,
        selectedPaymentMethod: 'VNPAY'
    });

    // State quản lý voucher
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        const fetchTour = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tours/${id}`);
                setTour(response.data.tour);
            } catch (error) {
                console.error('Error fetching tour:', error);
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

    // Step 1: Tạo Booking (Pending)
    const handleCreateBooking = async (e) => {
        e.preventDefault();
        if (!bookingData.startDate) {
            alert('Vui lòng chọn ngày khởi hành');
            return;
        }
        if (!user) {
            alert('Vui lòng đăng nhập để đặt tour');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/bookings`, {
                type: 'tour',
                tourId: id,
                quantity: bookingData.participants,
                startDate: bookingData.startDate,
                specialRequest: bookingData.note,
                promotionCode: bookingData.promotionCode || undefined
            }, config);

            setBookingId(res.data.bookingId);
            setStep(2);
        } catch (error) {
            console.error('Create booking error:', error);
            alert(error.response?.data?.message || 'Có lỗi khi tạo đơn đặt tour');
        }
    };

    const handlePayment = async () => {
        if (!bookingId) return alert('Không tìm thấy đơn đặt');
        setPaymentLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/payments/create`, {
                orderId: bookingId,
                orderType: 'TOUR',
                couponCode: appliedVoucher?.code || undefined,
                paymentMethod: bookingData.selectedPaymentMethod
            }, config);

            if (res.data.paymentUrl) {
                // Chuyển sang trang giả lập thanh toán
                window.location.href = res.data.paymentUrl;
            } else {
                alert('Không nhận được link thanh toán');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert(error.response?.data?.message || 'Lỗi khi tạo link thanh toán');
        } finally {
            setPaymentLoading(false);
        }
    };

    // Áp dụng mã giảm giá (giữ nguyên logic cũ của bạn)
    const applyPromotion = async () => {
        const code = document.getElementById('promo-input').value.trim();
        if (!code) return alert('Vui lòng nhập mã giảm giá');

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/promotions/check`, {
                code,
                tourId: id,
                totalAmount: tour.price * bookingData.participants
            });

            if (res.data.valid) {
                alert(`Áp dụng thành công! Giảm ${new Intl.NumberFormat('vi-VN').format(res.data.discountAmount)} đ`);
                setBookingData(prev => ({
                    ...prev,
                    promotionCode: res.data.code,
                    discountAmount: res.data.discountAmount
                }));
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Mã giảm giá không hợp lệ');
        }
    };

    if (loading) return <div className="text-center py-20">Đang tải...</div>;
    if (!tour) return <div className="text-center py-20">Không tìm thấy tour</div>;

    const originalPrice = tour.price * bookingData.participants;
    const discount = appliedVoucher?.discountAmount || 0;
    const finalPrice = Math.max(0, originalPrice - discount);
    const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

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
                    {/* Left Form */}
                    <div className="lg:col-span-2">
                        {step === 1 && (
                            <div className="bg-white rounded-2xl shadow-sm p-8">
                                <h2 className="text-2xl font-bold mb-6">Thông tin đặt tour</h2>
                                <form onSubmit={handleCreateBooking}>
                                    {/* Các trường thông tin giống cũ */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                                            <input type="text" name="fullName" value={bookingData.fullName} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                            <input type="email" name="email" value={bookingData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                                            <input type="tel" name="phone" value={bookingData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng khách</label>
                                            <input type="number" min="1" name="participants" value={bookingData.participants} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500" required />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày khởi hành</label>
                                            <input type="date" name="startDate" value={bookingData.startDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500" required />
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú thêm</label>
                                        <textarea name="note" value={bookingData.note} onChange={handleChange} rows="3" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"></textarea>
                                    </div>

                                    <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                                        Tiếp tục đến thanh toán
                                    </button>
                                </form>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                {/* Voucher Section */}
                                <div className="bg-white rounded-2xl shadow-sm p-6">
                                    <h2 className="text-xl font-bold mb-4">🎟️ Mã giảm giá</h2>
                                    <VoucherInput
                                        bookingType="tour"
                                        amount={originalPrice}
                                        tourId={id}
                                        location={tour?.location}
                                        onApplied={(result) => setAppliedVoucher(result)}
                                        onRemoved={() => setAppliedVoucher(null)}
                                    />
                                </div>

                                {/* Phương thức thanh toán */}
                                <div className="bg-white rounded-2xl shadow-sm p-6">
                                    <h2 className="text-xl font-bold mb-4">💳 Phương thức thanh toán</h2>
                                    {/* 💳 Phương thức thanh toán */}
                                    <div className="space-y-3">
                                        {[
                                            { value: 'VNPAY', label: 'VNPay (Thẻ ATM / QR Code)', icon: '🏦', color: 'blue' },
                                            { value: 'MOMO', label: 'Ví MoMo', icon: '💜', color: 'pink' }
                                        ].map(m => (
                                            <label
                                                key={m.value}
                                                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                                    bookingData.selectedPaymentMethod === m.value
                                                        ? `border-${m.color}-500 bg-${m.color}-50`
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <input
                                                    type="radio" name="paymentMethod" value={m.value}
                                                    checked={bookingData.selectedPaymentMethod === m.value}
                                                    onChange={e => setBookingData(prev => ({ ...prev, selectedPaymentMethod: e.target.value }))}
                                                    className="w-4 h-4"
                                                />
                                                <span className="ml-3 text-2xl">{m.icon}</span>
                                                <span className="ml-2 font-medium text-gray-700">{m.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Tóm tắt giá + nút */}
                                <div className="bg-white rounded-2xl shadow-sm p-6">
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Giá gốc ({bookingData.participants} khách)</span>
                                            <span>{fmt(originalPrice)}</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between text-sm text-green-600 font-medium">
                                                <span>🎟️ Giảm ({appliedVoucher?.code})</span>
                                                <span>- {fmt(discount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-dashed border-gray-200">
                                            <span>Tổng thanh toán</span>
                                            <span className="text-blue-600 text-2xl">{fmt(finalPrice)}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="w-1/3 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                        >
                                            ← Quay lại
                                        </button>
                                        <button
                                            onClick={handlePayment}
                                            disabled={paymentLoading}
                                            className="w-2/3 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                        >
                                            {paymentLoading
                                                ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang xử lý...</>
                                                : `Thanh toán ${fmt(finalPrice)}`
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                                <FiCheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
                                <h2 className="text-3xl font-bold mb-4">Đặt tour thành công!</h2>
                                <p className="text-gray-600 mb-8">Cảm ơn bạn! Chúng tôi đã gửi thông tin đơn hàng đến email của bạn.</p>
                                <button onClick={() => navigate('/')} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700">Về trang chủ</button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar tóm tắt */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
                            <h3 className="text-lg font-bold mb-4">Tóm tắt đơn hàng</h3>
                            {/* Giữ nguyên phần tóm tắt tour của bạn */}
                            <div className="flex gap-4 mb-4">
                                <img 
                                    src={tour.images?.[0]
                                        ? (tour.images[0].startsWith('http') ? tour.images[0] : `${import.meta.env.VITE_API_URL}${tour.images[0].startsWith('/') ? '' : '/'}${tour.images[0].replace(/\\/g, '/')}`)
                                        : 'https://via.placeholder.com/400x300'} 
                                    alt={tour.name} 
                                    className="w-20 h-20 rounded-lg object-cover" 
                                />
                                <div>
                                    <h4 className="font-medium line-clamp-2">{tour.name}</h4>
                                </div>
                            </div>

                            <div className="space-y-3 border-t border-gray-100 pt-4 text-sm text-gray-600">
                                <div className="flex justify-between"><span>Khởi hành:</span><span className="font-medium">{bookingData.startDate ? new Date(bookingData.startDate).toLocaleDateString('vi-VN') : 'Chưa chọn'}</span></div>
                                <div className="flex justify-between"><span>Số khách:</span><span className="font-medium">{bookingData.participants} người</span></div>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <div className="flex justify-between mb-2"><span>Đơn giá</span><span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.price)}</span></div>
                                <div className="flex justify-between mb-4"><span>Số lượng</span><span>x {bookingData.participants}</span></div>
                                {bookingData.discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600 mb-4">
                                        <span>Giảm giá</span>
                                        <span>- {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bookingData.discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t border-dashed pt-4">
                                    <span className="font-bold text-lg">Tổng cộng</span>
                                    <span className="font-bold text-2xl text-blue-600">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice)}
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