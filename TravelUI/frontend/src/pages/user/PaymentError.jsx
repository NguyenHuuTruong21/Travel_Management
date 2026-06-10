import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimesCircle, FaHome, FaRedo } from 'react-icons/fa';

const PaymentError = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <FaTimesCircle className="text-6xl text-red-500" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Thanh Toán Thất Bại</h1>
        <p className="text-gray-600 mb-8">
          Rất tiếc, đã có lỗi xảy ra trong quá trình thanh toán hoặc giao dịch đã bị hủy. Vui lòng thử lại sau.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/profile')}
            className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-700 transition-all"
          >
            <FaRedo /> Thử lại từ Lịch sử đặt chỗ
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

export default PaymentError;
