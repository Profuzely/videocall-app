const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve the frontend web page
app.use(express.static('public'));

let waitingUser = null;

io.on('connection', (socket) => {
  // When a user provides their PeerJS ID
  socket.on('join', (peerId) => {
    socket.peerId = peerId;

    if (waitingUser && waitingUser.id !== socket.id) {
      // If someone is already waiting, pair them up!
      socket.emit('match', { peerToCall: waitingUser.peerId });
      waitingUser = null;
    } else {
      // If no one is waiting, wait for the next person
      waitingUser = socket;
      socket.emit('waiting');
    }
  });

  socket.on('disconnect', () => {
    if (waitingUser && waitingUser.id === socket.id) {
      waitingUser = null;
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});