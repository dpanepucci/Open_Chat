import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import bcrypt from 'bcrypt';
import Database from 'better-sqlite3';

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

const db = new Database('./database.db');


db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
)`);

app.use(cors({ origin: isProd ? clientOrigin : 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send(
    `Hello World!.`
  );
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const hashed = await bcrypt.hash(password, 10);
  try {
    db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, hashed);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: 'Email already in use' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ ok: true, username: user.username });
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