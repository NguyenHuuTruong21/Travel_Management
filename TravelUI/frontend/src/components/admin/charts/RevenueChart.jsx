import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import statsService from '../../../services/statsService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const RevenueChart = () => {
    const [chartData, setChartData] = useState(null);
    const [filter, setFilter] = useState('month'); // day, month, year

    useEffect(() => {
        const fetchData = async () => {
            const res = await statsService.getRevenueByTime(filter);
            if (res.success && res.data) {
                const labels = res.data.map(item => item._id);
                const dataValues = res.data.map(item => item.revenue);

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Doanh thu (VNĐ)',
                            data: dataValues,
                            borderColor: 'rgb(79, 70, 229)', // text-indigo-600
                            backgroundColor: 'rgba(79, 70, 229, 0.5)',
                            tension: 0.3,
                            fill: true,
                        }
                    ]
                });
            }
        };
        fetchData();
    }, [filter]);

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Biểu đồ doanh thu</h3>
                <select 
                    value={filter} 
                    onChange={e => setFilter(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-gray-50 text-gray-600 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="day">Theo Ngày</option>
                    <option value="month">Theo Tháng</option>
                    <option value="year">Theo Năm</option>
                </select>
            </div>
            <div className="h-72 w-full">
                {chartData ? (
                    <Line 
                        data={chartData} 
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        callback: (value) => {
                                            if (value >= 1e9) return (value / 1e9) + 'B';
                                            if (value >= 1e6) return (value / 1e6) + 'M';
                                            return value;
                                        }
                                    }
                                }
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

export default RevenueChart;
