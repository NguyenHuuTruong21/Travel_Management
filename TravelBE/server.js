require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require('http');

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const bookingRoutes = require('./routes/bookings');
const errorHandler = require("./middlewares/errorHandler");
const createSocket = require('./config/socket');
const notification = require('./utils/notification');

const app = express();

app.use(cors());
app.use(express.json());

// connect DB
connectDB();

// routes
app.use("/api/auth", authRoutes);

const tourRoutes = require('./routes/tours');
app.use('/api/tours', tourRoutes);
app.use('/api/bookings', bookingRoutes);

const hotelRoutes = require('./routes/hotels');
app.use('/api/hotels', hotelRoutes);

const guideRoutes = require('./routes/guides');
app.use('/api/guides', guideRoutes);

const vehicleRoutes = require('./routes/vehicles');
app.use('/api/vehicles', vehicleRoutes);

const reviewRoutes = require('./routes/reviews');
app.use('/api/reviews', reviewRoutes);

const reportRoutes = require('./routes/reports');
app.use('/api/reports', reportRoutes);

const notificationRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const postRoutes = require('./routes/posts');
app.use('/api/posts', postRoutes);

const bannerRoutes = require('./routes/banners'); // Banners also missing public route
app.use('/api/banners', bannerRoutes);

const promotionRoutes = require('./routes/promotions');
app.use('/api/promotions', promotionRoutes);

const contactRoutes = require('./routes/contact');
app.use('/api/contacts', contactRoutes);


// static uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// error handler
app.use(errorHandler);

// create http server and socket.io
const server = http.createServer(app);
const io = createSocket(server);

// iinit notification util with io
notification.init(io);

// socket connection - optional: log and allow join
io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);
  socket.on('join', ({ userId }) => {
    if (userId) socket.join(`user:${userId}`);
  });
  socket.on('leave', (data) => {
    if (data && data.userId) socket.leave(`user:${data.userId}`);
  });
  socket.on('disconnect', () => {
    // console.log('Socket disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server chạy tại PORT ${PORT}`));
