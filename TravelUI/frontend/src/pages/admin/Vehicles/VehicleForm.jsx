import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiUpload, FiTrash, FiX } from 'react-icons/fi';
import adminService from '../../../services/adminService';

const VehicleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'bus',
        capacity: '',
        plateNumber: '',
        driverName: '',
        status: 'active'
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [existingImage, setExistingImage] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchVehicleData();
        }
    }, [id]);

    const fetchVehicleData = async () => {
        setLoading(true);
        const result = await adminService.getVehicle(id);
        if (result.error) {
            alert('Lỗi: ' + result.error);
            navigate('/admin/vehicles');
        } else {
            const vehicle = result.vehicle || result.data || result;
            setFormData({
                type: vehicle.type || 'bus',
                capacity: vehicle.capacity || '',
                plateNumber: vehicle.plateNumber || '',
                driverName: vehicle.driverName || '',
                status: vehicle.status || 'active'
            });
            if (vehicle.image) {
                setExistingImage(vehicle.image.startsWith('http') ? vehicle.image : `http://localhost:5000${vehicle.image}`);
            }
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File quá lớn (tối đa 5MB)');
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert('File không phải là ảnh');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            submitData.append(key, formData[key]);
        });

        if (imageFile) {
            submitData.append('image', imageFile);
        }

        let result;
        if (isEditMode) {
            result = await adminService.updateVehicle(id, submitData);
        } else {
            result = await adminService.createVehicle(submitData);
        }

        if (result.error) {
            alert('Lỗi: ' + result.error);
        } else {
            alert(isEditMode ? 'Cập nhật thành công!' : 'Thêm phương tiện thành công!');
            navigate('/admin/vehicles');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/admin/vehicles')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <FiArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Chỉnh sửa Phương tiện' : 'Thêm Phương tiện'}</h1>
                    <p className="text-gray-500 text-sm">Quản lý thông tin phương tiện di chuyển</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* General Info */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Thông tin chung</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại xe</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                <option value="bus">Xe buýt</option>
                                <option value="minivan">Xe minivan</option>
                                <option value="electric">Xe điện</option>
                                <option value="boat">Thuyền</option>
                                <option value="train">Tàu hỏa</option>
                                <option value="car">Ô tô</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Biển số <span className="text-red-500">*</span></label>
                            <input required type="text" name="plateNumber" value={formData.plateNumber} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 uppercase" placeholder="51H-12345" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa (người) <span className="text-red-500">*</span></label>
                            <input required type="number" min="1" name="capacity" value={formData.capacity} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tài xế</label>
                            <input type="text" name="driverName" value={formData.driverName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Không hoạt động</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Image */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Hình ảnh</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div>
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500"><span className="font-semibold">Click để upload</span> hoặc kéo thả</p>
                                    <p className="text-xs text-gray-500">PNG, JPG (Max 5MB)</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>

                        <div className="flex justify-center md:justify-start">
                            {/* Preview Logic */}
                            {imagePreview ? (
                                <div className="relative group">
                                    <img src={imagePreview} alt="Preview" className="h-48 w-full object-cover rounded-lg shadow-sm" />
                                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                        <button type="button" onClick={removeImage} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                                            <FiX size={20} />
                                        </button>
                                    </div>
                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">Mới</div>
                                </div>
                            ) : existingImage ? (
                                <div className="relative group">
                                    <img src={existingImage} alt="Current" className="h-48 w-full object-cover rounded-lg shadow-sm" />
                                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">Hiện tại</div>
                                </div>
                            ) : (
                                <div className="h-48 w-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                    Chưa có ảnh
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => navigate('/admin/vehicles')} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                        Hủy bỏ
                    </button>
                    <button type="submit" disabled={loading} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2">
                        {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <FiSave />}
                        {isEditMode ? 'Lưu thay đổi' : 'Thêm Phương tiện'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VehicleForm;
