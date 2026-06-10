import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiToggleLeft, FiToggleRight, FiBarChart2 } from 'react-icons/fi';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const VouchersList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // 'all' | 'active' | 'inactive'
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const navigate = useNavigate();

  useEffect(() => { fetchVouchers(); }, [filterActive]);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = { page: 1, limit: 50 };
      if (filterActive !== 'all') params.isActive = filterActive === 'active';

      const res = await axios.get(`${API}/vouchers`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      setVouchers(res.data.data || []);
      setPagination({ page: res.data.page, totalPages: res.data.totalPages, total: res.data.total });
    } catch (err) {
      alert('Lỗi khi tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (voucher) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(`${API}/vouchers/${voucher._id}`, {
        isActive: !voucher.isActive
      }, { headers: { Authorization: `Bearer ${token}` } });
      fetchVouchers();
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Xóa voucher "${code}"?`)) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.delete(`${API}/vouchers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
      fetchVouchers();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi xóa');
    }
  };

  const filtered = vouchers.filter(v =>
    v.code?.toLowerCase().includes(search.toLowerCase()) ||
    v.description?.toLowerCase().includes(search.toLowerCase())
  );

  const now = new Date();
  const getStatus = (v) => {
    if (!v.isActive) return { text: 'Vô hiệu', cls: 'bg-gray-100 text-gray-600' };
    if (v.endDate < now) return { text: 'Hết hạn', cls: 'bg-red-100 text-red-600' };
    if (v.startDate > now) return { text: 'Chưa bắt đầu', cls: 'bg-yellow-100 text-yellow-700' };
    if (v.usageLimit > 0 && v.usedCount >= v.usageLimit) return { text: 'Đã hết lượt', cls: 'bg-orange-100 text-orange-600' };
    return { text: 'Đang hoạt động', cls: 'bg-green-100 text-green-700' };
  };

  const typeLabels = { tour: '🗺️ Tour', hotel: '🏨 Khách sạn', car: '🚗 Xe' };
  const groupLabels = { ALL: 'Tất cả', NEW_USER: '🌟 Mới', VIP: '👑 VIP', NORMAL: 'Thường' };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">🎟️ Quản lý Voucher</h1>
          <p className="text-gray-500">Tổng: <strong>{pagination.total}</strong> voucher</p>
        </div>
        <button
          onClick={() => navigate('/admin/vouchers/create')}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 font-semibold shadow-lg shadow-indigo-200 transition-all"
        >
          <FiPlus /> Tạo Voucher mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo mã hoặc mô tả..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'inactive'].map(f => (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterActive === f
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Tất cả' : f === 'active' ? 'Đang hoạt động' : 'Vô hiệu'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
            <p className="text-gray-400">Đang tải...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Mã Voucher', 'Giảm giá', 'Điều kiện', 'Nhóm KH', 'Thời gian', 'Lượt dùng', 'Trạng thái', 'Thao tác'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(v => {
                  const status = getStatus(v);
                  return (
                    <tr key={v._id} className="hover:bg-gray-50 transition-colors">
                      {/* Mã */}
                      <td className="px-4 py-4">
                        <div>
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md text-sm">{v.code}</span>
                          {v.isFlashSale && <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">⚡ FLASH</span>}
                          {v.description && <p className="text-xs text-gray-400 mt-1 max-w-[160px] truncate">{v.description}</p>}
                        </div>
                      </td>
                      {/* Giảm */}
                      <td className="px-4 py-4">
                        <span className="font-bold text-gray-800">
                          {v.discountType === 'percent'
                            ? `${v.discountValue}%`
                            : `${v.discountValue.toLocaleString('vi-VN')}đ`}
                        </span>
                        {v.maxDiscount > 0 && (
                          <p className="text-xs text-gray-400">Tối đa {v.maxDiscount.toLocaleString('vi-VN')}đ</p>
                        )}
                      </td>
                      {/* Điều kiện */}
                      <td className="px-4 py-4">
                        <div className="text-xs text-gray-500 space-y-1">
                          {v.minOrderValue > 0 && (
                            <p>Đơn tối thiểu: <strong>{v.minOrderValue.toLocaleString('vi-VN')}đ</strong></p>
                          )}
                          {v.applicableTypes?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {v.applicableTypes.map(t => (
                                <span key={t} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-xs">{typeLabels[t] || t}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">Tất cả loại</span>
                          )}
                        </div>
                      </td>
                      {/* Nhóm */}
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          v.userGroup === 'VIP' ? 'bg-yellow-100 text-yellow-700' :
                          v.userGroup === 'NEW_USER' ? 'bg-green-100 text-green-700' :
                          v.userGroup === 'NORMAL' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {groupLabels[v.userGroup] || v.userGroup}
                        </span>
                      </td>
                      {/* Thời gian */}
                      <td className="px-4 py-4 text-xs text-gray-500">
                        <p>Từ: {new Date(v.startDate).toLocaleDateString('vi-VN')}</p>
                        <p>Đến: {new Date(v.endDate).toLocaleDateString('vi-VN')}</p>
                      </td>
                      {/* Lượt */}
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">{v.usedCount}</span>
                          {v.usageLimit > 0 ? (
                            <>
                              <span className="text-gray-400"> / {v.usageLimit}</span>
                              <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1">
                                <div
                                  className="h-full bg-indigo-500 rounded-full"
                                  style={{ width: `${Math.min(100, (v.usedCount / v.usageLimit) * 100)}%` }}
                                />
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400"> / ∞</span>
                          )}
                        </div>
                      </td>
                      {/* Trạng thái */}
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${status.cls}`}>
                          {status.text}
                        </span>
                      </td>
                      {/* Thao tác */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(v)}
                            className={`p-1.5 rounded-lg transition-colors ${v.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                            title={v.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          >
                            {v.isActive ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                          </button>
                          <button
                            onClick={() => navigate(`/admin/vouchers/${v._id}`)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(v._id, v.code)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && !loading && (
              <div className="p-16 text-center">
                <div className="text-6xl mb-4">🎟️</div>
                <p className="text-gray-400 font-medium">Chưa có voucher nào</p>
                <button
                  onClick={() => navigate('/admin/vouchers/create')}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                >
                  + Tạo voucher đầu tiên
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VouchersList;
