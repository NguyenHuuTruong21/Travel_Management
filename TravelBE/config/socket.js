// Export a function to attach socket.io to server
module.exports = (server) => {
  const io = require('socket.io')(server, {
    cors: { origin: process.env.CLIENT_URL || '*' }
  });

  // on connection: join a room for the user if client emits 'join'
  io.on('connection', (socket) => {
    socket.on('join', (data) => {
      // data = { userId }
      if (data && data.userId) socket.join(`user:${data.userId}`);
    });
    socket.on('leave', (data) => {
      if (data && data.userId) socket.leave(`user:${data.userId}`);
    });
  });

  return io;
};