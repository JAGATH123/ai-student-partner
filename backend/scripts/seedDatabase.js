import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      console.log('⚠️  Admin user already exists');
    } else {
      // Create admin user
      const admin = await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@aistudent.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        bio: 'System Administrator',
        isActive: true
      });
      console.log('✅ Admin user created:', admin.email);
    }

    // Create sample users if needed
    const userCount = await User.countDocuments({ role: 'user' });
    if (userCount === 0) {
      const sampleUsers = [
        {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          role: 'user',
          bio: 'Computer Science Student'
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: 'password123',
          role: 'user',
          bio: 'Data Science Enthusiast'
        }
      ];

      for (const userData of sampleUsers) {
        await User.create(userData);
        console.log('✅ Sample user created:', userData.email);
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Credentials:');
    console.log('Admin:', process.env.ADMIN_EMAIL || 'admin@aistudent.com', '/', process.env.ADMIN_PASSWORD || 'admin123');
    console.log('User: john@example.com / password123');
    console.log('User: jane@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
