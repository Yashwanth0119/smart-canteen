import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import MenuItem from './models/MenuItem.js';
import Order from './models/Order.js';
import { defaultUsers, defaultMenuItems, defaultOrders } from './data/defaultData.js';

dotenv.config();

const seedDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/canteen_db';
  try {
    console.log(`Connecting to MongoDB at ${uri}...`);
    await mongoose.connect(uri);
    console.log('Clearing old collections...');
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({});

    console.log('Inserting default users...');
    await User.insertMany(defaultUsers);

    console.log('Inserting default canteen menu items...');
    await MenuItem.insertMany(defaultMenuItems);

    console.log('Inserting sample orders...');
    await Order.insertMany(defaultOrders);

    console.log('✅ Database seeded successfully with default student (E025015) and worker (WORKER01)!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();
