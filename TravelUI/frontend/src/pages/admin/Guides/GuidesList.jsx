import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import adminService from '../../../services/adminService';

const GuidesList = () => {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchGuides();
    }, []);

    const fetchGuides = async () => {
        setLoading(true);
        const result = await adminService.getGuides();
        if (result.error) {
            alert('Lỗi: ' + result.error);
        } else {
            setGuides(result.data || result || []);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa hướng dẫn viên này?')) return;
        const result = await adminService.deleteGuide(id);
        if (result.error) {
            alert('Lỗi: ' + result.error);
        } else {
            alert('Xóa thành công!');
            fetchGuides();
        }
    };

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý hướng dẫn viên</h1>
                    <p className="text-gray-600">Danh sách và quản lý tất cả hướng dẫn viên</p>
                </div>
                <button
                    onClick={() => navigate('/admin/guides/create')}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2"
                >
                    <FiPlus /> Thêm hướng dẫn viên
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Liên hệ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngôn ngữ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kinh nghiệm</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {guides.map((guide) => (
                                    <tr key={guide._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {guide.avatar && (
                                                    <img src={`http://localhost:5000${guide.avatar}`} alt={guide.name} className="h-10 w-10 rounded-full object-cover mr-3" />
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{guide.name}</div>
                                                    <div className="text-xs text-gray-500 line-clamp-1">{guide.bio}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{guide.phone || 'Chưa có SĐT'}</div>
                                            <div className="text-sm text-gray-500">{guide.email || 'Chưa có Email'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{guide.languages?.join(', ') || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{guide.experience || '-'} năm</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${guide.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {guide.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button onClick={() => navigate(`/admin/guides/${guide._id}`)} className="text-indigo-600 hover:text-indigo-900">
                                                    <FiEdit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(guide._id)} className="text-red-600 hover:text-red-900">
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuidesList;
