const RecommendationService = require('../services/recommendationService');
const AIAgentService = require('../services/aiAgentService');

exports.getRecommendations = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null; // Support cả khi có/không có Auth (Gợi ý Guest)
        const { budget, interests } = req.query;

        // 1. Chạy Core Recommendation Algorithm
        const recommenderParams = { budget, interests };
        const topTours = await RecommendationService.generateRecommendations(userId, recommenderParams);

        // 2. Chạy LLM Agent để sinh lời dẫn
        // Trích xuất list kết quả sang format nhẹ hơn để tránh làm phình prompt cho LLM
        const agentPromptContext = topTours.map(t => ({
            tour: { name: t.tour.name, price: t.tour.price },
            explanationTags: t.explanationTags
        }));

        const explanationText = await AIAgentService.explainRecommendations(
            { budget, interests },
            agentPromptContext
        );

        // 3. Trả về Frontend
        res.status(200).json({
            success: true,
            aiExplanation: explanationText,
            data: topTours.map(t => t.tour) // Chỉ cần trả về tour object để frontend render component
            // (Thực tế có thể trả về cả score, tags để frontend show label "Phù hợp ngân sách")
        });

    } catch (error) {
        console.error("Recommendation Controller Error:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống Gợi ý AI" });
    }
};
