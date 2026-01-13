// Export a function to attach socket.io to server
module.exports = (server) => {
  const io = require('socket.io')(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('join', ({ userId }) => {
      if (userId) socket.join(`user:${userId}`);
    });

    socket.on('leave', ({ userId }) => {
      if (userId) socket.leave(`user:${userId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return io;
};
