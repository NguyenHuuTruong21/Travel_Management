import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiUpload } from 'react-icons/fi';
import adminService from '../../../services/adminService';

const ToursList = () => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTours();
    }, []);

    const fetchTours = async () => {
        setLoading(true);
        const result = await adminService.getTours();
        if (result.error) {
            alert('Lỗi: ' + result.error);
        } else {
            setTours(result.data || []);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa tour này?')) return;

        const result = await adminService.deleteTour(id);
        if (result.error) {
            alert('Lỗi: ' + result.error);
        } else {
            alert('Xóa tour thành công!');
            fetchTours();
        }
    };

    const filteredTours = tours.filter(tour =>
        tour.name?.toLowerCase().includes(search.toLowerCase()) ||
        tour.destination?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Tours</h1>
                    <p className="text-gray-600">Danh sách và quản lý tất cả tours</p>
                </div>
                <button
                    onClick={() => navigate('/admin/tours/create')}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2"
                >
                    <FiPlus /> Thêm Tour
                </button>
            </div>

            {/* Search */}
            <div className="mb-4">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tour theo tên hoặc điểm đến..."
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tour</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTours.map((tour) => (
                                    <tr key={tour._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {tour.images?.[0] && (
                                                    <img
                                                        src={`http://localhost:5000${tour.images[0]}`}
                                                        alt={tour.name}
                                                        className="h-12 w-12 rounded-lg object-cover mr-3"
                                                    />
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{tour.name}</div>
                                                    <div className="text-sm text-gray-500">{tour.destination}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{tour.price?.toLocaleString()} VNĐ</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{tour.duration}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${tour.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {tour.status || 'active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button onClick={() => navigate(`/admin/tours/${tour._id}`)} className="text-indigo-600 hover:text-indigo-900">
                                                    <FiEdit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tour._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>


        </div>
    );
};

export default ToursList;
