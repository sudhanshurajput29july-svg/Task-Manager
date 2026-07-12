import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://sudhanshurajput29july_db_user:LYHRS80JSrJSHmIj@cluster0.cxt8fzs.mongodb.net/?appName=Cluster0';

const printUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const users = await User.find({});
    console.log('\n=== CURRENT DATABASE USERS ===');
    users.forEach((user, idx) => {
      console.log(`${idx + 1}. Name: "${user.name}" | Email: "${user.email}" | Role: "${user.role}"`);
    });
    console.log('==============================\n');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

printUsers();
