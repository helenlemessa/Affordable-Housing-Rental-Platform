const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const { app, server } = require('./app');

// Remove deprecated options and use modern connection
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,  // 5 second timeout
    socketTimeoutMS: 45000,         // 45 second socket timeout
    maxPoolSize: 10                 // Connection pool size
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    // Set Mongoose options after connection
    mongoose.set('strictQuery', true);
  })
  .catch(err => {
    console.error("❌ DB connection failed:", err.message);
    console.log("Retrying connection in 5 seconds...");
    setTimeout(connectWithRetry, 5000);
  });
};

// Error handlers
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

connectWithRetry();
const diagnoseDB = async () => {
  try {
    // 1. Verify environment variables
    console.log("Verifying MongoDB URI:", process.env.MONGO_URI ? "Exists" : "MISSING");
    
    // 2. Test basic network connectivity
    const atlasHost = new URL(process.env.MONGO_URI).hostname;
    require('dns').resolve(atlasHost, (err) => {
      console.log(err ? `❌ Cannot resolve ${atlasHost}` : `✅ DNS resolution works for ${atlasHost}`);
    });

    // 3. Attempt raw TCP connection
    const net = require('net');
    const socket = net.createConnection(27017, atlasHost, () => {
      console.log("✅ Raw TCP connection successful");
      socket.destroy();
    });
    socket.on('error', (e) => console.log("❌ TCP connection failed:", e.message));

    // 4. Full Mongoose connection
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log("✅ MongoDB connection successful");
  } catch (err) {
    console.error("❌ Diagnostic failed:", err.message);
    if (err.message.includes("ETIMEOUT")) {
      console.log("👉 SOLUTION: Check your network/firewall allows outbound connections to MongoDB ports (27017-27019)");
    }
    process.exit(1);
  }
};

// Replace connectWithRetry() with:
diagnoseDB().then(() => {
  server.listen(process.env.PORT, () => console.log(`🚀 Server running`));
});
 