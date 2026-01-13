import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiUpload, FiTrash, FiX } from 'react-icons/fi';
import adminService from '../../../services/adminService';

const GuideForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        languages: '',
        experience: '',
        description: '',
        status: 'active'
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [existingAvatar, setExistingAvatar] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchGuideData();
        }
    }, [id]);

    const fetchGuideData = async () => {
        setLoading(true);
        const result = await adminService.getGuide(id);
        if (result.error) {
            alert('Lỗi: ' + result.error);
            navigate('/admin/guides');
        } else {
            const guide = result.guide || result.data || result;
            setFormData({
                name: guide.name || '',
                phone: guide.phone || '',
                email: guide.email || '',
                languages: guide.languages ? guide.languages.join(', ') : '',
                experience: guide.experience || '',
                description: guide.description || '',
                status: guide.status || 'active'
            });
            if (guide.avatar) {
                setExistingAvatar(guide.avatar.startsWith('http') ? guide.avatar : `http://localhost:5000${guide.avatar}`);
            }
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
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
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const removeAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            submitData.append(key, formData[key]);
        });

        if (avatarFile) {
            submitData.append('avatar', avatarFile);
        }

        let result;
        if (isEditMode) {
            result = await adminService.updateGuide(id, submitData);
        } else {
            result = await adminService.createGuide(submitData);
        }

        if (result.error) {
            alert('Lỗi: ' + result.error);
        } else {
            alert(isEditMode ? 'Cập nhật thành công!' : 'Thêm hướng dẫn viên thành công!');
            navigate('/admin/guides');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/admin/guides')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <FiArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Chỉnh sửa Hướng dẫn viên' : 'Thêm Hướng dẫn viên'}</h1>
                    <p className="text-gray-500 text-sm">Quản lý đội ngũ hướng dẫn viên</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* General Info */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Thông tin cá nhân</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Avatar Upload (Left side on desktop usually looks good, or just inside grid) */}
                        <div className="md:col-span-2 flex justify-center mb-6">
                            <div className="text-center">
                                <span className="block text-sm font-medium text-gray-700 mb-2">Ảnh đại diện</span>
                                <div className="relative inline-block">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-md mx-auto bg-gray-100 flex items-center justify-center">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : existingAvatar ? (
                                            <img src={existingAvatar} alt="Current" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-gray-400 text-4xl font-bold">{formData.name ? formData.name.charAt(0).toUpperCase() : '?'}</span>
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full text-white cursor-pointer hover:bg-indigo-700 shadow-lg transition-transform hover:scale-110">
                                        <FiUpload size={16} />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                    </label>
                                    {(avatarPreview) && (
                                        <button type="button" onClick={removeAvatar} className="absolute top-0 right-0 bg-red-500 p-1 rounded-full text-white hover:bg-red-600 shadow-sm" title="Xóa ảnh mới chọn">
                                            <FiX size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                            <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kinh nghiệm (năm)</label>
                            <input type="number" name="experience" value={formData.experience} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngôn ngữ (phân cách bằng dấu phẩy)</label>
                            <input type="text" name="languages" value={formData.languages} onChange={handleChange} placeholder="Tiếng Việt, English, ..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu bản thân</label>
                            <textarea rows="4" name="description" value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Tạm dừng</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => navigate('/admin/guides')} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                        Hủy bỏ
                    </button>
                    <button type="submit" disabled={loading} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2">
                        {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <FiSave />}
                        {isEditMode ? 'Lưu thay đổi' : 'Thêm Hướng dẫn viên'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GuideForm;
