import React from 'react';
import { FiTruck, FiUsers, FiUser } from 'react-icons/fi';

const VehicleInfo = ({ vehicle }) => {
    // Only show if vehicle exists
    if (!vehicle) {
        return null;
    }

    const imageUrl = vehicle.image?.startsWith('http')
        ? vehicle.image
        : `http://localhost:5000${vehicle.image?.startsWith('/') ? '' : '/'}${vehicle.image?.replace(/\\/g, '/')}`;

    const getStatusBadge = (status) => {
        const statusConfig = {
            'available': { label: 'Sẵn sàng', color: 'bg-green-100 text-green-700' },
            'in-use': { label: 'Đang sử dụng', color: 'bg-blue-100 text-blue-700' },
            'maintenance': { label: 'Bảo trì', color: 'bg-yellow-100 text-yellow-700' }
        };

        const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiTruck className="text-green-600" />
                Phương tiện
            </h3>

            <div className="space-y-4">
                {/* Vehicle Image */}
                {vehicle.image && (
                    <div className="w-full h-32 rounded-lg overflow-hidden">
                        <img
                            src={imageUrl}
                            alt={vehicle.type}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400x200?text=Vehicle';
                            }}
                        />
                    </div>
                )}

                {/* Vehicle Details */}
                <div className="space-y-2">
                    {/* Type & Capacity */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <FiTruck className="text-green-500" />
                            <span className="font-medium">{vehicle.type}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <FiUsers className="text-blue-500" />
                            <span>{vehicle.capacity} chỗ</span>
                        </div>
                    </div>

                    {/* Plate Number */}
                    {vehicle.plateNumber && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">Biển số:</span>
                            <span className="px-2 py-1 bg-white border border-gray-300 rounded font-mono text-xs">
                                {vehicle.plateNumber}
                            </span>
                        </div>
                    )}

                    {/* Driver */}
                    {vehicle.driverName && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FiUser className="text-gray-400" />
                            <span>Tài xế: <span className="font-medium">{vehicle.driverName}</span></span>
                        </div>
                    )}

                    {/* Status */}
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">Trạng thái:</span>
                        {getStatusBadge(vehicle.status)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleInfo;
