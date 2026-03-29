import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const isProd = process.env.NODE_ENV === 'production';
const io = new Server(server, {
  cors: {
    origin: isProd ? clientOrigin : true,
    methods: ['GET', 'POST'],
  },
});

app.get('/', (req, res) => {
  res.send(
    `Open Chat backend is running. In development, open ${clientOrigin} for the React app.`
  );
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join_room', (roomName, ack) => {
    socket.join(roomName);
    console.log(`User ${socket.id} joined room: ${roomName}`);
    if (typeof ack === 'function') {
      ack({ ok: true, room: roomName });
    }
  });

  socket.on('chat message', (payload) => {
    const room = payload?.room;
    const text = payload?.text;
    const user = payload?.user;
    if (!room) return;
    if (!text) return;
    io.to(room).emit('chat message', {
      room,
      text,
      user: user || 'Anonymous',
      sender: socket.id,
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(port, () => {
    console.log(`Listening on port http://localhost:${port}`);
});