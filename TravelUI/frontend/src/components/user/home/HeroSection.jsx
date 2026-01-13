import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';

const HeroSection = () => {
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/banners');
            const activeBanners = (response.data.data || []).filter(b => b.isActive);
            setBanners(activeBanners.length > 0 ? activeBanners : [getDefaultBanner()]);
        } catch (error) {
            console.error('Error fetching banners:', error);
            setBanners([getDefaultBanner()]);
        } finally {
            setLoading(false);
        }
    };

    const getDefaultBanner = () => ({
        _id: 'default',
        title: 'Khám phá thế giới cùng TravelManagement',
        image: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
        link: '/tours'
    });

    const nextBanner = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    };

    const prevBanner = () => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(nextBanner, 5000);
        return () => clearInterval(interval);
    }, [banners.length]);

    if (loading) {
        return (
            <div className="relative h-[600px] flex items-center justify-center bg-gray-200">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const currentBanner = banners[currentIndex];

    return (
        <div className="relative h-[600px] flex items-center justify-center text-white overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={currentBanner.image}
                    alt={currentBanner.title}
                    className="w-full h-full object-cover transition-opacity duration-700"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in-up">
                    {currentBanner.title}
                </h1>
                <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-2xl mx-auto animate-fade-in-up delay-100">
                    Trải nghiệm những hành trình tuyệt vời, khám phá văn hóa độc đáo và tận hưởng kỳ nghỉ đáng nhớ với dịch vụ đẳng cấp.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200">
                    <Link
                        to={'/tours'}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                    >
                        Khám phá Tour <FiArrowRight />
                    </Link>
                    <Link
                        to="/contact"
                        className="px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
                    >
                        Liên hệ tư vấn
                    </Link>
                </div>
            </div>

            {/* Navigation Arrows (only show if multiple banners) */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={prevBanner}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full backdrop-blur-sm transition-all"
                    >
                        <FiChevronLeft size={24} />
                    </button>
                    <button
                        onClick={nextBanner}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full backdrop-blur-sm transition-all"
                    >
                        <FiChevronRight size={24} />
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? 'bg-white w-8' : 'bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default HeroSection;
