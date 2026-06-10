/**
 * pages/user/MyItineraryPage.jsx
 * ================================
 * Trang Lịch trình cá nhân (My Trips)
 *
 * Hiển thị:
 *  - Danh sách booking đã xác nhận / đã thanh toán
 *  - Filter: Tất cả | Sắp tới | Đã hoàn thành
 *  - Card: ảnh, tên, ngày khởi hành, countdown, trạng thái, giá
 *  - Trạng thái loading / empty state
 */

import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCalendar, FiMapPin, FiUsers, FiClock, FiFilter,
  FiAlertCircle, FiCheckCircle, FiLoader, FiCompass,
  FiArrowRight, FiRefreshCw, FiDollarSign
} from 'react-icons/fi';
import { getMyItinerary } from '../../services/itineraryService';
import { AuthContext } from '../../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Helper: tạo màu cho badge ───
const statusConfig = {
  Confirmed:  { label: 'Đã xác nhận', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  Completed:  { label: 'Hoàn thành',  color: 'bg-blue-100   text-blue-700   border-blue-200'   },
  Pending:    { label: 'Chờ xử lý',   color: 'bg-amber-100  text-amber-700  border-amber-200'  },
  Cancelled:  { label: 'Đã hủy',      color: 'bg-red-100    text-red-700    border-red-200'    },
  default:    { label: 'Không rõ',    color: 'bg-gray-100   text-gray-600   border-gray-200'   }
};

const getStatusBadge = (status) => statusConfig[status] || statusConfig.default;

// ─── Helper: countdown text ───
const getDepartureText = (days) => {
  if (days < 0)  return { text: `${Math.abs(days)} ngày trước`, color: 'text-gray-500' };
  if (days === 0) return { text: 'Hôm nay!',                     color: 'text-red-600 font-bold' };
  if (days === 1) return { text: 'Ngày mai!',                    color: 'text-red-500 font-semibold' };
  if (days <= 3)  return { text: `Còn ${days} ngày`,             color: 'text-orange-500 font-semibold' };
  return         { text: `Còn ${days} ngày`,                    color: 'text-emerald-600' };
};

// ─── Card lịch trình ───
const ItineraryCard = ({ booking }) => {
  const resource  = booking.tour || booking.hotel;
  const isHotel   = booking.type === 'hotel';
  const images    = resource?.images || [];
  const imgSrc    = images[0]
    ? (images[0].startsWith('http') ? images[0] : `${API_URL}${images[0]}`)
    : null;

  const startDate = new Date(booking.startDate).toLocaleDateString('vi-VN', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const { text: countdownTxt, color: countdownColor } = getDepartureText(booking.daysUntilDeparture ?? Infinity);
  const badge = getStatusBadge(booking.status);

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col">

      {/* Ảnh */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc} alt={resource?.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-blue-300">
            <FiCompass size={40} />
            <span className="text-sm">{isHotel ? 'Khách sạn' : 'Tour'}</span>
          </div>
        )}

        {/* Overlay badge loại dịch vụ */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isHotel ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'}`}>
            {isHotel ? '🏨 Khách sạn' : '✈️ Tour'}
          </span>
        </div>

        {/* Countdown badge */}
        <div className="absolute top-3 right-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-gray-700">
            {countdownTxt}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col gap-3">

        {/* Tên + Status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">
            {resource?.name || 'Dịch vụ không xác định'}
          </h3>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        {/* Địa điểm */}
        {(resource?.destination || resource?.address) && (
          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <FiMapPin size={14} className="flex-shrink-0 text-blue-400" />
            <span className="truncate">{resource.destination || resource.address}</span>
          </div>
        )}

        {/* Ngày khởi hành */}
        <div className="flex items-center gap-1.5 text-gray-600 text-sm">
          <FiCalendar size={14} className="flex-shrink-0 text-blue-400" />
          <span>{startDate}</span>
        </div>

        {/* Số lượng */}
        <div className="flex items-center gap-1.5 text-gray-600 text-sm">
          <FiUsers size={14} className="flex-shrink-0 text-blue-400" />
          <span>{booking.quantity} {isHotel ? 'phòng' : 'người'}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mt-auto pt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FiDollarSign size={14} className="text-emerald-500" />
            <span className="font-bold text-emerald-600 text-sm">
              {booking.totalPrice?.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>

          <Link
            to={`/booking-detail/${booking._id}`}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 group/link"
          >
            Chi tiết <FiArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────────────────
const FILTERS = [
  { key: 'all',       label: 'Tất cả',       icon: '🗺️' },
  { key: 'upcoming',  label: 'Sắp tới',      icon: '✈️' },
  { key: 'completed', label: 'Đã hoàn thành', icon: '✅' }
];

const MyItineraryPage = () => {
  const { user }         = useContext(AuthContext);
  const [filter,    setFilter]    = useState('upcoming');
  const [bookings,  setBookings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [page,      setPage]      = useState(1);
  const [totalPages,setTotalPages]= useState(1);
  const [total,     setTotal]     = useState(0);

  const fetchItinerary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyItinerary({ filter, page, limit: 9 });
      setBookings(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError('Không thể tải lịch trình. Vui lòng thử lại.');
      console.error('[MyItinerary]', err);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchItinerary();
  }, [fetchItinerary]);

  // Reset về trang 1 khi đổi filter
  const handleFilterChange = (key) => {
    setFilter(key);
    setPage(1);
  };

  // ─── Empty State ───
  const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-6 text-5xl">
        🧳
      </div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">
        {filter === 'upcoming' ? 'Chưa có chuyến đi nào sắp tới' :
         filter === 'completed' ? 'Chưa có chuyến đi nào hoàn thành' :
         'Chưa có lịch trình nào'}
      </h3>
      <p className="text-gray-500 mb-6 max-w-sm">
        {filter === 'upcoming'
          ? 'Hãy đặt tour hoặc khách sạn để bắt đầu hành trình của bạn!'
          : 'Lịch trình đã xác nhận của bạn sẽ hiển thị ở đây.'}
      </p>
      {filter === 'upcoming' && (
        <Link
          to="/tours"
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-blue-200 flex items-center gap-2"
        >
          <FiCompass size={16} /> Khám phá tour ngay
        </Link>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      {/* ─── Hero ─── */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">
                Xin chào, {user?.fullName || 'bạn'} 👋
              </p>
              <h1 className="text-3xl font-bold">Lịch trình của tôi</h1>
              <p className="text-blue-200 mt-1 text-sm">
                Theo dõi toàn bộ chuyến đi của bạn tại đây
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 text-center">
                <span className="text-2xl font-bold">{total}</span>
                <p className="text-blue-100 text-xs mt-0.5">Chuyến đi</p>
              </div>
              <button
                onClick={fetchItinerary}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                title="Làm mới"
              >
                <FiRefreshCw size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ─── Filter Tabs ─── */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                filter === f.key
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
              }`}
            >
              <span>{f.icon}</span>
              {f.label}
              {filter === f.key && total > 0 && (
                <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {total}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Grid ─── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <FiAlertCircle size={32} className="text-red-400" />
            </div>
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={fetchItinerary}
              className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.length === 0
              ? <EmptyState />
              : bookings.map(b => <ItineraryCard key={b._id} booking={b} />)
            }
          </div>
        )}

        {/* ─── Pagination ─── */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Trước
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-full text-sm font-semibold transition-all ${
                  page === i + 1
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Sau →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyItineraryPage;
