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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại PORT ${PORT}`));
