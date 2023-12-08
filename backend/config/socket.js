const socketIo = require('socket.io');

let io;

module.exports = {
  init: server => {
    io = socketIo(server, {
      cors: {
        origin: ["https://afg.modawn.ai", "http://localhost:3000"], // Update the protocol to HTTPS
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // You can also add your Socket.IO event handling here
    io.on('connection', socket => {


      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });

      // Additional event handling as needed...
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};