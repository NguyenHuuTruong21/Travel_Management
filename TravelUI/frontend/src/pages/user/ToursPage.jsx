import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiSearch, FiMapPin, FiClock, FiUsers, FiFilter, FiStar } from 'react-icons/fi';

const ToursPage = () => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        startLocation: '',
        destination: '',
        minPrice: '',
        maxPrice: '',
        duration: '',
        page: 1
    });
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setFilters(prev => ({
            ...prev,
            search: params.get('q') || '',
            startLocation: params.get('startLocation') || '',
            destination: params.get('location') || '', // Map 'location' URL param to 'destination' filter
            minPrice: params.get('minPrice') || '',
            maxPrice: params.get('maxPrice') || '',
            duration: params.get('duration') || '',
            page: Number(params.get('page')) || 1
        }));
    }, []);

    useEffect(() => {
        fetchTours();
    }, [filters]);

    const fetchTours = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.search) queryParams.append('q', filters.search);
            if (filters.startLocation) queryParams.append('startLocation', filters.startLocation);
            if (filters.destination) queryParams.append('location', filters.destination);
            if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
            if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
            if (filters.duration) queryParams.append('duration', filters.duration);
            queryParams.append('page', filters.page);
            queryParams.append('limit', 12);

            const response = await axios.get(`http://localhost:5000/api/tours?${queryParams.toString()}`);
            setTours(response.data.data);
            setPagination({
                page: response.data.page,
                totalPages: response.data.totalPages,
                total: response.data.total
            });
        } catch (error) {
            console.error('Error fetching tours:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    };

    const handlePriceChange = (e) => {
        const value = e.target.value;
        if (value === 'under5') {
            setFilters(prev => ({ ...prev, minPrice: 0, maxPrice: 5000000, page: 1 }));
        } else if (value === '5to10') {
            setFilters(prev => ({ ...prev, minPrice: 5000000, maxPrice: 10000000, page: 1 }));
        } else if (value === '10to20') {
            setFilters(prev => ({ ...prev, minPrice: 10000000, maxPrice: 20000000, page: 1 }));
        } else if (value === 'over20') {
            setFilters(prev => ({ ...prev, minPrice: 20000000, maxPrice: '', page: 1 }));
        } else {
            setFilters(prev => ({ ...prev, minPrice: '', maxPrice: '', page: 1 }));
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Khám phá các Tour du lịch</h1>
                    <p className="text-gray-600 mt-2">Hơn {pagination.total} tour du lịch đang chờ bạn khám phá</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:w-1/4">
                        <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
                            <div className="flex items-center gap-2 mb-6 text-xl font-bold text-gray-900 border-b pb-4">
                                <FiFilter className="text-blue-600" />
                                Bộ lọc tìm kiếm
                            </div>

                            {/* Search */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        name="search"
                                        placeholder="Tên tour..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={filters.search}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>

                            {/* Destination */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Điểm đến</label>
                                <div className="relative">
                                    <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        name="destination"
                                        placeholder="Nhập điểm đến..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={filters.destination}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>

                            {/* Start Location */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Điểm khởi hành</label>
                                <select
                                    name="startLocation"
                                    value={filters.startLocation}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    onChange={handleFilterChange}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                                    <option value="Hà Nội">Hà Nội</option>
                                    <option value="Đà Nẵng">Đà Nẵng</option>
                                </select>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mức giá</label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" name="price" value="all" defaultChecked onChange={handlePriceChange} className="text-blue-600 focus:ring-blue-500" />
                                        <span className="text-gray-600">Tất cả</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" name="price" value="under5" onChange={handlePriceChange} className="text-blue-600 focus:ring-blue-500" />
                                        <span className="text-gray-600">Dưới 5 triệu</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" name="price" value="5to10" onChange={handlePriceChange} className="text-blue-600 focus:ring-blue-500" />
                                        <span className="text-gray-600">5 - 10 triệu</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" name="price" value="10to20" onChange={handlePriceChange} className="text-blue-600 focus:ring-blue-500" />
                                        <span className="text-gray-600">10 - 20 triệu</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" name="price" value="over20" onChange={handlePriceChange} className="text-blue-600 focus:ring-blue-500" />
                                        <span className="text-gray-600">Trên 20 triệu</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tours Grid */}
                    <div className="lg:w-3/4">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : tours.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                                <FiSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">Không tìm thấy tour nào</h3>
                                <p className="text-gray-500 mt-2">Vui lòng thử lại với bộ lọc khác</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {tours.map((tour) => (
                                        <Link key={tour._id} to={`/tours/${tour._id}`} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all group">
                                            <div className="relative h-48 w-full overflow-hidden">
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
                                                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                                    <div className="flex items-center gap-1">
                                                        <FiClock className="text-blue-500" />
                                                        <span>{tour.duration} ngày</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <FiUsers className="text-blue-500" />
                                                        <span>Còn {tour.remainingSeats ?? 0} chỗ</span>
                                                    </div>
                                                </div>

                                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                    {tour.name}
                                                </h3>

                                                <div className="flex items-center gap-1 text-yellow-400 mb-4">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FiStar key={i} className={i < (tour.rating || 5) ? "fill-current" : "text-gray-300"} size={16} />
                                                    ))}
                                                    <span className="text-gray-500 text-sm ml-2">({tour.reviewsCount || 0})</span>
                                                </div>

                                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <FiMapPin />
                                                        <span className="truncate max-w-[120px]">{tour.startLocation}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-blue-600 hover:text-blue-700">Chi tiết &rarr;</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="mt-10 flex justify-center gap-2">
                                        {[...Array(pagination.totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setFilters(prev => ({ ...prev, page: i + 1 }))}
                                                className={`w-10 h-10 rounded-lg font-medium transition-colors ${pagination.page === i + 1
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToursPage;
