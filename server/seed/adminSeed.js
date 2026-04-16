import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FIRST_NAME, ADMIN_LAST_NAME } =
    process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error(
      '❌ Admin seed skipped: ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables'
    );
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists:', existingAdmin.email);
    } else {
      const admin = await User.create({
        firstName: ADMIN_FIRST_NAME || 'Admin',
        lastName: ADMIN_LAST_NAME || 'User',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
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
