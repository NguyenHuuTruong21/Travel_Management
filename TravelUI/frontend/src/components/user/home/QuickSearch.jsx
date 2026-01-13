import React, { useState } from 'react';
import { FiSearch, FiMapPin, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const QuickSearch = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useState({
        location: '',
        date: '',
        priceRange: ''
    });

    const handleSearch = (e) => {
        e.preventDefault();
        // Construct query string
        const query = new URLSearchParams(searchParams).toString();
        navigate(`/tours?${query}`);
    };

    return (
        <div className="relative z-20 -mt-24 px-4 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 items-end">
                    {/* Location */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Điểm đến</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiMapPin className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Bạn muốn đi đâu?"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={searchParams.location}
                                onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Ngày khởi hành</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiCalendar className="text-gray-400" />
                            </div>
                            <input
                                type="date"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={searchParams.date}
                                onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Ngân sách</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiDollarSign className="text-gray-400" />
                            </div>
                            <select
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                                value={searchParams.priceRange}
                                onChange={(e) => setSearchParams({ ...searchParams, priceRange: e.target.value })}
                            >
                                <option value="">Tất cả mức giá</option>
                                <option value="0-5000000">Dưới 5 triệu</option>
                                <option value="5000000-10000000">5 - 10 triệu</option>
                                <option value="10000000-20000000">10 - 20 triệu</option>
                                <option value="20000000+">Trên 20 triệu</option>
                            </select>
                        </div>
                    </div>

                    {/* Search Button */}
                    <div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                            <FiSearch size={20} />
                            Tìm kiếm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuickSearch;
