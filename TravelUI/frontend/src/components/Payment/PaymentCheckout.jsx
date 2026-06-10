import React, { useState } from 'react';
import axios from 'axios';
import { FaCreditCard, FaTicketAlt, FaCheckCircle } from 'react-icons/fa';
import VoucherInput from './VoucherInput';

const PaymentCheckout = ({ bookingData, onPaymentSuccess, onPaymentError }) => {
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('VNPAY');

  const finalAmount = Math.max(0, bookingData.totalPrice - discountAmount);



  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payments/create`,
        {
          orderId: bookingData._id,
          orderType: bookingData.type.toUpperCase(),
          couponCode,
          paymentMethod
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success && response.data.paymentUrl) {
        // Chuyển hướng đến VNPay
        window.location.href = response.data.paymentUrl;
      } else {
        onPaymentError('Không thể tạo liên kết thanh toán.');
      }
    } catch (error) {
      console.error('Payment Error:', error);
      onPaymentError(error.response?.data?.message || 'Lỗi hệ thống khi thanh toán.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header nhỏ gọn */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 text-white">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <FaCreditCard />
          Thanh Toán Đơn Hàng
        </h2>
        <p className="text-xs text-indigo-100 mt-0.5">Hoàn tất bước cuối để bắt đầu hành trình của bạn.</p>
      </div>

      {/* Tóm tắt đơn hàng */}
      <div className="px-5 py-4 space-y-2">
        <div className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
          <span className="text-gray-500 text-sm">Loại dịch vụ</span>
          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold uppercase">
            {bookingData.type === 'tour' ? 'Tour Du Lịch' : bookingData.type === 'hotel' ? 'Khách Sạn' : 'Thuê Xe'}
          </span>
        </div>
        <div className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
          <span className="text-gray-500 text-sm">Tổng tiền gốc</span>
          <span className="text-base font-bold text-gray-800">{bookingData.totalPrice.toLocaleString()} VNĐ</span>
        </div>
      </div>

      {/* Mã giảm giá (Coupon) */}
      <div className="mx-5 mb-4">
        <VoucherInput
          bookingType={bookingData.type}
          amount={bookingData.totalPrice}
          tourId={bookingData.type === 'tour' ? bookingData.itemId || bookingData._id : undefined}
          onApplied={(res) => {
            setCouponCode(res.code);
            setDiscountAmount(res.discountAmount);
          }}
          onRemoved={() => {
            setCouponCode('');
            setDiscountAmount(0);
          }}
        />
      </div>

      {/* Phương thức thanh toán */}
      <div className="px-5 mb-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Phương thức thanh toán</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPaymentMethod('VNPAY')}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
              paymentMethod === 'VNPAY' ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-gray-100 hover:border-indigo-200 bg-white'
            }`}
          >
            <div className="h-8 flex items-center justify-center">
              <img src="https://haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png" alt="VNPay" className="h-6 object-contain" />
            </div>
            <span className={`font-bold text-[11px] ${paymentMethod === 'VNPAY' ? 'text-indigo-700' : 'text-gray-500'}`}>VNPay Gateway</span>
          </button>

          <button
            onClick={() => setPaymentMethod('MOMO')}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
              paymentMethod === 'MOMO' ? 'border-pink-500 bg-pink-50 shadow-sm' : 'border-gray-100 hover:border-pink-200 bg-white'
            }`}
          >
            <div className="h-8 flex items-center justify-center">
              <img src="https://static.mservice.io/img/logo-momo.png" alt="MoMo" className="h-6 object-contain" />
            </div>
            <span className={`font-bold text-[11px] ${paymentMethod === 'MOMO' ? 'text-pink-600' : 'text-gray-500'}`}>Ví MoMo</span>
          </button>
        </div>
      </div>

      {/* Tổng kết cuối cùng */}
      <div className="mx-5 border-t border-dashed border-gray-200 pt-3 mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-500 text-sm">Giảm giá:</span>
          <span className="text-red-500 font-semibold text-sm">-{discountAmount.toLocaleString()} VNĐ</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-gray-900">Thanh toán:</span>
          <span className="text-xl font-black text-indigo-700">{finalAmount.toLocaleString()} VNĐ</span>
        </div>
      </div>

      <div className="px-5 pb-5">
        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] animate-gradient-x text-white text-base font-bold rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
        >
          {isLoading ? 'Đang xử lý...' : 'THANH TOÁN NGAY'}
        </button>
        <p className="text-center text-[11px] text-gray-400 mt-3">
          Hệ thống thanh toán bảo mật 256-bit SSL.
        </p>
      </div>
    </div>
  );
};

export default PaymentCheckout;
