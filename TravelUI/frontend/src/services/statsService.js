import axios from 'axios';

const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`
});

// Interceptor attach token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const statsService = {
    // 1. Doanh thu theo thời gian
    getRevenueByTime: async (type = 'month') => {
        const response = await API.get(`/stats/revenue-by-time?type=${type}`);
        return response.data;
    },

    // 2. Doanh thu theo loại
    getRevenueByType: async () => {
        const response = await API.get('/stats/revenue-by-type');
        return response.data;
    },

    // 3. Doanh thu theo khu vực
    getRevenueByLocation: async () => {
        const response = await API.get('/stats/revenue-by-location');
        return response.data;
    },

    // 4. User growth
    getUserGrowth: async () => {
        const response = await API.get('/stats/user-growth');
        return response.data;
    },

    // 5. User behavior
    getUserBehavior: async () => {
        const response = await API.get('/stats/user-behavior');
        return response.data;
    },

    // 6. Top tours
    getTopTours: async () => {
        const response = await API.get('/stats/top-tours');
        return response.data;
    },

    // 7. Month-over-month comparison
    getMoMComparison: async () => {
        const response = await API.get('/stats/mom-comparison');
        return response.data;
    },

    // 8. Dashboard Summary (Realtime global stats)
    getSummary: async () => {
        const response = await API.get('/stats/summary');
        return response.data;
    },

    // 9. Log interactions (For client-side usages)
    logInteraction: async (action, entityId = null, entityType = 'none', metadata = {}) => {
        try {
            await API.post('/stats/interactions', { action, entityId, entityType, metadata });
        } catch (error) {
            console.error('Interaction logging failed:', error);
        }
    }
};

export default statsService;
