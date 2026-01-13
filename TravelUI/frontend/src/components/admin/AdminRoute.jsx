import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (!user.roles || !user.roles.includes('admin')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
                    <div className="text-red-500 text-6xl mb-4">⛔</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Truy cập bị từ chối</h2>
                    <p className="text-gray-600 mb-6">Bạn không có quyền truy cập trang quản trị.</p>
                    <a
                        href="/dashboard"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                    >
                        Quay lại Dashboard
                    </a>
                </div>
            </div>
        );
    }

    return children;
};

export default AdminRoute;
