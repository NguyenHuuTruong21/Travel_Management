import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiStar } from 'react-icons/fi';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // Assuming there's an endpoint for featured reviews or just get latest
                const response = await axios.get('http://localhost:5000/api/reviews?limit=3');
                setReviews(response.data.data || []);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };

        fetchReviews();
    }, []);

    // Fallback data if no reviews
    const displayReviews = reviews.length > 0 ? reviews : [
        {
            _id: 1,
            user: { fullName: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?img=1' },
            rating: 5,
            comment: 'Chuyến đi tuyệt vời! Hướng dẫn viên rất nhiệt tình và am hiểu kiến thức. Khách sạn sạch sẽ, tiện nghi.',
            tour: { name: 'Tour Đà Nẵng - Hội An 3N2Đ' }
        },
        {
            _id: 2,
            user: { fullName: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?img=5' },
            rating: 5,
            comment: 'Dịch vụ rất tốt, xe đưa đón đúng giờ. Đồ ăn ngon, phong phú. Sẽ ủng hộ lần sau.',
            tour: { name: 'Tour Phú Quốc 4N3Đ' }
        },
        {
            _id: 3,
            user: { fullName: 'Lê Văn C', avatar: 'https://i.pravatar.cc/150?img=8' },
            rating: 4,
            comment: 'Cảnh đẹp, thời tiết ủng hộ. Tuy nhiên lịch trình hơi dày nên hơi mệt một chút. Nhưng tổng thể rất vui.',
            tour: { name: 'Tour Sapa - Fansipan 2N1Đ' }
        }
    ];

    return (
        <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Khách hàng nói gì?</h2>
                    <p className="text-gray-600">Cảm nhận thực tế từ những khách hàng đã trải nghiệm dịch vụ</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {displayReviews.map((review) => (
                        <div key={review._id} className="bg-gray-50 p-8 rounded-2xl relative">
                            {/* Quote icon decoration */}
                            <div className="absolute top-4 right-6 text-6xl text-blue-100 font-serif">"</div>

                            <div className="flex items-center gap-4 mb-6">
                                <img
                                    src={review.user?.avatar || `https://ui-avatars.com/api/?name=${review.user?.fullName}&background=random`}
                                    alt={review.user?.fullName}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                                />
                                <div>
                                    <h4 className="font-bold text-gray-900">{review.user?.fullName}</h4>
                                    <div className="flex text-yellow-400 text-sm">
                                        {[...Array(5)].map((_, i) => (
                                            <FiStar key={i} className={i < review.rating ? "fill-current" : "text-gray-300"} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-600 italic mb-4 relative z-10">
                                {review.comment}
                            </p>

                            {review.tour && (
                                <div className="text-sm text-blue-600 font-medium border-t border-gray-200 pt-4">
                                    Tour: {review.tour.name}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Reviews;
