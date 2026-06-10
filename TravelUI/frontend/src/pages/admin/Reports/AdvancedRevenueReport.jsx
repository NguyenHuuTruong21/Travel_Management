import React, { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiMap, FiShoppingBag, FiDollarSign } from 'react-icons/fi';
import StatCard from '../../../components/admin/StatCard';
import adminService from '../../../services/adminService';
import statsService from '../../../services/statsService';

// Import các biểu đồ
import RevenueChart from '../../../components/admin/charts/RevenueChart';
import RevenueByTypeChart from '../../../components/admin/charts/RevenueByTypeChart';
import RevenueByLocationChart from '../../../components/admin/charts/RevenueByLocationChart';
import UserGrowthChart from '../../../components/admin/charts/UserGrowthChart';
import UserBehaviorChart from '../../../components/admin/charts/UserBehaviorChart';
import TopToursList from '../../../components/admin/charts/TopToursList';
import MoMComparisonCard from '../../../components/admin/charts/MoMComparisonCard';

const AdvancedRevenueReport = () => {
    const [stats, setStats] = useState({
        users: { total: 0 },
        tours: { total: 0 },
        bookings: { total: 0 },
        revenue: { total: 0 }
    });
    const [loading, setLoading] = useState(true);

    const fetchBasicData = useCallback(async () => {
        setLoading(true);

        try {
            // Fetch basic overview counts
            const [usersResult, toursResult, bookingsResult, momResult] = await Promise.all([
                adminService.getUsers({ page: 1, limit: 1 }),
                adminService.getTours({ page: 1, limit: 1 }),
                adminService.getBookings({ page: 1, limit: 1 }),
                statsService.getMoMComparison()
            ]);

            const usersTotal = usersResult.total || 0;
            const toursTotal = toursResult.total || (toursResult.data?.length || 0);
            const bookingsTotal = bookingsResult.total || (bookingsResult.data?.length || 0);

            // Tính tổng doanh thu thông qua API MoM đã trả về
            const revenueTotal = momResult?.data?.thisMonth?.revenue || 0;

            setStats({
                users: { total: usersTotal },
                tours: { total: toursTotal },
                bookings: { total: bookingsTotal, change: momResult?.data?.bookingsChange },
                revenue: { total: revenueTotal, change: momResult?.data?.revenueChange }
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBasicData();
    }, [fetchBasicData]);

    const formatCurrency = (amount) => {
        if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B`;
        if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
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
        <div className="pb-10">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Báo cáo & Thống kê Nâng cao</h1>
                    <p className="text-gray-600">Phân tích chuyên sâu hiệu suất kinh doanh và hành vi người dùng</p>
                </div>
            </div>

            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={FiDollarSign}
                    title="Doanh thu tháng này"
                    value={`${formatCurrency(stats.revenue.total)} VNĐ`}
                    change={stats.revenue.change}
                    color="indigo"
                />
                <StatCard
                    icon={FiShoppingBag}
                    title="Booking tháng này"
                    value={stats.bookings.total.toLocaleString()}
                    change={stats.bookings.change}
                    color="amber"
                />
                <StatCard
                    icon={FiUsers}
                    title="Tổng người dùng"
                    value={stats.users.total.toLocaleString()}
                    change={null}
                    color="emerald"
                />
                <StatCard
                    icon={FiMap}
                    title="Tổng Tours đang có"
                    value={stats.tours.total.toLocaleString()}
                    change={null}
                    color="purple"
                />
            </div>

            {/* Chart Grid - Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <RevenueChart />
                </div>
                <div className="lg:col-span-1">
                    <MoMComparisonCard />
                </div>
            </div>

            {/* Chart Grid - Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-1">
                    <RevenueByTypeChart />
                </div>
                <div className="lg:col-span-2">
                    <RevenueByLocationChart />
                </div>
            </div>

            {/* Chart Grid - Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <TopToursList />
                </div>
                <div className="lg:col-span-1">
                    <UserGrowthChart />
                </div>
                <div className="lg:col-span-1">
                    <UserBehaviorChart />
                </div>
            </div>
        </div>
    );
};

export default AdvancedRevenueReport;
