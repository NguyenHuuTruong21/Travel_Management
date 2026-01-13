import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { FiCalendar, FiUser, FiMapPin, FiCreditCard } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const HotelBookingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Form State
    const [bookingData, setBookingData] = useState({
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Default 1 night
        quantity: 1, // Number of rooms/guests? Assuming rooms/units
        specialRequest: '',
        paymentMethod: 'none'
    });

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/hotels/${id}`);
                setHotel(response.data.hotel || response.data.data || response.data);
            } catch (error) {
                console.error('Error fetching hotel:', error);
                alert('Không thể tải thông tin khách sạn.');
                navigate('/hotels');
            } finally {
                setLoading(false);
            }
        };
        fetchHotel();
    }, [id, navigate]);

    const calculateTotal = () => {
        if (!hotel || !bookingData.startDate || !bookingData.endDate) return 0;
        const diffTime = Math.abs(bookingData.endDate - bookingData.startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const nights = diffDays > 0 ? diffDays : 1;

        return (hotel.pricePerNight || 0) * bookingData.quantity * nights;
    };

    const handleBooking = async (e) => {
        e.preventDefault();

        if (!user) {
            alert('Vui lòng đăng nhập để đặt phòng.');
            navigate('/login');
            return;
        }

        if (bookingData.endDate <= bookingData.startDate) {
            alert('Ngày Check-out phải sau ngày Check-in');
            return;
        }

        setSubmitLoading(true);

        try {
            const token = localStorage.getItem('accessToken');
            const payload = {
                type: 'hotel',
                hotelId: id,
                quantity: bookingData.quantity,
                startDate: bookingData.startDate,
                endDate: bookingData.endDate,
                specialRequest: bookingData.specialRequest,
                paymentMethod: bookingData.paymentMethod
            };

            const response = await axios.post(
                'http://localhost:5000/api/bookings',
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 201) {
                alert('Đặt phòng thành công! Chúng tôi sẽ liên hệ sớm.');
                navigate('/profile'); // Go to dashboard history
            }
        } catch (error) {
            console.error('Booking error:', error);
            const msg = error.response?.data?.message || 'Có lỗi xảy ra khi đặt phòng.';
            alert(msg);
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Đang tải...</div>;
    if (!hotel) return <div className="p-10 text-center">Khách sạn không tồn tại.</div>;

    const totalPrice = calculateTotal();
    const nights = Math.ceil(Math.abs(bookingData.endDate - bookingData.startDate) / (1000 * 60 * 60 * 24)) || 1;

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Đặt Phòng Khách Sạn</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Hotel Info Sidebar */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-24">
                            <div className="h-48">
                                <img
                                    src={(hotel.images && hotel.images[0])
                                        ? (hotel.images[0].startsWith('http') ? hotel.images[0] : `http://localhost:5000${hotel.images[0].startsWith('/') ? '' : '/'}${hotel.images[0].replace(/\\/g, '/')}`)
                                        : 'https://via.placeholder.com/400x300'}
                                    alt={hotel.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-2">{hotel.name}</h2>
                                <div className="flex items-start gap-2 text-gray-600 mb-4">
                                    <FiMapPin className="mt-1 flex-shrink-0" />
                                    <span className="text-sm">{hotel.address}</span>
                                </div>
                                <div className="border-t border-gray-100 pt-4">
                                    <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                                        <span>Giá mỗi đêm:</span>
                                        <span className="font-bold text-indigo-600">{(hotel.pricePerNight || 0).toLocaleString()} VNĐ</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <span>Đánh giá:</span>
                                        <span className="font-bold text-yellow-500">{hotel.stars || 5} ★</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <form onSubmit={handleBooking} className="space-y-6">
                                {/* Date Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <FiCalendar /> Ngày nhận phòng (Check-in)
                                        </label>
                                        <DatePicker
                                            selected={bookingData.startDate}
                                            onChange={(date) => setBookingData({ ...bookingData, startDate: date })}
                                            selectsStart
                                            startDate={bookingData.startDate}
                                            endDate={bookingData.endDate}
                                            minDate={new Date()}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <FiCalendar /> Ngày trả phòng (Check-out)
                                        </label>
                                        <DatePicker
                                            selected={bookingData.endDate}
                                            onChange={(date) => setBookingData({ ...bookingData, endDate: date })}
                                            selectsEnd
                                            startDate={bookingData.startDate}
                                            endDate={bookingData.endDate}
                                            minDate={bookingData.startDate}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Guests/Rooms */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                        <FiUser /> Số lượng phòng (đơn vị đặt)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={bookingData.quantity}
                                        onChange={(e) => setBookingData({ ...bookingData, quantity: parseInt(e.target.value) || 1 })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Special Request */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Yêu cầu đặc biệt</label>
                                    <textarea
                                        rows="3"
                                        value={bookingData.specialRequest}
                                        onChange={(e) => setBookingData({ ...bookingData, specialRequest: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Ví dụ: Phòng tầng cao, view biển..."
                                    ></textarea>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                        <FiCreditCard /> Phương thức thanh toán
                                    </label>
                                    <select
                                        value={bookingData.paymentMethod}
                                        onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="none">Thanh toán sau (Tư vấn viên liên hệ)</option>
                                        <option value="banking">Chuyển khoản ngân hàng</option>
                                        <option value="credit_card">Thẻ tín dụng (Mô phỏng)</option>
                                    </select>
                                </div>

                                {/* Summary & Submit */}
                                <div className="bg-gray-50 p-6 rounded-xl mt-8">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Số đêm nghỉ:</span>
                                        <span className="font-medium">{nights} đêm</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Số lượng:</span>
                                        <span className="font-medium">{bookingData.quantity}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                        <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
                                        <span className="text-2xl font-bold text-indigo-600">{totalPrice.toLocaleString()} VNĐ</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitLoading}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {submitLoading ? 'Đang xử lý...' : 'Xác Nhận Đặt Phòng'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelBookingPage;
