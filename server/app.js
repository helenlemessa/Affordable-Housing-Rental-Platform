const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken'); // ADD THIS

const app = express();

// Middleware
app.use(cookieParser());
app.use(cors({
  origin: ['https://affordable-housing-rental-platform.vercel.app', "http://127.0.0.1:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// [app.js](http://_vscodecontentref_/2) (or server.js) — add very carefully for testing only
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://affordable-housing-rental-platform.vercel.app');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.headers['access-control-request-private-network']) {
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/contact-requests', require('./routes/contactRequests'));
app.use('/api/notifications', require('./routes/notifications'));

const server = http.createServer(app);

// Enhanced WebSocket Server
const wss = new WebSocket.Server({ 
  server, 
  path: '/ws/notifications',
  clientTracking: true
});

// ADD WEBSOCKET AUTHENTICATION HERE:
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection attempt from:', req.socket.remoteAddress);
  
  // Extract token from query string
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  
  if (!token) {
    console.log('WebSocket connection rejected: No token provided');
    ws.close(1008, 'Authentication required');
    return;
  }
  
  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    ws.userId = decoded.id;
    console.log('WebSocket connection authenticated for user:', decoded.id);
  } catch (error) {
    console.log('WebSocket connection rejected: Invalid token');
    ws.close(1008, 'Invalid token');
    return;
  }
  
  // Heartbeat
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'mark_read') {
        // Handle mark as read via WebSocket
        console.log('Mark as read request for notification:', data.notificationId);
        // You can add database update logic here if needed
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('Client disconnected for user:', ws.userId);
  });
});

// Heartbeat interval
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// Cleanup
wss.on('close', () => clearInterval(interval));

// Broadcast function - UPDATE THIS TO SEND TO SPECIFIC USERS
// Replace the broadcastNotification function in app.js with this:
function sendToUser(userId, notification) {
  let sent = false;
  wss.clients.forEach((client) => {
    // Only send to the specific user who should receive this notification
    if (client.readyState === WebSocket.OPEN && client.userId === userId.toString()) {
      client.send(JSON.stringify(notification));
      sent = true;
      console.log(`Notification sent to user ${userId}:`, notification.message);
    }
  });
  return sent;
}

// Make it available to routes
app.locals.sendToUser = sendToUser;
app.locals.broadcastNotification = sendToUser; // Keep for backward compatibility

module.exports = { app, server };