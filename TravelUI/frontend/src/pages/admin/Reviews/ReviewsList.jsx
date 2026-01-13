import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';

const ReviewsList = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        const result = await adminService.getReviews();
        if (result.error) {
            console.error('Error:', result.error);
            setReviews([]);
        } else {
            setReviews(result.data || []);
        }
        setLoading(false);
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý đánh giá</h1>
                <p className="text-gray-600">Danh sách và quản lý tất cả đánh giá từ khách hàng</p>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    </div>
                ) : reviews.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {reviews.map((review) => (
                            <div key={review._id} className="p-6 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-2">
                                            <div className="font-semibold text-gray-900">{review.user?.fullName || 'Anonymous'}</div>
                                            <div className="ml-4 flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>⭐</span>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                                        <p className="text-xs text-gray-500">Tour: {review.tour?.name || 'N/A'}</p>
                                        {review.images && review.images.length > 0 && (
                                            <div className="flex gap-2 mt-2">
                                                {review.images.map((img, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                                                        alt="Review"
                                                        className="w-16 h-16 object-cover rounded"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${review.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {review.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">Chưa có đánh giá nào</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewsList;
