import React, { useState, useEffect } from 'react';
import statsService from '../../../services/statsService';
import { FiStar, FiUsers, FiTrendingUp } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TopToursList = () => {
    const [tours, setTours] = useState([]);

    useEffect(() => {
        const fetchTopTours = async () => {
            const res = await statsService.getTopTours();
            if (res.success && res.data) {
                setTours(res.data);
            }
        };
        fetchTopTours();
    }, []);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <FiTrendingUp className="text-indigo-600" /> Top 5 Tour Bán Chạy
                </h3>
            </div>
            
            <div className="space-y-4">
                {tours.length > 0 ? tours.map((tour, idx) => (
                    <div key={tour._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                        <div className="w-8 flex-shrink-0 text-center font-black text-xl text-gray-300">
                            #{idx + 1}
                        </div>
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                            {tour.image ? (
                                <img 
                                    src={tour.image.startsWith('http') ? tour.image : `${API_URL}${tour.image}`} 
                                    alt={tour.name} 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-300">T</div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate">{tour.name}</h4>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium">
                                <span className="flex items-center gap-1 text-emerald-600">
                                    <FiUsers size={12} /> {tour.totalPassengers} khách
                                </span>
                                <span>{tour.totalBookings} đơn</span>
                            </div>
                        </div>
                        <div className="text-right flex-shrink-0 font-black text-indigo-600 text-sm">
                            {(tour.totalRevenue > 1000000) ? `${(tour.totalRevenue / 1000000).toFixed(1)}M` : tour.totalRevenue.toLocaleString() + 'đ'}
                        </div>
                    </div>
                )) : (
                    <div className="text-center text-gray-400 py-10 text-sm">Chưa có dữ liệu Tour</div>
                )}
            </div>
        </div>
    );
};

export default TopToursList;
