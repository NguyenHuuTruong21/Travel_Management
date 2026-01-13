import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiMapPin, FiStar, FiUsers } from 'react-icons/fi';
import axios from 'axios';

const FeaturedTours = () => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                // Fetch tours from backend (adjust endpoint as needed)
                const response = await axios.get('http://localhost:5000/api/tours?limit=4');
                setTours(response.data.data || []);
            } catch (error) {
                console.error('Error fetching tours:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTours();
    }, []);

    if (loading) {
        return (
            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Tour nổi bật</h2>
                        <p className="text-gray-600">Những hành trình được yêu thích nhất mùa này</p>
                    </div>
                    <Link to="/tours" className="hidden md:inline-flex items-center text-blue-600 font-medium hover:text-blue-700">
                        Xem tất cả <FiArrowRight className="ml-2" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {tours.slice(0, 4).map((tour) => (
                        <div key={tour._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={tour.images?.[0]
                                        ? (tour.images[0].startsWith('http') ? tour.images[0] : `http://localhost:5000${tour.images[0].startsWith('/') ? '' : '/'}${tour.images[0].replace(/\\/g, '/')}`)
                                        : 'https://via.placeholder.com/400x300'}
                                    alt={tour.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-blue-600 shadow-sm">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.price)}
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                    <FiClock className="text-blue-500" />
                                    <span>{tour.duration} ngày</span>
                                    <span className="mx-2">•</span>
                                    <FiUsers className="text-blue-500" />
                                    <span>Còn {tour.remainingSeats ?? 0} chỗ</span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    <Link to={`/tours/${tour._id}`}>{tour.name}</Link>
                                </h3>

                                <div className="flex items-center gap-1 text-yellow-400 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <FiStar key={i} className={i < (tour.averageRating || 5) ? "fill-current" : "text-gray-300"} size={16} />
                                    ))}
                                    <span className="text-gray-500 text-sm ml-2">({tour.totalReviews || 0} đánh giá)</span>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <FiMapPin />
                                        <span className="truncate max-w-[120px]">{tour.startLocation}</span>
                                    </div>
                                    <Link
                                        to={`/tours/${tour._id}`}
                                        className="text-sm font-bold text-blue-600 hover:text-blue-700"
                                    >
                                        Chi tiết
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link to="/tours" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700">
                        Xem tất cả <FiArrowRight className="ml-2" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

// Helper component for arrow icon since it was missing in imports
const FiArrowRight = ({ className }) => (
    <svg
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
    >
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

export default FeaturedTours;
