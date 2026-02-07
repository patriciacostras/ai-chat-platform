require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());


const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const rooms = new Map();
const users = new Map();
const messageHistory = new Map();

const AI_BOT = {
  id: 'ai-assistant',
  username: 'AI Assistant',
  avatar: '🤖',
  isBot: true
};

function createRoom(name, isPrivate = false) {
  const roomId = uuidv4();
  const room = {
    id: roomId,
    name,
    isPrivate,
    users: new Set(),
    createdAt: new Date().toISOString()
  };
  rooms.set(roomId, room);
  messageHistory.set(roomId, []);
  return room;
}

createRoom('General', false);
createRoom('Tech Talk', false);
createRoom('Random', false);

async function getAIResponse(message, roomId) {
  try {
    const history = messageHistory.get(roomId) || [];
    const recentMessages = history.slice(-10).map(msg => ({
      role: msg.userId === AI_BOT.id ? 'assistant' : 'user',
      content: `${msg.username}: ${msg.content}`
    }));

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful AI assistant in a chat room. Be friendly, concise, and helpful. 
                    You can help with coding questions, general knowledge, and casual conversation.
                    Keep responses under 200 words unless more detail is specifically requested.`
        },
        ...recentMessages,
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return 'Sorry, I encountered an error processing your request. Please try again.';
  }
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('user:join', (userData) => {
    const user = {
      id: socket.id,
      username: userData.username,
      avatar: userData.avatar || '👤',
      status: 'online',
      joinedAt: new Date().toISOString()
    };
    users.set(socket.id, user);
    
    socket.emit('rooms:list', Array.from(rooms.values()).map(room => ({
      ...room,
      users: Array.from(room.users),
      userCount: room.users.size
    })));
    
    io.emit('users:online', Array.from(users.values()));
    console.log(`User joined: ${user.username}`);
  });

  socket.on('room:join', (roomId) => {
    const user = users.get(socket.id);
    const room = rooms.get(roomId);
    
    if (!user || !room) return;

    socket.rooms.forEach(r => {
      if (r !== socket.id) {
        socket.leave(r);
        const oldRoom = rooms.get(r);
        if (oldRoom) {
          oldRoom.users.delete(socket.id);
          io.to(r).emit('room:userLeft', { roomId: r, user });
        }
      }
    });

    socket.join(roomId);
    room.users.add(socket.id);

    const history = messageHistory.get(roomId) || [];
    socket.emit('room:joined', {
      room: { ...room, users: Array.from(room.users) },
      messages: history.slice(-50),
      onlineUsers: Array.from(room.users).map(id => users.get(id)).filter(Boolean)
    });

    socket.to(roomId).emit('room:userJoined', { roomId, user });
    
    io.emit('rooms:update', Array.from(rooms.values()).map(r => ({
      ...r,
      users: Array.from(r.users),
      userCount: r.users.size
    })));
  });

  socket.on('room:create', ({ name, isPrivate }) => {
    const room = createRoom(name, isPrivate);
    io.emit('rooms:list', Array.from(rooms.values()).map(r => ({
      ...r,
      users: Array.from(r.users),
      userCount: r.users.size
    })));
    socket.emit('room:created', room);
  });

  socket.on('message:send', async ({ roomId, content }) => {
    const user = users.get(socket.id);
    if (!user || !content.trim()) return;

    const message = {
      id: uuidv4(),
      roomId,
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      type: 'user'
    };

    const history = messageHistory.get(roomId) || [];
    history.push(message);
    if (history.length > 100) history.shift();
    messageHistory.set(roomId, history);

    io.to(roomId).emit('message:new', message);

    if (content.toLowerCase().includes('@ai') || content.toLowerCase().startsWith('/ai ')) {
      const query = content.replace(/@ai/gi, '').replace(/^\/ai\s*/i, '').trim();
      
      io.to(roomId).emit('typing:start', { roomId, user: AI_BOT });
      
      const aiResponse = await getAIResponse(query || content, roomId);
      
      io.to(roomId).emit('typing:stop', { roomId, userId: AI_BOT.id });
      
      const aiMessage = {
        id: uuidv4(),
        roomId,
        userId: AI_BOT.id,
        username: AI_BOT.username,
        avatar: AI_BOT.avatar,
        content: aiResponse,
        timestamp: new Date().toISOString(),
        type: 'ai'
      };

      history.push(aiMessage);
      messageHistory.set(roomId, history);
      
      io.to(roomId).emit('message:new', aiMessage);
    }
  });

  socket.on('typing:start', ({ roomId }) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(roomId).emit('typing:start', { roomId, user });
    }
  });

  socket.on('typing:stop', ({ roomId }) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(roomId).emit('typing:stop', { roomId, userId: user.id });
    }
  });

  socket.on('user:status', (status) => {
    const user = users.get(socket.id);
    if (user) {
      user.status = status;
      io.emit('users:online', Array.from(users.values()));
    }
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      rooms.forEach((room, roomId) => {
        if (room.users.has(socket.id)) {
          room.users.delete(socket.id);
          io.to(roomId).emit('room:userLeft', { roomId, user });
        }
      });
      
      users.delete(socket.id);
      io.emit('users:online', Array.from(users.values()));
      console.log(`User disconnected: ${user.username}`);
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    rooms: rooms.size,
    users: users.size
  });
});

app.get('/api/rooms', (req, res) => {
  res.json(Array.from(rooms.values()).map(room => ({
    ...room,
    users: Array.from(room.users),
    userCount: room.users.size
  })));
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 AI Chat Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
  console.log(`🤖 AI Assistant powered by OpenAI`);
});
