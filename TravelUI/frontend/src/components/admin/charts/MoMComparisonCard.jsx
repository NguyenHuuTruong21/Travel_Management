import React, { useState, useEffect } from 'react';
import statsService from '../../../services/statsService';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

const MoMComparisonCard = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchMoM = async () => {
            const res = await statsService.getMoMComparison();
            if (res.success && res.data) {
                setStats(res.data);
            }
        };
        fetchMoM();
    }, []);

    if (!stats) return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center h-full">
            <span className="text-sm text-gray-400">Đang tải...</span>
        </div>
    );

    const renderChange = (value) => {
        if (value > 0) return <span className="flex items-center text-emerald-600 text-sm font-bold bg-emerald-50 px-2 py-0.5 rounded-full"><FiTrendingUp className="mr-1" /> +{value}%</span>;
        if (value < 0) return <span className="flex items-center text-red-600 text-sm font-bold bg-red-50 px-2 py-0.5 rounded-full"><FiTrendingDown className="mr-1" /> {value}%</span>;
        return <span className="flex items-center text-gray-500 text-sm font-bold bg-gray-100 px-2 py-0.5 rounded-full"><FiMinus className="mr-1" /> 0%</span>;
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col justify-center">
            <h3 className="font-bold text-gray-800 mb-6 text-lg">So sánh Tháng Nay vs Tháng Trước</h3>
            
            <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-50">
                    <p className="text-sm text-gray-500 mb-1 font-medium">Doanh thu tháng này</p>
                    <p className="text-2xl font-black text-indigo-700 mb-2">
                        {stats.thisMonth.revenue.toLocaleString()}đ
                    </p>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">So với tháng trước</span>
                        {renderChange(stats.revenueChange)}
                    </div>
                </div>

                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-50">
                    <p className="text-sm text-gray-500 mb-1 font-medium">Đơn hàng (Booking)</p>
                    <p className="text-2xl font-black text-amber-700 mb-2">
                        {stats.thisMonth.bookingsCount}
                    </p>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">So với tháng trước</span>
                        {renderChange(stats.bookingsChange)}
                    </div>
                </div>
            </div>
            
            <p className="text-[11px] text-gray-400 mt-6 text-center italic">
                * Dữ liệu chỉ tính các đơn hàng đã thanh toán và hệ thống xác nhận.
            </p>
        </div>
    );
};

export default MoMComparisonCard;
