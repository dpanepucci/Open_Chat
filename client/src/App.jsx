import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000');

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [connectionError, setConnectionError] = useState('');
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const rooms = ['general', 'sports', 'music'];

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      setConnectionError('');
    };
    const onDisconnect = () => setIsConnected(false);
    const onConnectError = (err) => {
      setConnectionError(err?.message || 'Socket connection failed');
    };

    socket.on('chat message', (payload) => {
      setMessages((prev) => [...prev, payload]);
    });
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    // Sync local UI with current transport state and trigger connect if needed.
    setIsConnected(socket.connected);
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off('chat message');
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, []);

  const joinRoom = (roomName) => {
    setRoom(roomName);
    socket.emit('join_room', roomName);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!room || !message.trim() || !username.trim()) return;
    socket.emit('chat message', {
      room,
      text: message,
      user: username.trim(),
    });
    setMessage('');
  };

  return (
    <>
      <h1>Open Chat</h1>
      <p>Status: {isConnected ? 'connected' : 'disconnected'}</p>
      {connectionError && <p>Socket error: {connectionError}</p>}

      <div>
        <p>Your name:</p>
        <input
          className="username-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Type your name"
        />
      </div>

      <div>
        <p>Select a room:</p>
        {rooms.map((r) => (
          <button key={r} onClick={() => joinRoom(r)}>
            Join {r}
          </button>
        ))}
      </div>

      <p>Current room: {room || 'none selected'}</p>

      <aside>
        <form onSubmit={sendMessage}>
          <textarea
            className="message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={room ? `Message #${room}` : 'Select a room first'}
          />
          <br />
          <button className="send-button" type="submit" disabled={!room || !username.trim()}>
            Send
          </button>
        </form>
      </aside>

      <section className="chat-feed">
        <h2>Messages</h2>
        <ul className="messages-list">
          {messages.map((m, i) => (
            <li key={i} className="message-item">
              <span className="message-room">#{m.room}</span>
              <span className="message-author">{m.user || 'Anonymous'}:</span>
              <span className="message-text">{m.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default App;
