import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import User from './models/User.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import './services/reminderService.js';

// Load env variables
dotenv.config();

// Connect to MongoDB
await connectDB();

// Seed default admin if none exists
try {
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
  console.error(`Seeding admin failed: ${error.message}`);
}

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Base route for API health check
app.get('/', (req, res) => {
  res.json({ message: 'Task Manager API is running...' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
