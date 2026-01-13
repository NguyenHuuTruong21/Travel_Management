import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin } from 'react-icons/fi';

const departures = [
    {
        id: 1,
        name: 'Hồ Chí Minh',
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',
        desc: 'Trung tâm sôi động'
    },
    {
        id: 2,
        name: 'Hà Nội',
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
        desc: 'Thủ đô ngàn năm'
    },
    {
        id: 3,
        name: 'Đà Nẵng',
        image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
        desc: 'Thành phố đáng sống'
    },
    {
        id: 4,
        name: 'Cần Thơ',
        image: 'https://ezcloud.vn/wp-content/uploads/2023/07/dia-diem-check-in-can-tho.webp',
        desc: 'Miền Tây sông nước'
    }
];

const DepartureLocations = () => {
    return (
        <div className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Điểm khởi hành phổ biến</h2>
                    <p className="text-gray-600">Chọn điểm xuất phát thuận tiện nhất cho hành trình của bạn</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {departures.map((item) => (
                        <Link
                            key={item.id}
                            to={`/tours`}
                            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                        >
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-4 left-4 text-white">
                                    <div className="flex items-center gap-1 mb-1">
                                        <FiMapPin size={16} />
                                        <h3 className="font-bold text-lg">{item.name}</h3>
                                    </div>
                                    <p className="text-xs text-gray-200">{item.desc}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DepartureLocations;
