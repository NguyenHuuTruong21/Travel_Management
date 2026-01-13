import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiMapPin, FiStar, FiSearch, FiFilter, FiCalendar, FiArrowDown, FiArrowUp } from 'react-icons/fi';

const HotelsPage = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState('all');
    const [starFilter, setStarFilter] = useState('all');
    const [sortOption, setSortOption] = useState('default');
    const navigate = useNavigate();

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/hotels');
            setHotels(response.data.data || response.data || []);
        } catch (error) {
            console.error('Error fetching hotels:', error);
        } finally {
            setLoading(false);
        }
    };

    const normalizeString = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const filteredAndSortedHotels = () => {
        let filtered = hotels.filter(hotel => {
            // Search
            const matchesSearch = normalizeString(hotel.name).includes(normalizeString(searchTerm)) ||
                normalizeString(hotel.address).includes(normalizeString(searchTerm));

            // Price
            let matchesPrice = true;
            if (priceRange === 'low') matchesPrice = hotel.pricePerNight < 1000000;
            if (priceRange === 'medium') matchesPrice = hotel.pricePerNight >= 1000000 && hotel.pricePerNight <= 3000000;
            if (priceRange === 'high') matchesPrice = hotel.pricePerNight > 3000000;

            // Stars
            let matchesStars = true;
            if (starFilter !== 'all') {
                matchesStars = hotel.stars === parseInt(starFilter);
            }

            return matchesSearch && matchesPrice && matchesStars;
        });

        // Sorting
        switch (sortOption) {
            case 'price_asc':
                return filtered.sort((a, b) => a.pricePerNight - b.pricePerNight);
            case 'price_desc':
                return filtered.sort((a, b) => b.pricePerNight - a.pricePerNight);
            case 'stars_desc':
                return filtered.sort((a, b) => b.stars - a.stars);
            case 'stars_asc':
                return filtered.sort((a, b) => a.stars - b.stars);
            default:
                return filtered;
        }
    };

    const displayHotels = filteredAndSortedHotels();

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Khách Sạn & Resort</h1>
                    <p className="text-lg text-gray-600">Trải nghiệm kỳ nghỉ tuyệt vời tại những khách sạn hàng đầu</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8 sticky top-4 z-30 border border-gray-100">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm khách sạn, địa điểm..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 focus:bg-white transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap gap-4 lg:w-auto w-full">
                            {/* Price Filter */}
                            <div className="flex-1 min-w-[150px]">
                                <select
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 cursor-pointer hover:bg-white transition-colors text-gray-600"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(e.target.value)}
                                >
                                    <option value="all">Mức giá</option>
                                    <option value="low">Dưới 1 triệu</option>
                                    <option value="medium">1 - 3 triệu</option>
                                    <option value="high">Trên 3 triệu</option>
                                </select>
                            </div>

                            {/* Star Filter */}
                            <div className="flex-1 min-w-[150px]">
                                <select
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 cursor-pointer hover:bg-white transition-colors text-gray-600"
                                    value={starFilter}
                                    onChange={(e) => setStarFilter(e.target.value)}
                                >
                                    <option value="all">Hạng sao</option>
                                    <option value="5">5 Sao</option>
                                    <option value="4">4 Sao</option>
                                    <option value="3">3 Sao</option>
                                </select>
                            </div>

                            {/* Sort */}
                            <div className="flex-1 min-w-[180px]">
                                <select
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 cursor-pointer hover:bg-white transition-colors text-gray-600 font-medium"
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                >
                                    <option value="default">Sắp xếp: Mặc định</option>
                                    <option value="price_asc">Giá: Thấp đến Cao</option>
                                    <option value="price_desc">Giá: Cao đến Thấp</option>
                                    <option value="stars_desc">Sao: Cao đến Thấp</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hotel List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayHotels.length > 0 ? (
                            displayHotels.map(hotel => (
                                <div key={hotel._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col border border-gray-100">
                                    <div className="relative h-64 overflow-hidden">
                                        <img
                                            src={(hotel.images && hotel.images[0])
                                                ? (hotel.images[0].startsWith('http') ? hotel.images[0] : `http://localhost:5000${hotel.images[0].startsWith('/') ? '' : '/'}${hotel.images[0].replace(/\\/g, '/')}`)
                                                : 'https://via.placeholder.com/400x300'}
                                            alt={hotel.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm text-sm font-bold text-yellow-500 flex items-center gap-1">
                                            <span>{hotel.stars || 5}</span> <FiStar className="fill-current" />
                                        </div>
                                        {hotel.pricePerNight < 1000000 && (
                                            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                                Ưu đãi tốt
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors" title={hotel.name}>
                                                {hotel.name}
                                            </h3>
                                        </div>

                                        <div className="flex items-start gap-2 text-gray-500 text-sm mb-4">
                                            <FiMapPin className="mt-1 flex-shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                            <span className="line-clamp-2">{hotel.address}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {hotel.amenities?.slice(0, 3).map((amenity, idx) => (
                                                <span key={idx} className="text-xs px-2.5 py-1 bg-gray-50 text-gray-600 rounded-md border border-gray-100">
                                                    {amenity}
                                                </span>
                                            ))}
                                            {hotel.amenities?.length > 3 && (
                                                <span className="text-xs px-2.5 py-1 bg-gray-50 text-gray-500 rounded-md border border-gray-100">
                                                    +{hotel.amenities.length - 3}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">Giá mỗi đêm từ</p>
                                                <div className="flex items-baseline gap-1">
                                                    <p className="text-lg font-bold text-blue-600">{(hotel.pricePerNight || 0).toLocaleString()}đ</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/booking/hotel/${hotel._id}`)}
                                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium text-sm flex items-center gap-2 shadow-lg shadow-blue-200"
                                            >
                                                <FiCalendar /> Đặt phòng
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-16 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                    <FiSearch className="text-gray-400 text-2xl" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Không tìm thấy kết quả</h3>
                                <p className="text-gray-500 mt-1">Vui lòng thử điều chỉnh bộ lọc tìm kiếm của bạn.</p>
                                <button
                                    onClick={() => { setSearchTerm(''); setPriceRange('all'); setStarFilter('all'); setSortOption('default'); }}
                                    className="mt-4 text-blue-600 font-medium hover:text-blue-700"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HotelsPage;
