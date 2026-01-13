import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import adminService from '../../../services/adminService';

const BookingsList = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        const result = await adminService.getBookings();
        if (result.error) {
            alert('Lỗi: ' + result.error);
        } else {
            setBookings(result.data || result || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleStatusChange = async (id, status) => {
        const result = await adminService.updateBookingStatus(id, status);
        if (result.error) {
            alert('Lỗi: ' + result.error);
        } else {
            alert('Cập nhật trạng thái thành công!');
            fetchBookings();
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking._id?.toLowerCase().includes(search.toLowerCase()) ||
            booking.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            booking.tour?.name?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed':
                return 'bg-green-100 text-green-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Completed':
                return 'bg-blue-100 text-blue-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Confirmed':
                return 'Đã xác nhận';
            case 'Pending':
                return 'Chờ xử lý';
            case 'Completed':
                return 'Hoàn thành';
            case 'Cancelled':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý đặt tour</h1>
                <p className="text-gray-600">Danh sách và quản lý tất cả đặt tour</p>
            </div>

            {/* Search and Filter */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo ID, tên khách hàng, tour..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="relative">
                    <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="Pending">Chờ xử lý</option>
                        <option value="Confirmed">Đã xác nhận</option>
                        <option value="Completed">Hoàn thành</option>
                        <option value="Cancelled">Đã hủy</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đặt tour</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dịch vụ (Tour/Hotel)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số người</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">#{booking._id?.slice(-6)}</div>
                                            <div className="text-xs text-gray-500">
                                                {booking.createdAt && new Date(booking.createdAt).toLocaleDateString('vi-VN')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{booking.tour?.name || booking.hotel?.name || 'N/A'}</div>
                                            <div className="text-sm text-gray-500">{booking.tour?.destination}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{booking.user?.fullName || 'N/A'}</div>
                                            <div className="text-sm text-gray-500">{booking.user?.email || ''}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{booking.quantity || 1} người</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {booking.totalPrice?.toLocaleString()} VNĐ
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                {getStatusText(booking.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={booking.status}
                                                onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                                                className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="Pending">Chờ xử lý</option>
                                                <option value="Confirmed">Xác nhận</option>
                                                <option value="Completed">Hoàn thành</option>
                                                <option value="Cancelled">Hủy</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredBookings.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                Không tìm thấy đặt tour nào
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
};

export default BookingsList;
