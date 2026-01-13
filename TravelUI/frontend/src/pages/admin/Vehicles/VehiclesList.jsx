import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import adminService from '../../../services/adminService';

const VehiclesList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        setLoading(true);
        const result = await adminService.getVehicles();
        if (result.error) {
            alert('Lỗi: ' + result.error);
        } else {
            setVehicles(result.data || result || []);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa phương tiện này?')) return;
        const result = await adminService.deleteVehicle(id);
        if (result.error) {
            alert('Lỗi: ' + result.error);
        } else {
            alert('Xóa thành công!');
            fetchVehicles();
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeText = (type) => {
        const types = {
            bus: 'Xe buýt',
            minivan: 'Xe minivan',
            electric: 'Xe điện',
            boat: 'Thuyền',
            train: 'Tàu hỏa',
            car: 'Ô tô'
        };
        return types[type] || type;
    };

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý phương tiện</h1>
                    <p className="text-gray-600">Danh sách và quản lý tất cả phương tiện</p>
                </div>
                <button
                    onClick={() => navigate('/admin/vehicles/create')}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2"
                >
                    <FiPlus /> Thêm phương tiện
                </button>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại xe</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Biển số</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sức chứa</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tài xế</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {vehicles.map((vehicle) => (
                                    <tr key={vehicle._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {vehicle.image && (
                                                    <img src={`http://localhost:5000${vehicle.image}`} alt={vehicle.type} className="h-10 w-10 rounded object-cover mr-3" />
                                                )}
                                                <div className="text-sm font-medium text-gray-900">{getTypeText(vehicle.type)}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900">{vehicle.plateNumber}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{vehicle.capacity} người</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{vehicle.driverName || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                                                {vehicle.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button onClick={() => navigate(`/admin/vehicles/${vehicle._id}`)} className="text-indigo-600 hover:text-indigo-900">
                                                    <FiEdit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(vehicle._id)} className="text-red-600 hover:text-red-900">
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

export default VehiclesList;
