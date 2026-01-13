import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
    FiHome, FiUsers, FiMap, FiUser, FiTruck,
    FiShoppingBag, FiStar, FiFileText, FiImage, FiGift,
    FiBarChart2, FiSettings, FiMenu, FiX, FiMessageSquare
} from 'react-icons/fi';
import LogoutButton from '../LogoutButton';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const menuItems = [
        { path: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/admin/users', icon: FiUsers, label: 'Người dùng' },
        { path: '/admin/tours', icon: FiMap, label: 'Tours' },
        { path: '/admin/hotels', icon: FiHome, label: 'Khách sạn' },
        { path: '/admin/guides', icon: FiUser, label: 'Hướng dẫn viên' },
        { path: '/admin/vehicles', icon: FiTruck, label: 'Phương tiện' },
        { path: '/admin/bookings', icon: FiShoppingBag, label: 'Đặt tour' },
        { path: '/admin/reviews', icon: FiStar, label: 'Đánh giá' },
        { path: '/admin/contacts', icon: FiMessageSquare, label: 'Liên hệ' },
        {
            label: 'CMS',
            isGroup: true,
            items: [
                { path: '/admin/banners', icon: FiImage, label: 'Banners' },
                { path: '/admin/posts', icon: FiFileText, label: 'Bài viết' },
                { path: '/admin/promotions', icon: FiGift, label: 'Khuyến mãi' },
            ]
        },
        {
            label: 'Báo cáo',
            isGroup: true,
            items: [
                { path: '/admin/reports/revenue', icon: FiBarChart2, label: 'Doanh thu' },
                { path: '/admin/reports/customers', icon: FiUsers, label: 'Khách hàng' },
                { path: '/admin/reports/services', icon: FiBarChart2, label: 'Dịch vụ' },
            ]
        },
        { path: '/admin/settings', icon: FiSettings, label: 'Cài đặt' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-30 px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Admin Panel
                </h1>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                >
                    {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
                <div className="p-6 border-b border-gray-700">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Travel Admin
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Quản trị hệ thống</p>
                </div>

                <nav className="p-4 overflow-y-auto h-[calc(100vh-100px)]">
                    {menuItems.map((item, index) => (
                        item.isGroup ? (
                            <div key={index} className="mb-4">
                                <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 px-3">
                                    {item.label}
                                </div>
                                {item.items.map((subItem) => {
                                    const Icon = subItem.icon;
                                    return (
                                        <Link
                                            key={subItem.path}
                                            to={subItem.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`
                        flex items-center px-3 py-2.5 mb-1 rounded-lg transition-all duration-200
                        ${isActive(subItem.path)
                                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                                }
                      `}
                                        >
                                            <Icon className="mr-3" size={18} />
                                            <span className="text-sm font-medium">{subItem.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                  flex items-center px-3 py-2.5 mb-1 rounded-lg transition-all duration-200
                  ${isActive(item.path)
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }
                `}
                            >
                                <item.icon className="mr-3" size={18} />
                                <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                        )
                    ))}
                </nav>
            </aside>

            {/* Main content */}
            <div className="lg:ml-64 pt-16 lg:pt-0">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 hidden lg:flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {menuItems.find(item =>
                                item.path === location.pathname ||
                                item.items?.some(sub => sub.path === location.pathname)
                            )?.label || menuItems.find(item =>
                                item.items?.some(sub => sub.path === location.pathname)
                            )?.items?.find(sub => sub.path === location.pathname)?.label || 'Admin'}
                        </h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        <LogoutButton />
                    </div>
                </header>

                {/* Page content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminLayout;
