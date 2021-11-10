let io;

/** This let us share the socket IO instance across the app */
module.exports = {
  init: httpServer => {
    /** For the version installed is need it to set the cors headers */
    io = require('socket.io')(httpServer, {
      cors: {
        origin: "*",
        methods: "*",
        Headers: "*"
      }
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.IO not initialized')
    }
    return io;
  }
}