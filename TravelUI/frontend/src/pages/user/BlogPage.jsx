import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiCalendar, FiUser, FiArrowRight } from 'react-icons/fi';

const BlogPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/posts');
                // Ensure we handle different potential response structures
                const fetchedPosts = response.data.data || response.data.posts || response.data || [];
                setPosts(fetchedPosts.filter(post => post.isPublished !== false));
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // Function to strip HTML tags for excerpt
    const getExcerpt = (htmlContent, maxLength = 150) => {
        const div = document.createElement('div');
        div.innerHTML = htmlContent;
        const text = div.textContent || div.innerText || '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <div className="bg-white min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog du lịch</h1>
                    <p className="text-lg text-gray-600">Chia sẻ kinh nghiệm, cảm hứng và những câu chuyện thú vị về những chuyến đi.</p>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-12">
                            {posts.length > 0 ? (
                                posts.map(post => (
                                    <div key={post._id} className="flex flex-col md:flex-row gap-6 items-start group">
                                        <div className="w-full md:w-1/3 h-52 rounded-xl overflow-hidden shadow-sm">
                                            <img
                                                src={
                                                    post.image
                                                        ? (post.image.trim().startsWith("http")
                                                            ? post.image.trim()
                                                            : `http://localhost:5000${post.image.trim().startsWith("/") ? "" : "/"}${post.image.trim().replace(/\\/g, "/")}`
                                                        )
                                                        : "https://via.placeholder.com/400x300?text=No+Image"
                                                }
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 text-sm text-blue-600 font-bold mb-2 uppercase tracking-wide">
                                                {post.category || 'Tin tức'}
                                            </div>
                                            <Link to={`/blog/${post._id}`}>
                                                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors cursor-pointer">
                                                    {post.title}
                                                </h2>
                                            </Link>
                                            <p className="text-gray-600 mb-4 line-clamp-2">
                                                {getExcerpt(post.content)}
                                            </p>
                                            <div className="flex items-center text-sm text-gray-400 gap-4">
                                                <div className="flex items-center gap-1">
                                                    <FiCalendar />
                                                    <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                                <Link to={`/blog/${post._id}`} className="text-indigo-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                                    Xem chi tiết <FiArrowRight />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500">Chưa có bài viết nào.</p>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-gray-50 p-6 rounded-xl">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Danh mục phổ biến</h3>
                                <ul className="space-y-2">
                                    <li className="text-gray-600 hover:text-blue-600 cursor-pointer flex justify-between">
                                        <span>Kinh nghiệm du lịch</span>
                                        <span className="text-gray-400">(12)</span>
                                    </li>
                                    <li className="text-gray-600 hover:text-blue-600 cursor-pointer flex justify-between">
                                        <span>Điểm đến hấp dẫn</span>
                                        <span className="text-gray-400">(5)</span>
                                    </li>
                                    <li className="text-gray-600 hover:text-blue-600 cursor-pointer flex justify-between">
                                        <span>Ẩm thực bốn phương</span>
                                        <span className="text-gray-400">(8)</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-8 rounded-xl text-white text-center shadow-lg">
                                <h3 className="text-2xl font-bold mb-4">Đăng ký nhận tin</h3>
                                <p className="mb-6 opacity-90">Nhận những ưu đãi du lịch và bài viết mới nhất qua email.</p>
                                <input type="email" placeholder="Email của bạn" className="w-full px-4 py-3 rounded-lg text-gray-900 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                                <button className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-md">Đăng ký ngay</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogPage;
