import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiStar, FiSend } from 'react-icons/fi';

const TourReviews = ({ tourId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        rating: 5,
        comment: ''
    });
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('accessToken');
        if (token) {
            fetchUserProfile();
        }
        fetchReviews();
    }, [tourId]);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get('http://localhost:5000/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data.user);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/reviews/tour/${tourId}`);
            setReviews(response.data.data || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            alert('Vui lòng đăng nhập để đánh giá');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('accessToken');
            await axios.post('http://localhost:5000/api/reviews',
                {
                    tourId,
                    rating: formData.rating,
                    comment: formData.comment
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            alert('Đánh giá của bạn đã được gửi thành công! Chờ duyệt.');
            setFormData({ rating: 5, comment: '' });
            fetchReviews();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating, interactive = false, onRate = null) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type={interactive ? "button" : undefined}
                        onClick={interactive ? () => onRate(star) : undefined}
                        className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
                        disabled={!interactive}
                    >
                        <FiStar
                            className={`w-5 h-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Review Form */}
            {user && (
                <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Viết đánh giá của bạn</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Đánh giá của bạn
                            </label>
                            {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nhận xét
                            </label>
                            <textarea
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Chia sẻ trải nghiệm của bạn về tour này..."
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <FiSend />
                            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                    </form>
                </div>
            )}

            {!user && (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <p className="text-gray-600">
                        Vui lòng <a href="/login" className="text-blue-600 hover:underline">đăng nhập</a> để đánh giá tour này
                    </p>
                </div>
            )}

            {/* Reviews List */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Đánh giá từ khách hàng ({reviews.length})
                </h3>

                {reviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>Chưa có đánh giá nào cho tour này</p>
                        <p className="text-sm mt-2">Hãy là người đầu tiên đánh giá!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                            {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{review.user?.name || 'Người dùng'}</h4>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                            {renderStars(review.rating)}
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>

                                        {review.images && review.images.length > 0 && (
                                            <div className="flex gap-2 mt-4">
                                                {review.images.map((img, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                                                        alt={`Review ${idx + 1}`}
                                                        className="w-20 h-20 object-cover rounded-lg"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TourReviews;
