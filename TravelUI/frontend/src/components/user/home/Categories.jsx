import React from 'react';
import { Link } from 'react-router-dom';
import { FiMap, FiHome, FiTruck, FiUserCheck, FiTag, FiCompass } from 'react-icons/fi';

const categories = [
    { icon: <FiMap size={32} />, name: 'Tour Du Lịch', path: '/tours', color: 'bg-blue-100 text-blue-600' },
    { icon: <FiHome size={32} />, name: 'Khách Sạn', path: '/hotels', color: 'bg-green-100 text-green-600' },
    { icon: <FiTruck size={32} />, name: 'Phương Tiện', path: '/services', color: 'bg-orange-100 text-orange-600' },
    { icon: <FiUserCheck size={32} />, name: 'Liên Hệ', path: '/contact', color: 'bg-purple-100 text-purple-600' },
    { icon: <FiTag size={32} />, name: 'Ưu Đãi', path: '/services', color: 'bg-red-100 text-red-600' },
    { icon: <FiCompass size={32} />, name: 'Blog Du Lịch', path: '/blog', color: 'bg-teal-100 text-teal-600' },
];

const Categories = () => {
    return (
        <div className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Danh mục dịch vụ</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Chúng tôi cung cấp đa dạng các dịch vụ du lịch để đáp ứng mọi nhu cầu của bạn.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {categories.map((cat, index) => (
                        <Link
                            key={index}
                            to={cat.path}
                            className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 group"
                        >
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${cat.color} group-hover:scale-110 duration-300`}>
                                {cat.icon}
                            </div>
                            <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                {cat.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Categories;
