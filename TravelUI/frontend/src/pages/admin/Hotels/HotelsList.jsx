import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import adminService from '../../../services/adminService';

const HotelsList = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        setLoading(true);
        const result = await adminService.getHotels();
        if (result.error) {
            alert('Lỗi: ' + result.error);
        } else {
            setHotels(result.data || result || []);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa khách sạn này?')) return;
        const result = await adminService.deleteHotel(id);
        if (result.error) {
            alert('Lỗi: ' + result.error);
        } else {
            alert('Xóa thành công!');
            fetchHotels();
        }
    };

    const filteredHotels = hotels.filter(hotel =>
        hotel.name?.toLowerCase().includes(search.toLowerCase()) ||
        hotel.address?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý khách sạn</h1>
                    <p className="text-gray-600">Danh sách và quản lý tất cả khách sạn</p>
                </div>
                <button
                    onClick={() => navigate('/admin/hotels/create')}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2"
                >
                    <FiPlus /> Thêm khách sạn
                </button>
            </div>

            {/* Search */}
            <div className="mb-4">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm khách sạn theo tên hoặc địa chỉ..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên khách sạn</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Địa chỉ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đánh giá</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá/đêm</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredHotels.map((hotel) => (
                                    <tr key={hotel._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {hotel.images?.[0] && (
                                                    <img
                                                        src={hotel.images[0].startsWith('http')
                                                            ? hotel.images[0]
                                                            : `http://localhost:5000${hotel.images[0].startsWith('/') ? '' : '/'}${hotel.images[0].replace(/\\/g, '/')}`}
                                                        alt={hotel.name}
                                                        className="h-12 w-12 rounded-lg object-cover mr-3"
                                                    />
                                                )}
                                                <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{hotel.address}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">⭐ {hotel.rating}/5</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{hotel.pricePerNight?.toLocaleString()} VNĐ</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button onClick={() => navigate(`/admin/hotels/${hotel._id}`)} className="text-indigo-600 hover:text-indigo-900">
                                                    <FiEdit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(hotel._id)} className="text-red-600 hover:text-red-900">
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredHotels.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                Không tìm thấy khách sạn nào
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HotelsList;
