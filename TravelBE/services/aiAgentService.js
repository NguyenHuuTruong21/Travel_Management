const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIAgentService {
    /**
     * Dùng Gemini LLM để generate câu chào dẫn dắt giải thích tại sao gợi ý các tour này.
     * @param {*} userContext 
     * @param {*} topTours 
     */
    static async explainRecommendations(userContext, topTours) {
        // Nếu không cài KEY hoặc báo lỗi, fallback trả về string tĩnh (vẫn đảm bảo luồng chạy mượt).
        if (!process.env.GEMINI_API_KEY) {
            return "Hệ thống AI vừa phân tích lịch sử sở thích của bạn và lọc ra các tour du lịch phù hợp nhất trong tầm ngân sách dưới đây.";
        }

        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const tourSummaries = topTours.map(t => `- Tour: ${t.tour.name} | Giá: ${t.tour.price} VND | Lý do quét được: ${t.explanationTags.join(', ')}`).join('\n');
            const budgetText = userContext.budget ? `${userContext.budget} VNĐ` : 'linh hoạt';
            const interestsText = userContext.interests ? userContext.interests : 'khám phá tự do';

            const prompt = `
Bạn là một chuyên gia tư vấn du lịch thông minh, thân thiện.
Khách hàng vừa yêu cầu gợi ý tour.
Ngữ cảnh của khách: 
- Ngân sách: ${budgetText}
- Sở thích/Từ khoá: ${interestsText}

Dựa trên thuật toán cốt lõi, tôi đã trích xuất ra các Tour này (KHÔNG được liệt kê lại tên Tour trong câu trả lời):
${tourSummaries}

YÊU CẦU:
Hãy viết một đoạn giới thiệu ngắn (tối đa 3 câu) bằng tiếng Việt thật tự nhiên (như người thật đang chat). 
Nhiệm vụ của đoạn này là "chào" và "giải thích" TÓM TẮT lý do tại sao hệ thống lại gợi ý những tour này.
Ví dụ: "Chào bạn, dựa trên sở thích du lịch và ngân sách bạn đề xuất, tôi nhận thấy bạn thích biển. Vì vậy tôi gợi ý..."
TUYỆT ĐỐI KHÔNG liệt kê cụ thể tên tour, vì giao diện UI sẽ hiển thị bộ Thẻ (Cards) ngay bên dưới đoạn text của bạn.
            `;

            // Cắt giảm Timeout xuống 3s để App phản hồi nhanh hơn (Tránh user phải đợi lâu)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Gemini Timeout")), 3000)
            );

            const result = await Promise.race([
                model.generateContent(prompt),
                timeoutPromise
            ]);

            return result.response.text().trim();
        } catch (error) {
            console.error("Gemini Explanation Error:", error.message);
            // Fallback tĩnh liền mạch cực nhanh
            return "Hệ thống đã chọn lọc hoàn tất. Đây là các đề xuất tối ưu nhất dựa theo những khu vực bạn quan tâm và thông tin ngân sách hiện tại!";
        }
    }
}

module.exports = AIAgentService;
