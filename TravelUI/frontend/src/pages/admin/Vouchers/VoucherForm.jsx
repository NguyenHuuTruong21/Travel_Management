import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiSave, FiArrowLeft, FiInfo } from 'react-icons/fi';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const defaultForm = {
  code: '',
  description: '',
  discountType: 'percent',
  discountValue: '',
  maxDiscount: '',
  minOrderValue: '',
  startDate: '',
  endDate: '',
  applicableTypes: [],
  applicableLocations: '',
  userGroup: 'ALL',
  usageLimit: '',
  perUserLimit: 1,
  isActive: true,
  isFlashSale: false
};

const VoucherForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) fetchVoucher();
  }, [id]);

  const fetchVoucher = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`${API}/vouchers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const v = res.data;
      setForm({
        ...v,
        startDate: v.startDate ? v.startDate.slice(0, 10) : '',
        endDate: v.endDate ? v.endDate.slice(0, 10) : '',
        applicableLocations: v.applicableLocations?.join(', ') || '',
        maxDiscount: v.maxDiscount || '',
        minOrderValue: v.minOrderValue || '',
        usageLimit: v.usageLimit || ''
      });
    } catch (err) {
      alert('Không tải được thông tin voucher');
      navigate('/admin/vouchers');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleTypeToggle = (type) => {
    setForm(prev => ({
      ...prev,
      applicableTypes: prev.applicableTypes.includes(type)
        ? prev.applicableTypes.filter(t => t !== type)
        : [...prev.applicableTypes, type]
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.code) errs.code = 'Bắt buộc nhập mã';
    if (!form.discountValue || Number(form.discountValue) <= 0) errs.discountValue = 'Giá trị giảm phải > 0';
    if (form.discountType === 'percent' && Number(form.discountValue) > 100) errs.discountValue = 'Phần trăm không được > 100';
    if (!form.startDate) errs.startDate = 'Bắt buộc';
    if (!form.endDate) errs.endDate = 'Bắt buộc';
    if (form.startDate && form.endDate && form.startDate > form.endDate) errs.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const payload = {
        ...form,
        code: form.code.toUpperCase().trim(),
        discountValue: Number(form.discountValue),
        maxDiscount: Number(form.maxDiscount) || 0,
        minOrderValue: Number(form.minOrderValue) || 0,
        usageLimit: Number(form.usageLimit) || 0,
        perUserLimit: Number(form.perUserLimit) || 1,
        applicableLocations: form.applicableLocations
          ? form.applicableLocations.split(',').map(s => s.trim()).filter(Boolean)
          : []
      };

      if (isEdit) {
        await axios.put(`${API}/vouchers/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Cập nhật voucher thành công!');
      } else {
        await axios.post(`${API}/vouchers`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Tạo voucher thành công!');
      }
      navigate('/admin/vouchers');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi lưu voucher');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const FieldError = ({ field }) => errors[field] ?
    <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FiInfo size={12} />{errors[field]}</p> : null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate('/admin/vouchers')}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEdit ? '✏️ Chỉnh sửa Voucher' : '➕ Tạo Voucher mới'}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isEdit ? `Cập nhật mã: ${form.code}` : 'Điền thông tin để tạo mã giảm giá mới'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Thông tin cơ bản */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
            🎟️ Thông tin cơ bản
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Mã voucher */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Mã Voucher <span className="text-red-500">*</span>
              </label>
              <input
                name="code" value={form.code} onChange={handleChange}
                placeholder="VD: SUMMER2025"
                disabled={isEdit}
                className={`w-full px-4 py-2.5 border rounded-xl font-mono uppercase text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${
                  errors.code ? 'border-red-400 bg-red-50' : 'border-gray-200'
                } ${isEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              <FieldError field="code" />
              {!isEdit && <p className="text-xs text-gray-400 mt-1">Mã sẽ tự động đổi thành CHỮ HOA</p>}
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Mô tả</label>
              <input
                name="description" value={form.description} onChange={handleChange}
                placeholder="VD: Giảm 20% mùa hè"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Loại giảm */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Loại giảm giá <span className="text-red-500">*</span>
              </label>
              <select name="discountType" value={form.discountType} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                <option value="percent">Phần trăm (%)</option>
                <option value="amount">Số tiền cố định (VNĐ)</option>
              </select>
            </div>

            {/* Giá trị */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Giá trị giảm <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="discountValue" value={form.discountValue} onChange={handleChange}
                  type="number" min="0"
                  placeholder={form.discountType === 'percent' ? '20' : '50000'}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none pr-12 ${
                    errors.discountValue ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                  {form.discountType === 'percent' ? '%' : 'đ'}
                </span>
              </div>
              <FieldError field="discountValue" />
            </div>

            {/* Max discount (chỉ khi percent) */}
            {form.discountType === 'percent' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Giảm tối đa (VNĐ)</label>
                <input
                  name="maxDiscount" value={form.maxDiscount} onChange={handleChange}
                  type="number" min="0" placeholder="0 = không giới hạn"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            )}

            {/* Min order */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Đơn hàng tối thiểu (VNĐ)</label>
              <input
                name="minOrderValue" value={form.minOrderValue} onChange={handleChange}
                type="number" min="0" placeholder="0 = không yêu cầu"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Thời gian */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">📅 Thời gian hiệu lực</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date" name="startDate" value={form.startDate} onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${errors.startDate ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              />
              <FieldError field="startDate" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="date" name="endDate" value={form.endDate} onChange={handleChange}
                min={form.startDate}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${errors.endDate ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              />
              <FieldError field="endDate" />
            </div>
          </div>

          {/* Flash Sale toggle */}
          <div className="mt-4 flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
            <input
              type="checkbox" id="isFlashSale" name="isFlashSale"
              checked={form.isFlashSale} onChange={handleChange}
              className="w-4 h-4 accent-red-600"
            />
            <label htmlFor="isFlashSale" className="text-sm font-medium text-red-700 cursor-pointer">
              ⚡ Flash Sale (hiển thị badge đặc biệt)
            </label>
          </div>
        </div>

        {/* Card 3: Rules */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">⚙️ Quy tắc áp dụng (Rules)</h2>
          <div className="space-y-5">
            {/* Loại dịch vụ */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Loại dịch vụ <span className="text-gray-400 font-normal">(trống = tất cả)</span>
              </label>
              <div className="flex gap-3">
                {[
                  { key: 'tour', label: '🗺️ Tour' },
                  { key: 'hotel', label: '🏨 Khách sạn' },
                  { key: 'car', label: '🚗 Thuê xe' }
                ].map(({ key, label }) => (
                  <button
                    type="button" key={key}
                    onClick={() => handleTypeToggle(key)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      form.applicableTypes.includes(key)
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nhóm khách hàng */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Nhóm khách hàng</label>
              <select name="userGroup" value={form.userGroup} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                <option value="ALL">🌐 Tất cả khách hàng</option>
                <option value="NEW_USER">🌟 Khách hàng mới (chưa đặt lần nào)</option>
                <option value="NORMAL">👤 Khách hàng thường</option>
                <option value="VIP">👑 Khách hàng VIP (≥5 booking hoặc ≥10tr)</option>
              </select>
            </div>

            {/* Địa điểm */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Địa điểm áp dụng <span className="text-gray-400 font-normal">(cách nhau bởi dấu phẩy, trống = tất cả)</span>
              </label>
              <input
                name="applicableLocations" value={form.applicableLocations} onChange={handleChange}
                placeholder="VD: Hà Nội, Đà Nẵng, Phú Quốc"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Giới hạn */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">🔢 Giới hạn sử dụng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Tổng số lượt dùng</label>
              <input
                name="usageLimit" value={form.usageLimit} onChange={handleChange}
                type="number" min="0" placeholder="0 = không giới hạn"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">0 = không giới hạn tổng số lượt</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Mỗi user tối đa</label>
              <input
                name="perUserLimit" value={form.perUserLimit} onChange={handleChange}
                type="number" min="1" max="100"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Số lần mỗi tài khoản được dùng mã này</p>
            </div>
          </div>

          {/* Active toggle */}
          <div className="mt-4 flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
            <input
              type="checkbox" id="isActive" name="isActive"
              checked={form.isActive} onChange={handleChange}
              className="w-4 h-4 accent-green-600"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-green-700 cursor-pointer">
              ✅ Kích hoạt voucher (cho phép sử dụng ngay)
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pb-8">
          <button
            type="button" onClick={() => navigate('/admin/vouchers')}
            className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium transition-all"
          >
            Hủy
          </button>
          <button
            type="submit" disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading
              ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang lưu...</>
              : <><FiSave /> {isEdit ? 'Cập nhật Voucher' : 'Tạo Voucher'}</>
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default VoucherForm;
