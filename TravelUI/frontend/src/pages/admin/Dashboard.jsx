import React, { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiMap, FiShoppingBag, FiDollarSign } from 'react-icons/fi';
import StatCard from '../../components/admin/StatCard';
import adminService from '../../services/adminService';

const Dashboard = () => {
    const [stats, setStats] = useState({
        users: { total: 0 },
        tours: { total: 0 },
        bookings: { total: 0 },
        revenue: { total: 0 }
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);

        // Fetch all data in parallel
        const [usersResult, toursResult, bookingsResult] = await Promise.all([
            adminService.getUsers({ page: 1, limit: 1 }),
            adminService.getTours({ page: 1, limit: 1 }),
            adminService.getBookings({ page: 1, limit: 10 })
        ]);

        // Calculate statistics
        const usersTotal = usersResult.total || 0;
        const toursTotal = toursResult.total || (toursResult.data?.length || 0);
        const bookingsData = Array.isArray(bookingsResult.data) ? bookingsResult.data : (Array.isArray(bookingsResult) ? bookingsResult : []);
        const bookingsTotal = bookingsData.length;

        // Calculate revenue from bookings
        const revenue = bookingsData.reduce((sum, booking) => {
            return sum + (booking.totalPrice || 0);
        }, 0);

        setStats({
            users: { total: usersTotal }, // Change calculation would require historical data
            tours: { total: toursTotal },
            bookings: { total: bookingsTotal },
            revenue: { total: revenue }
        });

        // Set recent activities from bookings
        const activities = bookingsData.slice(0, 5).map(booking => ({
            type: 'booking',
            message: `Đặt tour mới #${booking._id?.slice(-6)}`,
            time: getTimeAgo(booking.createdAt),
            color: 'green'
        }));

        setRecentActivities(activities);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const getTimeAgo = (date) => {
        if (!date) return 'Vừa xong';
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        return `${diffDays} ngày trước`;
    };

    const formatCurrency = (amount) => {
        if (amount >= 1000000000) {
            return `${(amount / 1000000000).toFixed(1)}B`;
        } else if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `${(amount / 1000).toFixed(1)}K`;
        }
        return amount.toString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
                <p className="text-gray-600">Tổng quan hệ thống quản lý du lịch</p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={FiUsers}
                    title="Tổng người dùng"
                    value={stats.users.total.toLocaleString()}
                    change={stats.users.change}
                    color="indigo"
                />
                <StatCard
                    icon={FiMap}
                    title="Tổng Tours"
                    value={stats.tours.total}
                    change={stats.tours.change}
                    color="purple"
                />
                <StatCard
                    icon={FiShoppingBag}
                    title="Đặt tour"
                    value={stats.bookings.total}
                    change={stats.bookings.change}
                    color="blue"
                />
                <StatCard
                    icon={FiDollarSign}
                    title="Doanh thu"
                    value={`${formatCurrency(stats.revenue.total)} VNĐ`}
                    change={stats.revenue.change}
                    color="green"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Thao tác nhanh</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/admin/tours"
                        className="p-4 border-2 border-indigo-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 text-center"
                    >
                        <FiMap className="mx-auto mb-2 text-indigo-600" size={32} />
                        <p className="font-semibold text-gray-800">Thêm Tour mới</p>
                    </a>
                    <a
                        href="/admin/bookings"
                        className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-center"
                    >
                        <FiShoppingBag className="mx-auto mb-2 text-purple-600" size={32} />
                        <p className="font-semibold text-gray-800">Quản lý đặt tour</p>
                    </a>
                    <a
                        href="/admin/users"
                        className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-center"
                    >
                        <FiUsers className="mx-auto mb-2 text-blue-600" size={32} />
                        <p className="font-semibold text-gray-800">Quản lý người dùng</p>
                    </a>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Hoạt động gần đây</h2>
                {recentActivities.length > 0 ? (
                    <div className="space-y-4">
                        {recentActivities.map((activity, index) => (
                            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full mr-3`}></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800">{activity.message}</p>
                                    <p className="text-xs text-gray-500">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">Chưa có hoạt động nào</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
