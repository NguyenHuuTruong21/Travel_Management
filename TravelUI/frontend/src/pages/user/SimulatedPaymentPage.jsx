import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';

/**
 * SIMULATED PAYMENT PAGE
 * Giao diện giả lập thanh toán trông giống VNPay/MoMo
 * Người dùng click "Thanh toán" hoặc "Hủy" để mô phỏng kết quả
 */
const SimulatedPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const token = searchParams.get('token');
  const bookingId = searchParams.get('bookingId');
  const paymentId = searchParams.get('paymentId');
  const amount = searchParams.get('amount');
  const method = searchParams.get('method') || 'VNPAY';
  const type = searchParams.get('type') || 'tour';

  const [processing, setProcessing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'card'

  // Tạo thông tin thẻ ngẫu nhiên khi vào trang
  const cardInfo = useMemo(() => {
    const random4 = () => Math.floor(Math.random() * 8999 + 1000);
    const now = new Date();
    const expMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    const expYear = (now.getFullYear() + 5).toString().slice(-2);
    
    return {
      number: `9704 ${random4()} ${random4()} ${random4()}`,
      expiry: `${expMonth}/${expYear}`,
      cvv: Math.floor(Math.random() * 899 + 100).toString(),
      holderName: user?.fullName?.toUpperCase() || 'NGUYEN VAN A'
    };
  }, [user]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Countdown nếu có flash sale (demo)
  useEffect(() => {
    if (method === 'VNPAY') setCountdown(900); // 15 phút
  }, [method]);

  useEffect(() => {
    if (!countdown) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handlePayment = async (status) => {
    setProcessing(true);
    // Redirect đến backend callback - backend sẽ xử lý và redirect lại frontend
    const callbackUrl = `${API_URL}/api/payments/simulate/callback?` +
      `token=${token}&paymentId=${paymentId}&bookingId=${bookingId}&status=${status}`;
    window.location.href = callbackUrl;
  };

  const formattedAmount = Number(amount).toLocaleString('vi-VN');

  const typeLabels = { tour: 'Đặt Tour Du Lịch', hotel: 'Đặt Khách Sạn', car: 'Thuê Xe' };

  // Giả QR code (placeholder hình ảnh)
  const fakeQR = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`PAY:${bookingId}:${amount}`)}`;

  if (method === 'MOMO') {
    return <MoMoSimulator
      amount={formattedAmount} type={typeLabels[type]}
      onSuccess={() => handlePayment('success')}
      onCancel={() => handlePayment('cancel')}
      processing={processing} fakeQR={fakeQR}
    />;
  }

  // VNPay Simulator (default)
  return (
    <div className="min-h-screen bg-[#003087] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header VNPay */}
        <div className="bg-[#003087] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg p-1.5">
              <span className="text-[#003087] font-black text-lg">VN</span>
              <span className="text-[#E31837] font-black text-lg">PAY</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Cổng thanh toán VNPAY</p>
              <p className="text-blue-200 text-xs">Kết nối an toàn SSL</p>
            </div>
          </div>
          {countdown !== null && (
            <div className="text-right">
              <p className="text-blue-200 text-xs">Hết hạn sau</p>
              <p className={`font-bold text-lg ${countdown < 60 ? 'text-red-400' : 'text-white'}`}>
                {formatTime(countdown)}
              </p>
            </div>
          )}
        </div>

        {/* Thông tin đơn hàng */}
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Dịch vụ</span>
            <span className="text-sm font-semibold text-gray-700">{typeLabels[type]}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Mã đơn hàng</span>
            <span className="text-sm font-mono text-gray-600">{bookingId?.slice(-8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Số tiền cần thanh toán</span>
            <span className="text-xl font-bold text-[#E31837]">{formattedAmount} ₫</span>
          </div>
        </div>

        {/* Tabs QR / Thẻ ngân hàng */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'qr'
                  ? 'text-[#003087] border-b-2 border-[#003087] bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📱 Quét mã QR
            </button>
            <button
              onClick={() => setActiveTab('card')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'card'
                  ? 'text-[#003087] border-b-2 border-[#003087] bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              💳 Thẻ ngân hàng
            </button>
          </div>
        </div>

        {/* Nội dung tab */}
        <div className="px-6 py-5">
          {activeTab === 'qr' ? (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">Quét mã QR bằng app ngân hàng hoặc VNPAY app</p>
              <div className="inline-block p-3 border-2 border-[#003087] rounded-xl mb-4">
                <img src={fakeQR} alt="QR Code" className="w-48 h-48" />
              </div>
              {/* Thông tin thanh toán mô phỏng */}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Số thẻ</label>
                <input
                  type="text"
                  defaultValue={cardInfo.number}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#003087] outline-none"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ngày hết hạn</label>
                  <input
                    type="text"
                    defaultValue={cardInfo.expiry}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#003087] outline-none"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">CVV</label>
                  <input
                    type="password"
                    defaultValue={cardInfo.cvv}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#003087] outline-none"
                    readOnly
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Chủ thẻ</label>
                <input
                  type="text"
                  defaultValue={cardInfo.holderName}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#003087] outline-none"
                  readOnly
                />
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-600">
                💡 Dữ liệu trên là thẻ test – Nhấn nút bên dưới để mô phỏng thanh toán
              </div>
            </div>
          )}
        </div>

        {/* Nút hành động */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={() => handlePayment('success')}
            disabled={processing || countdown === 0}
            className="w-full py-3.5 bg-[#E31837] hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang xử lý...
              </>
            ) : (
              `✅ Thanh toán ${formattedAmount} ₫`
            )}
          </button>
          <button
            onClick={() => handlePayment('cancel')}
            disabled={processing}
            className="w-full py-3 border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium rounded-xl transition-all disabled:opacity-60"
          >
            ❌ Hủy giao dịch
          </button>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 text-center">
          <p className="text-xs text-gray-400">
            🔒 Bảo mật bởi <strong>VNPAY</strong> • SSL 256-bit • PCI DSS Compliant
          </p>
        </div>
      </div>
    </div>
  );
};

// MoMo Simulator
const MoMoSimulator = ({ amount, type, onSuccess, onCancel, processing, fakeQR }) => (
  <div className="min-h-screen bg-[#AE1889] flex items-center justify-center p-4">
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-[#AE1889] px-6 py-5 text-center">
        <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-3 flex items-center justify-center">
          <span className="text-3xl">💜</span>
        </div>
        <h1 className="text-white font-bold text-xl">MoMo</h1>
        <p className="text-pink-200 text-sm">Thanh toán qua Ví MoMo</p>
      </div>

      <div className="px-6 py-4 bg-pink-50 border-b">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">Dịch vụ</span>
          <span className="text-sm font-medium">{type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Số tiền</span>
          <span className="text-lg font-bold text-[#AE1889]">{amount} ₫</span>
        </div>
      </div>

      <div className="p-6 text-center">
        <p className="text-sm text-gray-500 mb-3">Quét QR bằng app MoMo</p>
        <img src={fakeQR} alt="QR" className="w-44 h-44 mx-auto border-4 border-[#AE1889] rounded-xl mb-4" />
        {/* Môi trường thanh toán mô phỏng */}
      </div>

      <div className="px-6 pb-6 space-y-3">
        <button
          onClick={onSuccess}
          disabled={processing}
          className="w-full py-3.5 bg-[#AE1889] hover:bg-pink-800 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {processing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : `✅ Xác nhận thanh toán`}
        </button>
        <button onClick={onCancel} disabled={processing} className="w-full py-3 border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium rounded-xl">
          ❌ Hủy
        </button>
      </div>
    </div>
  </div>
);

export default SimulatedPaymentPage;
