const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
const httpServer = createServer(app);

// CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize Supabase Admin client for JWT verification
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Store user socket mappings: userId -> socketId
const userSocketMap = new Map();
// Store socket to user mappings: socketId -> userId
const socketUserMap = new Map();
// Store user rooms: userId -> Set of matchIds
const userRooms = new Map();

// Middleware to authenticate socket connections
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify JWT token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return next(new Error('Invalid authentication token'));
    }

    // Attach user info to socket
    socket.userId = user.id;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

// Socket connection handler
io.on('connection', (socket) => {
  const userId = socket.userId;
  console.log(`User connected: ${userId} (socket: ${socket.id})`);

  // Store socket mapping
  userSocketMap.set(userId, socket.id);
  socketUserMap.set(socket.id, userId);
  userRooms.set(userId, new Set());

  // Handle joining a conversation room
  socket.on('join_conversation', (data) => {
    try {
      const { matchId } = data;
      
      if (!matchId) {
        socket.emit('error', { message: 'matchId is required' });
        return;
      }

      // Join the room
      socket.join(`conversation:${matchId}`);
      
      // Track the room for this user
      const rooms = userRooms.get(userId) || new Set();
      rooms.add(matchId);
      userRooms.set(userId, rooms);

      console.log(`User ${userId} joined conversation: ${matchId}`);
      socket.emit('joined_conversation', { matchId });
    } catch (error) {
      console.error('Error joining conversation:', error);
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  });

  // Handle leaving a conversation room
  socket.on('leave_conversation', (data) => {
    try {
      const { matchId } = data;
      
      if (!matchId) {
        return;
      }

      // Leave the room
      socket.leave(`conversation:${matchId}`);
      
      // Remove from tracking
      const rooms = userRooms.get(userId);
      if (rooms) {
        rooms.delete(matchId);
      }

      console.log(`User ${userId} left conversation: ${matchId}`);
      socket.emit('left_conversation', { matchId });
    } catch (error) {
      console.error('Error leaving conversation:', error);
    }
  });

  // Handle sending a message
  socket.on('send_message', async (data) => {
    try {
      const { matchId, receiverId, message } = data;

      if (!matchId || !receiverId || !message) {
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }

      // Get receiver's socket ID
      const receiverSocketId = userSocketMap.get(receiverId);

      if (receiverSocketId) {
        // Emit to the receiver with the full message object
        io.to(receiverSocketId).emit('receive_message', {
          matchId,
          senderId: userId,
          message: message, // Full Message object
          timestamp: new Date().toISOString(),
        });
        console.log(`Message sent from ${userId} to ${receiverId} in match ${matchId}`);
      } else {
        console.log(`Receiver ${receiverId} is not connected`);
      }

      // Confirm to sender
      socket.emit('message_sent', {
        matchId,
        receiverId,
        success: true,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    try {
      const { matchId, receiverId, isTyping } = data;

      if (!matchId || !receiverId) {
        return;
      }

      // Get receiver's socket ID
      const receiverSocketId = userSocketMap.get(receiverId);

      if (receiverSocketId) {
        // Emit to the receiver
        io.to(receiverSocketId).emit('typing', {
          matchId,
          userId,
          isTyping,
        });
      }
    } catch (error) {
      console.error('Error handling typing event:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId} (socket: ${socket.id})`);
    
    // Clean up mappings
    userSocketMap.delete(userId);
    socketUserMap.delete(socket.id);
    userRooms.delete(userId);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.SOCKET_PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});

