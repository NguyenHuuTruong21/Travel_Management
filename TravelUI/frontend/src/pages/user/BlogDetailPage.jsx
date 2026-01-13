import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiCalendar, FiUser, FiArrowLeft, FiClock } from 'react-icons/fi';

const BlogDetailPage = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/posts/${id}`);
                setPost(response.data.post || response.data.data || response.data);
            } catch (err) {
                console.error('Error fetching post:', err);
                setError('Không thể tải bài viết. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <p className="text-xl text-gray-600 mb-4">{error || 'Bài viết không tồn tại'}</p>
                <Link to="/blog" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium">
                    <FiArrowLeft /> Quay lại trang tin tức
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Header Image */}
            <div className="h-[400px] relative w-full">
                <img
                    src={post.image
                        ? (post.image.startsWith('http') ? post.image : `http://localhost:5000${post.image.startsWith('/') ? '' : '/'}${post.image.replace(/\\/g, '/')}`)
                        : 'https://via.placeholder.com/1200x600?text=No+Image'}
                    alt={post.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="max-w-4xl mx-auto text-white">
                        <div className="flex items-center gap-4 text-sm font-medium mb-3 uppercase tracking-wider text-blue-300">
                            {post.category || 'Tin tức'}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{post.title}</h1>
                        <div className="flex items-center gap-6 text-sm md:text-base text-gray-200">
                            <div className="flex items-center gap-2">
                                <FiCalendar />
                                <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiUser />
                                <span>{post.author?.fullName || 'Admin'}</span>
                            </div>
                            {/* Estimated reading time could be added here */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                <Link to="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 transition-colors">
                    <FiArrowLeft /> Quay lại danh sách
                </Link>

                <article className="prose prose-lg max-w-none prose-img:rounded-xl prose-a:text-blue-600 hover:prose-a:text-blue-800">
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </article>

                {/* Tags or Share could go here */}
                {post.tags && post.tags.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <h3 className="text-lg font-bold mb-4">Tags:</h3>
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag, index) => (
                                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogDetailPage;
