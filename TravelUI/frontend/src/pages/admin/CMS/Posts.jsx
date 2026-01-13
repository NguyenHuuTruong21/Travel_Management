import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import adminService from '../../../services/adminService';

const PostsList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image: '',
        isPublished: true
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        const result = await adminService.getPosts();
        if (result.error) {
            alert('Lỗi: ' + result.error);
        } else {
            setPosts(result.data || result || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = editingPost
            ? await adminService.updatePost(editingPost._id, formData)
            : await adminService.createPost(formData);

        if (result.error) {
            alert('Lỗi: ' + result.error);
        } else {
            alert(editingPost ? 'Cập nhật thành công!' : 'Thêm bài viết thành công!');
            setShowModal(false);
            setEditingPost(null);
            setFormData({ title: '', content: '', image: '', isPublished: true });
            fetchPosts();
        }
    };

    const handleEdit = (post) => {
        setEditingPost(post);
        setFormData({
            title: post.title || '',
            content: post.content || '',
            image: post.image || '',
            isPublished: post.isPublished !== undefined ? post.isPublished : true
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) return;
        const result = await adminService.deletePost(id);
        if (result.error) {
            alert('Lỗi: ' + result.error);
        } else {
            alert('Xóa thành công!');
            fetchPosts();
        }
    };

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý bài viết</h1>
                    <p className="text-gray-600">Danh sách và quản lý tất cả bài viết</p>
                </div>
                <button
                    onClick={() => {
                        setEditingPost(null);
                        setFormData({ title: '', content: '', image: '', isPublished: true });
                        setShowModal(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2"
                >
                    <FiPlus /> Thêm bài viết
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {posts.map((post) => (
                            <div key={post._id} className="p-6 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.content}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>Tác giả: {post.author?.fullName || post.author?.email || 'N/A'}</span>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${post.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {post.isPublished ? 'Đã xuất bản' : 'Nháp'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button onClick={() => handleEdit(post)} className="text-indigo-600 hover:text-indigo-900">
                                            <FiEdit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(post._id)} className="text-red-600 hover:text-red-900">
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">{editingPost ? 'Sửa bài viết' : 'Thêm bài viết'}</h2>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL hình ảnh</label>
                                    <input
                                        type="url"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung *</label>
                                    <textarea
                                        required
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        rows="10"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isPublished"
                                        checked={formData.isPublished}
                                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">Xuất bản</label>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700"
                                >
                                    {editingPost ? 'Cập nhật' : 'Thêm mới'}
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

export default PostsList;
