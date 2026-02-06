# AI Chat Platform

A real-time chat application with AI assistant integration, built with WebSocket technology and deployed to the cloud.

![Platform Overview](docs/images/screenshot.png)

## 🎯 Project Overview

**AI Chat Platform** is a modern, real-time communication system that combines:

1. **Socket-based Client-Server Architecture** - Real-time bidirectional communication using WebSockets (Socket.io)
2. **Public Web Service Integration** - OpenAI GPT API for intelligent AI assistant responses
3. **Cloud Deployment** - Hosted on Railway/Render for global accessibility

---

## ✨ Features

### Real-Time Communication
- **Instant Messaging** - Messages delivered in real-time via WebSocket connections
- **Multiple Chat Rooms** - Create and join different channels for organized conversations
- **Typing Indicators** - See when other users are typing
- **Online Presence** - View who's currently online in each room
- **Message History** - Access recent conversation history when joining rooms

### AI Assistant
- **Intelligent Responses** - Powered by OpenAI GPT-3.5-turbo
- **Context-Aware** - AI considers recent conversation history for relevant responses
- **Easy Activation** - Simply type `@ai` or `/ai` followed by your question
- **Coding Help** - Get assistance with programming questions
- **General Knowledge** - Ask about any topic

### User Experience
- **Modern UI** - Beautiful dark theme with glass morphism effects
- **Responsive Design** - Works on desktop and mobile devices
- **Avatar Selection** - Choose from 16 emoji avatars
- **Connection Status** - Real-time connection indicator
- **Auto-Reconnection** - Automatic reconnection on connection loss

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLOUD (Railway/Render)                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    WebSocket Server                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│  │  │   Socket.io │  │   Express   │  │  OpenAI Client  │  │   │
│  │  │   Server    │  │   REST API  │  │                 │  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │   │
│  │         │                │                   │           │   │
│  │         └────────────────┼───────────────────┘           │   │
│  │                          │                               │   │
│  └──────────────────────────┼───────────────────────────────┘   │
│                             │                                    │
│                    WebSocket Connection                          │
│                             │                                    │
│  ┌──────────────────────────┼───────────────────────────────┐   │
│  │              React Frontend (Netlify/Vercel)              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│  │  │  Socket.io  │  │    React    │  │   TailwindCSS   │  │   │
│  │  │   Client    │  │ Components  │  │      UI         │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   OpenAI API      │
                    │   (GPT-3.5-turbo) │
                    └───────────────────┘
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Backend** | Node.js + Express | HTTP server and REST endpoints |
| **WebSocket** | Socket.io | Real-time bidirectional communication |
| **AI Service** | OpenAI API | Intelligent chat responses |
| **Frontend** | React 18 | User interface components |
| **Styling** | TailwindCSS | Modern, responsive design |
| **Build Tool** | Vite | Fast development and bundling |
| **Cloud** | Railway/Render | Server hosting with WebSocket support |
| **Static Host** | Netlify/Vercel | Frontend deployment |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Git installed

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-chat-platform
   ```

2. **Setup the server**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

3. **Setup the client**
   ```bash
   cd ../client
   npm install
   cp .env.example .env
   # Edit .env if needed (default: http://localhost:3001)
   ```

4. **Start the server**
   ```bash
   cd ../server
   npm run dev
   ```

5. **Start the client** (in a new terminal)
   ```bash
   cd client
   npm run dev
   ```

6. **Open the application**
   - Navigate to `http://localhost:5173`
   - Enter a username and select an avatar
   - Join a chat room and start messaging!

---

## 📖 User Guide

### Getting Started

1. **Login Screen**
   - Select an avatar from the emoji grid
   - Enter your desired username (max 20 characters)
   - Click "Join Chat" to enter the platform

2. **Navigating the Interface**
   - **Left Sidebar**: Channel list and online users
   - **Main Area**: Chat messages and input
   - **Header**: Current room info and AI status

### Sending Messages

1. Select a channel from the sidebar
2. Type your message in the input field
3. Press Enter or click the Send button

### Using the AI Assistant

The AI assistant can help with questions, coding, and general conversation.

**Method 1: @mention**
```
@ai What is the capital of France?
```

**Method 2: Command**
```
/ai Explain how WebSockets work
```

**Tips for better AI responses:**
- Be specific in your questions
- Provide context when needed
- Ask follow-up questions for clarification

### Creating Channels

1. Click the **+** button next to "Channels"
2. Enter a channel name
3. Optionally mark as private
4. Click "Create"

### Understanding Status Indicators

| Indicator | Meaning |
|-----------|---------|
| 🟢 Green dot | User is online |
| Typing animation | Someone is typing |
| "Connected" | WebSocket connection active |
| "Reconnecting..." | Connection lost, attempting to reconnect |

---

## ☁️ Cloud Deployment

### Option 1: Railway (Recommended for Server)

1. Create account at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Create new project from repo
4. Select the `server` directory
5. Add environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `CLIENT_URL`: Your frontend URL (after deploying client)
6. Deploy!

### Option 2: Render

1. Create account at [render.com](https://render.com)
2. Use the included `render.yaml` blueprint
3. Connect repository and deploy both services
4. Add `OPENAI_API_KEY` in environment settings

### Frontend Deployment (Netlify)

1. Create account at [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Set build settings:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`
4. Add environment variable:
   - `VITE_SOCKET_URL`: Your deployed server URL
5. Deploy!

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individually
cd server && docker build -t ai-chat-server .
cd client && docker build -t ai-chat-client .
```

---

## 🔧 Configuration

### Server Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `CLIENT_URL` | Allowed CORS origin | `http://localhost:5173` |

### Client Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_SOCKET_URL` | WebSocket server URL | `http://localhost:3001` |

---

## 📡 API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/api/rooms` | List all chat rooms |

### WebSocket Events

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `user:join` | `{ username, avatar }` | Join the platform |
| `room:join` | `roomId` | Join a chat room |
| `room:create` | `{ name, isPrivate }` | Create new room |
| `message:send` | `{ roomId, content }` | Send a message |
| `typing:start` | `{ roomId }` | Start typing indicator |
| `typing:stop` | `{ roomId }` | Stop typing indicator |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `rooms:list` | `Room[]` | List of available rooms |
| `room:joined` | `{ room, messages, onlineUsers }` | Joined room data |
| `message:new` | `Message` | New message received |
| `typing:start` | `{ roomId, user }` | User started typing |
| `typing:stop` | `{ roomId, userId }` | User stopped typing |
| `users:online` | `User[]` | Online users update |

---

## 🔒 Security Considerations

- API keys are stored in environment variables, never in code
- CORS is configured to allow only specified origins
- WebSocket connections are authenticated per session
- Input is sanitized before processing
- Rate limiting recommended for production

---

## 🐛 Troubleshooting

### Connection Issues

**Problem**: "Connecting..." never changes to "Connected"
- Verify the server is running
- Check `VITE_SOCKET_URL` matches server address
- Ensure no firewall blocking WebSocket connections

**Problem**: Messages not sending
- Check browser console for errors
- Verify you've joined a room
- Ensure WebSocket connection is active

### AI Not Responding

**Problem**: AI doesn't reply to @ai messages
- Verify `OPENAI_API_KEY` is set correctly
- Check server logs for API errors
- Ensure you have API credits available

---

## 📄 License

MIT License - See LICENSE file for details.

---

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review server and browser console logs
3. Open an issue on GitHub

---

## 🤝 Example

For issues or questions:
1. Check the troubleshooting section
2. Review server and browser console logs
3. Open an issue on GitHub

---