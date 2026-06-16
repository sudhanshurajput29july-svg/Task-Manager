import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('======================================================');
    console.error('CRITICAL: MONGO_URI is not set in Render environment variables!');
    console.error('Go to Render Dashboard -> Environment -> Add MONGO_URI');
    console.error('======================================================');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
