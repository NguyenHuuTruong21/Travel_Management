import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiCheckCircle, FiSearch, FiDollarSign, FiCompass, FiStar, FiMapPin } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

const AIRecommendationModal = ({ isOpen, onClose }) => {
    const [budget, setBudget] = useState(3000000);
    const [interests, setInterests] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [aiExplanation, setAiExplanation] = useState('');

    // Typing effect state
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setResults(null);
            setAiExplanation('');
            setDisplayedText('');
            setInterests('');
            setBudget(3000000);
        }
    }, [isOpen]);

    useEffect(() => {
        if (aiExplanation) {
            setIsTyping(true);
            let idx = 0;
            const timer = setInterval(() => {
                if (idx <= aiExplanation.length) {
                    setDisplayedText(aiExplanation.substring(0, idx));
                    idx++;
                } else {
                    clearInterval(timer);
                    setIsTyping(false);
                }
            }, 15); // Tốc độ gõ chữ 15ms/kí tự
            return () => clearInterval(timer);
        }
    }, [aiExplanation]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResults(null);
        setAiExplanation('');
        setDisplayedText('');

        try {
            const token = localStorage.getItem('accessToken');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.get(`${API_URL}/api/recommendations/tours`, {
                params: {
                    budget,
                    interests
                },
                headers
            });

            if (response.data.success) {
                setResults(response.data.data);
                setAiExplanation(response.data.aiExplanation);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 animate-fade-in-up">
                {/* Header */}
                <div className="sticky top-0 bg-white/90 backdrop-blur px-8 py-5 border-b border-gray-100 flex items-center justify-between z-20">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 outline outline-[3px] outline-indigo-100 rounded-full text-white shadow-lg shadow-indigo-200">
                            <FiCompass size={26} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Trợ Lý Du Lịch AI</h2>
                            <p className="text-gray-500 text-sm">Gợi ý lộ trình cá nhân hóa từ lịch sử và mong muốn của bạn</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <FiX size={26} />
                    </button>
                </div>

                <div className="p-8">
                    {/* Form Component */}
                    {!results && !loading && (
                        <div className="max-w-2xl mx-auto py-12 text-center animate-fade-in">
                            <h3 className="text-3xl font-extrabold text-gray-800 mb-6">Bạn muốn đi đâu tiếp theo?</h3>
                            <p className="text-gray-600 mb-10 text-lg">Tôi sẽ đối chiếu hàng trăm tour, phân tích điểm đến yêu thích của bạn để tìm ra sự phù hợp hoàn hảo nhất.</p>

                            <form onSubmit={handleSearch} className="space-y-6 text-left">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ngân sách bạn sẵn sàng (VNĐ)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="500000"
                                            max="20000000"
                                            step="500000"
                                            value={budget}
                                            onChange={(e) => setBudget(Number(e.target.value))}
                                            className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                        <div className="bg-indigo-50 text-indigo-700 px-4 py-2 font-bold rounded-xl whitespace-nowrap min-w-[140px] text-center border border-indigo-100 shadow-sm">
                                            {formatCurrency(budget)}
                                        </div>
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sở thích đặc biệt hoặc từ khóa (Tùy chọn)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <FiSearch className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={interests}
                                            onChange={(e) => setInterests(e.target.value)}
                                            placeholder="Ví dụ: biển Nha Trang, khám phá văn hóa, mạo hiểm..."
                                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-gray-700"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-lg mt-8">
                                    <FiCompass size={22} className="animate-pulse" />
                                    Phân tích & Tìm khuyến nghị
                                </button>
                            </form>
                        </div>
                    )}

                    {loading && (
                        <div className="py-24 flex flex-col items-center justify-center space-y-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-400 rounded-full blur-xl opacity-40 animate-pulse"></div>
                                <div className="relative p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl m-2 animate-bounce">
                                    <FiCompass size={40} className="text-white" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">AI đang quét dữ liệu...</h3>
                            <p className="text-gray-500 animate-pulse">Đối chiếu ngân sách, vị trí và lịch sử của bạn</p>
                        </div>
                    )}

                    {results && !loading && (
                        <div className="animate-fade-in-up space-y-8">
                            {/* Khung chat giải thích của AI */}
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 flex gap-5">
                                <div className="shrink-0 flex items-start justify-center pt-1">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100">
                                        <FiCompass size={24} className="text-indigo-600" />
                                    </div>
                                </div>
                                <div className="pt-1">
                                    <div className="text-lg text-gray-800 leading-relaxed font-medium">
                                        {displayedText}
                                        {isTyping && <span className="inline-block w-2.5 h-5 bg-indigo-500 ml-1 translate-y-1 animate-pulse"></span>}
                                    </div>
                                </div>
                            </div>

                            {/* Danh sách Tour gợi ý */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <FiCheckCircle className="text-green-500" />
                                    Top 5 Tour Tốt Nhất Dành Cho Bạn
                                </h3>

                                {results.length === 0 ? (
                                    <div className="text-center p-12 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                                        <p className="text-gray-500 mb-4">Thật tiếc, tôi không tìm được tour nào hoàn toàn khớp với ngân sách và sở thích này.</p>
                                        <button onClick={() => setResults(null)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">Thay đổi bộ lọc</button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {results.map((tour, idx) => (
                                            <Link to={`/tours/${tour._id}`} key={tour._id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all flex flex-col items-start relative">
                                                <div className="absolute top-3 left-3 z-10">
                                                    <span className="px-3 py-1 bg-white/90 backdrop-blur text-indigo-700 text-xs font-bold rounded-lg shadow-sm border border-white">
                                                        Top {idx + 1} Theo AI
                                                    </span>
                                                </div>
                                                <div className="h-48 w-full bg-gray-100 overflow-hidden relative">
                                                    <img
                                                        src={tour.images && tour.images.length > 0 ? tour.images[0] : 'https://placehold.co/600x400/E2E8F0/1E293B?text=Ảnh+Tour'}
                                                        alt={tour.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        crossOrigin='anonymous'
                                                    />
                                                </div>
                                                <div className="p-5 flex-1 flex flex-col">
                                                    <div className="flex items-center gap-1 text-yellow-500 mb-2">
                                                        <FiStar className="fill-current" />
                                                        <span className="text-sm font-bold">{tour.averageRating || '4.5'}</span>
                                                    </div>
                                                    <h4 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">{tour.name}</h4>
                                                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                                                        <FiMapPin size={14} />
                                                        <span className="truncate">{tour.startLocation || 'Khởi hành: HCM'}</span>
                                                    </div>

                                                    <div className="mt-auto flex items-end justify-between">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-gray-400 font-medium line-through">{formatCurrency(tour.price * 1.1)}</span>
                                                            <span className="font-bold text-lg text-indigo-600">{formatCurrency(tour.price)}</span>
                                                        </div>
                                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {results.length > 0 && (
                                    <div className="mt-8 text-center">
                                        <button
                                            onClick={() => setResults(null)}
                                            className="px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            Tìm kiếm lại
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIRecommendationModal;
