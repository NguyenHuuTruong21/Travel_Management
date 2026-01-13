import React from 'react';
import { FiShield, FiHeadphones, FiCreditCard, FiAward } from 'react-icons/fi';

const services = [
    {
        icon: <FiShield size={40} />,
        title: 'An toàn tuyệt đối',
        description: 'Chúng tôi cam kết đảm bảo an toàn cho mọi hành trình của bạn với bảo hiểm du lịch trọn gói.'
    },
    {
        icon: <FiHeadphones size={40} />,
        title: 'Hỗ trợ 24/7',
        description: 'Đội ngũ tư vấn viên chuyên nghiệp luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi.'
    },
    {
        icon: <FiCreditCard size={40} />,
        title: 'Thanh toán linh hoạt',
        description: 'Hỗ trợ nhiều phương thức thanh toán an toàn, nhanh chóng và tiện lợi.'
    },
    {
        icon: <FiAward size={40} />,
        title: 'Dịch vụ uy tín',
        description: 'Top 10 công ty lữ hành uy tín nhất Việt Nam với hơn 10 năm kinh nghiệm.'
    }
];

const Services = () => {
    return (
        <div className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Tại sao chọn chúng tôi?</h2>
                    <p className="text-gray-600">Những giá trị cốt lõi mà chúng tôi mang đến cho khách hàng</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all text-center group">
                            <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                {service.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Services;
