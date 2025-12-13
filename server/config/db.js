const mongoose = require('mongoose');

const connectDB = async () => {
  // Close any existing connections to prevent zombie states
  await mongoose.disconnect(); 

  // Enhanced connection settings
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // 5s to select server
    socketTimeoutMS: 45000, // 45s before closing sockets
    maxPoolSize: 5, // Limit connections
    minPoolSize: 1,
    retryWrites: true,
    retryReads: true,
    waitQueueTimeoutMS: 10000 // 10s max wait for connection
  });

  // Event listeners for connection health
  mongoose.connection.on('connected', () => 
    console.log('MongoDB connected:', mongoose.connection.host));
  
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
    // Auto-reconnect after 5s
    setTimeout(connectDB, 5000); 
  });

  mongoose.connection.on('disconnected', () => 
    console.log('MongoDB disconnected!'));
};

// Crash the app if can't reconnect after 3 attempts
let retries = 0;
mongoose.connection.on('reconnectFailed', () => {
  console.error('MongoDB reconnection failed!');
  if (retries++ >= 3) process.exit(1);
});

module.exports = connectDB;