import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists:', existingAdmin.email);
    } else {
      const admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@jobboard.com',
        password: 'Admin123!',
        role: 'admin',
      });
      console.log('✅ Admin user created:', admin.email);
    }
  } catch (error) {
    console.error('❌ Admin seed failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
  }
};

seedAdmin();
