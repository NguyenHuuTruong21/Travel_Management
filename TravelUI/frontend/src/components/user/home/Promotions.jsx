import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiCalendar } from 'react-icons/fi';

const Promotions = () => {
    const [promotions, setPromotions] = useState([]);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/promotions');
                setPromotions(response.data.data || []);
            } catch (error) {
                console.error('Error fetching promotions:', error);
            }
        };

        fetchPromotions();
    }, []);

    if (promotions.length === 0) return null;

    return (
        <div className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Ưu đãi hấp dẫn</h2>
                    <p className="text-gray-600">Săn deal hot, vi vu giá tốt ngay hôm nay</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {promotions.slice(0, 3).map((promo) => (
                        <div key={promo._id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-all transform hover:-translate-y-1">
                            <div className="relative h-48">
                                <img
                                    src={promo.image || 'https://via.placeholder.com/400x200'}
                                    alt={promo.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md animate-pulse">
                                    Giảm {promo.discountValue}{promo.discountType === 'percent' ? '%' : 'đ'}
                                </div>
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{promo.title}</h3>
                                <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">{promo.description}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <FiCalendar />
                                        <span>Hết hạn: {new Date(promo.endDate).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-500">Mã:</span>
                                        <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono font-bold text-blue-600 border border-blue-200 border-dashed">
                                            {promo.code}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Promotions;
