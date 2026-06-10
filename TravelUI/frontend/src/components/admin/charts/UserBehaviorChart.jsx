import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import statsService from '../../../services/statsService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UserBehaviorChart = () => {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const res = await statsService.getUserBehavior();
            if (res.success && res.data) {
                const actionLabels = {
                    view_tour: 'Bấm xem Tour',
                    view_hotel: 'Xem Khách sạn',
                    search: 'Tìm kiếm',
                    click_booking: 'Click Đặt Tour',
                    complete_booking: 'Thanh toán thành công',
                    cancel_booking: 'Hủy đơn'
                };

                const labels = res.data.map(item => actionLabels[item._id] || item._id);
                const dataValues = res.data.map(item => item.count);

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Lượt tương tác',
                            data: dataValues,
                            backgroundColor: 'rgba(56, 189, 248, 0.7)', // sky-400
                            borderRadius: 4
                        }
                    ]
                });
            }
        };
        fetchData();
    }, []);

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h3 className="font-bold text-gray-800 mb-4">Hành vi người dùng</h3>
            <div className="h-[250px] w-full">
                {chartData ? (
                    <Bar 
                        data={chartData} 
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                y: { beginAtZero: true }
                            }
                        }} 
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-400 text-sm">Đang tải biểu đồ...</div>
                )}
            </div>
        </div>
    );
};

export default UserBehaviorChart;
