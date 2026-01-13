import React, { useState, useEffect, useCallback } from 'react';
import { FiMap, FiHome, FiUser, FiTruck } from 'react-icons/fi';
import adminService from '../../../services/adminService';

const ServiceReport = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        const result = await adminService.getServiceReport();
        if (result.error) {
            console.error('Error:', result.error);
            setReportData(null);
        } else {
            setReportData(result);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Báo cáo dịch vụ</h1>
                <p className="text-gray-600">Phân bố và thống kê các dịch vụ</p>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
            ) : reportData ? (
                <>
                    {/* Service Distribution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Tours</p>
                                    <p className="text-2xl font-bold text-gray-800">{reportData.tours || 0}</p>
                                </div>
                                <div className="p-3 bg-indigo-100 rounded-full">
                                    <FiMap className="text-indigo-600" size={24} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Khách sạn</p>
                                    <p className="text-2xl font-bold text-gray-800">{reportData.hotels || 0}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <FiHome className="text-green-600" size={24} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Hướng dẫn viên</p>
                                    <p className="text-2xl font-bold text-gray-800">{reportData.guides || 0}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <FiUser className="text-purple-600" size={24} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">Phương tiện</p>
                                    <p className="text-2xl font-bold text-gray-800">{reportData.vehicles || 0}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <FiTruck className="text-blue-600" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Popular Tours */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">Tours phổ biến</h2>
                        </div>
                        {reportData.popularTours && reportData.popularTours.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tour</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượt đặt</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {reportData.popularTours.map((tour, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{tour.name || 'Unknown Tour'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{tour.bookingCount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                Chưa có dữ liệu tours
                            </div>
                        )}
                    </div>

                    {/* Service Utilization */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Tỷ lệ sử dụng dịch vụ</h2>
                        <div className="space-y-4">
                            {reportData.utilization && Object.entries(reportData.utilization).map(([service, percentage]) => (
                                <div key={service}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700 capitalize">{service}</span>
                                        <span className="text-sm font-medium text-gray-700">{percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
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

export default ServiceReport;
