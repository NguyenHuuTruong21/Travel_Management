import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

API.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ==================== USERS ====================
export const getUsers = async (params = {}) => {
    try {
        const res = await API.get('/admin/users', { params });
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const banUser = async (userId, reason) => {
    try {
        const res = await API.put(`/admin/users/${userId}/ban`, { reason });
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

// ==================== TOURS ====================
export const getTours = async (params = {}) => {
    try {
        const res = await API.get('/tours/admin', { params });
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const getTour = async (id) => {
    try {
        const res = await API.get(`/tours/${id}`);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const createTour = async (formData) => {
    try {
        const res = await API.post('/tours', formData);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const updateTour = async (id, formData) => {
    try {
        const res = await API.put(`/tours/${id}`, formData);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const deleteTour = async (id) => {
    try {
        const res = await API.delete(`/tours/${id}`);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

// ==================== HOTELS ====================
export const getHotels = async (params = {}) => {
    try {
        const res = await API.get('/hotels', { params });
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const getHotel = async (id) => {
    try {
        const res = await API.get(`/hotels/${id}`);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const createHotel = async (data) => {
    try {
        const res = await API.post('/hotels', data);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const updateHotel = async (id, data) => {
    try {
        const res = await API.put(`/hotels/${id}`, data);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const deleteHotel = async (id) => {
    try {
        const res = await API.delete(`/hotels/${id}`);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

// ==================== GUIDES ====================
export const getGuides = async (params = {}) => {
    try {
        const res = await API.get('/guides', { params });
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const getGuide = async (id) => {
    try {
        const res = await API.get(`/guides/${id}`);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const createGuide = async (formData) => {
    try {
        const res = await API.post('/guides', formData);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const updateGuide = async (id, formData) => {
    try {
        const res = await API.put(`/guides/${id}`, formData);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const deleteGuide = async (id) => {
    try {
        const res = await API.delete(`/guides/${id}`);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

// ==================== VEHICLES ====================
export const getVehicles = async (params = {}) => {
    try {
        const res = await API.get('/vehicles', { params });
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const getVehicle = async (id) => {
    try {
        const res = await API.get(`/vehicles/${id}`);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const createVehicle = async (formData) => {
    try {
        const res = await API.post('/vehicles', formData);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const updateVehicle = async (id, formData) => {
    try {
        const res = await API.put(`/vehicles/${id}`, formData);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const deleteVehicle = async (id) => {
    try {
        const res = await API.delete(`/vehicles/${id}`);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

// ==================== BOOKINGS ====================
export const getBookings = async (params = {}) => {
    try {
        const res = await API.get('/bookings/admin', { params });
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const getBookingDetail = async (id) => {
    try {
        const res = await API.get(`/bookings/${id}`);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const updateBookingStatus = async (id, status) => {
    try {
        const res = await API.put(`/bookings/${id}/status`, { status });
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

// ==================== CMS - BANNERS ====================
export const getBanners = async () => {
    try {
        const res = await API.get('/admin/banners');
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const createBanner = async (data) => {
    try {
        const res = await API.post('/admin/banners', data);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const updateBanner = async (id, data) => {
    try {
        const res = await API.put(`/admin/banners/${id}`, data);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const deleteBanner = async (id) => {
    try {
        const res = await API.delete(`/admin/banners/${id}`);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

// ==================== CMS - POSTS ====================
export const getPosts = async () => {
    try {
        const res = await API.get('/admin/posts');
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const createPost = async (data) => {
    try {
        const res = await API.post('/admin/posts', data);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const updatePost = async (id, data) => {
    try {
        const res = await API.put(`/admin/posts/${id}`, data);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const deletePost = async (id) => {
    try {
        const res = await API.delete(`/admin/posts/${id}`);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

// ==================== REVIEWS ====================
export const getReviews = async (params = {}) => {
    try {
        const res = await API.get('/admin/reviews', { params });
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

// ==================== CMS - PROMOTIONS ====================
export const getPromotions = async () => {
    try {
        const res = await API.get('/admin/promotions');
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const createPromotion = async (data) => {
    try {
        const res = await API.post('/admin/promotions', data);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const updatePromotion = async (id, data) => {
    try {
        const res = await API.put(`/admin/promotions/${id}`, data);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const deletePromotion = async (id) => {
    try {
        const res = await API.delete(`/admin/promotions/${id}`);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

// ==================== REPORTS ====================
export const getRevenueReport = async (params = {}) => {
    try {
        const res = await API.get('/reports/revenue', { params });
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const getCustomerReport = async (params = {}) => {
    try {
        const res = await API.get('/reports/customers', { params });
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const getServiceReport = async (params = {}) => {
    try {
        const res = await API.get('/reports/services', { params });
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

// ==================== SETTINGS ====================
export const getSettings = async () => {
    try {
        const res = await API.get('/admin/settings');
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const updateSetting = async (data) => {
    try {
        const res = await API.put('/admin/settings', data);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

// ==================== SYSTEM LOGS ====================
export const getSystemLogs = async (params = {}) => {
    try {
        const res = await API.get('/admin/logs', { params });
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

// ==================== CONTACTS ====================
export const getContacts = async () => {
    try {
        const res = await API.get('/contacts');
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const replyContact = async (id, response) => {
    try {
        const res = await API.put(`/contacts/${id}`, { response });
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

export const deleteContact = async (id) => {
    try {
        const res = await API.delete(`/contacts/${id}`);
        return res.data;
    } catch (err) {
        return { error: err.response?.data?.message || err.message };
    }
};

const adminService = {
    getUsers, banUser,
    getTours, getTour, createTour, updateTour, deleteTour,
    getHotels, getHotel, createHotel, updateHotel, deleteHotel,
    getGuides, getGuide, createGuide, updateGuide, deleteGuide,
    getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle,
    getBookings, getBookingDetail, updateBookingStatus,
    getBanners, createBanner, updateBanner, deleteBanner,
    getPosts, createPost, updatePost, deletePost,
    getReviews,
    getPromotions, createPromotion, updatePromotion, deletePromotion,
    getRevenueReport, getCustomerReport, getServiceReport,
    getSettings, updateSetting,
    getSystemLogs,
    getContacts, replyContact, deleteContact
};

export default adminService;
