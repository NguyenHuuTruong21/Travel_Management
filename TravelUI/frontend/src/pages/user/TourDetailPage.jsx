import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiMapPin, FiClock, FiUsers, FiStar, FiCheck, FiX, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import TourReviews from '../../components/user/TourReviews';
import GuideInfo from '../../components/user/GuideInfo';
import VehicleInfo from '../../components/user/VehicleInfo';

const TourDetailPage = () => {
    const { id } = useParams();
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('itinerary');

    useEffect(() => {
        const fetchTourDetail = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/tours/${id}`);
                setTour(response.data.tour);
            } catch (error) {
                console.error('Error fetching tour detail:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTourDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!tour) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy tour</h2>
                <Link to="/tours" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                    <FiArrowLeft /> Quay lại danh sách
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Hero Gallery */}
            <div className={`h-[500px] grid gap-2 p-2 ${!tour.images || tour.images.length === 0 ? 'grid-cols-1' :
                tour.images.length === 1 ? 'grid-cols-1' :
                    tour.images.length === 2 ? 'grid-cols-2' :
                        tour.images.length === 3 ? 'grid-cols-3' :
                            'grid-cols-4 grid-rows-2'
                }`}>
                {!tour.images || tour.images.length === 0 ? (
                    <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center text-gray-400">
                        No Images Available
                    </div>
                ) : (
                    tour.images.slice(0, 4).map((img, index) => {
                        // Class logic for different layouts
                        let spanClass = '';
                        if (tour.images.length >= 4) {
                            if (index === 0) spanClass = 'col-span-2 row-span-2';
                            else if (index === 3) spanClass = 'col-span-2 row-span-1';
                            else spanClass = 'col-span-1 row-span-1';
                        } else {
                            // Simple equal columns for 1-3 images
                            spanClass = 'col-span-1 row-span-full';
                        }

                        return (
                            <div key={index} className={`${spanClass} rounded-xl overflow-hidden cursor-pointer relative`}>
                                <img
                                    src={img.startsWith('http') ? img : `http://localhost:5000${img.startsWith('/') ? '' : '/'}${img.replace(/\\/g, '/')}`}
                                    alt={`${tour.name} - ${index + 1}`}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                />
                                {index === 3 && tour.images.length > 4 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xl font-bold hover:bg-black/40 transition-colors">
                                        +{tour.images.length - 4} ảnh khác
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content */}
                    <div className="lg:w-2/3">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{tour.name}</h1>

                        <div className="flex flex-wrap gap-6 text-gray-600 mb-8 pb-8 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <FiMapPin className="text-blue-500" />
                                <span>Khởi hành: {tour.startLocation}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiClock className="text-blue-500" />
                                <span>Thời gian: {tour.duration} ngày</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiUsers className="text-blue-500" />
                                <span>Quy mô: tối đa {tour.maxGroupSize} khách</span>
                            </div>
                            <div className="flex items-center gap-2 text-yellow-500">
                                <FiStar className="fill-current" />
                                <span className="text-gray-600 font-medium">{tour.rating || 5} / 5</span>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200 mb-8">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('itinerary')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'itinerary'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Lịch trình
                                </button>
                                <button
                                    onClick={() => setActiveTab('info')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'info'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Thông tin
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'reviews'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Đánh giá ({tour.totalReviews || 0})
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[400px]">
                            {activeTab === 'itinerary' && (
                                <div className="space-y-8">
                                    {tour.itinerary?.map((day, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="flex-shrink-0 w-16 text-center">
                                                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto shadow-lg">
                                                    {day.day}
                                                </div>
                                                <div className="h-full w-0.5 bg-blue-100 mx-auto mt-2 -mb-8"></div>
                                            </div>
                                            <div className="flex-grow bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">{day.title}</h3>
                                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{day.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!tour.itinerary || tour.itinerary.length === 0) && (
                                        <p className="text-gray-500 italic">Đang cập nhật lịch trình...</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'info' && (
                                <div className="space-y-8">
                                    <div className="prose max-w-none text-gray-600">
                                        <div dangerouslySetInnerHTML={{ __html: tour.description || 'Đang cập nhật...' }} />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                                        <div className="bg-green-50 p-6 rounded-xl">
                                            <h3 className="font-bold text-green-800 mb-4 text-lg flex items-center gap-2">
                                                <FiCheck className="text-green-600" /> Bao gồm
                                            </h3>
                                            <ul className="space-y-3">
                                                <li className="flex items-start gap-2 text-green-700"><span>•</span> Xe đưa đón đời mới máy lạnh</li>
                                                <li className="flex items-start gap-2 text-green-700"><span>•</span> Hướng dẫn viên nhiệt tình, kinh nghiệm</li>
                                                <li className="flex items-start gap-2 text-green-700"><span>•</span> Vé tham quan các điểm trong chương trình</li>
                                                <li className="flex items-start gap-2 text-green-700"><span>•</span> Bảo hiểm du lịch trọn tour</li>
                                            </ul>
                                        </div>
                                        <div className="bg-red-50 p-6 rounded-xl">
                                            <h3 className="font-bold text-red-800 mb-4 text-lg flex items-center gap-2">
                                                <FiX className="text-red-600" /> Không bao gồm
                                            </h3>
                                            <ul className="space-y-3">
                                                <li className="flex items-start gap-2 text-red-700"><span>•</span> Chi phí cá nhân (giặt ủi, điện thoại...)</li>
                                                <li className="flex items-start gap-2 text-red-700"><span>•</span> Thuế VAT</li>
                                                <li className="flex items-start gap-2 text-red-700"><span>•</span> Tiền Tip cho HDV và lái xe</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <TourReviews tourId={tour._id} />
                            )}
                        </div>
                    </div>

                    {/* Sidebar Booking */}
                    <div className="lg:w-1/3">
                        <div className="sticky top-24 bg-white rounded-2xl shadow-xl p-8 border border-blue-50">
                            <div className="text-center mb-8">
                                <span className="text-gray-500 text-lg line-through mb-1 block">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.price * 1.2)}
                                </span>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-3xl font-bold text-blue-600">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.price)}
                                    </span>
                                    <span className="text-gray-500">/ khách</span>
                                </div>
                            </div>

                            <Link
                                to={`/booking/${tour._id}`}
                                className="block w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:-translate-y-1 mb-6"
                            >
                                Đặt ngay
                            </Link>

                            <div className="space-y-4 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <FiCheck className="text-green-500 flex-shrink-0" />
                                    <span>Xác nhận tức thì</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <FiCheck className="text-green-500 flex-shrink-0" />
                                    <span>Thanh toán an toàn</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <FiCheck className="text-green-500 flex-shrink-0" />
                                    <span>Hỗ trợ 24/7</span>
                                </div>
                            </div>

                            <div className="mt-8 bg-blue-50 p-4 rounded-xl text-center">
                                <p className="text-sm text-blue-800 font-medium mb-1">Cần hỗ trợ tư vấn?</p>
                                <p className="text-xl font-bold text-blue-600">1900 1234</p>
                            </div>

                            {/* Guide Info */}
                            {tour.guideInfo && (
                                <div className="mt-6">
                                    <GuideInfo guide={tour.guideInfo} />
                                </div>
                            )}

                            {/* Vehicle Info */}
                            {tour.vehicleInfo && (
                                <div className="mt-6">
                                    <VehicleInfo vehicle={tour.vehicleInfo} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TourDetailPage;
