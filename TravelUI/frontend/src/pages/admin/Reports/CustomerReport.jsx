import React, { useState, useEffect } from 'react';
import { FiUsers, FiMapPin, FiMail } from 'react-icons/fi';
import adminService from '../../../services/adminService';

const CustomerReport = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        const result = await adminService.getCustomerReport();
        if (result.error) {
            console.error('Error:', result.error);
            setReportData(null);
        } else {
            setReportData(result);
        }
        setLoading(false);
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Báo cáo khách hàng</h1>
                <p className="text-gray-600">Thống kê và phân tích khách hàng</p>
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
                                    <p className="text-gray-500 text-sm mb-1">Tổng khách hàng</p>
                                    <p className="text-2xl font-bold text-gray-800">{reportData.totalCustomers || 0}</p>
                                </div>
                                <div className="p-3 bg-indigo-100 rounded-full">
                                    <FiUsers className="text-indigo-600" size={24} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Khách hàng mới (tháng này)</p>
                                    <p className="text-2xl font-bold text-gray-800">{reportData.newCustomersThisMonth || 0}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <FiMail className="text-green-600" size={24} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Khách hàng hoạt động</p>
                                    <p className="text-2xl font-bold text-gray-800">{reportData.activeCustomers || 0}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <FiMapPin className="text-purple-600" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Customers */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">Khách hàng hàng đầu</h2>
                        </div>
                        {reportData.topCustomers && reportData.topCustomers.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số đơn</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng chi tiêu</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {reportData.topCustomers.map((customer, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.name || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{customer.bookingCount}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-green-600">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer.totalSpent || 0)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                Chưa có dữ liệu khách hàng
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

export default CustomerReport;
