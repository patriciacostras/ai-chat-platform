# AI Chat Platform - User Manual

## For Client Software Buyers

**Version 1.0.0**

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Requirements](#2-system-requirements)
3. [Installation Guide](#3-installation-guide)
4. [Getting Started](#4-getting-started)
5. [Features Overview](#5-features-overview)
6. [Using the AI Assistant](#6-using-the-ai-assistant)
7. [Administration](#7-administration)
8. [Troubleshooting](#8-troubleshooting)
9. [FAQ](#9-faq)
10. [Technical Specifications](#10-technical-specifications)

---

## 1. Introduction

### What is AI Chat Platform?

AI Chat Platform is an enterprise-grade real-time communication solution that combines instant messaging with artificial intelligence. It enables teams to communicate efficiently while having access to an AI assistant that can answer questions, help with coding, and provide information on demand.

### Key Benefits

- **Real-Time Communication**: Messages are delivered instantly using WebSocket technology
- **AI-Powered Assistance**: Built-in GPT-powered assistant available 24/7
- **Cloud-Ready**: Deploy anywhere - on-premises or cloud
- **Scalable**: Handles multiple concurrent users and chat rooms
- **Modern Interface**: Intuitive, responsive design works on any device

### Use Cases

- **Team Collaboration**: Create channels for different projects or departments
- **Customer Support**: AI assistant can handle common queries
- **Knowledge Sharing**: AI provides instant answers to technical questions
- **Remote Work**: Keep distributed teams connected in real-time

---

## 2. System Requirements

### Server Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 1 core | 2+ cores |
| RAM | 512 MB | 1 GB+ |
| Storage | 100 MB | 500 MB |
| Node.js | 18.x | 20.x LTS |
| Network | 10 Mbps | 100 Mbps |

### Client Requirements

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

### Network Requirements

- WebSocket support (port 443 or custom)
- HTTPS recommended for production
- Stable internet connection (1 Mbps minimum)

---

## 3. Installation Guide

### Option A: Cloud Deployment (Recommended)

#### Step 1: Deploy the Server

**Using Railway:**

1. Visit [railway.app](https://railway.app) and create an account
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository and choose the `server` folder
4. Add environment variables:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   CLIENT_URL=https://your-frontend-url.netlify.app
   ```
5. Click "Deploy" - Railway will provide a URL like `https://your-app.railway.app`

**Using Render:**

1. Visit [render.com](https://render.com) and create an account
2. Click "New" → "Blueprint"
3. Connect your repository
4. Render will detect the `render.yaml` and deploy both services

#### Step 2: Deploy the Frontend

**Using Netlify:**

1. Visit [netlify.com](https://netlify.com) and create an account
2. Click "Add new site" → "Import an existing project"
3. Connect your repository
4. Configure build settings:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`
5. Add environment variable:
   ```
   VITE_SOCKET_URL=https://your-server.railway.app
   ```
6. Click "Deploy site"

### Option B: On-Premises Installation

#### Step 1: Prepare the Server

```bash
# Install Node.js 18+
# Download from https://nodejs.org

# Clone the repository
git clone <repository-url>
cd ai-chat-platform

# Install server dependencies
cd server
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings
```

#### Step 2: Configure Environment

Edit `server/.env`:

```env
PORT=3001
OPENAI_API_KEY=sk-your-openai-api-key
CLIENT_URL=http://your-domain.com
```

#### Step 3: Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

#### Step 4: Build and Serve Frontend

```bash
cd ../client
npm install

# Configure environment
cp .env.example .env
# Edit .env: VITE_SOCKET_URL=http://your-server:3001

# Build for production
npm run build

# Serve the 'dist' folder with your web server (nginx, Apache, etc.)
```

### Option C: Docker Deployment

```bash
# Set your OpenAI API key
export OPENAI_API_KEY=sk-your-api-key

# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 4. Getting Started

### First-Time Login

1. **Open the Application**
   - Navigate to your deployed URL or `http://localhost:5173`

2. **Check Connection Status**
   - Look for the green "Connected to server" indicator
   - If red, verify the server is running

3. **Choose Your Identity**
   - Select an avatar by clicking on an emoji
   - Enter your username (1-20 characters)
   - Click "Join Chat"

### Interface Overview

```
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌─────────────────────────────────────┐ │
│  │              │  │           Room Header               │ │
│  │   Sidebar    │  ├─────────────────────────────────────┤ │
│  │              │  │                                     │ │
│  │  - Profile   │  │                                     │ │
│  │  - Channels  │  │         Message Area                │ │
│  │  - Users     │  │                                     │ │
│  │  - Status    │  │                                     │ │
│  │              │  ├─────────────────────────────────────┤ │
│  │              │  │         Message Input               │ │
│  └──────────────┘  └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Sidebar Components:**
- **Profile**: Your avatar, username, and online status
- **Channels**: List of available chat rooms with user counts
- **Online Users**: Users currently in the selected room
- **Connection Status**: WebSocket connection indicator

**Main Area Components:**
- **Room Header**: Current room name, member count, AI status
- **Message Area**: Chat history with timestamps
- **Message Input**: Text field and send button

---

## 5. Features Overview

### Chat Rooms (Channels)

**Joining a Room:**
1. Click on any channel name in the sidebar
2. The room loads with recent message history
3. Online users for that room appear in the sidebar

**Creating a Room:**
1. Click the **+** icon next to "Channels"
2. Enter a room name (e.g., "project-alpha")
3. Optionally check "Private channel"
4. Click "Create"

**Default Rooms:**
- **General**: Main discussion channel
- **Tech Talk**: Technical discussions
- **Random**: Casual conversations

### Messaging

**Sending Messages:**
- Type in the input field
- Press `Enter` or click the send button
- Messages appear instantly for all room members

**Message Features:**
- Timestamps show when messages were sent
- Date dividers separate messages by day
- Your messages appear on the right (blue)
- Others' messages appear on the left (gray)
- AI messages have a special gradient background

### Typing Indicators

When someone is typing:
- Animated dots appear below messages
- Shows username(s) of who is typing
- Automatically disappears after 2 seconds of inactivity

### Online Presence

- Green dot indicates online status
- User list updates in real-time
- See who's in each room before joining

---

## 6. Using the AI Assistant

### Activating the AI

The AI assistant responds when you mention it in your message:

**Method 1: @mention**
```
@ai What is machine learning?
```

**Method 2: Slash command**
```
/ai Explain REST APIs
```

### Example Conversations

**General Knowledge:**
```
You: @ai What are the benefits of cloud computing?
AI: Cloud computing offers several key benefits:
    1. Scalability - easily adjust resources
    2. Cost efficiency - pay only for what you use
    3. Accessibility - access from anywhere
    4. Reliability - built-in redundancy
    5. Security - enterprise-grade protection
```

**Coding Help:**
```
You: @ai How do I reverse a string in Python?
AI: Here's how to reverse a string in Python:

    # Method 1: Slicing
    reversed_str = original[::-1]
    
    # Method 2: reversed() function
    reversed_str = ''.join(reversed(original))
    
    # Method 3: Loop
    reversed_str = ''
    for char in original:
        reversed_str = char + reversed_str
```

**Conversation Context:**
The AI remembers recent messages in the room, so you can have follow-up conversations:

```
You: @ai What is WebSocket?
AI: WebSocket is a protocol providing full-duplex communication...

You: @ai How is it different from HTTP?
AI: Building on my previous explanation, the key differences are...
```

### AI Best Practices

| Do | Don't |
|-----|-------|
| Be specific in questions | Ask vague questions |
| Provide context when needed | Expect AI to know private info |
| Ask follow-up questions | Share sensitive data |
| Use for learning and productivity | Rely on it for critical decisions |

### AI Limitations

- Cannot access external websites or files
- Knowledge cutoff applies (training data limit)
- May occasionally provide incorrect information
- Cannot perform actions outside the chat

---

## 7. Administration

### Server Management

**Health Check:**
```bash
curl http://your-server:3001/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "rooms": 3,
  "users": 5
}
```

**View Active Rooms:**
```bash
curl http://your-server:3001/api/rooms
```

### Monitoring

**Server Logs:**
- Connection events: User join/leave
- Message activity: Messages sent (content not logged)
- AI requests: OpenAI API calls
- Errors: Connection issues, API failures

**Key Metrics to Monitor:**
- Active WebSocket connections
- Message throughput
- AI response times
- Memory usage

### Scaling Considerations

**Horizontal Scaling:**
- Use Redis adapter for Socket.io to share state across instances
- Load balancer with sticky sessions for WebSocket

**Vertical Scaling:**
- Increase server resources as user count grows
- Consider dedicated AI processing for high-volume usage

---

## 8. Troubleshooting

### Connection Problems

**Issue: "Connecting..." never completes**

*Causes:*
- Server not running
- Wrong server URL
- Firewall blocking WebSocket

*Solutions:*
1. Verify server is running: `curl http://server:3001/health`
2. Check `VITE_SOCKET_URL` in client environment
3. Ensure port 3001 (or configured port) is accessible
4. Check browser console for specific errors

**Issue: Frequent disconnections**

*Causes:*
- Unstable network
- Server overloaded
- Proxy timeout settings

*Solutions:*
1. Check network stability
2. Monitor server resources
3. Increase proxy timeout for WebSocket connections

### AI Issues

**Issue: AI not responding**

*Causes:*
- Invalid API key
- API quota exceeded
- Network issues to OpenAI

*Solutions:*
1. Verify `OPENAI_API_KEY` is correct
2. Check OpenAI dashboard for quota/billing
3. Review server logs for API errors

**Issue: AI responses are slow**

*Causes:*
- OpenAI API latency
- Long conversation context
- Network congestion

*Solutions:*
1. This is often normal (2-5 seconds)
2. Shorter questions get faster responses
3. Check OpenAI status page for outages

### Message Issues

**Issue: Messages not appearing**

*Causes:*
- Not joined to a room
- WebSocket disconnected
- Browser caching issues

*Solutions:*
1. Ensure you've clicked on a room
2. Check connection status indicator
3. Refresh the page (Ctrl+F5)

---

## 9. FAQ

**Q: How many users can the platform support?**
A: A single server instance can handle 100-500 concurrent users depending on hardware. For larger deployments, use horizontal scaling with Redis.

**Q: Is the chat encrypted?**
A: Messages are encrypted in transit when using HTTPS/WSS. Messages are stored in server memory only (not persisted to disk by default).

**Q: Can I customize the AI's personality?**
A: Yes, modify the system prompt in `server/src/index.js` to change the AI's behavior and tone.

**Q: How do I add more default rooms?**
A: Edit `server/src/index.js` and add more `createRoom()` calls in the initialization section.

**Q: Can I integrate with other AI providers?**
A: Yes, the AI integration is modular. You can replace the OpenAI client with other providers like Anthropic, Google, or local models.

**Q: Is there message persistence?**
A: By default, only the last 100 messages per room are kept in memory. For persistence, integrate a database like MongoDB or PostgreSQL.

**Q: Can I white-label this application?**
A: Yes, modify the branding in `client/src/App.jsx` and `client/index.html`.

---

## 10. Technical Specifications

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 React Application                    │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────┐   │   │
│  │  │   State   │  │    UI     │  │  Socket.io    │   │   │
│  │  │ Management│  │Components │  │    Client     │   │   │
│  │  └───────────┘  └───────────┘  └───────┬───────┘   │   │
│  └────────────────────────────────────────┼────────────┘   │
└───────────────────────────────────────────┼─────────────────┘
                                            │ WebSocket
                                            │ Connection
┌───────────────────────────────────────────┼─────────────────┐
│                     Server                │                  │
│  ┌────────────────────────────────────────┼────────────┐    │
│  │                 Node.js                │            │    │
│  │  ┌───────────┐  ┌───────────┐  ┌──────┴──────┐    │    │
│  │  │  Express  │  │   Room    │  │  Socket.io  │    │    │
│  │  │   HTTP    │  │  Manager  │  │   Server    │    │    │
│  │  └───────────┘  └───────────┘  └─────────────┘    │    │
│  │                       │                            │    │
│  │              ┌────────┴────────┐                  │    │
│  │              │  OpenAI Client  │                  │    │
│  │              └────────┬────────┘                  │    │
│  └───────────────────────┼───────────────────────────┘    │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTPS
                           ▼
                  ┌─────────────────┐
                  │   OpenAI API    │
                  │  (GPT-3.5-turbo)│
                  └─────────────────┘
```

### Protocol Details

**WebSocket Events:**

| Direction | Event | Purpose |
|-----------|-------|---------|
| C→S | `user:join` | Register user on server |
| C→S | `room:join` | Join a chat room |
| C→S | `room:create` | Create new room |
| C→S | `message:send` | Send chat message |
| C→S | `typing:start` | Notify typing started |
| C→S | `typing:stop` | Notify typing stopped |
| S→C | `rooms:list` | Send available rooms |
| S→C | `room:joined` | Confirm room join with data |
| S→C | `message:new` | Broadcast new message |
| S→C | `typing:start` | Broadcast typing indicator |
| S→C | `users:online` | Update online user list |

### Data Structures

**User Object:**
```javascript
{
  id: "socket-id-123",
  username: "JohnDoe",
  avatar: "😀",
  status: "online",
  joinedAt: "2024-01-15T10:00:00.000Z"
}
```

**Message Object:**
```javascript
{
  id: "uuid-v4",
  roomId: "room-uuid",
  userId: "socket-id-123",
  username: "JohnDoe",
  avatar: "😀",
  content: "Hello, world!",
  timestamp: "2024-01-15T10:05:00.000Z",
  type: "user" // or "ai"
}
```

**Room Object:**
```javascript
{
  id: "uuid-v4",
  name: "General",
  isPrivate: false,
  users: ["socket-id-1", "socket-id-2"],
  createdAt: "2024-01-15T09:00:00.000Z"
}
```

---

## Support Contact

For technical support or feature requests, please contact your system administrator or open an issue in the project repository.

---

*Document Version: 1.0.0*
*Last Updated: February 2025*
