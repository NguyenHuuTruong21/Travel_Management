import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaHistory } from 'react-icons/fa';

const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const bookingId = query.get('vnp_TxnRef');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full animate-pulse">
            <FaCheckCircle className="text-6xl text-green-500" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Thành Công!</h1>
        <p className="text-gray-600 mb-8">
          Cảm ơn bạn! Đơn hàng <strong className="text-indigo-600">#{bookingId}</strong> của bạn đã được thanh toán thành công.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/profile')}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
          >
            <FaHistory /> Xem lịch sử đặt chỗ
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
          >
            <FaHome /> Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
