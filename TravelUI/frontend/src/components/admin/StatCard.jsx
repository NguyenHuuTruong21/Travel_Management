import React from 'react';

const StatCard = ({ icon: Icon, title, value, change, color = 'indigo' }) => {
    const colorClasses = {
        indigo: 'from-indigo-500 to-indigo-600',
        purple: 'from-purple-500 to-purple-600',
        green: 'from-green-500 to-green-600',
        blue: 'from-blue-500 to-blue-600',
        yellow: 'from-yellow-500 to-yellow-600',
        red: 'from-red-500 to-red-600',
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-800">{value}</p>
                    {change && (
                        <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% so với tháng trước
                        </p>
                    )}
                </div>
                <div className={`p-4 rounded-full bg-gradient-to-br ${colorClasses[color]} text-white`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
};

export default StatCard;
