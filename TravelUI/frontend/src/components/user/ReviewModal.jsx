import React, { useState } from 'react';
import axios from 'axios';
import { FiStar, FiX, FiCamera, FiUpload } from 'react-icons/fi';

const ReviewModal = ({ isOpen, onClose, tourId, tourName, onSuccess }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            setError('Chỉ được tải lên tối đa 5 ảnh');
            return;
        }

        const newImages = [...images, ...files];
        setImages(newImages);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewImages([...previewImages, ...newPreviews]);
        setError('');
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...previewImages];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviewImages(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('accessToken');
            const formData = new FormData();
            formData.append('tourId', tourId);
            formData.append('rating', rating);
            formData.append('comment', comment);

            images.forEach(image => {
                formData.append('images', image);
            });

            await axios.post('http://localhost:5000/api/reviews', formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            onSuccess();
            onClose();
            // Reset form
            setRating(5);
            setComment('');
            setImages([]);
            setPreviewImages([]);

        } catch (err) {
            console.error('Error submitting review:', err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                Đánh giá chuyến đi
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                                <FiX size={24} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 mb-6">
                            Bạn cảm thấy thế nào về tour <span className="font-bold text-gray-700">{tourName}</span>?
                        </p>

                        <form onSubmit={handleSubmit}>
                            {error && (
                                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Star Rating */}
                            <div className="flex justify-center mb-6 gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <FiStar
                                            size={32}
                                            className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Comment */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nhận xét của bạn
                                </label>
                                <textarea
                                    rows={4}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                    placeholder="Chia sẻ trải nghiệm của bạn về chuyến đi..."
                                    required
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Thêm hình ảnh (Tối đa 5 ảnh)
                                </label>
                                <div className="flex flex-wrap gap-4">
                                    {previewImages.map((src, index) => (
                                        <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg hover:bg-red-600 focus:outline-none"
                                            >
                                                <FiX size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {images.length < 5 && (
                                        <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-gray-50 transition-colors">
                                            <FiCamera className="text-gray-400" size={24} />
                                            <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="mt-5 sm:mt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:text-sm ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
