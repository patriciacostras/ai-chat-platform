import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { 
  Send, 
  Users, 
  MessageSquare, 
  Plus, 
  Settings, 
  LogOut,
  Hash,
  Lock,
  Bot,
  Wifi,
  WifiOff,
  Sparkles,
  Moon,
  Sun
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import clsx from 'clsx';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

const AVATARS = ['😀', '😎', '🚀', '💻', '🎮', '🎨', '🎵', '📚', '🌟', '🔥', '💡', '🦊', '🐱', '🐶', '🦁', '🐼'];

function App() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isPrivateRoom, setIsPrivateRoom] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', avatar: '😀' });
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('rooms:list', (roomsList) => {
      setRooms(roomsList);
    });

    newSocket.on('rooms:update', (roomsList) => {
      setRooms(roomsList);
    });

    newSocket.on('room:joined', ({ room, messages: roomMessages, onlineUsers: roomUsers }) => {
      setCurrentRoom(room);
      setMessages(roomMessages);
      setOnlineUsers(roomUsers);
      setTypingUsers([]);
    });

    newSocket.on('room:userJoined', ({ user: joinedUser }) => {
      setOnlineUsers(prev => {
        if (prev.find(u => u.id === joinedUser.id)) return prev;
        return [...prev, joinedUser];
      });
    });

    newSocket.on('room:userLeft', ({ user: leftUser }) => {
      setOnlineUsers(prev => prev.filter(u => u.id !== leftUser.id));
      setTypingUsers(prev => prev.filter(u => u.id !== leftUser.id));
    });

    newSocket.on('message:new', (message) => {
      setMessages(prev => [...prev, message]);
      setTypingUsers(prev => prev.filter(u => u.id !== message.userId));
    });

    newSocket.on('typing:start', ({ user: typingUser }) => {
      setTypingUsers(prev => {
        if (prev.find(u => u.id === typingUser.id)) return prev;
        return [...prev, typingUser];
      });
    });

    newSocket.on('typing:stop', ({ userId }) => {
      setTypingUsers(prev => prev.filter(u => u.id !== userId));
    });

    newSocket.on('users:online', (users) => {
      setOnlineUsers(users);
    });

    newSocket.on('room:created', (room) => {
      setShowCreateRoom(false);
      setNewRoomName('');
      newSocket.emit('room:join', room.id);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginData.username.trim() || !socket) return;

    const userData = {
      username: loginData.username.trim(),
      avatar: loginData.avatar
    };

    setUser(userData);
    socket.emit('user:join', userData);
    setShowLogin(false);
  };

  const handleJoinRoom = (roomId) => {
    if (!socket) return;
    socket.emit('room:join', roomId);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket || !currentRoom) return;

    socket.emit('message:send', {
      roomId: currentRoom.id,
      content: inputMessage.trim()
    });

    socket.emit('typing:stop', { roomId: currentRoom.id });
    setInputMessage('');
    inputRef.current?.focus();
  };

  const handleTyping = (e) => {
    setInputMessage(e.target.value);
    
    if (!socket || !currentRoom) return;

    socket.emit('typing:start', { roomId: currentRoom.id });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { roomId: currentRoom.id });
    }, 2000);
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!newRoomName.trim() || !socket) return;

    socket.emit('room:create', {
      name: newRoomName.trim(),
      isPrivate: isPrivateRoom
    });
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    }
    return format(date, 'MMM d, HH:mm');
  };

  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentDate = null;

    messages.forEach((message) => {
      const messageDate = format(new Date(message.timestamp), 'yyyy-MM-dd');
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({ type: 'date', date: new Date(message.timestamp) });
      }
      groups.push({ type: 'message', ...message });
    });

    return groups;
  };

  const formatDateDivider = (date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  if (showLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/20 mb-4">
              <Bot className="w-8 h-8 text-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">AI Chat Platform</h1>
            <p className="text-dark-400">Real-time chat with AI assistant</p>
          </div>

          <div className={clsx(
            "flex items-center gap-2 px-3 py-2 rounded-lg mb-6",
            connected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
          )}>
            {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="text-sm">{connected ? 'Connected to server' : 'Connecting...'}</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-dark-300 text-sm font-medium mb-2">
                Choose your avatar
              </label>
              <div className="grid grid-cols-8 gap-2">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setLoginData(prev => ({ ...prev, avatar }))}
                    className={clsx(
                      "w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all",
                      loginData.avatar === avatar
                        ? "bg-primary-500 ring-2 ring-primary-400 scale-110"
                        : "bg-dark-700 hover:bg-dark-600"
                    )}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-dark-300 text-sm font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                maxLength={20}
                required
              />
            </div>

            <button
              type="submit"
              disabled={!connected || !loginData.username.trim()}
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-dark-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Join Chat
            </button>
          </form>

          <p className="text-center text-dark-500 text-sm mt-6">
            Type <code className="bg-dark-700 px-2 py-1 rounded">@ai</code> to chat with AI assistant
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 bg-dark-900/50 border-r border-dark-700 flex flex-col">
        {/* User Profile */}
        <div className="p-4 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-2xl">
              {user?.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">{user?.username}</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-dark-400 text-sm">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rooms List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-dark-400 text-xs font-semibold uppercase tracking-wider">Channels</h4>
              <button
                onClick={() => setShowCreateRoom(true)}
                className="p-1 hover:bg-dark-700 rounded transition-colors"
              >
                <Plus className="w-4 h-4 text-dark-400" />
              </button>
            </div>
            <div className="space-y-1">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => handleJoinRoom(room.id)}
                  className={clsx(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left",
                    currentRoom?.id === room.id
                      ? "bg-primary-500/20 text-primary-400"
                      : "text-dark-300 hover:bg-dark-700 hover:text-white"
                  )}
                >
                  {room.isPrivate ? (
                    <Lock className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <Hash className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="flex-1 truncate">{room.name}</span>
                  {room.userCount > 0 && (
                    <span className="text-xs bg-dark-600 px-2 py-0.5 rounded-full">
                      {room.userCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Online Users */}
          <div className="p-4 border-t border-dark-700">
            <h4 className="text-dark-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Online — {onlineUsers.length}
            </h4>
            <div className="space-y-2">
              {onlineUsers.map((onlineUser) => (
                <div key={onlineUser.id} className="flex items-center gap-2 px-2 py-1">
                  <div className="relative">
                    <span className="text-lg">{onlineUser.avatar}</span>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-dark-900"></span>
                  </div>
                  <span className={clsx(
                    "text-sm truncate",
                    onlineUser.isBot ? "text-primary-400" : "text-dark-300"
                  )}>
                    {onlineUser.username}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="p-4 border-t border-dark-700">
          <div className={clsx(
            "flex items-center gap-2 text-sm",
            connected ? "text-green-400" : "text-red-400"
          )}>
            {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {connected ? 'Connected' : 'Reconnecting...'}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            {/* Room Header */}
            <div className="h-16 px-6 border-b border-dark-700 flex items-center justify-between bg-dark-900/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  {currentRoom.isPrivate ? (
                    <Lock className="w-5 h-5 text-primary-400" />
                  ) : (
                    <Hash className="w-5 h-5 text-primary-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-white font-semibold">{currentRoom.name}</h2>
                  <p className="text-dark-400 text-sm">{currentRoom.users?.length || 0} members</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-primary-500/10 rounded-full">
                  <Bot className="w-4 h-4 text-primary-400" />
                  <span className="text-primary-400 text-sm">AI Ready</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {groupMessagesByDate(messages).map((item, index) => {
                if (item.type === 'date') {
                  return (
                    <div key={`date-${index}`} className="flex items-center gap-4 my-6">
                      <div className="flex-1 h-px bg-dark-700"></div>
                      <span className="text-dark-500 text-xs font-medium">
                        {formatDateDivider(item.date)}
                      </span>
                      <div className="flex-1 h-px bg-dark-700"></div>
                    </div>
                  );
                }

                const isAI = item.type === 'ai';
                const isOwnMessage = item.userId === socket?.id;

                return (
                  <div
                    key={item.id}
                    className={clsx(
                      "message-enter flex gap-3",
                      isOwnMessage && "flex-row-reverse"
                    )}
                  >
                    <div className={clsx(
                      "w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0",
                      isAI ? "bg-gradient-to-br from-primary-500 to-purple-500" : "bg-dark-700"
                    )}>
                      {item.avatar}
                    </div>
                    <div className={clsx(
                      "max-w-[70%]",
                      isOwnMessage && "text-right"
                    )}>
                      <div className={clsx(
                        "flex items-baseline gap-2 mb-1",
                        isOwnMessage && "flex-row-reverse"
                      )}>
                        <span className={clsx(
                          "font-semibold text-sm",
                          isAI ? "text-primary-400" : "text-white"
                        )}>
                          {item.username}
                        </span>
                        <span className="text-dark-500 text-xs">
                          {formatMessageTime(item.timestamp)}
                        </span>
                      </div>
                      <div className={clsx(
                        "px-4 py-2.5 rounded-2xl",
                        isAI 
                          ? "ai-message rounded-tl-sm" 
                          : isOwnMessage
                            ? "bg-primary-500 text-white rounded-tr-sm"
                            : "bg-dark-700 text-dark-100 rounded-tl-sm"
                      )}>
                        <p className="whitespace-pre-wrap break-words">{item.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicators */}
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-3 text-dark-400">
                  <div className="typing-indicator flex gap-1">
                    <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                    <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                    <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                  </div>
                  <span className="text-sm">
                    {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-dark-700 bg-dark-900/30">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={handleTyping}
                    placeholder={`Message #${currentRoom.name} — Type @ai for AI assistant`}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all pr-12"
                  />
                  {inputMessage.toLowerCase().includes('@ai') && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Bot className="w-5 h-5 text-primary-400" />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-dark-600 disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-dark-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Select a channel</h3>
              <p className="text-dark-400">Choose a channel from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Create New Channel</h3>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Channel Name
                </label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g., project-discussion"
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                  maxLength={30}
                  required
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivateRoom}
                  onChange={(e) => setIsPrivateRoom(e.target.checked)}
                  className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-dark-300">Private channel</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateRoom(false)}
                  className="flex-1 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newRoomName.trim()}
                  className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-dark-600 text-white rounded-lg transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
