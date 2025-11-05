const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://pharmastakx_db_user:pharmastackx007@cluster0.tpkohgb.mongodb.net/?appName=Cluster0';

async function createAdmin() {
  await mongoose.connect(MONGO_URI);
  const existing = await User.findOne({ email: 'admin@gmail.com' });
  if (existing) {
    console.log('Admin user already exists.');
    process.exit(0);
  }
  const hashedPassword = await bcrypt.hash('123456admin', 10);
  const admin = new User({
    username: 'admin',
    email: 'admin@gmail.com',
    password: hashedPassword,
    userType: 'admin',
  });
  await admin.save();
  console.log('Admin user created.');
  process.exit(0);
}

createAdmin();
