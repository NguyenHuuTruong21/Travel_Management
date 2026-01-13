import React, { useContext, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { FiMenu, FiX, FiUser, FiLogOut, FiFacebook, FiInstagram, FiTwitter, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const UserLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    TM
                                </div>
                                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 hidden sm:block">
                                    TravelManagement
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-8">
                            <Link to="/" className={`text-base font-medium transition-colors ${isActive('/') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
                                Trang chủ
                            </Link>
                            <Link to="/tours" className={`text-base font-medium transition-colors ${isActive('/tours') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
                                Tour du lịch
                            </Link>
                            <Link to="/hotels" className={`text-base font-medium transition-colors ${isActive('/hotels') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
                                Khách sạn
                            </Link>
                            <Link to="/services" className={`text-base font-medium transition-colors ${isActive('/services') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
                                Dịch vụ
                            </Link>
                            <Link to="/blog" className={`text-base font-medium transition-colors ${isActive('/blog') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
                                Tin tức
                            </Link>
                            <Link to="/contact" className={`text-base font-medium transition-colors ${isActive('/contact') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
                                Liên hệ
                            </Link>
                        </nav>

                        {/* User Actions */}
                        <div className="hidden md:flex items-center space-x-4">
                            {user ? (
                                <div className="flex items-center gap-4">
                                    <NotificationDropdown />
                                    <Link to="/profile">
                                        <div className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-full transition-colors cursor-pointer">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden">
                                                {user.avatar ? (
                                                    <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} alt={user.fullName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <FiUser />
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{user.fullName}</span>
                                        </div>
                                    </Link>
                                    {user.role === 'admin' && (
                                        <Link to="/admin/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                            Quản trị
                                        </Link>
                                    )}
                                    <button
                                        onClick={logout}
                                        className="text-gray-500 hover:text-red-600 transition-colors"
                                        title="Đăng xuất"
                                    >
                                        <FiLogOut size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link to="/login" className="text-base font-medium text-gray-600 hover:text-blue-600">
                                        Đăng nhập
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                    >
                                        Đăng ký
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-gray-600 hover:text-blue-600 focus:outline-none"
                            >
                                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100">
                        <div className="px-4 pt-2 pb-4 space-y-1">
                            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50">Trang chủ</Link>
                            <Link to="/tours" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50">Tour du lịch</Link>
                            <Link to="/hotels" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50">Khách sạn</Link>
                            <Link to="/services" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50">Dịch vụ</Link>
                            <Link to="/blog" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50">Tin tức</Link>
                            <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50">Liên hệ</Link>

                            <div className="border-t border-gray-100 my-2 pt-2">
                                {user ? (
                                    <>
                                        <Link to="/profile" className="px-3 py-2 flex items-center gap-3 hover:bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <FiUser />
                                            </div>
                                            <span className="font-medium text-gray-700">{user.fullName}</span>
                                        </Link>
                                        {user.role === 'admin' && (
                                            <Link to="/admin/dashboard" className="block px-3 py-2 text-indigo-600 font-medium">Vào trang quản trị</Link>
                                        )}
                                        <button onClick={logout} className="block w-full text-left px-3 py-2 text-red-600 font-medium">Đăng xuất</button>
                                    </>
                                ) : (
                                    <div className="space-y-2 px-3">
                                        <Link to="/login" className="block w-full text-center py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Đăng nhập</Link>
                                        <Link to="/register" className="block w-full text-center py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Đăng ký</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                        {/* Brand Info */}
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                    TM
                                </div>
                                <span className="text-2xl font-bold">TravelManagement</span>
                            </div>
                            <p className="text-gray-400 mb-6 leading-relaxed">
                                Khám phá thế giới cùng chúng tôi. Trải nghiệm những hành trình tuyệt vời và dịch vụ đẳng cấp nhất.
                            </p>
                            <div className="flex space-x-4">
                                <button className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                                    <FiFacebook size={20} />
                                </button>
                                <button className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition-all">
                                    <FiInstagram size={20} />
                                </button>
                                <button className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-400 hover:text-white transition-all">
                                    <FiTwitter size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-lg font-bold mb-6 text-white">Liên kết nhanh</h3>
                            <ul className="space-y-4">
                                <li><Link to="/about" className="text-gray-400 hover:text-blue-500 transition-colors">Về chúng tôi</Link></li>
                                <li><Link to="/tours" className="text-gray-400 hover:text-blue-500 transition-colors">Tour du lịch</Link></li>
                                <li><Link to="/hotels" className="text-gray-400 hover:text-blue-500 transition-colors">Khách sạn</Link></li>
                                <li><Link to="/services" className="text-gray-400 hover:text-blue-500 transition-colors">Dịch vụ</Link></li>
                                <li><Link to="/blog" className="text-gray-400 hover:text-blue-500 transition-colors">Tin tức & Sự kiện</Link></li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h3 className="text-lg font-bold mb-6 text-white">Hỗ trợ</h3>
                            <ul className="space-y-4">
                                <li><Link to="/faq" className="text-gray-400 hover:text-blue-500 transition-colors">Câu hỏi thường gặp</Link></li>
                                <li><Link to="/policy" className="text-gray-400 hover:text-blue-500 transition-colors">Chính sách bảo mật</Link></li>
                                <li><Link to="/terms" className="text-gray-400 hover:text-blue-500 transition-colors">Điều khoản sử dụng</Link></li>
                                <li><Link to="/contact" className="text-gray-400 hover:text-blue-500 transition-colors">Liên hệ hỗ trợ</Link></li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h3 className="text-lg font-bold mb-6 text-white">Liên hệ</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-gray-400">
                                    <FiMapPin className="mt-1 text-blue-500 flex-shrink-0" />
                                    <span>123 Đường ABC, Quận 1, TP. Hồ Chí Minh, Việt Nam</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-400">
                                    <FiPhone className="text-blue-500 flex-shrink-0" />
                                    <span>+84 123 456 789</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-400">
                                    <FiMail className="text-blue-500 flex-shrink-0" />
                                    <span>contact@travelmanagement.com</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                        <p>&copy; {new Date().getFullYear()} TravelManagement. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default UserLayout;
