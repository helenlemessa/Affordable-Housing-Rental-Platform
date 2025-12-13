// server/scripts/createFirstAdmin.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); // Correct path to .env

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');

async function createFirstAdmin() {
  try {
    console.log('🔍 Loading environment variables from:', path.join(__dirname, '..', '.env'));
    console.log('🔗 MongoDB URI:', process.env.MONGO_URI);

    if (!process.env.MONGO_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Check for existing admin
    const adminExists = await User.exists({ role: 'admin' });
    if (adminExists) {
      console.log('ℹ️ Admin account already exists');
      return;
    }

    // Create admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: await bcrypt.hash('TempAdminPass123!', 12), // Stronger hash
      role: 'admin',
      
    phone:"0936187514",
      verified: true
    });

    console.log('\n🎉 ADMIN ACCOUNT CREATED SUCCESSFULLY!');
    console.log('======================================');
    console.log('🔑 Email:    admin@example.com');
    console.log('🔑 Password: TempAdminPass123!');
    console.log('======================================');
    console.log('⚠️  SECURITY WARNING:');
    console.log('1. IMMEDIATELY change these credentials');
    console.log('2. Disable this script in production');
    console.log('3. Enable 2FA for admin accounts\n');

  } catch (err) {
    console.error('\n❌ CRITICAL ERROR:', err.message);
    console.log('\nTROUBLESHOOTING ATLAS CONNECTION:');
    console.log('1. Verify your .env file exists at server/.env');
    console.log('2. Check MONGODB_URI format:');
    console.log('   mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/DBNAME?retryWrites=true&w=majority');
    console.log('3. Ensure your Atlas IP whitelist includes your current IP');
    console.log('4. Verify database user has correct privileges\n');
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

createFirstAdmin();