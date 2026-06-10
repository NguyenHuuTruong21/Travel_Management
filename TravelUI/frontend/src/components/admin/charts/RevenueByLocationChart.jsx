import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import statsService from '../../../services/statsService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RevenueByLocationChart = () => {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const res = await statsService.getRevenueByLocation();
            if (res.success && res.data) {
                const labels = res.data.map(item => item._id || 'Khác');
                const dataValues = res.data.map(item => item.revenue);

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Doanh thu (VNĐ)',
                            data: dataValues,
                            backgroundColor: 'rgba(99, 102, 241, 0.8)', // indigo-500
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
            <h3 className="font-bold text-gray-800 mb-4">Doanh thu theo điểm khởi hành (Top 10)</h3>
            <div className="h-[250px] w-full">
                {chartData ? (
                    <Bar 
                        data={chartData} 
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            indexAxis: 'y', // Xoay ngang biểu đồ cho dễ đọc chữ
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { 
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

export default RevenueByLocationChart;
