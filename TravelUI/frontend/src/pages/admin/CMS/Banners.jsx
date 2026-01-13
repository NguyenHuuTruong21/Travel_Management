import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import adminService from '../../../services/adminService';

const BannersList = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        image: '',
        link: '',
        order: 0,
        isActive: true
    });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setLoading(true);
        const result = await adminService.getBanners();
        if (result.error) {
            alert('Lỗi: ' + result.error);
        } else {
            setBanners(result.data || result || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = editingBanner
            ? await adminService.updateBanner(editingBanner._id, formData)
            : await adminService.createBanner(formData);

        if (result.error) {
            alert('Lỗi: ' + result.error);
        } else {
            alert(editingBanner ? 'Cập nhật thành công!' : 'Thêm banner thành công!');
            setShowModal(false);
            setEditingBanner(null);
            setFormData({ title: '', image: '', link: '', order: 0, isActive: true });
            fetchBanners();
        }
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title || '',
            image: banner.image || '',
            link: banner.link || '',
            order: banner.order || 0,
            isActive: banner.isActive !== undefined ? banner.isActive : true
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa banner này?')) return;
        const result = await adminService.deleteBanner(id);
        if (result.error) {
            alert('Lỗi: ' + result.error);
        } else {
            alert('Xóa thành công!');
            fetchBanners();
        }
    };

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Banners</h1>
                    <p className="text-gray-600">Danh sách và quản lý tất cả banners</p>
                </div>
                <button
                    onClick={() => {
                        setEditingBanner(null);
                        setFormData({ title: '', image: '', link: '', order: 0, isActive: true });
                        setShowModal(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2"
                >
                    <FiPlus /> Thêm banner
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    </div>
                ) : (
                    banners.map((banner) => (
                        <div key={banner._id} className="bg-white rounded-xl shadow-md overflow-hidden">
                            {banner.image && (
                                <img src={banner.image} alt={banner.title} className="w-full h-48 object-cover" />
                            )}
                            <div className="p-4">
                                <h3 className="font-semibold text-lg mb-2">{banner.title}</h3>
                                <p className="text-sm text-gray-600 mb-2">Thứ tự: {banner.order}</p>
                                <div className="flex items-center justify-between">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${banner.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {banner.active ? 'Hoạt động' : 'Tắt'}
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(banner)} className="text-indigo-600 hover:text-indigo-900">
                                            <FiEdit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(banner._id)} className="text-red-600 hover:text-red-900">
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold mb-4">{editingBanner ? 'Sửa banner' : 'Thêm banner'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL hình ảnh *</label>
                                    <input
                                        type="url"
                                        required
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                                    <input
                                        type="url"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Hoạt động</label>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700"
                                >
                                    {editingBanner ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BannersList;
