import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiCalendar, FiArrowRight } from 'react-icons/fi';

const Blog = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/posts?limit=3');
                setPosts(response.data.data || []);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, []);

    if (posts.length === 0) return null;

    const getExcerpt = (htmlContent) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = htmlContent;
        return tmp.textContent || tmp.innerText || '';
    };

    return (
        <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Tin tức & Cẩm nang</h2>
                        <p className="text-gray-600">Kinh nghiệm du lịch và những câu chuyện thú vị</p>
                    </div>
                    <Link to="/blog" className="hidden md:inline-flex items-center text-blue-600 font-medium hover:text-blue-700">
                        Xem tất cả <FiArrowRight className="ml-2" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.slice(0, 3).map((post) => (
                        <div key={post._id} className="group cursor-pointer">
                            <div className="rounded-2xl overflow-hidden mb-4 h-56">
                                <Link to={`/blog/${post._id}`}>
                                    <img
                                        src={post.image
                                            ? (post.image.startsWith('http') ? post.image : `http://localhost:5000${post.image.startsWith('/') ? '' : '/'}${post.image.replace(/\\/g, '/')}`)
                                            : 'https://via.placeholder.com/600x400'}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </Link>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                <div className="flex items-center gap-1">
                                    <FiCalendar />
                                    <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <span>•</span>
                                <span>{post.author?.fullName || 'Admin'}</span>
                            </div>
                            <Link to={`/blog/${post._id}`}>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                            </Link>
                            <p className="text-gray-600 line-clamp-2 mb-4">
                                {getExcerpt(post.content)}
                            </p>
                            <Link to={`/blog/${post._id}`} className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700">
                                Đọc tiếp <FiArrowRight className="ml-2" />
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link to="/blog" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700">
                        Xem tất cả <FiArrowRight className="ml-2" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Blog;
