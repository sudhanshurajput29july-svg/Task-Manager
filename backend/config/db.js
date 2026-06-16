import mongoose from 'mongoose';
import User from '../models/User.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed default admin if none exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('Seeding default Admin (Owner) user...');
      await User.create({
        name: 'Owner',
        email: 'admin@taskmanager.com',
        password: 'adminpassword123',
        role: 'admin',
      });
      console.log('Default Admin (Owner) registered successfully!');
      console.log('Credentials -> Email: admin@taskmanager.com, Password: adminpassword123');
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
