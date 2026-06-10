import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import statsService from '../../../services/statsService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const UserGrowthChart = () => {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const res = await statsService.getUserGrowth();
            if (res.success && res.data) {
                const labels = res.data.map(item => item._id);
                const dataValues = res.data.map(item => item.users);

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Người dùng mới',
                            data: dataValues,
                            borderColor: 'rgb(16, 185, 129)', // emerald-500
                            backgroundColor: 'rgba(16, 185, 129, 0.2)',
                            tension: 0.4,
                            fill: true,
                        }
                    ]
                });
            }
        };
        fetchData();
    }, []);

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h3 className="font-bold text-gray-800 mb-4">Tăng trưởng người dùng</h3>
            <div className="h-[250px] w-full">
                {chartData ? (
                    <Line 
                        data={chartData} 
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                y: { beginAtZero: true, ticks: { precision: 0 } }
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

export default UserGrowthChart;
