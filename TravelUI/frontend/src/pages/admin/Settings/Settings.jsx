import React, { useState, useEffect, useCallback } from 'react';
import { FiSettings as FiSettingsIcon, FiSave, FiActivity } from 'react-icons/fi';
import adminService from '../../../services/adminService';

const Settings = () => {
    const [settings, setSettings] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('settings');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        const result = await adminService.getSettings();
        if (result.error) {
            console.error('Error:', result.error);
            setSettings([]);
        } else {
            setSettings(result.data || result || []);
        }
        setLoading(false);
    }, []);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        const result = await adminService.getSystemLogs({ page, limit: 20 });
        if (result.error) {
            console.error('Error:', result.error);
            setLogs([]);
        } else {
            setLogs(result.data || []);
            setTotalPages(result.totalPages || 1);
        }
        setLoading(false);
    }, [page]);

    useEffect(() => {
        if (activeTab === 'settings') {
            fetchSettings();
        } else {
            fetchLogs();
        }
    }, [activeTab, fetchSettings, fetchLogs]);

    const handleUpdateSetting = async (key, value) => {
        const result = await adminService.updateSetting({ key, value });
        if (result.error) {
            alert('Lỗi: ' + result.error);
        } else {
            alert('Cập nhật thành công!');
            fetchSettings();
        }
    };

    const renderLogDetails = (log) => {
        if (!log.details) return <span className="text-gray-400">-</span>;

        // Handle Setting Updates
        if (log.action === 'UPDATE_SETTING' || log.action === 'CREATE_SETTING') {
            return (
                <div className="text-xs">
                    <div className="font-semibold text-gray-700">{log.details.key}</div>
                    {log.details.oldValue !== undefined && (
                        <div className="text-gray-500">
                            <span className="text-red-500 line-through mr-1">{String(log.details.oldValue)}</span>
                            <span>&rarr;</span>
                            <span className="text-green-600 ml-1 font-medium">{String(log.details.newValue || log.details.value)}</span>
                        </div>
                    )}
                </div>
            );
        }

        // Handle User Ban
        if (log.action === 'BAN_USER' || log.action === 'UNBAN_USER') {
            return (
                <div className="text-xs">
                    <div>User: <span className="font-medium">{log.details.userEmail}</span></div>
                    {log.details.reason && <div className="text-gray-500 italic">"{log.details.reason}"</div>}
                </div>
            );
        }

        // Default
        return (
            <div className="text-xs text-gray-500 break-all max-w-xs">
                {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)}
            </div>
        );
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Cài đặt hệ thống</h1>
                <p className="text-gray-600">Quản lý cài đặt và xem system logs</p>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'settings'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <FiSettingsIcon className="inline mr-2" />
                            Cài đặt
                        </button>
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'logs'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <FiActivity className="inline mr-2" />
                            System Logs
                        </button>
                    </nav>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'settings' ? (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        </div>
                    ) : settings.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {settings.map((setting) => (
                                <div key={setting._id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 mr-4">
                                            <h3 className="text-sm font-medium text-gray-900">{setting.key}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{setting.description || 'No description'}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                defaultValue={setting.value}
                                                onBlur={(e) => {
                                                    if (e.target.value !== setting.value) {
                                                        handleUpdateSetting(setting.key, e.target.value);
                                                    }
                                                }}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 w-64"
                                            />
                                            <button
                                                onClick={() => handleUpdateSetting(setting.key, document.querySelector(`input[defaultValue="${setting.value}"]`).value)}
                                                className="p-2 text-indigo-600 hover:text-indigo-900"
                                            >
                                                <FiSave size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            Chưa có cài đặt nào
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chi tiết</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người thực hiện</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {logs.map((log) => (
                                            <tr key={log._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {renderLogDetails(log)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {log.actor?.fullName || log.actor?.email || 'System'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{log.ipAddress || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                    <div className="text-sm text-gray-700">
                                        Trang {page} / {totalPages}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Trước
                                        </button>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Settings;
