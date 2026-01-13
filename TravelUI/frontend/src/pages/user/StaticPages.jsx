import React from 'react';
import { FiChevronDown, FiShield, FiFileText, FiHelpCircle } from 'react-icons/fi';

const FAQPage = () => {
    const faqs = [
        {
            question: "Làm thế nào để đặt tour?",
            answer: "Bạn có thể đặt tour trực tiếp trên website bằng cách chọn tour mong muốn, chọn ngày khởi hành và số lượng người, sau đó tiến hành thanh toán."
        },
        {
            question: "Chính sách hủy tour như thế nào?",
            answer: "Bạn có thể hủy tour miễn phí trước 7 ngày khởi hành. Hủy từ 3-7 ngày sẽ chịu phí 50%, và hủy trong vòng 3 ngày sẽ không được hoàn tiền."
        },
        {
            question: "Tôi có thể thay đổi thông tin đặt chỗ không?",
            answer: "Có, vui lòng liên hệ với bộ phận hỗ trợ khách hàng của chúng tôi ít nhất 48 giờ trước giờ khởi hành để được hỗ trợ thay đổi."
        },
        {
            question: "Hình thức thanh toán nào được chấp nhận?",
            answer: "Chúng tôi chấp nhận thanh toán qua thẻ tín dụng/ghi nợ (Visa, Mastercard), chuyển khoản ngân hàng và ví điện tử Momo/ZaloPay."
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-3xl mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
                        <FiHelpCircle size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Câu hỏi thường gặp</h1>
                    <p className="mt-2 text-gray-600">Giải đáp những thắc mắc phổ biến nhất của bạn</p>
                </div>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
                                <p className="text-gray-600">{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const PolicyPage = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 bg-white rounded-xl shadow-sm p-8">
                <div className="text-center mb-10 border-b border-gray-100 pb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                        <FiShield size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Chính sách bảo mật</h1>
                    <p className="mt-2 text-gray-600 cursor-text">Cập nhật lần cuối: 01/12/2025</p>
                </div>
                <div className="prose max-w-none text-gray-600">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">1. Thu thập thông tin</h3>
                    <p className="mb-6">Chúng tôi thu thập thông tin cá nhân khi bạn đăng ký, đặt tour hoặc đăng ký nhận bản tin. Các thông tin bao gồm tên, email, số điện thoại và địa chỉ.</p>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">2. Sử dụng thông tin</h3>
                    <p className="mb-6">Thông tin của bạn được sử dụng để xử lý đơn đặt hàng, cải thiện dịch vụ khách hàng và gửi các thông tin khuyến mãi nếu bạn đồng ý.</p>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">3. Bảo vệ thông tin</h3>
                    <p className="mb-6">Chúng tôi thực hiện nhiều biện pháp bảo mật để duy trì sự an toàn của thông tin cá nhân của bạn. Dữ liệu nhạy cảm được mã hóa và truyền qua công nghệ SSL.</p>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">4. Chia sẻ thông tin</h3>
                    <p>Chúng tôi không bán, trao đổi hoặc chuyển giao thông tin cá nhân của bạn cho bên thứ ba, ngoại trừ các đối tác tin cậy hỗ trợ vận hành website và dịch vụ của chúng tôi.</p>
                </div>
            </div>
        </div>
    );
};

const TermsPage = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 bg-white rounded-xl shadow-sm p-8">
                <div className="text-center mb-10 border-b border-gray-100 pb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-full mb-4">
                        <FiFileText size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Điều khoản sử dụng</h1>
                </div>
                <div className="prose max-w-none text-gray-600">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">1. Giới thiệu</h3>
                    <p className="mb-6">Chào mừng bạn đến với TravelManagement. Khi truy cập website này, bạn đồng ý tuân thủ các điều khoản và điều kiện sau đây.</p>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">2. Quyền sở hữu trí tuệ</h3>
                    <p className="mb-6">Tất cả nội dung trên website này bao gồm văn bản, đồ họa, logo, hình ảnh là tài sản của TravelManagement và được bảo vệ bởi luật bản quyền.</p>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">3. Trách nhiệm người dùng</h3>
                    <p className="mb-6">Bạn chịu trách nhiệm về mọi hoạt động diễn ra dưới tài khoản của mình. Bạn đồng ý không sử dụng website cho bất kỳ mục đích bất hợp pháp nào.</p>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">4. Thay đổi điều khoản</h3>
                    <p>Chúng tôi có quyền thay đổi, chỉnh sửa các điều khoản này vào bất kỳ lúc nào mà không cần thông báo trước. Việc bạn tiếp tục sử dụng website sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các thay đổi đó.</p>
                </div>
            </div>
        </div>
    );
};

export { FAQPage, PolicyPage, TermsPage };
