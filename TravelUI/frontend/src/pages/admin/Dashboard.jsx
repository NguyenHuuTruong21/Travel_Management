import React, { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiMap, FiShoppingBag, FiDollarSign, FiPlus, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import StatCard from '../../components/admin/StatCard';
import statsService from '../../services/statsService';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSummary = useCallback(async () => {
        setLoading(true);
        try {
            const result = await statsService.getSummary();
            if (result.success) {
                setSummary(result.data);
            }
        } catch (error) {
            console.error('Error fetching summary:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="pb-10">
            {/* Chào mừng */}
            <div className="mb-8 p-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg text-white">
                <h1 className="text-3xl font-bold mb-2">Chào mừng trở lại, Admin! 👋</h1>
                <p className="text-indigo-100 opacity-90">Hệ thống đang hoạt động ổn định. Đây là tóm tắt tình hình kinh doanh của bạn hôm nay.</p>
            </div>

            {/* Thống kê Realtime Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    icon={FiDollarSign}
                    title="Tổng doanh thu (Realtime)"
                    value={formatCurrency(summary?.totalRevenue)}
                    color="indigo"
                />
                <StatCard
                    icon={FiShoppingBag}
                    title="Tổng số đơn hàng"
                    value={summary?.totalBookings?.toLocaleString()}
                    color="amber"
                />
                <StatCard
                    icon={FiUsers}
                    title="Tổng người dùng"
                    value={summary?.totalUsers?.toLocaleString()}
                    color="emerald"
                />
                <StatCard
                    icon={FiMap}
                    title="Tổng Tours hiện có"
                    value={summary?.totalTours?.toLocaleString()}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Lối tắt nhanh */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Lối tắt nhanh</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/admin/tours/create" className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group">
                            <div className="p-2 bg-blue-600 text-white rounded-lg mr-3">
                                <FiPlus size={20} />
                            </div>
                            <span className="font-semibold text-blue-700 text-sm">Thêm Tour mới</span>
                        </Link>
                        <Link to="/admin/bookings" className="flex items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group">
                            <div className="p-2 bg-purple-600 text-white rounded-lg mr-3">
                                <FiShoppingBag size={20} />
                            </div>
                            <span className="font-semibold text-purple-700 text-sm">Quản lý đơn hàng</span>
                        </Link>
                    </div>
                </div>

                {/* Phân tích nâng cao Banner */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Báo cáo & Phân tích chuyên sâu</h3>
                        <p className="text-sm text-gray-500 mb-4">Xem biểu đồ doanh thu theo thời gian, địa điểm, và hành vi khách hàng để đưa ra quyết định kinh doanh đúng đắn.</p>
                    </div>
                    <Link 
                        to="/admin/reports/revenue" 
                        className="flex items-center justify-center gap-2 py-3 bg-gray-50 hover:bg-gray-100 text-indigo-600 font-bold rounded-xl transition-all"
                    >
                        Xem báo cáo nâng cao <FiArrowRight />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
