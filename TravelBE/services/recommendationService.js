const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const Interaction = require('../models/Interaction');

/**
 * CORE RECOMMENDATION ENGINE (Hybrid Scoring)
 * Xây dựng Scoring Model: Content-based + Collaborative
 * 
 * - Lịch sử User (Content): Bookings, Tương tác (View, Search)
 * - Yêu cầu hiện tại (Context): Budget, Sở thích text
 * - Global Metrics (Collaborative): Rating trung bình, Số lượng đã bán
 */
class RecommendationService {

    // Hàm chuẩn hoá chuỗi để so sánh NLP đơn giản
    static normalizeText(text) {
        if (!text) return '';
        return text.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Xóa dấu tiếng Việt
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    }

    // Extract footprint từ lịch sử
    static async getUserFootprint(userId) {
        if (!userId) return null;

        const footprint = { locations: new Set(), queryKeywords: new Set() };

        // 1. Phân tích Bookings (Đã mua là tín hiệu mạnh nhất)
        const pastBookings = await Booking.find({ user: userId, status: { $in: ['Paid', 'Confirmed', 'Completed'] } }).populate('tour');
        pastBookings.forEach(b => {
            if (b.tour && b.tour.startLocation) footprint.locations.add(this.normalizeText(b.tour.startLocation));
            if (b.tour && b.tour.location && b.tour.location.address) footprint.locations.add(this.normalizeText(b.tour.location.address));
        });

        // 2. Phân tích Interactions (Lịch sử tìm kiếm, xem tour)
        const recentInteractions = await Interaction.find({ user: userId }).sort({ createdAt: -1 }).limit(20);
        recentInteractions.forEach(int => {
            if (int.action === 'search' && int.metadata.query) {
                const words = this.normalizeText(int.metadata.query).split(' ');
                words.forEach(w => { if (w.length > 2) footprint.queryKeywords.add(w) });
            }
        });

        return {
            locations: Array.from(footprint.locations),
            queryKeywords: Array.from(footprint.queryKeywords)
        };
    }

    /**
     * Compute "Match Score"
     * Điểm số từ 0 -> Cao (Không giới hạn cứng trên, nhưng dùng để sort)
     */
    static async generateRecommendations(userId, params) {
        const { budget, interests } = params; // budget: number, interests: string (e.g. "biển đà nẵng")

        let userFootprint = { locations: [], queryKeywords: [] };
        if (userId) {
            userFootprint = await this.getUserFootprint(userId);
        }

        const inputKeywords = interests ? this.normalizeText(interests).split(' ').filter(w => w.length > 2) : [];
        const targetBudget = budget ? parseInt(budget) : null;

        // Fetch toàn bộ Tour đang active để tính toán (vì mảng nhỏ, có thể load all. Nếu scale lớn thì filter pre-DB)
        const allTours = await Tour.find({ status: 'active' }).select('name description startLocation location price averageRating bookedSeats images duration');

        const scoredTours = allTours.map(tour => {
            let score = 0;
            let explanationTags = []; // Cho AI context

            const tourSearchText = this.normalizeText(`${tour.name} ${tour.description} ${tour.startLocation}`);

            // 1. Collaborative Data (Phân tích toàn cầu - Weight 20%)
            // - Mỗi sao = 3 điểm
            if (tour.averageRating > 0) {
                score += tour.averageRating * 3;
            }
            // - Tour phổ biến (Cứ 10 ghế đã bán = 1 điểm, tối đa 10)
            const popScore = Math.min((tour.bookedSeats || 0) / 10, 10);
            score += popScore;
            if (popScore > 5) explanationTags.push('Bán chạy');

            // 2. Content-based: Phân tích theo Lịch sử User (History Match - Weight 30%)
            let matchedHistory = false;
            userFootprint.locations.forEach(loc => {
                if (tourSearchText.includes(loc)) {
                    score += 15;
                    matchedHistory = true;
                }
            });
            if (matchedHistory) explanationTags.push('Phù hợp lịch sử đến');

            // 3. User Current Request: Budget Match (Khoản chi - Weight 25%)
            if (targetBudget) {
                if (tour.price <= targetBudget) {
                    score += 25; // Phù hợp ngân sách hoàn toàn
                    explanationTags.push('Đúng ngân sách');
                } else if (tour.price <= targetBudget * 1.2) {
                    score += 10; // Hơi cao nhưng tạm chấp nhận (+20%)
                    explanationTags.push('Ngân sách linh hoạt');
                } else {
                    score -= 50; // Trừng phạt nặng nếu vượt quá nhiều
                }
            }

            // 4. User Current Request: Keyword Match (NLP - Weight 25%)
            let keywordMatches = 0;
            inputKeywords.forEach(kw => {
                if (tourSearchText.includes(kw)) {
                    score += 20; // Trọng số cực cao cho explicitly input
                    keywordMatches++;
                }
            });

            userFootprint.queryKeywords.forEach(kw => {
                if (tourSearchText.includes(kw)) {
                    score += 5; // Trọng số nhẹ cho lịch sử search cũ
                }
            });

            if (keywordMatches > 0) explanationTags.push('Đúng sở thích T.K/Khám phá');

            return {
                tour,
                score,
                explanationTags: Array.from(new Set(explanationTags))
            };
        });

        // Filter out tours with extreme negative scores (Way out of budget)
        const validTours = scoredTours.filter(t => t.score > 0);

        // Sort descending
        validTours.sort((a, b) => b.score - a.score);

        // Return Top 5
        const top5 = validTours.slice(0, 5);
        return top5;
    }
}

module.exports = RecommendationService;
