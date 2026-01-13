import React, { useState, useEffect, useCallback } from 'react';
import { FiDollarSign, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import adminService from '../../../services/adminService';

const RevenueReport = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const fetchReport = useCallback(async () => {
        setLoading(true);
        const params = { from: dateRange.startDate, to: dateRange.endDate };
        const result = await adminService.getRevenueReport(params);
        if (result.error) {
            console.error('Error:', result.error);
            setReportData(null);
        } else {
            setReportData(result);
        }
        setLoading(false);
    }, [dateRange]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Báo cáo doanh thu</h1>
                <p className="text-gray-600">Thống kê và phân tích doanh thu</p>
            </div>

            {/* Date Range Filter */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={fetchReport}
                            className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700"
                        >
                            Xem báo cáo
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
            ) : reportData ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Tổng doanh thu</p>
                                    <p className="text-2xl font-bold text-gray-800">{formatCurrency(reportData.totalRevenue)}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <FiDollarSign className="text-green-600" size={24} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Số đơn</p>
                                    <p className="text-2xl font-bold text-gray-800">{reportData.totalBookings || 0}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <FiCalendar className="text-blue-600" size={24} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Trung bình/đơn</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {formatCurrency(reportData.totalBookings ? reportData.totalRevenue / reportData.totalBookings : 0)}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <FiTrendingUp className="text-purple-600" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Chart */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Biểu đồ doanh thu theo thời gian</h2>
                        </div>
                        <div className="h-80 w-full">
                            {reportData.revenueOverTime && reportData.revenueOverTime.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={reportData.revenueOverTime}
                                        margin={{
                                            top: 20, right: 30, left: 20, bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(str) => {
                                                const date = new Date(str);
                                                return `${date.getDate()}/${date.getMonth() + 1}`;
                                            }}
                                        />
                                        <YAxis
                                            tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(value)}
                                        />
                                        <Tooltip
                                            formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                                            labelFormatter={(label) => `Ngày ${new Date(label).toLocaleDateString('vi-VN')}`}
                                        />
                                        <Legend />
                                        <Bar name="Doanh thu" dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    Chưa có dữ liệu biểu đồ
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details Table */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">Chi tiết theo tour</h2>
                        </div>
                        {reportData.byTour && reportData.byTour.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tour</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số đơn</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doanh thu</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {reportData.byTour.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-900">{item.tourName || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{item.count}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-green-600">{formatCurrency(item.revenue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                Không có dữ liệu trong khoảng thời gian này
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <p className="text-gray-500">Không thể tải báo cáo</p>
                </div>
            )}
        </div>
    );
};

export default RevenueReport;
