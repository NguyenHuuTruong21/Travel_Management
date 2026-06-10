import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * VoucherInput Component
 * Props:
 *  - bookingType: 'tour' | 'hotel' | 'car'
 *  - amount: số tiền gốc
 *  - tourId: (optional) ID tour cụ thể
 *  - location: (optional) địa điểm
 *  - onApplied: callback(voucherResult) khi áp dụng thành công
 *  - onRemoved: callback() khi xóa voucher
 */
const VoucherInput = ({ bookingType, amount, tourId, location, onApplied, onRemoved }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(null);  // { code, discountAmount, finalAmount }
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Tự động gợi ý voucher
  useEffect(() => {
    if (amount > 0) fetchSuggestions();
  }, [amount, bookingType]);

  const fetchSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`${API_URL}/api/vouchers/public/suggest`, {
        params: { bookingType, amount },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setSuggestions(res.data.suggestions || []);
    } catch (err) {
      // Silent fail
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleApply = async (codeToApply = code) => {
    const trimmed = codeToApply.trim().toUpperCase();
    if (!trimmed) { setError('Vui lòng nhập mã giảm giá'); return; }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(
        `${API_URL}/api/vouchers/apply`,
        { code: trimmed, bookingType, amount, location, tourId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const result = {
        code: trimmed,
        discountAmount: res.data.discountAmount,
        finalAmount: res.data.finalAmount,
        discountType: res.data.discountType,
        discountValue: res.data.discountValue,
        message: res.data.message
      };

      setApplied(result);
      setCode(trimmed);
      setShowSuggestions(false);
      onApplied && onApplied(result);

    } catch (err) {
      const msg = err.response?.data?.message || 'Mã giảm giá không hợp lệ';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setApplied(null);
    setCode('');
    setError('');
    onRemoved && onRemoved();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleApply();
  };

  const fmt = (n) => n?.toLocaleString('vi-VN') + 'đ';

  // ── Đã áp dụng thành công ────────────────────────────────────────
  if (applied) {
    return (
      <div className="rounded-xl border-2 border-green-400 bg-green-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
              🎟️
            </div>
            <div>
              <p className="font-bold text-green-700 font-mono tracking-wider">{applied.code}</p>
              <p className="text-sm text-green-600">
                Giảm <strong>{fmt(applied.discountAmount)}</strong>
                {applied.discountType === 'percent' && ` (${applied.discountValue}%)`}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
            title="Xóa mã"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-green-200 flex justify-between text-sm">
          <span className="text-gray-500">Tiền gốc</span>
          <span className="line-through text-gray-400">{fmt(amount)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold mt-1">
          <span className="text-green-700">Sau giảm giá</span>
          <span className="text-green-700 text-lg">{fmt(applied.finalAmount)}</span>
        </div>
      </div>
    );
  }

  // ── Chưa áp dụng ────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Input + Button */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          🎟️ Mã giảm giá
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Nhập mã VOUCHER..."
            className={`flex-1 px-4 py-3 border-2 rounded-xl font-mono text-sm uppercase focus:outline-none transition-colors ${
              error ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
            }`}
            disabled={loading}
          />
          <button
            onClick={() => handleApply()}
            disabled={loading || !code.trim()}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : 'Áp dụng'}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
      </div>

      {/* Auto-suggest vouchers */}
      {(showSuggestions || suggestions.length > 0) && !applied && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-blue-700">✨ Voucher dành cho bạn</span>
            {loadingSuggestions && (
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          <div className="space-y-2">
            {suggestions.length === 0 && !loadingSuggestions && (
              <p className="text-sm text-gray-400 text-center py-2">Không có voucher nào phù hợp</p>
            )}
            {suggestions.map((v) => (
              <button
                key={v.code}
                onClick={() => { setCode(v.code); handleApply(v.code); }}
                className="w-full text-left p-3 bg-white hover:bg-blue-50 border border-blue-100 hover:border-blue-300 rounded-lg transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-600 text-white font-mono font-bold text-xs px-2 py-1 rounded-md">
                      {v.code}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        {v.discountType === 'percent'
                          ? `Giảm ${v.discountValue}%${v.maxDiscount > 0 ? ` (tối đa ${v.maxDiscount.toLocaleString('vi-VN')}đ)` : ''}`
                          : `Giảm ${v.discountValue.toLocaleString('vi-VN')}đ`}
                      </p>
                      {v.description && <p className="text-xs text-gray-400">{v.description}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      HSD: {new Date(v.endDate).toLocaleDateString('vi-VN')}
                    </p>
                    {v.userGroup !== 'ALL' && (
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        v.userGroup === 'VIP' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {v.userGroup === 'VIP' ? '👑 VIP' : '🌟 Mới'}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherInput;
