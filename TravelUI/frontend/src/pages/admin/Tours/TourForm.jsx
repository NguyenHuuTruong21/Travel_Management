import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiPlus, FiTrash, FiUpload, FiX } from 'react-icons/fi';
import adminService from '../../../services/adminService';

const TourForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        startLocation: '',
        price: '',
        duration: '',
        description: '',
        type: 'domestic',
        status: 'active',
        capacity: '',
        location: {
            address: ''
        },
        itinerary: [
            { day: 1, title: '', description: '' }
        ]
    });

    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [imagesToRemove, setImagesToRemove] = useState([]); // List of URLs to remove

    useEffect(() => {
        if (isEditMode) {
            fetchTourData();
        }
    }, [id]);

    const fetchTourData = async () => {
        setLoading(true);
        const result = await adminService.getTour(id);
        if (result.error) {
            alert('Lỗi: ' + result.error);
            navigate('/admin/tours');
        } else {
            const tour = result.tour || result.data?.tour || result.data || result;
            setFormData({
                name: tour.name || '',
                startLocation: tour.startLocation || '',
                price: tour.price || '',
                duration: tour.duration || '',
                description: tour.description || '',
                type: tour.type || 'domestic',
                status: tour.status || 'active',
                capacity: tour.capacity || '',
                location: {
                    address: tour.location?.address || ''
                },
                itinerary: tour.itinerary && tour.itinerary.length > 0
                    ? tour.itinerary
                    : [{ day: 1, title: '', description: '' }]
            });
            setExistingImages(tour.images || []);
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('location.')) {
            const locationField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    [locationField]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Itinerary Handlers
    const handleItineraryChange = (index, field, value) => {
        const newItinerary = [...formData.itinerary];
        newItinerary[index][field] = value;
        setFormData(prev => ({ ...prev, itinerary: newItinerary }));
    };

    const addItineraryDay = () => {
        setFormData(prev => ({
            ...prev,
            itinerary: [
                ...prev.itinerary,
                { day: prev.itinerary.length + 1, title: '', description: '' }
            ]
        }));
    };

    const removeItineraryDay = (index) => {
        if (formData.itinerary.length === 1) return;
        const newItinerary = formData.itinerary.filter((_, i) => i !== index);
        // Re-number days
        const renumbered = newItinerary.map((item, i) => ({ ...item, day: i + 1 }));
        setFormData(prev => ({ ...prev, itinerary: renumbered }));
    };

    // Image Handlers
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = [];
        const newPreviews = [];

        files.forEach(file => {
            if (file.size > 10 * 1024 * 1024) {
                alert(`File ${file.name} quá lớn (tối đa 10MB)`);
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert(`File ${file.name} không phải là ảnh`);
                return;
            }
            validFiles.push(file);
            newPreviews.push(URL.createObjectURL(file));
        });

        setImageFiles(prev => [...prev, ...validFiles]);
        setImagePreviews(prev => [...prev, ...newPreviews]);
        e.target.value = ''; // Reset input
    };

    const removeNewImage = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (url) => {
        setExistingImages(prev => prev.filter(img => img !== url));
        setImagesToRemove(prev => [...prev, url]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const submitData = new FormData();

        // Basic fields
        submitData.append('name', formData.name);
        submitData.append('startLocation', formData.startLocation);
        submitData.append('price', formData.price);
        submitData.append('duration', formData.duration);
        submitData.append('description', formData.description);
        submitData.append('type', formData.type);
        submitData.append('status', formData.status);
        submitData.append('capacity', formData.capacity);

        // Complex fields
        submitData.append('location', JSON.stringify(formData.location));
        submitData.append('itinerary', JSON.stringify(formData.itinerary));

        // New Images
        imageFiles.forEach(file => {
            submitData.append('images', file);
        });

        // Existing images to remove (only for edit)
        if (isEditMode && imagesToRemove.length > 0) {
            // We can't directly send an array via FormData like JSON without stringifying or repeated keys
            // Backend updateTour logic: checks `up.removeImages`
            // Let's modify adminService to handle this or confirm backend logic.
            // Checked backend: checks `up.removeImages` (expected array)
            // But FormData arrays are tricky.
            // Best approach: append multiple times for same key or send as JSON if backend parses it?
            // Backend `updateTour` does: `if (Array.isArray(up.removeImages))` 
            // and `req.body` comes from multer. Multer handles text fields.
            // Express/Multer doesn't automatically parse arrays unless we use a library like `qs` or handle it manually.
            // Let's try appending multiple times.
            imagesToRemove.forEach(url => submitData.append('removeImages', url));
        }

        let result;
        if (isEditMode) {
            result = await adminService.updateTour(id, submitData);
        } else {
            result = await adminService.createTour(submitData);
        }

        if (result.error) {
            alert('Lỗi: ' + result.error);
        } else {
            alert(isEditMode ? 'Cập nhật thành công!' : 'Tạo tour thành công!');
            navigate('/admin/tours');
        }
        setLoading(false);
    };

    if (loading && isEditMode && !formData.name) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/admin*')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <FiArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Chỉnh sửa Tour' : 'Thêm Tour Mới'}</h1>
                    <p className="text-gray-500 text-sm">Điền đầy đủ thông tin để tạo tour du lịch hấp dẫn</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* General Info */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Thông tin chung</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Tour <span className="text-red-500">*</span></label>
                            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="VD: Tour Đà Nẵng - Hội An 3N2Đ" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Điểm Khởi Hành <span className="text-red-500">*</span></label>
                            <input required type="text" name="startLocation" value={formData.startLocation} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="VD: TP. Hồ Chí Minh" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại Tour</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                <option value="domestic">Trong nước</option>
                                <option value="international">Quốc tế</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Tạm ẩn</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) <span className="text-red-500">*</span></label>
                            <input required type="number" min="0" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số chỗ tối đa</label>
                            <input type="number" min="1" name="capacity" value={formData.capacity} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng <span className="text-red-500">*</span></label>
                            <input required type="text" name="duration" value={formData.duration} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="VD: 3 ngày 2 đêm" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Điểm đến (Địa chỉ)</label>
                            <input type="text" name="location.address" value={formData.location.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="VD: Đà Nẵng, Việt Nam" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả đầy đủ</label>
                            <textarea rows="4" name="description" value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"></textarea>
                        </div>
                    </div>
                </div>

                {/* Itinerary */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-lg font-bold text-gray-800">Lịch trình chi tiết</h2>
                        <button type="button" onClick={addItineraryDay} className="text-sm px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium flex items-center gap-1">
                            <FiPlus /> Thêm ngày
                        </button>
                    </div>

                    <div className="space-y-6">
                        {formData.itinerary.map((item, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg relative group">
                                <div className="absolute top-4 right-4">
                                    <button type="button" onClick={() => removeItineraryDay(index)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Xóa ngày này">
                                        <FiTrash />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div className="md:col-span-1">
                                        <div className="h-full flex items-center justify-center">
                                            <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">{item.day}</span>
                                        </div>
                                    </div>
                                    <div className="md:col-span-11 space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Tiêu đề ngày (VD: Đón sân bay - City Tour)"
                                            value={item.title}
                                            onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                                        />
                                        <textarea
                                            rows="2"
                                            placeholder="Mô tả chi tiết hoạt động trong ngày..."
                                            value={item.description}
                                            onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Hình ảnh</h2>

                    <div className="mb-4">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500"><span className="font-semibold">Click để upload</span> hoặc kéo thả</p>
                                <p className="text-xs text-gray-500">PNG, JPG (Max 10MB)</p>
                            </div>
                            <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>

                    {/* Previews */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {/* Existing Images */}
                        {existingImages.map((url, idx) => (
                            <div key={`existing-${idx}`} className="relative group aspect-square">
                                <img src={url} alt="Tour" className="w-full h-full object-cover rounded-lg" />
                                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                    <button type="button" onClick={() => removeExistingImage(url)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                                        <FiTrash size={16} />
                                    </button>
                                </div>
                                <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 rounded">Cũ</div>
                            </div>
                        ))}

                        {/* New Images */}
                        {imagePreviews.map((url, idx) => (
                            <div key={`new-${idx}`} className="relative group aspect-square">
                                <img src={url} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                    <button type="button" onClick={() => removeNewImage(idx)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                                        <FiX size={16} />
                                    </button>
                                </div>
                                <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 rounded">Mới</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => navigate('/admin/tours')} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                        Hủy bỏ
                    </button>
                    <button type="submit" disabled={loading} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2">
                        {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <FiSave />}
                        {isEditMode ? 'Lưu thay đổi' : 'Tạo Tour Mới'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TourForm;
