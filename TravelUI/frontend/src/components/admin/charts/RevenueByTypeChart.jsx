import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import statsService from '../../../services/statsService';

ChartJS.register(ArcElement, Tooltip, Legend);

const RevenueByTypeChart = () => {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const res = await statsService.getRevenueByType();
            if (res.success && res.data) {
                const typeLabels = { tour: 'Tour Du Lịch', hotel: 'Khách sạn', car: 'Thuê xe' };
                const labels = res.data.map(item => typeLabels[item._id] || item._id);
                const dataValues = res.data.map(item => item.revenue);

                setChartData({
                    labels,
                    datasets: [
                        {
                            data: dataValues,
                            backgroundColor: [
                                'rgba(79, 70, 229, 0.8)', // indigo-600
                                'rgba(16, 185, 129, 0.8)', // emerald-500
                                'rgba(245, 158, 11, 0.8)'  // amber-500
                            ],
                            borderWidth: 0,
                            hoverOffset: 4
                        }
                    ]
                });
            }
        };
        fetchData();
    }, []);

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <h3 className="font-bold text-gray-800 mb-4">Cơ cấu doanh thu</h3>
            <div className="flex-1 flex justify-center items-center w-full min-h-[200px] relative">
                {chartData ? (
                    <Doughnut 
                        data={chartData} 
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } }
                            },
                            cutout: '65%'
                        }} 
                    />
                ) : (
                    <div className="text-gray-400 text-sm">Đang tải biểu đồ...</div>
                )}
            </div>
        </div>
    );
};

export default RevenueByTypeChart;
