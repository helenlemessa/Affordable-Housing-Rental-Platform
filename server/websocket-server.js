// websocket-server.js
const WebSocket = require('ws');
const http = require('http');

// Create HTTP server (optional, for health checks)
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('WebSocket Server Running');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server, path: '/ws/notifications' });

// Store all connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('New client connected');

  ws.on('message', (message) => {
    console.log('Received:', message);
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

// Function to broadcast notifications
function broadcastNotification(notification) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
    }
  });
}

// Start server
const PORT = process.env.WS_PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}/ws/notifications`);
});

// Export for use in other backend files
module.exports = { broadcastNotification };