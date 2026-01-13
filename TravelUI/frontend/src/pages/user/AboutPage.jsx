import React from 'react';
import { FiUsers, FiAward, FiMap, FiHeart } from 'react-icons/fi';

const AboutPage = () => {
    return (
        <div className="bg-white">
            {/* Hero Banner */}
            <div className="relative h-[400px]">
                <img
                    src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80"
                    alt="Travel About"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                        <h1 className="text-5xl font-bold mb-4">Về Chúng Tôi</h1>
                        <p className="text-xl max-w-2xl mx-auto">Hành trình khám phá thế giới bắt đầu từ đây</p>
                    </div>
                </div>
            </div>

            {/* Our Story */}
            <div className="py-20 container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Câu Chuyện Của Chúng Tôi</h2>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            Được thành lập vào năm 2015, TravelManagement bắt đầu với một sứ mệnh đơn giản: giúp mọi người khám phá vẻ đẹp của thế giới một cách dễ dàng và trọn vẹn nhất.
                        </p>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            Từ một nhóm nhỏ những người đam mê du lịch, chúng tôi đã phát triển thành một trong những công ty lữ hành hàng đầu, phục vụ hàng ngàn khách hàng mỗi năm với các tour du lịch đa dạng trong và ngoài nước.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Chúng tôi tin rằng mỗi chuyến đi không chỉ là việc di chuyển từ nơi này đến nơi khác, mà là cơ hội để trải nghiệm văn hóa, kết nối con người và tạo ra những kỷ niệm vô giá.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <img src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Team" className="rounded-lg shadow-lg w-full h-64 object-cover mt-8" />
                        <img src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Trip" className="rounded-lg shadow-lg w-full h-64 object-cover" />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="bg-blue-600 py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                        <div>
                            <div className="text-4xl font-bold mb-2">10+</div>
                            <div className="text-blue-200">Năm Kinh Nghiệm</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">50k+</div>
                            <div className="text-blue-200">Khách Hàng Hài Lòng</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">100+</div>
                            <div className="text-blue-200">Điểm Đến</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">24/7</div>
                            <div className="text-blue-200">Hỗ Trợ Khách Hàng</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why Choose Us */}
            <div className="py-20 container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Tại Sao Chọn Chúng Tôi?</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">Chúng tôi cam kết mang đến những trải nghiệm du lịch tốt nhất với dịch vụ chuyên nghiệp và tận tâm.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: <FiAward size={32} />, title: "Dịch Vụ Hàng Đầu", desc: "Cam kết chất lượng dịch vụ tốt nhất cho từng chuyến đi." },
                        { icon: <FiMap size={32} />, title: "Lịch Trình Đa Dạng", desc: "Thiết kế tour linh hoạt phù hợp với mọi nhu cầu." },
                        { icon: <FiUsers size={32} />, title: "Hướng Dẫn Viên", desc: "Đội ngũ HDV chuyên nghiệp, am hiểu địa phương." },
                        { icon: <FiHeart size={32} />, title: "Giá Cả Hợp Lý", desc: "Mức giá cạnh tranh đi kèm nhiều ưu đãi hấp dẫn." }
                    ].map((item, index) => (
                        <div key={index} className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4 shadow-sm">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-600 text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
